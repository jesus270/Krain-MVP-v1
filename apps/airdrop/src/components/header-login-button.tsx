"use client";

import { log } from "@krain/utils";
import { usePrivyAuth } from "@krain/ui/hooks/index";
import { Avatar, AvatarFallback } from "@krain/ui/components/ui/avatar";
import { Button } from "@krain/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@krain/ui/components/ui/dropdown-menu";
import { useSidebar } from "@krain/ui/components/ui/sidebar";
import { Skeleton } from "@krain/ui/components/ui/skeleton";
import { capitalize } from "@krain/utils";
import { User, LogOut, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@krain/ui/lib/utils";

export function HeaderLoginButton() {
  const { ready, authenticated, login, logout, user } = usePrivyAuth();
  const router = useRouter();
  const disableLogin = !ready || (ready && authenticated);
  const { isMobile } = useSidebar();

  return ready ? (
    authenticated ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="group relative overflow-hidden bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:text-primary transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <User className="relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg backdrop-blur-xs bg-background/95 border-border/50"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "center" : "end"}
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm relative group">
              <Avatar className="h-8 w-8 rounded-lg relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <AvatarFallback className="rounded-lg backdrop-blur-sm bg-background/80 relative">
                  {user?.email?.address?.charAt(0) ? (
                    <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                      {capitalize(user?.email?.address?.charAt(0) ?? "")}
                    </span>
                  ) : (
                    <User className="text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
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
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              <span className="relative z-10 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
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
              logout();
            }}
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogOut className="relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
            <span className="relative z-10 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
              Log out
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Button
        disabled={disableLogin}
        onClick={login}
        className="w-full group relative overflow-hidden bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:text-primary transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <LogIn className="relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
        <span className="relative z-10 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
          Log in
        </span>
      </Button>
    )
  ) : (
    <Skeleton className="h-10 w-24" />
  );
}
