"use client";

import { Button } from "@krain/ui/components/ui/button";
import { Textarea } from "@krain/ui/components/ui/textarea";
import { MicIcon, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Sheet, SheetTrigger } from "@krain/ui/components/ui/sheet";
import { FilterSheet } from "./filter-sheet";
import { FilterState } from "../filters";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
  agents: any[];
  categories: string[];
  tags: string[];
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  agents,
  categories,
  tags,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Helper function to force scroll to top with multiple approaches
  const forceScrollToTop = useCallback(() => {
    console.log("SearchBar: Forcing scroll to top");

    // Try multiple approaches
    // Standard window scroll
    window.scrollTo(0, 0);

    // Alternative document scroll method
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // For Safari

    // Try scrolling other possible container elements
    const containers = [
      document.querySelector("main"),
      document.querySelector("div.p-2.lg\\:p-4.flex.flex-col"),
      document.querySelector("body"),
    ];

    containers.forEach((el) => {
      if (el) el.scrollTop = 0;
    });
  }, []);

  const commands = [
    {
      command: "clear search",
      callback: ({ resetTranscript }: { resetTranscript: () => void }) => {
        setSearchQuery("");
        resetTranscript();
      },
    },
    {
      command: ["search for *", "find *"],
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

  useEffect(() => {
    if (transcript && !listening) {
      setSearchQuery(transcript);
      // Use our new forceScrollToTop function with a delay
      setTimeout(forceScrollToTop, 50);
    }
  }, [transcript, listening, setSearchQuery, forceScrollToTop]);

  return (
    <div className="w-full max-w-2xl relative">
      <div className="relative flex items-end shadow-[0_0_10px_rgba(0,0,0,0.10)] rounded-lg">
        <Textarea
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Use our new forceScrollToTop function with a delay
            setTimeout(forceScrollToTop, 50);
          }}
          className="resize-none text-foreground placeholder:text-muted-foreground placeholder:text-xs min-h-[36px] pr-20 border rounded-full bg-muted/50 leading-none"
          style={{ paddingTop: "10px", paddingBottom: "10px" }}
          placeholder={
            isFocused ? "" : "What are you looking for? Use the mic to say it."
          }
          rows={1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(searchQuery.length > 0)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex">
          <Button
            onClick={handleVoiceInput}
            variant="ghost"
            size="icon"
            title={listening ? "Stop recording" : "Search with voice"}
            className="h-8 w-8 hover:bg-muted rounded-full"
            disabled={!browserSupportsSpeechRecognition}
          >
            <MicIcon
              className={`w-4 h-4 text-muted-foreground rounded-full ${listening ? "text-red-500" : ""} ${!browserSupportsSpeechRecognition ? "opacity-50" : ""}`}
            />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Filters"
                className="h-8 w-8 hover:bg-muted rounded-full"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </SheetTrigger>
            <FilterSheet
              filters={filters}
              setFilters={setFilters}
              allAgents={agents}
              categories={categories}
              tags={tags}
            />
          </Sheet>
        </div>
      </div>
      {!browserSupportsSpeechRecognition && (
        <p className="text-xs text-muted-foreground mt-2">
          Voice search is not supported in this browser. Please use Chrome or
          Edge for voice search functionality.
        </p>
      )}
    </div>
  );
}
