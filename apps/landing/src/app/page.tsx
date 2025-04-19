// import Link from "next/link";
// import { Nav } from "@/components/nav";
import { Footer } from "@/sections/footer";

import {
  HeroSection,
  PreviewSection,
  FeaturesSection,
  TokenSection,
  RoadmapSection,
  FaqSection,
  CommunitySection,
  SocialSection,
} from "@/sections";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#04030C] overflow-x-hidden">
      {/* Founders Key Sale Banner */}
      {/* <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white text-sm font-medium px-4">
        Announcing the Founders Key Sale!&nbsp;
        <Link
          href="/founders-key"
          className="underline hover:opacity-80 transition-opacity"
        >
          Learn More
        </Link>
      </div> */}
      {/* <Nav /> */}
      <HeroSection />
      <PreviewSection />
      <FeaturesSection />
      <TokenSection />
      <RoadmapSection />
      <FaqSection />
      <CommunitySection />
      <SocialSection />
      <Footer />
    </div>
  );
}
