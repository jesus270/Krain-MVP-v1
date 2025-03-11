"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { Button } from "@krain/ui/components/ui/button";
import { Heart } from "lucide-react";
import { toggleFavoriteAgent, isAgentFavorited } from "../actions/favorites";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@krain/ui/lib/utils";

interface FavoriteButtonProps {
  agentId: number;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function FavoriteButton({
  agentId,
  variant = "ghost",
  size = "icon",
  className = "",
}: FavoriteButtonProps) {
  const [serverFavorited, setServerFavorited] = useState<boolean>(false);
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    serverFavorited,
    (_, newFavorited: boolean) => newFavorited,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const { authenticated, login, user } = usePrivy();

  // Check if agent is favorited on component mount
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!authenticated || !user?.id) return;

      try {
        // Pass the user ID directly to the server action
        const favorited = await isAgentFavorited(agentId, user.id);
        setServerFavorited(favorited);
      } catch (error) {
        console.error("Error checking favorite status:", error);
        // Silently fail for the initial check
      }
    }

    checkFavoriteStatus();
  }, [agentId, authenticated, user?.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent parent link click
    e.preventDefault();
    e.stopPropagation();

    if (!authenticated || !user?.id) {
      toast.error("Please sign in to favorite agents", {
        description: "Authentication required",
      });
      login();
      return;
    }

    try {
      setIsLoading(true);

      // Optimistically update UI immediately
      const newFavoritedState = !optimisticFavorited;
      startTransition(() => {
        setOptimisticFavorited(newFavoritedState);
      });

      // Show optimistic toast message right away
      const toastId = toast.success(
        newFavoritedState
          ? "Agent added to favorites"
          : "Agent removed from favorites",
      );

      // Actually perform the server update
      const serverResult = await toggleFavoriteAgent(agentId, user.id);

      // Update the server state when operation completes
      setServerFavorited(serverResult);

      // If server result doesn't match our optimistic update, show error and correct the state
      if (serverResult !== newFavoritedState) {
        toast.error("Failed to update favorites", {
          description: "Please try again later",
        });
        startTransition(() => {
          setOptimisticFavorited(serverResult);
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);

      // Revert to previous state on error
      startTransition(() => {
        setOptimisticFavorited(serverFavorited);
      });

      // Handle specific error messages
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("User not found")) {
        toast.error("Profile not synchronized", {
          description: "Please refresh the page or sign out and sign in again",
        });
      } else {
        toast.error("Failed to update favorites", {
          description: "Please try again later",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use the optimistic state for rendering
  const isFavorited = optimisticFavorited;

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "hover:bg-transparent hover:opacity-100 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer",
        className,
      )}
      onClick={handleToggleFavorite}
      disabled={isLoading || isPending}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isFavorited ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "h-[1.2rem] w-[1.2rem] transition-opacity duration-200",
            isHovered ? "opacity-70" : "opacity-100",
          )}
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="url(#heartGradient)"
            stroke="url(#heartGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="heartGradient"
              x1="12"
              y1="4"
              x2="12"
              y2="21.23"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#B793F5" />
              <stop offset="100%" stopColor="#915BF0" />
            </linearGradient>
          </defs>
        </svg>
      ) : isHovered ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[1.2rem] w-[1.2rem]"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="url(#heartHoverGradient)"
            stroke="url(#heartGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="heartHoverGradient"
              x1="12"
              y1="4"
              x2="12"
              y2="21.23"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#D8CAFC" />
              <stop offset="100%" stopColor="#B793F5" />
            </linearGradient>
            <linearGradient
              id="heartGradient"
              x1="12"
              y1="4"
              x2="12"
              y2="21.23"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#B793F5" />
              <stop offset="100%" stopColor="#915BF0" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <Heart className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
