"use client";

import { CustomCarousel } from "@krain/ui/components/ui/custom-carousel";
import { FeaturedAgentCard } from "./agent-card";
import { AIAgent } from "../types";

interface FeaturedCarouselProps {
  agents: AIAgent[];
  onFilter: (type: string, value: string) => void;
  showControls?: boolean;
}

export function FeaturedCarousel({
  agents,
  onFilter,
  showControls = true,
}: FeaturedCarouselProps) {
  return (
    <div className="relative w-full mx-auto mb-8">
      <CustomCarousel
        options={{
          loop: true,
          containScroll: "trimSnaps",
        }}
        showControls={showControls}
        showPartialSlides={true}
        slideClassName="grid grid-flow-col auto-cols-[100%] md:auto-cols-[90%] lg:auto-cols-[85%] !gap-4"
        controlsClassName="flex justify-end gap-2 absolute -top-12 right-0"
      >
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="w-full transition-opacity duration-300 px-1 group-hover:opacity-100"
          >
            <FeaturedAgentCard
              agent={agent}
              onFilter={onFilter}
              featured={true}
            />
          </div>
        ))}
      </CustomCarousel>
    </div>
  );
}
