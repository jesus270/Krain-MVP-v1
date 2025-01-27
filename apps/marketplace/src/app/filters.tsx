import { Badge } from "@krain/ui/components/ui/badge";
import { Button } from "@krain/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@krain/ui/components/ui/sheet";
import { Separator } from "@krain/ui/components/ui/separator";
import { Slider } from "@krain/ui/components/ui/slider";
import { cn } from "@krain/ui/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  categories: string[];
  subcategories: string[];
  languages: string[];
  industries: string[];
  tags: string[];
  pricingType: Array<"free" | "paid">;
  licenseTypes: Array<"free" | "open-source" | "commercial" | "subscription">;
  minReputationScore: number;
  minAccuracyScore: number;
  minReliabilityScore: number;
  maxResponseTime: number;
}

export type FilterKey = keyof FilterState;

export const defaultFilterState: FilterState = {
  categories: [],
  subcategories: [],
  languages: [],
  industries: [],
  tags: [],
  pricingType: [],
  licenseTypes: [],
  minReputationScore: 0,
  minAccuracyScore: 0,
  minReliabilityScore: 0,
  maxResponseTime: 5000,
};

interface MultiSelectFilterProps<T extends string> {
  options: T[];
  selected: T[];
  onChange: (value: T[]) => void;
  placeholder: string;
  label: string;
}

export function MultiSelectFilter<T extends string>({
  options,
  selected,
  onChange,
  placeholder,
  label,
}: MultiSelectFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  const filteredOptions = safeOptions.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {safeSelected.length === 0
            ? placeholder
            : `${safeSelected.length} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] p-0 flex flex-col">
        <div className="border-b px-4 py-3 flex-shrink-0">
          <input
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No results found.
            </p>
          ) : (
            <div className="p-2">
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    safeSelected.includes(option) && "bg-accent",
                  )}
                  onClick={() => {
                    const newSelected = safeSelected.includes(option)
                      ? safeSelected.filter((s) => s !== option)
                      : [...safeSelected, option];
                    onChange(newSelected);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      safeSelected.includes(option)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span>{option}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ScoreFilterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}

export function ScoreFilter({
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.1,
  label,
}: ScoreFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value.toFixed(1)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue || 0)}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
      />
    </div>
  );
}

interface ActiveFiltersProps {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value: string) => void;
}

export function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  const activeFilters = Object.entries(filters).map(([key, value]) => ({
    key: key as keyof FilterState,
    values: Array.isArray(value)
      ? value
      : typeof value === "number" &&
          value !== defaultFilterState[key as keyof FilterState]
        ? [value.toString()]
        : [],
  }));

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(({ key, values }) =>
        values.map((value) => (
          <Badge
            key={`${key}-${value}`}
            variant="secondary"
            className="rounded-full"
          >
            {key}: {value}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-2 hover:bg-transparent hover:text-destructive"
              onClick={() => onRemove(key, value)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )),
      )}
    </div>
  );
}
