"use client";

import { LogOut, User, ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@repo/ui/components/ui/sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { NavLoginButton } from "./nav-login-button";
import { capitalize } from "@repo/utils";
import { useRouter } from "next/navigation";
import { log } from "@/lib/logger";

export function NavUser() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { isMobile } = useSidebar();
  const router = useRouter();

  if (!ready) {
    return null;
  }

  if (!authenticated) {
    return <NavLoginButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
            <AvatarFallback className="rounded-lg">
              {user?.email?.address ? (
                capitalize(user?.email?.address?.charAt(0) ?? "")
              ) : (
                <User key="avatar-user-icon" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-xs">
              {user?.email?.address ??
                `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
              <AvatarFallback className="rounded-lg">
                {user?.email?.address ? (
                  capitalize(user?.email?.address?.charAt(0) ?? "")
                ) : (
                  <User key="dropdown-user-icon" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              {/* <span className="truncate font-semibold">{user.name}</span> */}
              <span className="truncate text-xs">
                {user?.email?.address ??
                  `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User key="profile-icon" />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", {
                method: "POST",
              });
            } catch (error) {
              log.error("Error in server logout", {
                entity: "CLIENT",
                operation: "logout",
                error,
              });
            }
            // Always logout on client side regardless of server response
            logout();
          }}
        >
          <LogOut key="logout-icon" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
