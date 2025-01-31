import type { LucideIcon } from "lucide-react";

interface TokenFeatureProps {
  iconPath: string;
  title: string;
  className?: string;
}

export function TokenFeature({
  iconPath,
  title,
  className = "",
}: TokenFeatureProps) {
  return (
    <div
      className={`flex flex-col items-center text-center space-y-3 ${className}`}
    >
      {/* <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center"> */}
      <img src={iconPath} alt={title} className="w-10 h-10" />
      {/* </div> */}
      <p className="text-sm font-medium text-gray-300">{title}</p>
    </div>
  );
}
