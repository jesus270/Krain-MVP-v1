import { LayoutDashboard, Rocket, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/components/ui/sidebar";
import { NavUser } from "./nav-user";
import Image from "next/image";
import Link from "next/link";
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
  {
    name: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function SidebarNav() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mt-3">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {routes.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
