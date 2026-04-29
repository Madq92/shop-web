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
import { memo, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavMainProps, useMenuData } from '@/hooks/use-menu-data';

// Leaf menu item — stable icon rendering, only re-renders when isActive changes
const NavItemLeaf = memo(function NavItemLeaf({
  item,
  isActive,
}: {
  item: NavMainProps;
  isActive: boolean;
}) {
  const iconRef = useRef<React.ReactNode | null>(null);
  if (!iconRef.current && item.icon) {
    iconRef.current = React.createElement(item.icon as React.ComponentType);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url}>
          {iconRef.current}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

// Collapsible group — stable icon rendering, only re-renders when isActive changes
const NavItemGroup = memo(function NavItemGroup({
  item,
  pathname,
}: {
  item: NavMainProps;
  pathname: string;
}) {
  const iconRef = useRef<React.ReactNode | null>(null);
  if (!iconRef.current && item.icon) {
    iconRef.current = React.createElement(item.icon as React.ComponentType);
  }

  const defaultOpen = pathname.includes(item.url);

  return (
    <Collapsible key={item.title} asChild defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {iconRef.current}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map(subItem => (
              <SubNavItem key={subItem.title} item={subItem} isActive={pathname === subItem.url} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
});

const SubNavItem = memo(function SubNavItem({
  item,
  isActive,
}: {
  item: NavMainProps;
  isActive: boolean;
}) {
  const iconRef = useRef<React.ReactNode | null>(null);
  if (!iconRef.current && item.icon) {
    iconRef.current = React.createElement(item.icon as React.ComponentType);
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link href={item.url}>
          {iconRef.current}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
});

function NavMain() {
  const pathname = usePathname();
  const menuData = useMenuData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarMenu />
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {menuData?.map(item => {
          const hasItems = item.items && item.items.length > 0;
          if (hasItems) {
            return <NavItemGroup key={item.title} item={item} pathname={pathname} />;
          }
          return <NavItemLeaf key={item.title} item={item} isActive={pathname === item.url} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default memo(NavMain);
