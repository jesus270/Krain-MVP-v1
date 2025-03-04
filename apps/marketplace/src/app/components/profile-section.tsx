"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@krain/ui/components/ui/avatar";
import { GradientButton } from "@krain/ui/components/ui/gradient-button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@krain/ui/components/ui/dropdown-menu";
import { User } from "lucide-react";

export function ProfileSection() {
  const { authenticated, user, login, logout } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!authenticated) {
    return (
      <GradientButton
        size="sm"
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="rounded-full"
      >
        {isLoggingIn ? "Connecting..." : "Login"}
      </GradientButton>
    );
  }

  // Format wallet address to show only first 6 and last 4 characters
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback className="bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          {user?.email?.address ||
            (user?.wallet?.address
              ? formatWalletAddress(user.wallet.address)
              : "")}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
