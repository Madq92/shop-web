"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { TeamProps, TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import NavUser from "./nav-user";

// This is sample data.

export function AppSidebar({
  teams,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  teams: TeamProps[];
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
