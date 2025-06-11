// "use client";
//
// import { useMemo } from "react";
// import { Settings2 } from "lucide-react";
// import { NavMainProps } from "@/components/nav-main";
// import { treeDataTranslate } from "@/common/utils";
// import useSessionStorage from "@/hooks/useSessionStorage";
// import { UserDTO } from "@/api/sys/UserController";
//
// const defaultNavMain = [
//   // {
//   //   title: "Playground",
//   //   url: "#",
//   //   icon: SquareTerminal,
//   //   isActive: true,
//   //   items: [
//   //     {
//   //       title: "History",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Starred",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Settings",
//   //       url: "#",
//   //     },
//   //   ],
//   // },
//   // {
//   //   title: "Models",
//   //   url: "#",
//   //   icon: Bot,
//   //   items: [
//   //     {
//   //       title: "Genesis",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Explorer",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Quantum",
//   //       url: "#",
//   //     },
//   //   ],
//   // },
//   // {
//   //   title: "Documentation",
//   //   url: "#",
//   //   icon: BookOpen,
//   //   items: [
//   //     {
//   //       title: "Introduction",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Get Started",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Tutorials",
//   //       url: "#",
//   //     },
//   //     {
//   //       title: "Changelog",
//   //       url: "#",
//   //     },
//   //   ],
//   // },
//   {
//     title: "基础设置",
//     url: "/sys",
//     icon: Settings2,
//     isActive: true,
//     items: [
//       {
//         title: "用户管理",
//         url: "/sys/user",
//       },
//       {
//         title: "角色管理",
//         url: "/sys/role",
//       },
//       {
//         title: "资源管理",
//         url: "/sys/resource",
//       },
//       {
//         title: "系统配置",
//         url: "/sys/config",
//       },
//     ],
//   },
// ];
//
// export function useMenuData() {
//   // const [user] = useSessionStorage<UserDTO>("currentUser", {});
//   return useMemo<NavMainProps[]>(() => {
//     if (null == user) {
//       return defaultNavMain;
//     }
//     const menuResources = user.resources.filter(
//       (item) => item.resourceType === "MENU",
//     );
//     if (null == menuResources || menuResources.length === 0) {
//       return defaultNavMain;
//     }
//     const menuResourcesTree = treeDataTranslate(
//       menuResources,
//       "resourceId",
//       "parentResourceId",
//     );
//
//     return menuResourcesTree.map(
//       (item) =>
//         ({
//           title: item.resourceName,
//           url: item.url || "#",
//           items: item.children?.map((child) => ({
//             title: child.resourceName,
//             url: child.url || "#",
//           })),
//         }) as NavMainProps,
//     );
//   }, []);
// }
