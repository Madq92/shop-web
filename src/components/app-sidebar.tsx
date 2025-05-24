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
import { UserDTO } from "@/api/sys/UserController";

// This is sample data.

export function AppSidebar({
  teams,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  teams: TeamProps[];
  user: UserDTO;
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
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
