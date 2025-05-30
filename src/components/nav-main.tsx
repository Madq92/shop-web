"use client";

import { ChevronRight, type LucideIcon, Settings2 } from "lucide-react";
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
import { memo } from "react";
import { usePathname } from "next/navigation";

export interface NavMainProps {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavMainProps[];
}

const defaultNavMain = [
  // {
  //   title: "Playground",
  //   url: "#",
  //   icon: SquareTerminal,
  //   isActive: true,
  //   items: [
  //     {
  //       title: "History",
  //       url: "#",
  //     },
  //     {
  //       title: "Starred",
  //       url: "#",
  //     },
  //     {
  //       title: "Settings",
  //       url: "#",
  //     },
  //   ],
  // },
  // {
  //   title: "Models",
  //   url: "#",
  //   icon: Bot,
  //   items: [
  //     {
  //       title: "Genesis",
  //       url: "#",
  //     },
  //     {
  //       title: "Explorer",
  //       url: "#",
  //     },
  //     {
  //       title: "Quantum",
  //       url: "#",
  //     },
  //   ],
  // },
  // {
  //   title: "Documentation",
  //   url: "#",
  //   icon: BookOpen,
  //   items: [
  //     {
  //       title: "Introduction",
  //       url: "#",
  //     },
  //     {
  //       title: "Get Started",
  //       url: "#",
  //     },
  //     {
  //       title: "Tutorials",
  //       url: "#",
  //     },
  //     {
  //       title: "Changelog",
  //       url: "#",
  //     },
  //   ],
  // },
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
  // const user = useCurrentUser();
  // const menuTree = useMemo(() => {
  //   if (user.resources == null || user.resources.length === 0) {
  //     return defaultNavMain;
  //   }
  //
  //   const menuResources = user.resources.filter(
  //     (item) => item.resourceType === "MENU",
  //   );
  //   if (null == menuResources || menuResources.length === 0) {
  //     return defaultNavMain;
  //   }
  //   const menuResourcesTree = treeDataTranslate(
  //     menuResources,
  //     "resourceId",
  //     "parentResourceId",
  //   );
  //
  //   return menuResourcesTree.map(
  //     (item) =>
  //       ({
  //         title: item.resourceName,
  //         url: item.url || "#",
  //         items: item.children?.map((child) => ({
  //           title: child.resourceName,
  //           url: child.url || "#",
  //         })),
  //       }) as NavMainProps,
  //   );
  // }, [user]);
  const pathname = usePathname();
  console.log("menuTree", pathname);
  return (
    <SidebarGroup>
      <SidebarMenu>
        {defaultNavMain?.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
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
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
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
