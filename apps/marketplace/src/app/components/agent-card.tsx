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
    <Card className={`flex flex-col lg:flex-row`}>
      <div
        ref={containerRef}
        className="aspect-square w-full h-full bg-muted flex"
      >
        <AgentImage
          imageUrl={agent.imageUrl || ""}
          name={agent.name}
          size="lg"
          shape="rounded"
          className=""
          containerRef={containerRef}
        />
      </div>
      <div className="flex flex-col p-4 w-full justify-between items-start">
        <h3 className="font-semibold text-xl">{agent.name}</h3>
        <div className="flex justify-between gap-2 mt-1">
          <p className="text-sm text-muted-foreground">{agent.category}</p>
          <div className="flex items-center justify-start gap-1">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
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

        <div className="pt-4 flex justify-end w-full">
          <Button
            size="sm"
            asChild
            className="bg-muted hover:bg-muted/60 text-foreground rounded-full shadow-sm border-muted-foreground/20 border transition-colors"
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
