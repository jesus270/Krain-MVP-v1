"use client";

import { BotIcon } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect, RefObject, useLayoutEffect } from "react";
import { cn } from "@krain/ui/lib/utils";

interface AgentImageProps {
  imageUrl: string;
  name: string;
  size?: "sm" | "md" | "lg"; // small, medium, large
  shape?: "square" | "rounded" | "circle";
  className?: string;
  iconClassName?: string;
  containerRef?: RefObject<HTMLDivElement>;
}

export function AgentImage({
  imageUrl,
  name,
  size = "md",
  shape = "circle",
  className,
  iconClassName,
  containerRef: externalContainerRef,
}: AgentImageProps) {
  const [failedImage, setFailedImage] = useState(false);
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    };

    // Initial measurement
    updateDimensions();

    // Add event listener for window load to ensure images and layout are complete
    window.addEventListener("load", updateDimensions);

    // Add resize listener to handle window size changes
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => {
      window.removeEventListener("load", updateDimensions);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [containerRef]);

  // Use layout effect for immediate DOM measurements
  useLayoutEffect(() => {
    // Measure immediately after DOM updates but before painting
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    }
  }, [containerRef]);

  // Size classes for the icon
  const iconSizeClass =
    size === "sm" ? "w-6 h-6" : size === "md" ? "w-10 h-10" : "w-16 h-16";

  // Check if the imageUrl is valid
  const isValidImageUrl =
    imageUrl &&
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));

  // Determine fallback dimensions based on size prop
  const fallbackWidth = size === "sm" ? 24 : size === "md" ? 40 : 64;
  const fallbackHeight = fallbackWidth;

  return isValidImageUrl && !failedImage ? (
    <Image
      src={imageUrl}
      alt={`${name} icon`}
      width={dimensions.width || fallbackWidth}
      height={dimensions.height || fallbackHeight}
      className={cn(
        "w-full h-full object-cover",
        shape === "rounded" && "rounded-md",
        shape === "circle" && "rounded-full",
        className,
      )}
      onError={() => setFailedImage(true)}
      unoptimized={true}
      priority={true}
    />
  ) : (
    <BotIcon
      className={cn(
        "text-white",
        iconSizeClass,
        shape === "rounded" && "rounded-md",
        shape === "circle" && "rounded-full",
        iconClassName,
      )}
    />
  );
}
