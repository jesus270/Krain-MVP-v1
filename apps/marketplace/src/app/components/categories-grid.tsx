"use client";

import { AIAgent } from "../types";
import { Card } from "@krain/ui/components/ui/card";
import { BotIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

interface CategoryItem {
  name: string;
  count: number;
}

interface CategoriesGridProps {
  agents: AIAgent[];
  onFilter: (type: string, value: string) => void;
  title?: string;
}

export function CategoriesGrid({
  agents,
  onFilter,
  title = "Categories",
}: CategoriesGridProps) {
  // Count agents by category
  const categoryCounts = agents.reduce((acc: Record<string, number>, agent) => {
    const category = agent.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});

  // Convert to array and sort by count descending
  const categories: CategoryItem[] = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 w-full mb-8">
      {categories.map((category) => (
        <Card
          key={category.name}
          className="cursor-pointer hover:opacity-90 transition-opacity p-4"
          onClick={() => onFilter("category", category.name)}
        >
          <div className="flex items-center justify-between w-full h-full">
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-muted text-muted-foreground">
              <BotIcon className="h-5 w-5" />
              <div className="text-sm font-medium leading-none flex items-center">
                {category.count}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
