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

export function AgentCard({
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
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{agent.category}</p>
              <span className="text-sm text-muted-foreground">•</span>
              <p className="text-sm text-muted-foreground">
                {workflowCount} workflows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">
              {agent.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {agent.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1">
          {agent.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-normal cursor-pointer hover:bg-secondary/80"
              onClick={() => onFilter("tag", tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto pt-4 flex justify-end">
          <Button size="sm" asChild className="w-[120px]">
            <Link href={`/agent/${agent.id}`}>Learn more</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
