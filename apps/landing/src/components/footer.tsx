import { Send, Twitter, BookOpen, AtSign, Mail } from "lucide-react";
import { SocialLink } from "./social-link";
import { FooterLink } from "./footer-link";
import { Button } from "@krain/ui/components/ui/button";
import { Copy } from "lucide-react";
import { CoinMarketCapLogo } from "@krain/ui/components/icons/logo-coinmarketcap";
import { MediumLogo } from "@krain/ui/components/icons/logo-medium";
import { XLogo } from "@krain/ui/components/icons/XLogo";

const socialLinks = [
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

const footerLinks = {
  resources: [
    { href: "#", label: "Partners" },
    { href: "#", label: "Features" },
    { href: "#", label: "Watch demo" },
    { href: "#", label: "$KRAIN" },
    { href: "#", label: "Roadmap" },
    { href: "#", label: "FAQs" },
    { href: "#", label: "Community" },
  ],
  company: [
    { href: "#", label: "Docs" },
    { href: "#", label: "Brand Kit" },
    { href: "#", label: "Launch app" },
    { href: "#", label: "Contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black relative overflow-hidden">
      {/* Social Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b border-gray-800">
        {socialLinks.map((link) => (
          <SocialLink key={link.label} {...link} />
        ))}
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16">
          <a href="#" className="text-2xl font-bold text-white">
            KRAIN
          </a>
          <p className="mt-8 text-5xl md:text-6xl font-light leading-tight text-gray-400">
            The infrastructure
            <br />
            layer fuelling the
            <br />
            AI agent economy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="space-y-4">
            <h3 className="text-white font-medium">Resources</h3>
            {footerLinks.resources.map((link) => (
              <div key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-medium">Company</h3>
            {footerLinks.company.map((link) => (
              <div key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 flex items-center">
            <div className="flex items-center gap-2 bg-gray-900/50 backdrop-blur rounded-full px-6 py-3">
              <code className="text-sm text-white">0×0000...0000</code>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
          <div className="flex gap-6 mb-4 md:mb-0">
            <FooterLink href="#">Privacy policy</FooterLink>
            <FooterLink href="#">Terms of service</FooterLink>
          </div>
          <p className="text-sm text-gray-500">
            Copyright ©2025 KRAIN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
