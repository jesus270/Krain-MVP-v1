"use client";

import { Button } from "@krain/ui/components/ui/button";
import { Badge } from "@krain/ui/components/ui/badge";
import { StarIcon, BotIcon, ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { agents } from "@/app/agent-data";
import { AIAgent } from "@/app/types";

interface PageProps {
  params: {
    id: string;
  };
}

export default function AgentDetails({ params }: PageProps) {
  const [failedImage, setFailedImage] = useState(false);
  const agent = agents.find((a) => a.id === params.id);

  if (!agent) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">Agent not found</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 hover:text-blue-500"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </Link>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              {agent.imageUrl.startsWith("http") && !failedImage ? (
                <Image
                  src={agent.imageUrl}
                  alt={`${agent.name} icon`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  onError={() => setFailedImage(true)}
                />
              ) : (
                <BotIcon className="h-10 w-10 text-white" />
              )}
            </div>
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
                <p className="font-medium text-lg">{agent.uptime}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Reviews</p>
                <p className="font-medium text-lg">
                  {agent.reviewsCount.toLocaleString()}
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 space-y-6 sticky top-8">
            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    ${agent.pricing.monthly}
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
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
                <a
                  href={agent.documentationURL}
                  target="_blank"
                  rel="noreferrer"
                >
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
      </div>
    </div>
  );
}
