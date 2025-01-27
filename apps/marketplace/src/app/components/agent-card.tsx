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
import {
  BotIcon,
  StarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TimerIcon,
  BrainCircuitIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AgentCardProps {
  agent: AIAgent;
  onImageError: (agentId: string) => void;
  failedImages: Set<string>;
  onFilter: (type: string, value: string) => void;
}

export function AgentCard({
  agent,
  onImageError,
  failedImages,
  onFilter,
}: AgentCardProps) {
  const isPaid = agent.pricing.monthly > 0 || agent.pricing.yearly > 0;
  const formatMetric = (value: number) => (value * 100).toFixed(0) + "%";

  return (
    <Card className="group transition-all hover:shadow-xl hover:scale-[1.02] duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
            {agent.imageUrl.startsWith("http") &&
            !failedImages.has(agent.id) ? (
              <Image
                src={agent.imageUrl}
                alt={`${agent.name} icon`}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                onError={() => onImageError(agent.id)}
              />
            ) : (
              <BotIcon className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{agent.name}</CardTitle>
            <CardDescription className="text-xs">
              by {agent.developer}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">
            {agent.reputationMetrics.overallScore.toFixed(1)}
          </span>
        </div>
      </CardHeader>

      <div className="px-6 pb-2 flex gap-2">
        <Badge
          variant="outline"
          className="bg-primary/5 hover:bg-primary/10 cursor-pointer"
          onClick={() => onFilter("category", agent.category)}
        >
          {agent.category}
        </Badge>
        <Badge
          variant="outline"
          className="bg-secondary/10 hover:bg-secondary/15 capitalize cursor-pointer"
          onClick={() => onFilter("licenseType", agent.licenseType)}
        >
          {agent.licenseType}
        </Badge>
      </div>

      <CardContent className="space-y-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {agent.shortDescription}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <BrainCircuitIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {formatMetric(agent.performanceMetrics.accuracyScore)} accuracy
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TimerIcon className="w-3.5 h-3.5 text-violet-500" />
            <span>{agent.performanceMetrics.responseTime}ms response</span>
          </div>
          <div className="flex items-center gap-1.5">
            {agent.pricing.freeTier ? (
              <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <XCircleIcon className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>
              Free tier {agent.pricing.freeTier ? "available" : "unavailable"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {agent.enterpriseOptions ? (
              <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <XCircleIcon className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>Enterprise options</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
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
      </CardContent>

      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
          <Button size="sm" asChild className="w-full">
            <Link href={`/agent/${agent.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
