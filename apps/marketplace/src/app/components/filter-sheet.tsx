import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@krain/ui/components/ui/sheet";
import { Separator } from "@krain/ui/components/ui/separator";
import { FilterState } from "../filters";
import { MultiSelectFilter } from "../filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@krain/ui/components/ui/select";
import { useState } from "react";

interface FilterSheetProps {
  filters: FilterState;
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
  allAgents: any[]; // Using any to accommodate both AIAgent and DB Agent types
  categories: string[];
  tags: string[];
}

export function FilterSheet({
  filters,
  setFilters,
  allAgents,
  categories,
  tags,
}: FilterSheetProps) {
  // Extract unique industries from agents
  const uniqueIndustries = [
    ...new Set(allAgents.flatMap((agent) => agent.industryFocus || [])),
  ].filter(Boolean);

  const availableFilters = [
    {
      key: "categories" as const,
      label: "Categories",
      options: categories,
      values: filters.categories,
      onChange: (values: string[]) =>
        setFilters({ ...filters, categories: values }),
    },
    {
      key: "tags" as const,
      label: "Tags",
      options: tags,
      values: filters.tags,
      onChange: (values: string[]) => setFilters({ ...filters, tags: values }),
    },
    {
      key: "industries" as const,
      label: "Industries",
      options: uniqueIndustries,
      values: filters.industries,
      onChange: (values: string[]) =>
        setFilters({ ...filters, industries: values }),
    },
  ];

  return (
    <SheetContent className="w-[400px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-foreground text-base">Filters</SheetTitle>
        <SheetDescription className="text-foreground text-xs">
          Refine your search with specific criteria
        </SheetDescription>
      </SheetHeader>

      <Separator className="my-8" />

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">Sort By</h3>
          <div className="flex gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value: "rating" | "name" | "reviewsCount") =>
                setFilters({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="reviewsCount">Reviews</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortOrder}
              onValueChange={(value: "asc" | "desc") =>
                setFilters({ ...filters, sortOrder: value })
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {availableFilters.map((filter) => (
          <div key={filter.key}>
            <Separator className="my-8" />
            <h3 className="mb-2 font-medium">{filter.label}</h3>
            <MultiSelectFilter
              options={filter.options}
              selected={filter.values}
              onChange={filter.onChange}
              placeholder={`Select ${filter.label.toLowerCase()}`}
              label={filter.label}
            />
          </div>
        ))}
      </div>
    </SheetContent>
  );
}
