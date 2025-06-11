"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

// type BreadcrumbItem = {
//   title: string;
//   link: string;
// };

export function useBreadcrumbs() {
  const pathname = usePathname();
  // const menuData = useMenuData();
  // const routeMapping = useMemo(() => {
  //   return menuData.reduce<Record<string, BreadcrumbItem[]>>((acc, menu) => {
  //     acc[menu.url] = [
  //       {
  //         title: menu.title,
  //         link: menu.url,
  //       },
  //     ];
  //
  //     menu.items?.forEach((item) => {
  //       acc[item.url] = [
  //         {
  //           title: menu.title,
  //           link: menu.url,
  //         },
  //         {
  //           title: item.title,
  //           link: item.url,
  //         },
  //       ];
  //     });
  //
  //     return acc;
  //   }, {});
  // }, [menuData]);

  return useMemo(() => {
    // if (routeMapping[pathname]) {
    //   return routeMapping[pathname];
    // }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      };
    });
  }, [pathname]);
}
