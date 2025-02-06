import Link from "next/link";
import { TypeIcon as type, type LucideIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@krain/ui/components/ui/tooltip";

interface SocialLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  sublabel: string;
  className?: string;
  bgClass: string;
  disabled?: boolean;
}

export function SocialLink({
  href,
  icon: Icon,
  label,
  sublabel,
  className = "",
  bgClass,
  disabled,
}: SocialLinkProps) {
  const content = (
    <Link
      href={href}
      className={cn(
        "group block p-4 md:p-6 transition-all hover:text-white border border-[#272442] h-full",
        "hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]",
        bgClass,
        className,
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="md:p-3">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="md:pl-3 flex flex-col">
          <span className="text-xs text-gray-500">{sublabel}</span>
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </Link>
  );

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Coming Soon</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}
