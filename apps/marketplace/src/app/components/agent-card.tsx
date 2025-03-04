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

  const cardClassName = `relative overflow-hidden ${
    featured ? "shadow-lg" : ""
  }`;

  // Generate random number of workflows (under 1000)
  const workflowCount = Math.floor(Math.random() * 999) + 1;

  return (
    <Card className={`${cardClassName} flex flex-col md:flex-row md:h-[240px]`}>
      <div className="relative aspect-square w-full md:w-[240px] md:h-full shrink-0 bg-primary">
        <div className="absolute inset-0 flex items-center justify-center">
          <BotIcon className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="flex flex-col p-4 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="w-full">
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
          </div>
        </div>

        <p className="mt-2 text-sm text-foreground line-clamp-2">
          {agent.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1">
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

        <div className="mt-auto pt-4 flex justify-end">
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
