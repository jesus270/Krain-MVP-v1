"use client";

import { SidebarTrigger } from "@krain/ui/components/ui/sidebar";
import { Separator } from "@krain/ui/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@krain/ui/lib/utils";
import { ProfileSection } from "./profile-section";

export default function Header() {
  return (
    <header className="relative flex h-16 w-full justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-b-border/50">
      <div className="flex items-center gap-2 px-4 relative">
        <SidebarTrigger className="-ml-1 hover:bg-purple-500/10 transition-colors" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-border/50" />
      </div>
      <div className="flex items-center gap-2 px-4 relative">
        <ProfileSection />
      </div>
    </header>
  );
}
