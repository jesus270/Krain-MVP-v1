import { FooterLink } from "./footer-link";
import { Button } from "@krain/ui/components/ui/button";
import { Copy } from "lucide-react";

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
    <footer className="relative w-full">
      {/* Main Footer Content */}
      <div className="relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-[#04030C] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/bg-footer.svg')`,
          }}
        />

        {/* Content */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row justify-between">
            <p
              className="text-[96px] font-thin leading-[115.2px] px-4 md:px-20 pt-20"
              style={{
                background:
                  "linear-gradient(90deg, #8781BB 0%, #3E3B55 82.14%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              The infrastructure
              <br />
              layer fuelling the
              <br />
              AI agent economy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 px-4 md:px-20 pt-20">
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
            </div>
          </div>

          <div className="flex justify-end px-4 md:px-20 py-8">
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
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-4 md:px-20 border-t border-gray-800 bg-[#04030C]">
        <div className="flex gap-6 mb-4 md:mb-0">
          <FooterLink href="#">Privacy policy</FooterLink>
          <FooterLink href="#">Terms of service</FooterLink>
        </div>
        <p className="text-sm text-gray-500">
          Copyright ©2025 KRAIN. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
