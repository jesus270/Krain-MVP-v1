"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { StarIcon } from "lucide-react";
import { AIAgent } from "@/app/types";
import { AgentImage } from "./agent-image";

interface AgentDetailsContentProps {
  agent: AIAgent;
}

export function AgentDetailsContent({ agent }: AgentDetailsContentProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <AgentImage imageUrl={agent.imageUrl} name={agent.name} />
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">by {agent.developer}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{agent.category}</Badge>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm">{agent.popularityScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">{agent.description}</p>
        <div className="flex flex-wrap gap-2">
          {agent.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Technical Details</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">API Endpoint</h3>
            <code className="block bg-muted p-2 rounded-md text-sm">
              {agent.apiEndpoint}
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((capability) => (
                <Badge key={capability} variant="secondary">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Integration Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {agent.integrationPlatforms.map((platform) => (
                <Badge key={platform} variant="outline">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Supported Languages</h3>
            <div className="flex flex-wrap gap-2">
              {agent.supportedLanguages.map((language) => (
                <Badge key={language} variant="outline">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Uptime</p>
            <p className="font-medium text-lg">
              {agent.performanceMetrics.uptime}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Reviews</p>
            <p className="font-medium text-lg">
              {agent.reputationMetrics.reviewsCount.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Rating</p>
            <p className="font-medium text-lg flex items-center gap-1">
              {agent.popularityScore}
              <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </p>
          </div>
        </div>
      </div>

      {/* Release Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Release Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Initial Release</p>
            <p className="font-medium">
              {new Date(agent.releaseDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">
              {new Date(agent.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
