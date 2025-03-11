"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

interface StarRatingProps {
  rating?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating = 0,
  size = "md",
  disabled = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  // Determine size of stars
  const starSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  // Handle star hover
  const handleMouseEnter = (index: number) => {
    if (disabled) return;
    setHoverRating(index);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  // Handle click on star
  const handleClick = (index: number) => {
    if (disabled) return;
    setCurrentRating(index);
    onChange?.(index);
  };

  // Render 5 stars
  return (
    <div
      className={cn("flex items-center", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const displayRating = hoverRating || currentRating;
        const isActive = index <= displayRating;

        return (
          <div
            key={index}
            className={cn(
              "cursor-pointer transition-colors",
              disabled ? "cursor-default" : "cursor-pointer",
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => handleClick(index)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn(starSize)}
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={isActive ? "url(#starGradient)" : "transparent"}
                stroke={isActive ? "url(#starGradient)" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? "1" : "0.3"}
              />
              <defs>
                <linearGradient
                  id="starGradient"
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
        );
      })}
    </div>
  );
}
