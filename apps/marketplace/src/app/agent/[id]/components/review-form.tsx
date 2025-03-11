"use client";

import { useState } from "react";
import { StarRating } from "@/app/components/star-rating";
import { Button } from "@krain/ui/components/ui/button";
import { Textarea } from "@krain/ui/components/ui/textarea";
import { submitReview } from "@/app/actions/reviews";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";

interface ReviewFormProps {
  agentId: number;
  onSuccess: () => void;
}

export function ReviewForm({ agentId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, authenticated, login } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authenticated || !user) {
      toast.error("Please log in", {
        description: "You need to be logged in to submit a review",
      });
      return;
    }

    if (rating === 0) {
      toast.error("Rating required", {
        description: "Please select a star rating",
      });
      return;
    }

    try {
      console.log("Submitting review with userId:", user.id);
      console.log("Submission details:", {
        agentId,
        rating,
        review: review.trim() || undefined,
      });

      setIsSubmitting(true);
      const result = await submitReview({
        agentId,
        rating,
        review: review.trim() || undefined,
        privyUserId: user.id,
      });

      console.log("Review submission result:", result);
      toast.success("Review submitted", {
        description: "Thank you for your feedback!",
      });

      // Clear form and notify parent
      setRating(0);
      setReview("");
      onSuccess();
    } catch (error) {
      console.error("Review submission error:", error);

      // Try to extract more useful error message
      let message = "Failed to submit review. Please try again.";
      if (error instanceof Error) {
        message = error.message || message;
      }

      setErrorMessage(message);
      toast.error("Error", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
      <h2 className="text-xl font-semibold">Leave a Review</h2>

      {!authenticated ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Please log in to leave a review
          </p>
          <Button onClick={() => login()}>Log in</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <StarRating rating={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Review (Optional)
            </label>
            <Textarea
              id="review"
              placeholder="Share your experience with this agent..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 p-2 border border-red-200 bg-red-50 rounded">
              Error: {errorMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>

            {isSubmitting && (
              <span className="text-sm text-muted-foreground animate-pulse">
                Processing...
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
