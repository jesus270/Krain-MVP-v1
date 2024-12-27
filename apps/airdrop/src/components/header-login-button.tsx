"use client";

import { log } from "@/lib/logger";
import { usePrivy } from "@privy-io/react-auth";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@repo/ui/components/ui/dropdown-menu";
import { useSidebar } from "@repo/ui/components/ui/sidebar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { capitalize } from "@repo/utils";
import { User, LogOut, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeaderLoginButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const router = useRouter();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);
  const { isMobile } = useSidebar();

  return ready ? (
    authenticated ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <User />
          </Button>
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
                  {user?.email?.address?.charAt(0) ? (
                    capitalize(user?.email?.address?.charAt(0) ?? "")
                  ) : (
                    <User />
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
              <User />
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
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Button disabled={disableLogin} onClick={login} className="w-full">
        <LogIn />
        Log in
      </Button>
    )
  ) : (
    <Skeleton className="h-10 w-10 bg-foreground/10" />
  );
}
