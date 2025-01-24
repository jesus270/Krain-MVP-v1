"use client";

import "regenerator-runtime/runtime";
import { Button } from "@krain/ui/components/ui/button";
import { Textarea } from "@krain/ui/components/ui/textarea";
import { MicIcon, SearchIcon, StarIcon, BotIcon } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Badge } from "@krain/ui/components/ui/badge";
import { agents } from "./agent-data";
import Link from "next/link";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const commands = [
    {
      command: "clear search",
      callback: ({ resetTranscript }: { resetTranscript: () => void }) => {
        setSearchQuery("");
        resetTranscript();
      },
    },
    {
      command: "search for *",
      callback: (searchTerm: string) => {
        setSearchQuery(searchTerm);
      },
    },
    {
      command: "find *",
      callback: (searchTerm: string) => {
        setSearchQuery(searchTerm);
      },
    },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands });

  const handleVoiceInput = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      alert(
        "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
      );
      return;
    }

    if (!isMicrophoneAvailable) {
      alert("Please enable microphone access to use voice search.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
      });
    }
  }, [listening, isMicrophoneAvailable, browserSupportsSpeechRecognition]);

  // Update search query when transcript changes
  useEffect(() => {
    if (transcript && !listening) {
      setSearchQuery(transcript);
    }
  }, [transcript, listening]);

  // Common words to filter out from search
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "me",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
    "find",
    "show",
    "get",
    "want",
    "looking",
    "search",
    "need",
    "can",
    "could",
    "would",
    "should",
    "please",
    "help",
  ]);

  // Process natural language query into search terms
  const processSearchQuery = (query: string): string[] => {
    return query
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Remove punctuation
      .split(/\s+/) // Split on whitespace
      .filter(
        (word) =>
          word.length > 1 && // Filter out single characters
          !stopWords.has(word), // Filter out stop words
      );
  };

  // Filter and sort agents based on processed search terms
  const filteredAgents = agents
    .map((agent) => {
      if (!searchQuery.trim()) return { agent, score: 1 }; // Show all when no search

      const searchTerms = processSearchQuery(searchQuery);
      if (searchTerms.length === 0) return { agent, score: 1 };

      const searchableText = [
        agent.name,
        agent.description,
        ...agent.tags,
        agent.category,
        ...agent.capabilities,
        ...agent.integrationPlatforms,
        ...agent.supportedLanguages,
      ]
        .join(" ")
        .toLowerCase();

      // Calculate match score (number of matching terms / total terms)
      const matchingTerms = searchTerms.filter((term) =>
        searchableText.includes(term),
      );
      const score = matchingTerms.length / searchTerms.length;

      return { agent, score };
    })
    .filter(({ score }) => score > 0) // Remove non-matches
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .map(({ agent }) => agent); // Extract just the agent objects

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8">
      <header className="flex flex-col items-center gap-4 lg:gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Discover AI Agents</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Use natural language to find the perfect AI agent for your needs
          </p>
        </div>
        <div className="w-full max-w-2xl relative">
          <div className="relative flex items-end shadow-[0_0_10px_rgba(0,0,0,0.10)] rounded-lg">
            <Textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="resize-none text-sm min-h-[56px] pr-20 border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Try saying 'free chatbot with API'"
              rows={1}
            />
            <div className="absolute right-2 bottom-1.5 flex gap-2">
              <Button
                onClick={handleVoiceInput}
                variant="ghost"
                size="icon"
                title={listening ? "Stop recording" : "Search with voice"}
                className="h-8 w-8 hover:bg-muted"
                disabled={!browserSupportsSpeechRecognition}
              >
                <MicIcon
                  className={`w-4 h-4 ${listening ? "text-red-500" : ""} ${!browserSupportsSpeechRecognition ? "opacity-50" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Search"
                className="h-8 w-8 hover:bg-muted"
              >
                <SearchIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {!browserSupportsSpeechRecognition && (
            <p className="text-xs text-muted-foreground mt-2">
              Voice search is not supported in this browser. Please use Chrome
              or Edge for voice search functionality.
            </p>
          )}
        </div>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAgents.map((agent) => (
          <Card
            key={agent.id}
            className="group transition-all hover:shadow-xl hover:scale-[1.02] duration-300 flex flex-col"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-start gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
                  {agent.imageUrl.startsWith("http") &&
                  !failedImages.has(agent.id) ? (
                    <Image
                      src={agent.imageUrl}
                      alt={`${agent.name} icon`}
                      width={32}
                      height={32}
                      className="h-6 w-6 object-contain"
                      onError={() =>
                        setFailedImages((prev) => new Set([...prev, agent.id]))
                      }
                    />
                  ) : (
                    <BotIcon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-semibold">
                    {agent.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {agent.category}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-medium">
                  {agent.popularityScore}
                </span>
                <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-1">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {agent.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="hover:bg-secondary transition-colors text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {agent.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{agent.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">License</p>
                  <p className="font-medium">{agent.licenseType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Pricing</p>
                  <p className="font-medium">
                    {agent.pricing.freeTier
                      ? "Free"
                      : `$${agent.pricing.monthly}/mo`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Reviews</p>
                  <p className="font-medium">
                    {agent.reviewsCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Uptime</p>
                  <p className="font-medium">{agent.uptime}%</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium">Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.slice(0, 3).map((capability) => (
                    <Badge
                      key={capability}
                      variant="secondary"
                      className="text-xs px-2 py-0"
                    >
                      {capability}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      +{agent.capabilities.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-4">
              <Button variant="default" asChild className="flex-1 h-8 text-xs">
                <Link href={`/agent/${agent.id}`}>View Details</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 h-8 text-xs">
                <a
                  href={agent.documentationURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </main>
    </div>
  );
}
