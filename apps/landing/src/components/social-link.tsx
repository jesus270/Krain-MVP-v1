import Link from "next/link"
import { TypeIcon as type, type LucideIcon } from "lucide-react"

interface SocialLinkProps {
  href: string
  icon: LucideIcon
  label: string
  sublabel: string
  className?: string
}

export function SocialLink({ href, icon: Icon, label, sublabel, className = "" }: SocialLinkProps) {
  return (
    <Link href={href} className={`group block p-6 transition-colors hover:text-white ${className}`}>
      <div className="flex items-center gap-4">
        <Icon className="h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{sublabel}</span>
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </Link>
  )
}

