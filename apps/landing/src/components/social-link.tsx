import Link from "next/link";
import { TypeIcon as type, type LucideIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

interface SocialLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  sublabel: string;
  className?: string;
  bgClass: string;
}

export function SocialLink({
  href,
  icon: Icon,
  label,
  sublabel,
  className = "",
  bgClass,
}: SocialLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block p-6 transition-all hover:text-white border border-[#272442]",
        "hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]",
        bgClass,
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <Icon className="h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{sublabel}</span>
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </Link>
  );
}
