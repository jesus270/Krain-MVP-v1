import { Footer } from "@/sections/footer";

import {
  FoundersKeySection,
  FoundersKeyFaqSection,
  SocialSection,
  MintScheduleSection,
} from "@/sections";

export default function FoundersKeyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#04030C] overflow-x-hidden">
      <FoundersKeySection />
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto w-full lg:max-w-7xl xl:max-w-8xl">
        <div className="md:w-1/2">
          <MintScheduleSection />
        </div>
        <div className="md:w-1/2">
          <FoundersKeyFaqSection />
        </div>
      </div>
      <SocialSection />
      <Footer />
    </div>
  );
}
