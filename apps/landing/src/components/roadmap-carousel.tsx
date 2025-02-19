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
      "Launch of the $KRAIN Token to power the AI Agent Economy",
      "Introduction of the AI Agent Discovery Engine with NLP-powered search",
      "Comprehensive AI Agent Portal with performance metrics",
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
