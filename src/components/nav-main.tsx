"use client";

import { ChevronRight, Settings2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import * as React from "react";
import { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getCurrentUserInfo, treeDataTranslate } from "@/common/utils";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

// import { useMenuData } from "@/hooks/use-menu-data";

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
];

function NavMain() {
  const user = getCurrentUserInfo();
  const pathname = usePathname();
  const menuData = useMemo<NavMainProps[]>(() => {
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

    function getIconComponent(iconName: IconName) {
      return <DynamicIcon name={iconName} />;
    }

    return menuResourcesTree.map((item) => {
      const iconName = (item.icon as IconName) || "Circle";
      return {
        title: item.resourceName,
        url: item.url || "#",
        icon: () => getIconComponent(iconName),
        items: item.children?.map((child) => ({
          title: child.resourceName,
          url: child.url || "#",
        })),
      } as NavMainProps;
    });
  }, []);
  return (
    <SidebarGroup>
      <SidebarMenu>
        {menuData?.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={pathname.includes(item.url)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === subItem.url}
                      >
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default memo(NavMain);
