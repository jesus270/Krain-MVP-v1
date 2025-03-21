"use client";

import { Review, Agent } from "@krain/db";
import { StarRating } from "@/app/components/star-rating";
import { cn } from "@krain/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ExtendedReview extends Review {
  agent: Agent;
}

interface UserReviewsProps {
  reviews: ExtendedReview[];
  className?: string;
}

export function UserReviews({ reviews, className }: UserReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className={cn("py-4 text-center", className)}>
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 bg-muted/30 rounded-lg space-y-2 border border-muted"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/agent/${review.agent.id}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {review.agent.imageUrl ? (
                  <img
                    src={review.agent.imageUrl}
                    alt={review.agent.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-primary/20 rounded-md flex items-center justify-center text-sm font-medium">
                    {review.agent.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium line-clamp-1">
                  {review.agent.name}
                </span>
              </Link>
              <StarRating rating={review.rating} disabled size="sm" />
            </div>

            {review.review && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
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
