import {
  Compass,
  Star,
  Users,
  Percent,
  Target,
  GitBranch,
  DollarSign,
  MessageSquare,
  MonitorSmartphone,
  Megaphone,
  Magnet,
} from "lucide-react";
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
import Image from "next/image";
import Link from "next/link";
import { cn } from "@krain/ui/lib/utils";

const routes = [
  {
    name: "Discover",
    url: "#",
    icon: Compass,
  },
  {
    name: "Favourites",
    url: "#",
    icon: Star,
  },
  {
    name: "Community",
    url: "#",
    icon: Users,
  },
  {
    name: "Discounts",
    url: "#",
    icon: Percent,
  },
  {
    name: "Bounties",
    url: "#",
    icon: Target,
  },
  {
    name: "Workflows",
    url: "#",
    icon: GitBranch,
    premium: true,
  },
  {
    name: "Pricing",
    url: "#",
    icon: DollarSign,
  },
  {
    name: "Support",
    url: "#",
    icon: MessageSquare,
  },
];

const manageRoutes = [
  {
    name: "Listings",
    url: "#",
    icon: MonitorSmartphone,
  },
  {
    name: "Ads",
    url: "#",
    icon: Megaphone,
  },
  {
    name: "Leads",
    url: "#",
    icon: Magnet,
  },
  {
    name: "Bounties",
    url: "#",
    icon: Target,
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
                  : "/logo.svg"
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
                    {item.premium && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-primary/80">
                        PREMIUM
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-3 py-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Manage
            </h4>
          </div>
          <SidebarMenu>
            {manageRoutes.map((item) => (
              <SidebarMenuItem key={item.name} className="relative group">
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
        <div className="px-3 py-4">
          <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4">
            <h3 className="font-semibold mb-2">Buy $KRAIN</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium features, post bounties and much more with $KRAIN.
            </p>
            <Link
              href="#"
              className="block w-full text-center py-2 px-4 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Get premium now
            </Link>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail className="bg-gradient-to-b from-background/80 via-background to-background/80 border-r border-r-border/50 backdrop-blur-sm" />
    </Sidebar>
  );
}
