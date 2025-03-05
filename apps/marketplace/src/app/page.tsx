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
import { AgentListGrid } from "./components/agent-list-grid";
import { TrendingSection } from "./components/trending-section";
import { CategoriesGrid } from "./components/categories-grid";
import featuredAgentIds from "./featured-agents.json";

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

  const featuredAgents = agents
    .filter((agent) => featuredAgentIds.includes(agent.id))
    // sort by featuredAgentIds order
    .sort(
      (a, b) => featuredAgentIds.indexOf(a.id) - featuredAgentIds.indexOf(b.id),
    );
  const trendingAgents = agents
    .sort((a, b) => b.reviewsCount - a.reviewsCount)
    .slice(0, 5); // Most reviewed agents
  const topRatedAgents = agents
    .filter((agent) => agent.reviewsCount >= 100) // Only consider agents with significant reviews
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5); // Highest rated agents with sufficient reviews

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.industries.length > 0;

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
    <div className="p-4 flex flex-col">
      <header className="flex flex-col items-center gap-4 lg:gap-6">
        {/* <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Discover AI Agents</h1>
        </div> */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
        />
        <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
      </header>

      {!hasActiveFilters ? (
        <>
          <section className="w-full mx-auto">
            <h2 className="text-xl font-semibold mb-4">Featured Agents</h2>
            <FeaturedCarousel agents={featuredAgents} onFilter={handleFilter} />
          </section>

          <section className="w-full mx-auto">
            <TrendingSection agents={agents} onFilter={handleFilter} />
          </section>

          <section className="w-full mx-auto">
            <CategoriesGrid agents={agents} onFilter={handleFilter} />
          </section>
        </>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 auto-rows-maxmx-auto">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onFilter={handleFilter} />
          ))}
        </main>
      )}
    </div>
  );
}
