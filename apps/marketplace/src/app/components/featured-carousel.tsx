"use client";

import { CustomCarousel } from "@krain/ui/components/ui/custom-carousel";
import { AgentCard } from "./agent-card";
import { AIAgent } from "../types";

interface FeaturedCarouselProps {
  agents: AIAgent[];
  onFilter: (type: string, value: string) => void;
}

export function FeaturedCarousel({ agents, onFilter }: FeaturedCarouselProps) {
  return (
    <div className="relative w-full mx-auto">
      <CustomCarousel
        options={{
          loop: true,
          containScroll: "trimSnaps",
        }}
        showControls={false}
        showPartialSlides={true}
        slideClassName="grid grid-flow-col auto-cols-[100%] !gap-4"
        controlsClassName="flex justify-end mb-8"
      >
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="w-full transition-opacity duration-300 px-1 group-hover:opacity-100"
          >
            <AgentCard agent={agent} onFilter={onFilter} featured={true} />
          </div>
        ))}
      </CustomCarousel>
    </div>
  );
}
