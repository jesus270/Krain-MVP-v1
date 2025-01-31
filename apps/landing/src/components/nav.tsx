import Link from "next/link";
import { Button } from "@krain/ui/components/ui/button";
import { Container } from "./container";
import { GradientButton } from "./gradient-button";
import Image from "next/image";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-12">
      {/* <Container> */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image src="/logo-krain.svg" alt="Krain" width={116} height={24} />
        </Link>
        <div className="flex items-center gap-8">
          <GradientButton>Enter app</GradientButton>
        </div>
      </div>
      {/* </Container> */}
    </nav>
  );
}
