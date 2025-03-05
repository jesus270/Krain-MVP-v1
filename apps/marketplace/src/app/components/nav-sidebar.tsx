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
  Crown,
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
import { GradientButton } from "@krain/ui/components/ui/gradient-button";
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
  // {
  //   name: "Discounts",
  //   url: "#",
  //   icon: Percent,
  // },
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
          className="flex items-center w-full group"
        >
          <div
            className={cn(
              "transition-all duration-300 relative ml-2.5",
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
              width={state === "collapsed" ? 19 : 93}
              height={state === "collapsed" ? 19 : 19}
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
              <SidebarMenuItem
                key={item.name}
                className="relative hover:bg-transparent data-[state=open]:bg-transparent data-[highlighted]:bg-transparent"
              >
                <SidebarMenuButton
                  asChild
                  className="rounded-none hover:bg-transparent data-[state=open]:bg-transparent"
                >
                  <Link
                    href={item.url}
                    onClick={handleClick}
                    className="relative z-10 transition-all hover:bg-transparent [&:hover>span]:font-bold [&:hover>svg]:scale-110"
                  >
                    <item.icon className="transition-transform text-foreground" />
                    <span className="text-foreground transition-all">
                      {item.name}
                    </span>
                    {item.premium && (
                      <span className="relative ml-auto text-xs px-2 py-0.5 rounded-full text-white">
                        <div
                          className="absolute inset-0 rounded-full opacity-50"
                          style={{
                            background: `linear-gradient(120deg,
                              #1FC5D6 0%,
                              #915BF0 50%,
                              rgb(47, 45, 64) 75%
                            )`,
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full opacity-50"
                          style={{
                            padding: "1px",
                            background: `linear-gradient(120deg,
                              #1FC5D6 0%,
                              rgba(31, 196, 214, 0.50) 50%,
                              rgba(31, 196, 214, 0.25) 75%
                            )`,
                            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            maskComposite: "exclude",
                          }}
                        />
                        <span className="relative z-10 block">PREMIUM</span>
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          {state !== "collapsed" && (
            <div className="px-3 py-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Manage
              </h4>
            </div>
          )}
          <SidebarMenu>
            {manageRoutes.map((item) => (
              <SidebarMenuItem
                key={item.name}
                className="relative hover:bg-transparent data-[state=open]:bg-transparent data-[highlighted]:bg-transparent"
              >
                <SidebarMenuButton
                  asChild
                  className="rounded-none hover:bg-transparent data-[state=open]:bg-transparent"
                >
                  <Link
                    href={item.url}
                    onClick={handleClick}
                    className="relative z-10 transition-all hover:bg-transparent [&:hover>span]:font-bold [&:hover>svg]:scale-110"
                  >
                    <item.icon className="transition-transform text-foreground" />
                    <span className="text-foreground transition-all">
                      {item.name}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-0">
        <div className="relative space-y-4 w-full">
          <div className="absolute inset-0 bg-[url('/bg-gradient-ellipsis.svg')] bg-no-repeat bg-cover opacity-30" />

          {state !== "collapsed" && (
            <>
              <Link
                href="#"
                className="block relative p-4 group/krain w-full"
                onClick={handleClick}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground font-medium">Buy $KRAIN</h3>
                  <Image
                    src="/icon-arrow.svg"
                    alt="Arrow"
                    width={24}
                    height={22}
                    className="transition-all duration-300 group-hover/krain:scale-125"
                  />
                </div>
                <p className="text-xs text-foreground/80 mt-2">
                  Premium features, post bounties
                  <br />
                  and much more with $KRAIN.
                </p>
              </Link>
              <Separator className="bg-border/50 w-full" />
              <div className="relative p-4 w-full">
                <h3 className="font-medium mb-3">Level Up with Premium</h3>
                <ul className="space-y-2 mb-4">
                  <li className="text-sm text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EFF0F3]" />
                    Workflow Creator
                  </li>
                  <li className="text-sm text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EFF0F3]" />
                    Get Paid for Tasks
                  </li>
                  <li className="text-sm text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EFF0F3]" />
                    Staking Bonuses
                  </li>
                </ul>
                <GradientButton
                  size="default"
                  className="w-full rounded-full"
                  onClick={() => {
                    handleClick();
                    window.location.href = "#"; // Replace with actual premium page URL
                  }}
                >
                  Get premium now
                </GradientButton>
              </div>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
