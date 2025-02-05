import { SocialLink } from "../components/social-link";
import { Send, Mail, LucideIcon } from "lucide-react";
import { XLogo } from "@krain/ui/components/icons/XLogo";

interface SocialLinkType {
  href: string;
  icon: LucideIcon | typeof XLogo;
  label: string;
  sublabel: string;
  bgClass: string;
  disabled?: boolean;
}

export const socialLinks: SocialLinkType[] = [
  {
    href: "https://t.me/krainofficial",
    icon: Send,
    label: "TG community",
    sublabel: "@krainofficial",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(19,33,53,0.5),transparent)]",
  },
  {
    href: "https://t.me/krainofficial",
    icon: Send,
    label: "TG announcement",
    sublabel: "@krainofficial",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(19,33,53,0.5),transparent)]",
  },
  {
    href: "https://twitter.com/krain_ai",
    icon: XLogo,
    label: "X / Twitter",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(44,38,60,0.5),transparent)]",
  },
  {
    href: "mailto:contact@krain.ai",
    icon: Mail,
    label: "Contact us",
    sublabel: "contact@krain.ai",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(31,18,56,0.5),transparent)]",
  },
];

export function SocialSection() {
  return (
    <section id="social" className="flex flex-col w-full bg-[#04030C]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b border-gray-800 relative z-10">
        {socialLinks.map((link) => (
          <SocialLink key={link.label} {...link} />
        ))}
      </div>
    </section>
  );
}
