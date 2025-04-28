import React from "react";

interface TagChipProps {
  icon?: React.ReactNode;
  text: string | React.ReactNode;
  className?: string;
}

export function TagChip({ icon, text, className = "" }: TagChipProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[rgba(98,55,239,0.2)] to-[rgba(55,199,239,0.2)] rounded-lg shadow-md ${className}`}
    >
      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6237EF] to-[#37C7EF] bg-clip-text text-transparent">
        {icon}
        <span className="font-semibold text-xs sm:text-sm">{text}</span>
      </span>
    </div>
  );
}
