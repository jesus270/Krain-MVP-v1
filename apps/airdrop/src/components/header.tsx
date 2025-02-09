import { SidebarTrigger } from "@krain/ui/components/ui/sidebar";
import { Separator } from "@krain/ui/components/ui/separator";
import HeaderBreadcrumb from "./header-breadcrumb";
import { HeaderLoginButton } from "./header-login-button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@krain/ui/lib/utils";

export default function Header() {
  return (
    <header className="relative flex h-16 w-full justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-gradient-to-r from-background/80 via-background to-background/80 border-b border-b-border/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x opacity-50" />

      <div className="flex items-center gap-2 px-4 relative">
        <SidebarTrigger className="-ml-1 hover:bg-purple-500/10 transition-colors" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-border/50" />
        {/* <Link href="/" className="group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <Image
              src="/icon-square-krain-token.png"
              alt="Logo"
              width={40}
              height={40}
              style={{ width: 40, height: 40 }}
              className={cn(
                "rounded-full transition-transform duration-300",
                "group-hover:scale-105"
              )}
            />
          </div>
        </Link> */}
        <HeaderBreadcrumb />
      </div>
      <div className="flex items-center gap-2 px-4 relative">
        <HeaderLoginButton />
      </div>
    </header>
  );
}
