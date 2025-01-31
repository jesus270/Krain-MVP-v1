import Link from "next/link";
import { cn } from "@krain/ui/lib/utils";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function FooterLink({ href, children, className }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-gray-400 hover:text-white transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}
