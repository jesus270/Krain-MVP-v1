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
