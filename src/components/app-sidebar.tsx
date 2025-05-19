"use client";

import * as React from "react";

import { NavMain, NavMainProps } from "@/components/nav-main";
import { NavUser, UserProps } from "@/components/nav-user";
import { TeamProps, TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.

export function AppSidebar({
  navMain,
  teams,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navMain: NavMainProps[];
  teams: TeamProps[];
  user: UserProps;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
