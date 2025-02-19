import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@krain/ui/components/ui/sheet";
import { Separator } from "@krain/ui/components/ui/separator";
import { FilterState } from "../filters";
import { agents } from "../agent-data";
import { MultiSelectFilter } from "../filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@krain/ui/components/ui/select";

// Extract unique values from agents
const uniqueCategories = [
  ...new Set(agents.map((agent) => agent.category)),
].filter(Boolean);

const uniqueTags = [...new Set(agents.flatMap((agent) => agent.tags))].filter(
  Boolean,
);

const uniqueIndustries = [
  ...new Set(agents.flatMap((agent) => agent.industryFocus)),
].filter(Boolean);

interface FilterSheetProps {
  filters: FilterState;
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
}

export function FilterSheet({ filters, setFilters }: FilterSheetProps) {
  const availableFilters = [
    {
      key: "categories" as const,
      label: "Categories",
      options: uniqueCategories,
      values: filters.categories,
      onChange: (values: string[]) =>
        setFilters({ ...filters, categories: values }),
    },
    {
      key: "tags" as const,
      label: "Tags",
      options: uniqueTags,
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
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>
          Refine your search with specific criteria
        </SheetDescription>
      </SheetHeader>

      <div className="py-4 space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Sort By</h3>
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

        {availableFilters.map((filter, index) => (
          <div key={filter.key}>
            {index > 0 && <Separator className="my-4" />}
            <h3 className="mb-2 text-sm font-medium">{filter.label}</h3>
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
