import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface TokenFeatureProps {
  icon?: LucideIcon;
  iconPath?: string;
  title: string;
  className?: string;
}

export function TokenFeature({
  iconPath,
  title,
  className = "",
}: TokenFeatureProps) {
  return (
    <div className={`flex flex-col text-left space-y-3 ${className}`}>
      <Image
        src={iconPath || ""}
        alt={title}
        width={40}
        height={40}
        className="w-10 h-10"
      />
      <p className="text-sm font-medium text-gray-300 whitespace-pre-line">
        {title}
      </p>
    </div>
  );
}
