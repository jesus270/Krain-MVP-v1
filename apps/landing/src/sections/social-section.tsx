import { SocialLink } from "../components/social-link";
import { Send, Mail } from "lucide-react";
import { CoinMarketCapLogo } from "@krain/ui/components/icons/logo-coinmarketcap";
import { MediumLogo } from "@krain/ui/components/icons/logo-medium";
import { XLogo } from "@krain/ui/components/icons/XLogo";

export const socialLinks = [
  {
    href: "#",
    icon: Send,
    label: "TG community",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(19,33,53,0.5),transparent)]",
  },
  {
    href: "#",
    icon: Send,
    label: "TG announcement",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(19,33,53,0.5),transparent)]",
  },
  {
    href: "#",
    icon: XLogo,
    label: "X / Twitter",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(44,38,60,0.5),transparent)]",
  },
  {
    href: "#",
    icon: MediumLogo,
    label: "Medium",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(18,43,35,0.5),transparent)]",
  },
  {
    href: "#",
    icon: CoinMarketCapLogo,
    label: "Coinmarketcap",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(20,21,60,0.5),transparent)]",
  },
  {
    href: "#",
    icon: Mail,
    label: "Contact us",
    sublabel: "@KRAIN_AI",
    bgClass: "hover:bg-[linear-gradient(90deg,rgba(31,18,56,0.5),transparent)]",
  },
];

export function SocialSection() {
  return (
    <section id="social" className="flex flex-col w-full bg-[#04030C]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b border-gray-800 relative z-10">
        {socialLinks.map((link) => (
          <SocialLink key={link.label} {...link} />
        ))}
      </div>
    </section>
  );
}
