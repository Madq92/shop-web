"use client";

import * as React from "react";
import { useMemo } from "react";
import { Settings2 } from "lucide-react";
import { getCurrentUserInfo, treeDataTranslate } from "@/common/utils";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useRouter } from "next/navigation";

export interface NavMainProps {
  title: string;
  url: string;
  icon?: React.ElementType;
  isActive?: boolean;
  items?: NavMainProps[];
}

const defaultNavMain = [
  {
    title: "基础设置",
    url: "/sys",
    icon: Settings2,
    isActive: true,
    items: [
      {
        title: "用户管理",
        url: "/sys/user",
      },
      {
        title: "角色管理",
        url: "/sys/role",
      },
      {
        title: "资源管理",
        url: "/sys/resource",
      },
      {
        title: "系统配置",
        url: "/sys/config",
      },
    ],
  },
  {
    title: "商品管理",
    url: "/prod",
    icon: Settings2,
    isActive: true,
    items: [
      {
        title: "用户管理",
        url: "/spu",
      },
      {
        title: "角色管理",
        url: "/dict",
      },
      {
        title: "资源管理",
        url: "/category",
      },
    ],
  },
];

export function useMenuData() {
  const user = getCurrentUserInfo();
  const router = useRouter();
  if (null == user) {
    router.push("/login");
  }
  return useMemo<NavMainProps[]>(() => {
    if (null == user) {
      return defaultNavMain;
    }
    const menuResources = user.resources.filter(
      (item) => item.resourceType === "MENU",
    );
    if (null == menuResources || menuResources.length === 0) {
      return defaultNavMain;
    }
    const menuResourcesTree = treeDataTranslate(
      menuResources,
      "resourceId",
      "parentResourceId",
    );

    function getIconComponent(iconName: string) {
      if (null == iconName || iconName.trim().length === 0) {
        return null;
      }
      return React.createElement(DynamicIcon, { name: iconName as IconName });
    }

    return menuResourcesTree.map((item) => {
      return {
        title: item.resourceName,
        url: item.url || "#",
        icon: () => getIconComponent(item.icon),
        items: item.children?.map((child) => {
          const childIconName = child.icon as IconName;
          return {
            title: child.resourceName,
            url: child.url || "#",
            icon: () => getIconComponent(childIconName),
          };
        }),
      } as NavMainProps;
    });
  }, [user]);
}
