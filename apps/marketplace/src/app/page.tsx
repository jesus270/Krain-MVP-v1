"use client";

import "regenerator-runtime/runtime";
import { Button } from "@krain/ui/components/ui/button";
import { Textarea } from "@krain/ui/components/ui/textarea";
import {
  MicIcon,
  SearchIcon,
  StarIcon,
  BotIcon,
  SlidersHorizontal,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@krain/ui/components/ui/sheet";
import { Separator } from "@krain/ui/components/ui/separator";
import {
  FilterState,
  defaultFilterState,
  MultiSelectFilter,
  ScoreFilter,
  ActiveFilters,
} from "./filters";
import { AgentCard } from "./components/agent-card";

// Extract unique values from agents
const uniqueCategories = [
  ...new Set(agents.map((agent) => agent.category)),
].filter(Boolean);
const uniqueSubcategories = [
  ...new Set(agents.flatMap((agent) => agent.subcategories)),
].filter(Boolean);
const uniqueTags = [...new Set(agents.flatMap((agent) => agent.tags))].filter(
  Boolean,
);
const uniqueLanguages = [
  ...new Set(agents.flatMap((agent) => agent.supportedLanguages)),
].filter(Boolean);
const uniqueIndustries = [
  ...new Set(
    agents.flatMap((agent) =>
      agent.useCases
        .map((uc) => uc.industry)
        .filter(
          (industry): industry is string =>
            industry !== undefined && industry !== null,
        ),
    ),
  ),
].filter(Boolean);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilterState,
    categories: [],
    subcategories: [],
    languages: [],
    industries: [],
    pricingType: [],
    licenseTypes: [],
  }));

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

  // Filter agents based on search query and filters
  const filteredAgents = agents
    .filter((agent) => {
      // Text search
      if (searchQuery.trim()) {
        const searchTerms = processSearchQuery(searchQuery);
        if (searchTerms.length === 0) return true;

        const searchableText = [
          agent.name,
          agent.description,
          ...(agent.tags || []),
          agent.category,
          ...(agent.subcategories || []),
          agent.developer,
          ...(agent.capabilities || []),
          ...(agent.integrationPlatforms || []),
          ...(agent.supportedLanguages || []),
          ...(agent.technicalRequirements || []),
          ...(agent.useCases
            ?.map((uc) => [
              uc.title,
              uc.description,
              uc.industry,
              ...(uc.successMetrics || []),
              ...(uc.testimonials || []),
            ])
            .flat() || []),
          ...(agent.competitiveAdvantages || []),
          ...(agent.bestSuitedFor || []),
          agent.version,
        ]
          .filter(
            (item): item is string =>
              typeof item === "string" && item.length > 0,
          )
          .join(" ")
          .toLowerCase();

        const matchingTerms = searchTerms.filter((term) =>
          searchableText.includes(term),
        );
        if (matchingTerms.length === 0) return false;
      }

      // Category filters
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(agent.category)
      ) {
        return false;
      }

      // Subcategory filters
      if (
        filters.subcategories.length > 0 &&
        !agent.subcategories.some((sub) => filters.subcategories.includes(sub))
      ) {
        return false;
      }

      // Pricing type filters
      if (filters.pricingType.length > 0) {
        const isPaid = agent.pricing.monthly > 0 || agent.pricing.yearly > 0;
        const pricingType = isPaid ? "paid" : "free";
        if (!filters.pricingType.includes(pricingType)) {
          return false;
        }
      }

      // License type filters
      if (
        filters.licenseTypes.length > 0 &&
        !filters.licenseTypes.includes(agent.licenseType)
      ) {
        return false;
      }

      // Language filters
      if (
        filters.languages.length > 0 &&
        !agent.supportedLanguages.some((lang) =>
          filters.languages.includes(lang),
        )
      ) {
        return false;
      }

      // Industry filters
      if (filters.industries.length > 0) {
        const agentIndustries = agent.useCases
          .map((uc) => uc.industry)
          .filter(Boolean) as string[];
        if (!agentIndustries.some((ind) => filters.industries.includes(ind))) {
          return false;
        }
      }

      // Tag filters
      if (
        filters.tags.length > 0 &&
        !agent.tags.some((tag) => filters.tags.includes(tag))
      ) {
        return false;
      }

      // Score filters
      if (
        filters.minReputationScore > 0 &&
        agent.reputationMetrics.overallScore < filters.minReputationScore
      ) {
        return false;
      }
      if (
        filters.minAccuracyScore > 0 &&
        agent.performanceMetrics.accuracyScore < filters.minAccuracyScore
      ) {
        return false;
      }
      if (
        filters.minReliabilityScore > 0 &&
        agent.performanceMetrics.reliabilityScore < filters.minReliabilityScore
      ) {
        return false;
      }
      if (
        filters.maxResponseTime < 5000 &&
        agent.performanceMetrics.responseTime > filters.maxResponseTime
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.popularityScore - a.popularityScore);

  const handleRemoveFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev };

        if (key === "pricingType") {
          newFilters.pricingType = prev.pricingType.filter(
            (v) => v !== value,
          ) as Array<"free" | "paid">;
        } else if (key === "licenseTypes") {
          newFilters.licenseTypes = prev.licenseTypes.filter(
            (v) => v !== value,
          ) as Array<"free" | "open-source" | "commercial" | "subscription">;
        } else if (
          key === "categories" ||
          key === "subcategories" ||
          key === "languages" ||
          key === "industries" ||
          key === "tags"
        ) {
          newFilters[key] = prev[key].filter((v) => v !== value);
        } else {
          // Handle numeric filters
          newFilters[key] = defaultFilterState[key];
        }

        return newFilters;
      });
    },
    [],
  );

  const handleFilter = useCallback((type: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      switch (type) {
        case "category":
          newFilters.categories = [value];
          break;
        case "licenseType":
          newFilters.licenseTypes = [
            value as "free" | "open-source" | "commercial" | "subscription",
          ];
          break;
        case "tag":
          if (!prev.tags.includes(value)) {
            newFilters.tags = [...prev.tags, value];
          }
          break;
      }

      return newFilters;
    });
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Filters"
                    className="h-8 w-8 hover:bg-muted"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search with specific criteria
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6 pb-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Categories</h3>
                        {filters.categories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                categories: [],
                              }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <MultiSelectFilter
                        options={uniqueCategories}
                        selected={filters.categories}
                        onChange={(value) =>
                          setFilters((prev) => ({ ...prev, categories: value }))
                        }
                        placeholder="Select categories"
                        label="Categories"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Subcategories</h3>
                        {filters.subcategories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                subcategories: [],
                              }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <MultiSelectFilter
                        options={uniqueSubcategories}
                        selected={filters.subcategories}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            subcategories: value,
                          }))
                        }
                        placeholder="Select subcategories"
                        label="Subcategories"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Languages</h3>
                        {filters.languages.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, languages: [] }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <MultiSelectFilter
                        options={uniqueLanguages}
                        selected={filters.languages}
                        onChange={(value) =>
                          setFilters((prev) => ({ ...prev, languages: value }))
                        }
                        placeholder="Select languages"
                        label="Languages"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Industries</h3>
                        {filters.industries.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                industries: [],
                              }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <MultiSelectFilter
                        options={uniqueIndustries}
                        selected={filters.industries}
                        onChange={(value) =>
                          setFilters((prev) => ({ ...prev, industries: value }))
                        }
                        placeholder="Select industries"
                        label="Industries"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Pricing & License
                        </h3>
                        {(filters.pricingType.length > 0 ||
                          filters.licenseTypes.length > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                pricingType: [],
                                licenseTypes: [],
                              }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <MultiSelectFilter
                        options={["free", "paid"]}
                        selected={filters.pricingType}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            pricingType: value as Array<"free" | "paid">,
                          }))
                        }
                        placeholder="Select pricing type"
                        label="Pricing Type"
                      />
                      <MultiSelectFilter
                        options={[
                          "open-source",
                          "commercial",
                          "subscription",
                          "free",
                        ]}
                        selected={filters.licenseTypes}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            licenseTypes: value as Array<
                              | "open-source"
                              | "commercial"
                              | "subscription"
                              | "free"
                            >,
                          }))
                        }
                        placeholder="Select license type"
                        label="License Type"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Performance & Reputation
                        </h3>
                        {(filters.minReputationScore > 0 ||
                          filters.minAccuracyScore > 0 ||
                          filters.minReliabilityScore > 0 ||
                          filters.maxResponseTime < 5000) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                minReputationScore: 0,
                                minAccuracyScore: 0,
                                minReliabilityScore: 0,
                                maxResponseTime: 5000,
                              }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <ScoreFilter
                        value={filters.minReputationScore}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            minReputationScore: value,
                          }))
                        }
                        label="Minimum Reputation Score"
                        min={0}
                        max={5}
                        step={0.1}
                      />
                      <ScoreFilter
                        value={filters.minAccuracyScore}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            minAccuracyScore: value,
                          }))
                        }
                        label="Minimum Accuracy Score"
                      />
                      <ScoreFilter
                        value={filters.minReliabilityScore}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            minReliabilityScore: value,
                          }))
                        }
                        label="Minimum Reliability Score"
                      />
                      <ScoreFilter
                        value={filters.maxResponseTime}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxResponseTime: value,
                          }))
                        }
                        label="Maximum Response Time (ms)"
                        min={0}
                        max={5000}
                        step={100}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Tags</h3>
                        {filters.tags.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                tags: [],
                              }))
                            }
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <MultiSelectFilter
                        options={uniqueTags}
                        selected={filters.tags}
                        onChange={(value) =>
                          setFilters((prev) => ({ ...prev, tags: value }))
                        }
                        placeholder="Select tags"
                        label="Tags"
                      />
                    </div>
                    <Separator />
                  </div>
                </SheetContent>
              </Sheet>
              {/* <Button
                variant="ghost"
                size="icon"
                title="Search"
                className="h-8 w-8 hover:bg-muted"
              >
                <SearchIcon className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
          {!browserSupportsSpeechRecognition && (
            <p className="text-xs text-muted-foreground mt-2">
              Voice search is not supported in this browser. Please use Chrome
              or Edge for voice search functionality.
            </p>
          )}
        </div>
        <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-max">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onImageError={(agentId) =>
              setFailedImages((prev) => new Set([...prev, agentId]))
            }
            failedImages={failedImages}
            onFilter={handleFilter}
          />
        ))}
      </main>
    </div>
  );
}
