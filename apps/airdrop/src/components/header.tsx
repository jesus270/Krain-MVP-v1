import { SidebarTrigger } from "@krain/ui/components/ui/sidebar";
import { Separator } from "@krain/ui/components/ui/separator";
import HeaderBreadcrumb from "./header-breadcrumb";
import { HeaderLoginButton } from "./header-login-button";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex h-16 w-full justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Link href="/">
          <Image
            src="/logo-avatar.png"
            alt="Logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40 }}
          />
        </Link>
        <HeaderBreadcrumb />
      </div>
      <div className="flex items-center gap-2 px-4">
        <HeaderLoginButton />
      </div>
    </header>
  );
}
