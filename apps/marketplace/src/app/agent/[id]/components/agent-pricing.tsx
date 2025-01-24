"use client";

import { Button } from "@krain/ui/components/ui/button";
import { Badge } from "@krain/ui/components/ui/badge";
import { AIAgent } from "@/app/types";

interface AgentPricingProps {
  agent: AIAgent;
}

export function AgentPricing({ agent }: AgentPricingProps) {
  return (
    <div className="relative h-fit">
      <div className="sticky top-8 border rounded-lg p-6 space-y-6">
        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                ${agent.pricing.monthly}
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
              {agent.pricing.freeTier && (
                <Badge variant="secondary" className="mt-1">
                  Free Tier Available
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="capitalize">
              {agent.licenseType}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">Yearly Pricing</p>
            <p className="font-medium">
              ${agent.pricing.yearly}
              <span className="text-sm text-muted-foreground">/year</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <a href={agent.apiEndpoint} target="_blank" rel="noreferrer">
              Get Started
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={agent.documentationURL} target="_blank" rel="noreferrer">
              Documentation
            </a>
          </Button>
          {agent.demoURL && (
            <Button asChild variant="outline" className="w-full">
              <a href={agent.demoURL} target="_blank" rel="noreferrer">
                Try Demo
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
