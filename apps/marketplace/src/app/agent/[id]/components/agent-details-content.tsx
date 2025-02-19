"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { StarIcon } from "lucide-react";
import { AIAgent } from "@/app/types";
import { AgentImage } from "./agent-image";
import { BotIcon } from "lucide-react";
import {
  TwitterIcon,
  YoutubeIcon,
  LinkedinIcon,
  InstagramIcon,
  MessageCircleIcon,
} from "lucide-react";

interface AgentDetailsContentProps {
  agent: AIAgent;
}

export function AgentDetailsContent({ agent }: AgentDetailsContentProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
          <BotIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">by {agent.companyName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{agent.category}</Badge>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm">
                {agent.rating.toFixed(1)} ({agent.reviewsCount} reviews)
              </span>
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
            <h3 className="font-medium">Website</h3>
            <code className="block bg-muted p-2 rounded-md text-sm">
              {agent.websiteUrl}
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Blockchains Supported</h3>
            <div className="flex flex-wrap gap-2">
              {agent.blockchainsSupported.map((blockchain) => (
                <Badge key={blockchain} variant="secondary">
                  {blockchain}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Industry Focus</h3>
            <div className="flex flex-wrap gap-2">
              {agent.industryFocus.map((industry) => (
                <Badge key={industry} variant="outline">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          {agent.tokenSymbol && (
            <div className="space-y-2">
              <h3 className="font-medium">Token Information</h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <span className="text-sm font-medium">Symbol</span>
                  <span className="text-sm">{agent.tokenSymbol}</span>
                </div>
                <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <span className="text-sm font-medium">Name</span>
                  <span className="text-sm">{agent.tokenName}</span>
                </div>
                {agent.cmcTokenLink && (
                  <a
                    href={agent.cmcTokenLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View on CoinMarketCap
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <div className="grid gap-4">
          <div className="flex items-center justify-between bg-muted p-3 rounded-md">
            <span className="font-medium">Support Email</span>
            <a
              href={`mailto:${agent.supportEmail}`}
              className="text-blue-500 hover:underline"
            >
              {agent.supportEmail}
            </a>
          </div>
          {agent.contactEmail && (
            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
              <span className="font-medium">Contact Email</span>
              <a
                href={`mailto:${agent.contactEmail}`}
                className="text-blue-500 hover:underline"
              >
                {agent.contactEmail}
              </a>
            </div>
          )}
          {agent.contactPhone && (
            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
              <span className="font-medium">Phone</span>
              <span>{agent.contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Social Media</h2>
        <div className="flex flex-wrap gap-4">
          {agent.socialMedia.x && (
            <a
              href={agent.socialMedia.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <TwitterIcon className="h-5 w-5" />
            </a>
          )}
          {agent.socialMedia.discord && (
            <a
              href={agent.socialMedia.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircleIcon className="h-5 w-5" />
            </a>
          )}
          {agent.socialMedia.youtube && (
            <a
              href={agent.socialMedia.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <YoutubeIcon className="h-5 w-5" />
            </a>
          )}
          {agent.socialMedia.linkedin && (
            <a
              href={agent.socialMedia.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
          )}
          {agent.socialMedia.instagram && (
            <a
              href={agent.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
