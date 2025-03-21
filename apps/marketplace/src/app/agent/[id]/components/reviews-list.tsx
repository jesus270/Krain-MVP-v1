"use client";

import { Review, User } from "@krain/db";
import { StarRating } from "@/app/components/star-rating";
import { cn } from "@krain/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ExtendedReview extends Review {
  user: User & {
    profile?: {
      displayName?: string;
      profilePictureUrl?: string;
    };
  };
}

interface ReviewsListProps {
  reviews: ExtendedReview[];
  className?: string;
}

export function ReviewsList({ reviews, className }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className={cn("py-4 text-center", className)}>
        <p className="text-muted-foreground">
          No reviews yet. Be the first to review this agent!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-xl font-semibold">Reviews ({reviews.length})</h3>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/profile/${review.user.username || review.user.id}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {review.user.profile?.profilePictureUrl ? (
                  <img
                    src={review.user.profile.profilePictureUrl}
                    alt={getUserDisplayName(review.user)}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitials(review.user)}
                  </div>
                )}
                <span className="font-medium">
                  {getUserDisplayName(review.user)}
                </span>
              </Link>
              <StarRating rating={review.rating} disabled size="sm" />
            </div>

            {review.review && (
              <p className="text-sm text-muted-foreground mt-2">
                {review.review}
              </p>
            )}

            <div className="text-xs text-muted-foreground mt-2">
              {review.createdAt &&
                formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get user initials
function getUserInitials(user?: User): string {
  if (!user) return "?";

  // Try to use their name if available
  if (user.twitterName) {
    return user.twitterName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  // Use the first two characters of their wallet address
  if (user.walletAddress) {
    return user.walletAddress.substring(0, 2).toUpperCase();
  }

  // Fallback
  return "?";
}

// Helper function to get user display name
function getUserDisplayName(user?: User): string {
  if (!user) return "Anonymous";

  // Check for profile displayName first
  if ("profile" in user && user.profile?.displayName)
    return user.profile.displayName;

  // Then try username
  if (user.username) return user.username;

  // Fall back to existing options
  if (user.twitterName) return user.twitterName;
  if (user.twitterHandle) return `@${user.twitterHandle}`;

  if (user.walletAddress) {
    const address = user.walletAddress;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  return "Anonymous";
}
