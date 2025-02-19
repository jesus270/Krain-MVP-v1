"use client";

import "regenerator-runtime/runtime";
import { useState, useCallback } from "react";
import { FilterState, defaultFilterState } from "./filters";
import { AgentCard } from "./components/agent-card";
import { SearchBar } from "./components/search-bar";
import { ActiveFilters } from "./components/active-filters";
import { agents } from "./agent-data";
import { processSearchQuery } from "./utils/search";
import { FeaturedCarousel } from "./components/featured-carousel";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(() => defaultFilterState);

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
          agent.companyName,
          ...agent.industryFocus,
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

      // Tag filters
      if (
        filters.tags.length > 0 &&
        !agent.tags.some((tag) => filters.tags.includes(tag))
      ) {
        return false;
      }

      // Industry filters
      if (
        filters.industries.length > 0 &&
        !agent.industryFocus.some((ind) => filters.industries.includes(ind))
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "name") {
        return filters.sortOrder === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      const sortValue = filters.sortBy === "rating" ? "rating" : "reviewsCount";
      const multiplier = filters.sortOrder === "desc" ? -1 : 1;
      return (a[sortValue] - b[sortValue]) * multiplier;
    });

  // Add this new constant for featured agents
  const featuredAgents = agents.sort((a, b) => b.rating - a.rating).slice(0, 5); // Show top 5 featured agents

  const handleRemoveFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        // Only handle the filters we have now: categories, tags, industries
        if (key === "categories" || key === "tags" || key === "industries") {
          newFilters[key] = prev[key].filter((v) => v !== value);
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
        </div>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
        />
        <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
      </header>

      {featuredAgents.length > 0 && (
        <section className="w-full max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Featured Agents</h2>
          <FeaturedCarousel agents={featuredAgents} onFilter={handleFilter} />
        </section>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 auto-rows-max max-w-7xl mx-auto">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onFilter={handleFilter} />
        ))}
      </main>
    </div>
  );
}
