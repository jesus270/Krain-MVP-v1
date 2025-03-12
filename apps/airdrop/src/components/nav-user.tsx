"use client";

import { LogOut, User, ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@krain/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@krain/ui/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@krain/ui/components/ui/sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { NavLoginButton } from "./nav-login-button";
import { capitalize } from "@krain/utils";
import { useRouter } from "next/navigation";
import { log } from "@krain/utils";
import { cn } from "@krain/ui/lib/utils";

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
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

          <Avatar className="h-8 w-8 rounded-lg relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <AvatarFallback className="rounded-lg backdrop-blur-xs bg-background/80 relative">
              {user?.email?.address ? (
                <span className="bg-gradient-to-br from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                  {capitalize(user?.email?.address?.charAt(0) ?? "")}
                </span>
              ) : (
                <User
                  key="avatar-user-icon"
                  className="text-primary/80 group-hover:text-primary transition-colors"
                />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight relative z-10">
            <span className="truncate text-xs bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
              {user?.email?.address ??
                `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-primary/80 group-hover:text-primary transition-colors" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg backdrop-blur-xs bg-background/95 border-border/50"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm relative group">
            <Avatar className="h-8 w-8 rounded-lg relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <AvatarFallback className="rounded-lg backdrop-blur-xs bg-background/80 relative">
                {user?.email?.address ? (
                  <span className="bg-gradient-to-br from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                    {capitalize(user?.email?.address?.charAt(0) ?? "")}
                  </span>
                ) : (
                  <User
                    key="dropdown-user-icon"
                    className="text-primary/80 group-hover:text-primary transition-colors"
                  />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xs bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                {user?.email?.address ??
                  `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/profile")}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x rounded-sm" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
            <User
              key="profile-icon"
              className="text-primary/80 group-hover:text-primary transition-colors relative z-10"
            />
            <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all relative z-10">
              Profile
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
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
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x rounded-sm" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
          <LogOut
            key="logout-icon"
            className="text-primary/80 group-hover:text-primary transition-colors relative z-10"
          />
          <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all relative z-10">
            Log out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
