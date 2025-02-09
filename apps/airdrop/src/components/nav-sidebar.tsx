import { LayoutDashboard, User } from "lucide-react";
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
  useSidebar,
} from "@krain/ui/components/ui/sidebar";
import { NavUser } from "./nav-user";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@krain/ui/lib/utils";

const routes = [
  {
    name: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function SidebarNav() {
  const { setOpenMobile, isMobile, state } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-gradient-to-b from-background/80 via-background to-background/80 border-r border-r-border/50 backdrop-blur-sm"
    >
      <SidebarHeader className="mt-3">
        <Link
          href="/"
          onClick={handleClick}
          className="flex items-center justify-center w-full group"
        >
          <div
            className={cn(
              "transition-all duration-300 relative",
              state === "collapsed" ? "p-1" : "",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity",
                state === "collapsed" ? "rounded-full" : "rounded-md",
              )}
            />
            <Image
              src={
                state === "collapsed"
                  ? "/icon-square-krain-token.png"
                  : "/logo-krain.svg"
              }
              alt="Logo"
              width={state === "collapsed" ? 24 : 116}
              height={24}
              className={cn(
                "transition-all duration-300 relative",
                state === "collapsed" ? "rounded-full" : "",
              )}
            />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {routes.map((item) => (
              <SidebarMenuItem key={item.url} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x rounded-md" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    onClick={handleClick}
                    className="relative z-10 transition-all group bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10"
                  >
                    <item.icon className="transition-transform group-hover:scale-110 text-primary/80 group-hover:text-primary" />
                    <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                      {item.name}
                    </span>
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
      <SidebarRail className="bg-gradient-to-b from-background/80 via-background to-background/80 border-r border-r-border/50 backdrop-blur-sm" />
    </Sidebar>
  );
}
