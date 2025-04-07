import { SocialNav } from "../components/social-nav";
import { Partners } from "../components/partners";
import { GradientButton } from "@/components/gradient-button";
import { VideoBackground } from "@/components/video-background";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="flex flex-col items-center w-full min-h-screen bg-[#04030C]"
    >
      <VideoBackground
        videoSrc="/bg-hero.mp4"
        posterSrc="/bg-hero.webp"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* <div className="absolute inset-0 bg-[#04030C]/50" /> */}
      <SocialNav />
      <div className="flex flex-col items-center justify-center flex-1 z-10 px-4 md:px-20 text-center mt-24">
        <h1 className="max-w-4xl text-4xl md:text-6xl font-bold text-white mb-4">
          The infrastructure layer fueling the <span>AI economy</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-8">
          From discovery to creation, we are accelerating the AI ecosystem
          with intelligent infrastructure.
        </p>
        {/* <Link href="https://early.krain.ai">
          <GradientButton>Enter app</GradientButton>
        </Link> */}
      </div>
      <Partners />
    </section>
  );
}
