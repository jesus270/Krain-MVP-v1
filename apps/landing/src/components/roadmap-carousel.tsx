"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@krain/ui/components/ui/button";
import { PhaseCard } from "./phase-card";

const phases = [
  {
    phase: "PHASE ONE",
    title: "AI agent discovery engine",
    features: [
      "System user search",
      "AI agent performance metrics",
      "AI agent ratings and reviews",
      "AI agent profile and details",
    ],
  },
  {
    phase: "PHASE TWO",
    title: "AI agent recommendation engine",
    features: [
      "MLT recommendation engine",
      "AI agent performance history",
      "Verified agents and partnerships",
      "Curated AI agent lists (top 10)",
    ],
  },
  {
    phase: "PHASE THREE",
    title: "AI agent recommendation engine",
    features: [
      "MLT recommendation engine",
      "AI agent performance history",
      "Verified agents and partnerships",
      "Curated AI agent lists (top 10)",
    ],
  },
];

export function RoadmapCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {phases.map((phase, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <PhaseCard {...phase} />
            </div>
          ))}
        </div>
      </div>
      <CarouselButton
        onClick={scrollPrev}
        className="left-4"
        icon={ChevronLeft}
      />
      <CarouselButton
        onClick={scrollNext}
        className="right-4"
        icon={ChevronRight}
      />
    </div>
  );
}

interface CarouselButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
}

function CarouselButton({
  onClick,
  className,
  icon: Icon,
}: CarouselButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute top-1/2 -translate-y-1/2 bg-black/50 border-gray-800 hover:bg-black/75 ${className}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
