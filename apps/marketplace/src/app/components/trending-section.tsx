"use client";

import { AIAgent } from "../types";
import { ListAgentCard } from "./list-agent-card";
import { Card } from "@krain/ui/components/ui/card";
import { Star as StarIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";
import Link from "next/link";

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
        {agents.slice(0, 5).map((agent) => (
          <Link
            key={agent.id}
            href={`/agent/${agent.id}`}
            className="block w-full no-underline"
          >
            <Card className="relative overflow-hidden flex flex-row h-[60px] w-full text-foreground cursor-pointer hover:opacity-90 transition-opacity">
              <div className="relative aspect-square w-[60px] h-full shrink-0 flex items-center justify-center bg-primary">
                <StarIcon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 flex flex-col justify-center p-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm truncate">
                      {agent.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xs truncate text-muted-foreground">
                        {agent.category}
                      </p>
                      <div className="flex items-center gap-0.5">
                        <StarIcon className="w-2.5 h-2.5 text-primary fill-primary" />
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
            </Card>
          </Link>
        ))}
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
    <div className="w-full mb-8 bg-black/90 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Trending Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
