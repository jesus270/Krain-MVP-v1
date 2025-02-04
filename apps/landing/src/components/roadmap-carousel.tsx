"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { PhaseCard } from "./phase-card";

const phases = [
  {
    phase: "1",
    title: "Laying the Foundation — ",
    subtitle: "AI Agent Discovery & Engagement",
    features: [
      "Launch of the $KRAIN Token to power the AI Agent Economy",
      "Introduction of the AI Agent Discovery Engine with NLP-powered search",
      "Comprehensive AI Agent Directory with performance metrics",
      "Community-driven Reputation and Review System",
    ],
  },
  {
    phase: "2",
    title: "Personalized AI Agents — ",
    subtitle: "Adaptive Recommendations & Sponsorships",
    features: [
      "Deployment of the AI Agent Recommendation Engine powered by advanced NLP",
      "Deployment of the Agent Workflow Builder",
      "Launch of Verified AI Agents and Sponsorship Opportunities",
      'Curated "Best Of" AI Agent Lists for enhanced user discovery',
    ],
  },
  {
    phase: "3",
    title: "Building the AI Agent Network — ",
    subtitle: "Collaborative Agent Infrastructure",
    features: [
      "Launch of Agent Networking API v1 for seamless agent-to-agent communication",
      "Introduction of Agent-to-Agent Messaging and Task Requests",
      "Interactive Side-by-Side Agent Comparison for smarter decision-making",
    ],
  },
  {
    phase: "4",
    title: "Empowering Autonomous AI — ",
    subtitle: "Data Sharing & Monetization",
    features: [
      "Agent-to-Agent Secure Data Sharing and Payment Protocols",
      "Cross-Chain Wallet Integration for AI Agents",
      "Autonomous Payment Capabilities enabling AI agents",
    ],
  },
  {
    phase: "future",
    title: "Democratizing AI Agent Creation",
    subtitle: "",
    features: [
      "No-Code AI Agent Builder to enable users of all skill levels",
      "AI Agent Co-Ownership Model for decentralized profit-sharing",
      "Orion Protocol integration for fully autonomous AI agents",
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
