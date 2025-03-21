"use client";

import { useState, useEffect } from "react";
import { ReviewForm } from "./review-form";
import { ReviewsList } from "./reviews-list";
import { getAgentReviews, hasUserReviewedAgent } from "@/app/actions/reviews";
import { usePrivy } from "@privy-io/react-auth";
import { Review } from "@krain/db";
import { Toaster } from "sonner";

interface ReviewsSectionProps {
  agentId: number;
}

export function ReviewsSection({ agentId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, authenticated } = usePrivy();

  // Load reviews when the component mounts or when a new review is submitted
  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviews = await getAgentReviews({
        agentId,
        privyUserId: user?.id,
      });

      setReviews(reviews);

      // If user is logged in, check if they have reviewed this agent separately
      if (authenticated && user?.id) {
        const existingReview = await hasUserReviewedAgent({
          agentId,
          privyUserId: user.id,
        });
        setUserReview(existingReview);
      } else {
        setUserReview(null);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load reviews when the component mounts or when the user changes
  useEffect(() => {
    loadReviews();
  }, [agentId, user?.id]);

  // Handle successful review submission
  const handleReviewSuccess = () => {
    loadReviews();
  };

  return (
    <div className="mt-10 space-y-8">
      <Toaster />
      <h2 className="text-2xl font-semibold">Reviews</h2>

      {loading ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      ) : (
        <>
          {!userReview ? (
            <ReviewForm agentId={agentId} onSuccess={handleReviewSuccess} />
          ) : (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Your Review</h3>
              <div className="bg-primary/5 p-4 rounded-lg space-y-2 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Your rating</span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-2">
                      {userReview.rating.toFixed(1)}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="url(#starGradientDetails)"
                        stroke="url(#starGradientDetails)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="starGradientDetails"
                          x1="12"
                          y1="2"
                          x2="12"
                          y2="21.02"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#B793F5" />
                          <stop offset="100%" stopColor="#915BF0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {userReview.review && (
                  <p className="text-sm">{userReview.review}</p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setUserReview(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit Review
                  </button>
                </div>
              </div>
            </div>
          )}

          <ReviewsList reviews={reviews} />
        </>
      )}
    </div>
  );
}
