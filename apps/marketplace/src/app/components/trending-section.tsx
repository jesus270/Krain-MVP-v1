"use client";

import { AIAgent } from "../types";
import { ListAgentCard } from "./list-agent-card";
import { Card } from "@krain/ui/components/ui/card";
import { Star as StarIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";
import Link from "next/link";
import { AgentImage } from "../agent/[id]/components/agent-image";
import { RefObject, useRef } from "react";
import { FavoriteButton } from "./favorite-button";

interface TrendingCategoryProps {
  title: string;
  agents: AIAgent[];
  onFilter: (type: string, value: string) => void;
  className?: string;
}

function TrendingCategory({
  title,
  agents,
  onFilter,
  className,
}: TrendingCategoryProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <div className="flex flex-col">
        {agents.slice(0, 5).map((agent) => {
          const imageContainerRef = useRef<HTMLDivElement>(null);
          return (
            <div key={agent.id} className="relative">
              <Link
                href={`/agent/${agent.id}`}
                className="block w-full no-underline"
              >
                <Card className="overflow-hidden flex flex-row py-3 px-5 w-full text-foreground cursor-pointer hover:bg-muted/50 transition-colors shadow-xs gap-3">
                  <div
                    ref={imageContainerRef}
                    className="size-[36px] flex items-center justify-center"
                  >
                    <AgentImage
                      imageUrl={agent.imageUrl || ""}
                      name={agent.name}
                      size="md"
                      shape="square"
                      containerRef={
                        imageContainerRef as RefObject<HTMLDivElement>
                      }
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{agent.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {agent.category}
                          </p>
                          <div className="flex items-center gap-0.5">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="size-4"
                            >
                              <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="url(#starGradient)"
                                stroke="url(#starGradient)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
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
                            <span className="text-xs text-foreground/70 font-medium">
                              {agent.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-foreground/70">
                              ({agent.reviewsCount})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FavoriteButton agentId={parseInt(agent.id)} />
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TrendingSectionProps {
  agents: AIAgent[];
  onFilter: (type: string, value: string) => void;
}

export function TrendingSection({ agents, onFilter }: TrendingSectionProps) {
  // Filter agents by category
  const cryptoAgents = agents
    .filter(
      (agent) =>
        agent.category === "Crypto" ||
        agent.tags.some((tag) => tag.toLowerCase().includes("crypto")),
    )
    .sort((a, b) => b.rating - a.rating);

  const businessAgents = agents
    .filter(
      (agent) =>
        agent.category === "Business" ||
        agent.category === "Business Intelligence" ||
        agent.category === "Business Automation",
    )
    .sort((a, b) => b.rating - a.rating);

  const travelAgents = agents
    .filter(
      (agent) =>
        agent.category === "Travel" ||
        agent.tags.some((tag) => tag.toLowerCase().includes("travel")),
    )
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full">
      <TrendingCategory
        title="Crypto"
        agents={cryptoAgents}
        onFilter={onFilter}
        className="text-white"
      />
      <TrendingCategory
        title="Business"
        agents={businessAgents}
        onFilter={onFilter}
        className="text-white"
      />
      <TrendingCategory
        title="Travel"
        agents={travelAgents}
        onFilter={onFilter}
        className="text-white"
      />
    </div>
  );
}
