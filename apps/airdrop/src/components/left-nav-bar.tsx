"use client";

import { LayoutDashboard, Rocket } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";

const routes = [
  {
    name: "Airdrop",
    url: "/",
    icon: Rocket,
  },
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   name: "Tasks",
  //   url: "/tasks",
  //   icon: PieChart,
  // },
  // {
  //   name: "Profile",
  //   url: "/profile",
  //   icon: User,
  // },
];

export default function LeftNavBar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {routes.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
