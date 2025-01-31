"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { PhaseCard } from "./phase-card";

const phases = [
  {
    phase: "PHASE ONE",
    title: "AI agent discovery engine",
    features: [
      "System user search",
      "AI agent directory",
      "AI agent ratings and reviews",
      "AI agent profile and metrics",
    ],
  },
  {
    phase: "PHASE TWO",
    title: "AI agent recommendation engine",
    features: [
      "MLT recommendation engine",
      "Performance and reputation memory",
      "Verified agents and partnerships",
      "Curated AI agent lists (Best 10)",
    ],
  },
  {
    phase: "PHASE THREE",
    title: "AI agent recommendation engine",
    features: [
      "MLT recommendation engine",
      "Performance and reputation memory",
      "Multiple plans and subscriptions",
      "Curated AI agent lists (Best 10)",
    ],
  },
];

export function RoadmapCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    containScroll: "trimSnaps",
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div>
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white">Roadmap</h2>
        <div className="flex gap-2">
          <button onClick={scrollPrev} className="group">
            <Image
              src="/button-carousel.svg"
              alt="Previous"
              width={80}
              height={49}
              className="rotate-180 opacity-50 transition-opacity hover:opacity-100"
            />
          </button>
          <button onClick={scrollNext} className="group">
            <Image
              src="/button-carousel.svg"
              alt="Next"
              width={80}
              height={49}
              className="opacity-50 transition-opacity hover:opacity-100"
            />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="grid grid-flow-col auto-cols-[420px] gap-6">
          {phases.map((phase, index) => (
            <div key={index}>
              <PhaseCard {...phase} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
