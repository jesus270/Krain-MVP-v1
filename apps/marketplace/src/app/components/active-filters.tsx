import { Badge } from "@krain/ui/components/ui/badge";
import { FilterState } from "../filters";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value: string) => void;
}

export function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {Object.entries(filters).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return value.map((v) => (
            <Badge
              key={`${key}-${v}`}
              variant="outline"
              style={{
                background:
                  "linear-gradient(to right, rgba(31, 197, 214, 0.4), transparent)",
                borderColor: "rgba(31, 197, 214, 0.8)",
                borderWidth: "1px",
              }}
              className="text-xs font-normal cursor-pointer hover:opacity-80 transition-all flex items-center px-3 py-1"
              onClick={() => onRemove(key as keyof FilterState, v)}
            >
              {v}
              <X className="w-3 h-3 ml-1.5" />
            </Badge>
          ));
        }
        return null;
      })}
    </div>
  );
}
