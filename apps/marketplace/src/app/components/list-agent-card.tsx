import { AIAgent } from "../types";
import { Card } from "@krain/ui/components/ui/card";
import { BotIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { AgentImage } from "../agent/[id]/components/agent-image";
import { useRef, RefObject } from "react";

interface ListAgentCardProps {
  agent: AIAgent;
  onFilter: (type: string, value: string) => void;
}

export function ListAgentCard({ agent, onFilter }: ListAgentCardProps) {
  // Generate random number of workflows (under 1000)
  const workflowCount = Math.floor(Math.random() * 999) + 1;
  const imageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Link
      href={`/agent/${agent.id}`}
      className="block w-[350px] h-[60px] no-underline"
    >
      <Card className="relative overflow-hidden flex flex-row h-full w-full text-foreground cursor-pointer hover:bg-muted/50 transition-colors shadow-xs">
        <div
          ref={imageContainerRef}
          className="relative size-[60px] flex-shrink-0 flex items-center justify-center bg-muted/20"
          style={{ minWidth: "60px" }}
        >
          <AgentImage
            imageUrl={agent.imageUrl || ""}
            name={agent.name}
            size="sm"
            shape="square"
            className="size-full object-cover"
            containerRef={imageContainerRef as RefObject<HTMLDivElement>}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center p-2">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs truncate text-muted-foreground">
                  {agent.category}
                </p>
                <div className="flex items-center gap-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-2.5"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="url(#starGradientList)"
                      stroke="url(#starGradientList)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="starGradientList"
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
      </Card>
    </Link>
  );
}
