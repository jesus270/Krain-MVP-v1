"use client";

import Link from "next/link";
import { Button } from "@krain/ui/components/ui/button";
import { GradientButton } from "./gradient-button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SocialNav } from "./social-nav";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { label: "Features", id: "features" },
    { label: "$KRAIN", id: "token" },
    { label: "Roadmap", id: "roadmap" },
    { label: "FAQs", id: "faq" },
    { label: "Community", id: "community" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
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
          <Link href="/">
            <Image src="/logo-krain.svg" alt="Krain" width={116} height={24} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`text-white hover:text-white relative transition-all duration-300 ${
                  isScrolled
                    ? "hover:bg-white/5"
                    : "hover:bg-white/10 hover:backdrop-blur-sm"
                } before:absolute before:inset-0 before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:rounded-md before:shadow-[0_0_15px_rgba(255,255,255,0.3)] before:-z-10`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
            <Link href="https://early.krain.ai">
              <GradientButton>Enter app</GradientButton>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-8">
            <Link href="https://early.krain.ai">
              <GradientButton>Enter app</GradientButton>
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
                  {/* We can reuse the same gradient style; just give them distinct IDs */}
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
          className={`md:hidden absolute left-0 right-0 top-[100%] transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          {/* Backdrop for mobile menu */}
          <div className="absolute inset-0 bg-[#04030C]/50 [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="text-white hover:text-white w-full justify-start"
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
            <SocialNav className="!flex !flex-row !static !translate-y-0 nav-social" />
          </div>
        </div>
      </div>
    </nav>
  );
}
