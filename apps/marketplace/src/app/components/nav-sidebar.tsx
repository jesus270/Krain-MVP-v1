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
import { Separator } from "@krain/ui/components/ui/separator";

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
    <Sidebar collapsible="icon">
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
            {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity",
                state === "collapsed" ? "rounded-full" : "",
              )}
            /> */}
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
                {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x rounded-md" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" /> */}
                <SidebarMenuButton asChild className="rounded-none">
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
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
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
                {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x rounded-md" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" /> */}
                <SidebarMenuButton asChild className="rounded-none">
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
        <div className="relative space-y-4">
          <div className="absolute inset-0 bg-[url('/bg-gradient-ellipsis.svg')] bg-no-repeat bg-cover opacity-30" />

          <Link href="#" className="block relative p-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Buy $KRAIN</h3>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-muted-foreground"
              >
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium features, post bounties and much more with $KRAIN.
            </p>
          </Link>
          <Separator className="bg-border/50 w-full" />
          <div className="relative p-2">
            <h3 className="font-semibold mb-3">Level Up with Premium</h3>
            <ul className="space-y-2 mb-4">
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                Workflow Creator
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                Get Paid for Tasks
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                Staking Bonuses
              </li>
            </ul>
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
