import { SocialNav } from "../components/social-nav";
import { Partners } from "../components/partners";
import { GradientButton } from "@/components/gradient-button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="flex flex-col items-center w-full min-h-screen bg-[#04030C]"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/bg-hero.png"
      >
        <source src="/bg-hero.mp4" type="video/mp4" />
      </video>
      {/* <div className="absolute inset-0 bg-[#04030C]/50" /> */}
      <SocialNav />
      <div className="flex flex-col items-center justify-center flex-1 z-10 px-4 text-center">
        <h1 className="max-w-4xl text-4xl md:text-6xl font-bold text-white mb-4">
          The infrastructure layer fueling the <span>AI agent economy</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-8">
          From discovery to creation, we are accelerating the AI Agent ecosystem
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
