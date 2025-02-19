import { Button } from "@krain/ui/components/ui/button";
import { FilterState } from "../filters";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value: string) => void;
}

export function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(filters).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return value.map((v) => (
            <Button
              key={`${key}-${v}`}
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => onRemove(key as keyof FilterState, v)}
            >
              {v}
              <X className="w-3 h-3" />
            </Button>
          ));
        }
        return null;
      })}
    </div>
  );
}
