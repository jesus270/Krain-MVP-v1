"use client";

import { AIAgent } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Badge } from "@krain/ui/components/ui/badge";
import { Button } from "@krain/ui/components/ui/button";
import { BotIcon, StarIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { AgentImage } from "../agent/[id]/components/agent-image";
import { useRef } from "react";
import { FavoriteButton } from "./favorite-button";

interface AgentCardProps {
  agent: AIAgent;
  onFilter: (type: string, value: string) => void;
  featured?: boolean;
}

export function FeaturedAgentCard({
  agent,
  onFilter,
  featured = false,
}: AgentCardProps) {
  // Find if there's a free tier
  const hasFreeOption = agent.pricing.some(
    (price) => price.amount === "0" || price.amount === "Free",
  );

  // Find if there's an enterprise tier
  const hasEnterprise = agent.pricing.some(
    (price) => price.amount === "Contact Us",
  );

  // Generate random number of workflows (under 1000)
  const workflowCount = Math.floor(Math.random() * 999) + 1;
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <Card className={`flex flex-col lg:flex-row p-0 relative`}>
      {/* Favorite Button */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton agentId={parseInt(agent.id)} size="sm" />
      </div>

      <div
        ref={containerRef}
        className="aspect-square w-full lg:w-auto bg-muted flex"
      >
        <AgentImage
          imageUrl={agent.imageUrl || ""}
          name={agent.name}
          size="lg"
          shape="rounded"
          className=""
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
        />
      </div>
      <div className="flex flex-col w-full justify-between">
        <div className="flex flex-col p-4 w-full items-start">
          <h3 className="font-semibold text-xl">{agent.name}</h3>
          <div className="flex justify-between gap-2 mt-1">
            <p className="text-sm text-muted-foreground">{agent.category}</p>
            <div className="flex items-center justify-start gap-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
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
              <span className="text-sm font-medium text-foreground">
                {agent.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-foreground flex-1">
              {workflowCount} workflows
            </p>
          </div>

          <p className="mt-2 text-sm text-foreground line-clamp-2">
            {agent.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1 line-clamp-2">
            {agent.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                style={{
                  background:
                    "linear-gradient(to right, rgba(31, 197, 214, 0.4), transparent)",
                  borderColor: "rgba(31, 197, 214, 0.8)",
                  borderWidth: "1px",
                }}
                className="text-xs font-normal cursor-pointer hover:opacity-80 transition-all"
                onClick={() => onFilter("tag", tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-end w-full p-4">
          <Button
            size="sm"
            asChild
            className="bg-muted hover:bg-muted/60 text-foreground rounded-full shadow-xs border-muted-foreground/20 border transition-colors"
          >
            <Link href={`/agent/${agent.id}`}>Learn more</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// For backward compatibility, export the FeaturedAgentCard as AgentCard as well
export { FeaturedAgentCard as AgentCard };
