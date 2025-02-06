import { FooterLink } from "../components/footer-link";
import { Button } from "@krain/ui/components/ui/button";
import { Copy } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@krain/ui/components/ui/tooltip";

interface FooterLinkType {
  href: string;
  label: string;
  tooltip?: string;
}

const footerLinks: {
  resources: FooterLinkType[];
  company: FooterLinkType[];
} = {
  resources: [
    { href: "#", label: "Partners" },
    { href: "#preview", label: "Preview" },
    { href: "#features", label: "Features" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#faq", label: "FAQs" },
    { href: "#token", label: "Token" },
    { href: "#community", label: "Community" },
  ],
  company: [
    { href: "https://krain.gitbook.io/krain", label: "Docs" },
    { href: "/brand-kit", label: "Brand Kit" },
    { href: "https://early.krain.ai", label: "Early Access" },
    { href: "mailto:contact@krain.ai", label: "Contact" },
  ],
};

export function Footer() {
  return (
    <footer className="relative w-full overflow-x-hidden">
      {/* Main Footer Content */}
      <div className="relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-[#04030C] bg-fit bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/bg-footer.svg')`,
          }}
        />

        {/* Content */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center justify-between p-12 pt-24 pb-18 md:p-24 pr-24 md:pt-48 md:pb-36 md:pr-48 md:gap-24 gap-12">
            <p
              className="text-[36px] md:text-6xl lg:text-8xl font-thin leading-[43.2px] md:leading-tight lg:leading-[115.2px] text-left"
              style={{
                background:
                  "linear-gradient(90deg, #8781BB 0%, #3E3B55 82.14%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <span className="whitespace-nowrap">The infrastructure</span>
              <br />
              <span className="whitespace-nowrap">layer fueling the</span>
              <br />
              <span className="whitespace-nowrap">AI agent economy</span>
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                {footerLinks.resources.map((link) => (
                  <div key={link.label}>
                    {link.tooltip ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <FooterLink href={link.href}>
                                {link.label}
                              </FooterLink>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{link.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {footerLinks.company.map((link) => (
                  <div key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </div>
                ))}
                {/* <div className="flex items-center gap-2 bg-gray-900/50 backdrop-blur rounded-full px-4 py-2">
                  <code className="text-sm text-white blur-sm">
                    0×0000...0000
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white -mr-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-4 md:px-20 border-t border-gray-800 bg-[#04030C]">
        <div className="flex gap-6 mb-4 md:mb-0">
          <FooterLink href="https://krain.gitbook.io/krain/legal">
            Privacy policy
          </FooterLink>
          <FooterLink href="https://krain.gitbook.io/krain/legal">
            Terms of service
          </FooterLink>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/logo-krain.svg" alt="Krain" width={116} height={24} />
          <p className="text-sm text-gray-500">
            Copyright ©2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
