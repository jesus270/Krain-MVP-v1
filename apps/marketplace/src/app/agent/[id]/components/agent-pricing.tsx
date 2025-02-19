"use client";

import { Button } from "@krain/ui/components/ui/button";
import { Badge } from "@krain/ui/components/ui/badge";
import { AIAgent } from "@/app/types";
import { Card } from "@krain/ui/components/ui/card";

interface AgentPricingProps {
  agent: AIAgent;
}

export function AgentPricing({ agent }: AgentPricingProps) {
  // Check for free tier
  const hasFreeOption = agent.pricing.some(
    (price) => price.amount === "0" || price.amount === "Free",
  );

  // Check for enterprise tier
  const hasEnterprise = agent.pricing.some(
    (price) => price.amount === "Contact Us",
  );

  return (
    <div className="relative h-fit">
      <div className="sticky top-8 border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Pricing Plans</h2>

        {/* Pricing Tiers */}
        <div className="space-y-4">
          {agent.pricing.map((tier, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{tier.name}</h3>
                <Badge variant="outline" className="capitalize">
                  {tier.interval}
                </Badge>
              </div>

              <div className="flex items-baseline gap-1">
                {tier.amount === "Contact Us" ? (
                  <span className="text-lg font-semibold">Contact Us</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold">
                      {tier.amount === "0" || tier.amount === "Free"
                        ? "Free"
                        : `$${tier.amount}`}
                    </span>
                    {tier.amount !== "0" && tier.amount !== "Free" && (
                      <span className="text-sm text-muted-foreground">
                        /{tier.interval}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap gap-2">
          {hasFreeOption && (
            <Badge variant="secondary">Free Tier Available</Badge>
          )}
          {hasEnterprise && (
            <Badge variant="secondary">Enterprise Options</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <a href={agent.websiteUrl} target="_blank" rel="noreferrer">
              Get Started
            </a>
          </Button>
          {agent.websiteUrl && (
            <Button asChild variant="outline" className="w-full">
              <a href={agent.websiteUrl} target="_blank" rel="noreferrer">
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
