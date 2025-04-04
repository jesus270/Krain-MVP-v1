"use client";

import * as React from "react";
import { CustomCarousel } from "@krain/ui/components/ui/custom-carousel";
import { PhaseCard } from "./phase-card";

const phases = [
  {
    phase: "1",
    title: "Laying the Foundation — ",
    subtitle: "AI Agent Discovery & Engagement",
    features: [
      "Launch of the $KRAIN Token to power the AI App Economy",
      "Introduction of the AI App Discovery Engine with NLP-powered search",
      "Community-driven Reputation and Review System",
    ],
  },
  {
    phase: "2",
    title: "AI App Infrastructure — ",
    subtitle: "AI App Deployment & Hosting",
    features: [
      "Linux containers for AI apps",
      "One-click deployment of AI apps",
      "Crypto payments acceptance",
    ],
  },
  {
    phase: "3",
    title: "Building the AI App Network — ",
    subtitle: "App Workflow Infrastructure",
    features: [
      "AI App Workflow Builder for complex tasks",
      "Incentive-based system to notify builders of emerging needs",
      "User incentives for workflow creation",
    ],
  },
  {
    phase: "4",
    title: "Collaborative AI App Infrastructure — ",
    subtitle: "Data Sharing, Payments & Monetization",
    features: [
      "App networking API for seamless integration",
      "API to connect off-platform built apps",
      "Payment infrastructure with crypto and fiat",
    ],
  },
  {
    phase: "future",
    title: "Democratizing AI App Creation",
    subtitle: "",
    features: [
      "No-Code AI App Builder to enable users of all skill levels",
      "AI App Co-Ownership Model for decentralized profit-sharing",
      "Orion Protocol integration for fully autonomous AI apps",
    ],
  },
];

export function RoadmapCarousel() {
  return (
    <div>
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">
        Roadmap
      </h2>
      <CustomCarousel controlsClassName="flex justify-end gap-2 mb-16">
        {phases.map((phase, index) => (
          <div key={index} className="w-full">
            <PhaseCard {...phase} />
          </div>
        ))}
      </CustomCarousel>
    </div>
  );
}
