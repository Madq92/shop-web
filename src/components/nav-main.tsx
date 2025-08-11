'use client';

import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import * as React from 'react';
import { memo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavMainProps, useMenuData } from '@/hooks/use-menu-data';

function NavMain() {
  const pathname = usePathname();
  const menuData = useMenuData();

  const renderMenuItem = (item: NavMainProps) => {
    const hasItems = item.items && item.items.length > 0;

    if (hasItems) {
      // 如果有子项，可折叠
      return (
        <Collapsible key={item.title} asChild defaultOpen={pathname.includes(item.url)} className="group/collapsible">
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
                {item.items?.map(subItem => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                      <Link href={subItem.url}>
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    } else {
      // 如果没有子项，直接作为链接使用
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname === item.url}>
            <Link href={item.url}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>{menuData?.map(item => renderMenuItem(item))}</SidebarMenu>
    </SidebarGroup>
  );
}

export default memo(NavMain);
