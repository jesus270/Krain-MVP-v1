"use client";

import Link from "next/link";
import { Button } from "@krain/ui/components/ui/button";
import { GradientButton } from "./gradient-button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SocialNav } from "./social-nav";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Features", id: "features", type: "scroll" },
    { label: "$KRAIN", id: "token", type: "scroll" },
    { label: "Roadmap", id: "roadmap", type: "scroll" },
    { label: "FAQs", id: "faq", type: "scroll" },
    { label: "Community", id: "community", type: "scroll" },
    // { label: "Founders Key", id: "/founders-key", type: "link" },
    {
      label: "Early Access",
      id: "https://early.krain.ai",
      type: "external-link",
    },
  ];

  type NavItem = (typeof navItems)[number]; // Define NavItem type

  return (
    <nav className="fixed top-0 w-screen z-50">
      {/* Backdrop for nav */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isMobileMenuOpen
            ? "bg-[#04030C]/50 [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]"
            : isScrolled
              ? "bg-white/5 [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]"
              : "bg-transparent"
        }`}
      />

      {/* Content */}
      <div className="relative z-10 py-6 px-6 md:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-krain.svg"
              alt="Krain"
              width={116}
              height={24}
              className="w-auto h-[20px] md:h-[24px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item: NavItem) => {
              const buttonClasses = `text-white hover:text-white relative transition-all duration-300 ${
                isScrolled
                  ? "hover:bg-white/5"
                  : "hover:bg-white/10 hover:backdrop-blur-sm"
              } before:absolute before:inset-0 before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:rounded-md before:shadow-[0_0_15px_rgba(255,255,255,0.3)] before:-z-10`;

              if (item.type === "scroll") {
                return pathname === "/" ? (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={buttonClasses}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Link key={item.id} href={`/#${item.id}`}>
                    <Button variant="ghost" className={buttonClasses}>
                      {item.label}
                    </Button>
                  </Link>
                );
              } else {
                // item.type === "link" or "external-link"
                const isExternal = item.type === "external-link";
                return (
                  <Link
                    key={item.id}
                    href={item.id}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    <Button variant="ghost" className={buttonClasses}>
                      {item.label}
                    </Button>
                  </Link>
                );
              }
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block shrink-0">
            <Link href="https://airdrop.krain.ai">
              <GradientButton>Enter app</GradientButton>
            </Link>
          </div>

          {/* Mobile & Tablet Navigation */}
          <div className="flex lg:hidden items-center gap-4 pr-4">
            <Link href="https://early.krain.ai">
              <GradientButton className="px-4 py-2.5 text-sm">
                Enter app
              </GradientButton>
            </Link>
            <button
              className="p-2 text-white relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {/* HAMBURGER ICON */}
              <svg
                className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
                width="32"
                height="23"
                viewBox="0 0 32 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 0H5V3H16H27V0H19L16 3L13 0Z"
                  fill="url(#hamburgerGradient)"
                />
                <path
                  d="M19 23H27V20H16H5V23H13L16 20L19 23Z"
                  fill="url(#hamburgerGradient)"
                />
                <path d="M0 10H13L16 13H0V10Z" fill="url(#hamburgerGradient)" />
                <path
                  d="M19 10H32V13H16L19 10Z"
                  fill="url(#hamburgerGradient)"
                />
                <defs>
                  <linearGradient
                    id="hamburgerGradient"
                    x1="2"
                    y1="11.5"
                    x2="30"
                    y2="11.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7E82A0" />
                    <stop offset="0.304277" stopColor="white" />
                    <stop offset="0.727666" stopColor="white" />
                    <stop offset="1" stopColor="#7E82A0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X ICON */}
              <svg
                className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-100" : "opacity-0"
                }`}
                width="32"
                height="23"
                viewBox="0 0 32 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Diagonal 1 */}
                <path
                  d="M0,0 L3,0 L32,20 L32,23 L29,23 L0,3 Z"
                  fill="url(#xGradient1)"
                />
                {/* Diagonal 2 */}
                <path
                  d="M32,0 L29,0 L0,20 L0,23 L3,23 L32,3 Z"
                  fill="url(#xGradient2)"
                />

                <defs>
                  <linearGradient
                    id="xGradient1"
                    x1="2"
                    y1="11.5"
                    x2="30"
                    y2="11.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7E82A0" />
                    <stop offset="0.304277" stopColor="white" />
                    <stop offset="0.727666" stopColor="white" />
                    <stop offset="1" stopColor="#7E82A0" />
                  </linearGradient>

                  <linearGradient
                    id="xGradient2"
                    x1="2"
                    y1="11.5"
                    x2="30"
                    y2="11.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7E82A0" />
                    <stop offset="0.304277" stopColor="white" />
                    <stop offset="0.727666" stopColor="white" />
                    <stop offset="1" stopColor="#7E82A0" />
                  </linearGradient>
                </defs>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute left-0 right-0 top-[100%] transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          {/* Backdrop for mobile menu */}
          <div className="absolute inset-0 bg-[#04030C]/50 [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col p-4 gap-2">
            {navItems.map((item: NavItem) => {
              const buttonClasses =
                "text-white hover:text-white w-full justify-start";

              if (item.type === "scroll") {
                return pathname === "/" ? (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={buttonClasses}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Link key={item.id} href={`/#${item.id}`} className="w-full">
                    <Button variant="ghost" className={buttonClasses}>
                      {item.label}
                    </Button>
                  </Link>
                );
              } else {
                // item.type === "link" or "external-link"
                const isExternal = item.type === "external-link";
                return (
                  <Link
                    key={item.id}
                    href={item.id}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="w-full"
                  >
                    <Button variant="ghost" className={buttonClasses}>
                      {item.label}
                    </Button>
                  </Link>
                );
              }
            })}
            <SocialNav className="!flex !flex-row !static !translate-y-0 nav-social" />
          </div>
        </div>
      </div>
    </nav>
  );
}
