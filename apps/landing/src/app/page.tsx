import { Nav } from "@/components/nav";
import { SocialNav } from "@/components/social-nav";
import { Partners } from "@/components/partners";
import { UiPreview } from "@/components/ui-preview";
import { FeatureCard } from "@/components/feature-card";
import { TokenFeature } from "@/components/token-feature";
import { ContractDisplay } from "@/components/contract-display";
import { ExchangeCard } from "@/components/exchange-card";
import { RoadmapCarousel } from "@/components/roadmap-carousel";
import { FaqSection } from "@/components/faq-section";
import { CommunitySection } from "@/components/community-section";
import { GradientButton } from "@/components/gradient-button";
import { Footer } from "@/components/footer";

const features = [
  {
    title: "AI Agent Portal",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "/feature-1.svg",
  },
  {
    title: "Agent discovery engine",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "/feature-2.svg",
  },
  {
    title: "Transparent reputation system",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "/feature-3.svg",
  },
  {
    title: "Advanced search and filtering tools",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "/feature-4.svg",
  },
  {
    title: "Side-by-side AI agent comparison",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "/feature-5.svg",
  },
];

const tokenFeatures = [
  { iconPath: "/icon-square-star.svg", title: "UNLOCK PREMIUM\nAI FEATURES" },
  { iconPath: "/icon-square-krain.svg", title: "AGENT HUB PRIMARY\nCURRENCY" },
  { iconPath: "/icon-square-robot.svg", title: "AGENT HUB\nSUBSCRIPTIONS" },
  { iconPath: "/icon-square-reward.svg", title: "AGENT PERFORMANCE\nREWARDS" },
  {
    iconPath: "/icon-square-liquid.svg",
    title: "AGENT TOKEN\nLIQUIDITY PAIRING",
  },
  { iconPath: "/icon-square-coins.svg", title: "EARN\nSTAKING REWARDS" },
  { iconPath: "/icon-square-vote.svg", title: "PARTICIPATE\nIN GOVERNANCE" },
  {
    iconPath: "/icon-square-burn.svg",
    title: "TOKEN BUYBACKS\n& BURNS MECHANISM",
  },
];

const exchanges = [
  { name: "Exchange 1" },
  { name: "Exchange 2" },
  { name: "Exchange 3" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#04030C]">
      <Nav />

      {/* Hero Section */}
      <section className="flex flex-col items-center w-full min-h-screen">
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
        <div className="absolute inset-0 bg-black/50" />
        <SocialNav />
        <div className="flex flex-col items-center justify-center flex-1 z-10 px-4 text-center">
          <h1 className="max-w-4xl text-4xl md:text-6xl font-bold text-white mb-4">
            The infrastructure layer fueling the <span>AI agent economy</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-8">
            From discovery to creation, we accelerate the AI Agent ecosystem
            with intelligent infrastructure.
          </p>
          <GradientButton>Enter app</GradientButton>
        </div>
        <Partners />
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center w-full py-24 md:py-32 px-4 md:px-20">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              The only AI agent portal
              <br />
              you'll ever need
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
              Find high performing AI agents based on your exact criteria,
              performance index and trust scores.
            </p>
          </div>
          <UiPreview />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
          {features.map((feature) => (
            <FeatureCard key={`feature-${feature.title}`} {...feature} />
          ))}
        </div>
      </section>

      {/* Token Section */}
      <section className="flex flex-col items-center w-full py-24 relative">
        <div className="absolute inset-0 bg-[url('/bg-token.svg')] bg-cover bg-center" />
        <div className="flex flex-col items-center w-full max-w-7xl px-4 z-10">
          <div className="flex flex-col items-center text-center space-y-6 mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              $KRAIN
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
              The Krain ecosystem is powered by the $Krain token, built to
              enhance the ecosystem experience by providing access to premium
              app features, generous staking rewards, community governance
              voting and more.
            </p>
          </div>

          <ContractDisplay address="0×000000000000000000000000" />

          <div className="h-96" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full">
            {tokenFeatures.map((feature) => (
              <TokenFeature
                key={feature.title.replace(/\s+/g, "-").toLowerCase()}
                {...feature}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Exchanges Section */}
      <section className="flex flex-col items-center w-full py-24 md:py-32">
        <div className="flex flex-col items-center w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-sm font-medium tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#4E516A] via-white to-[#4E516A]">
              Available on
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-5xl">
            {exchanges.map((exchange) => (
              <ExchangeCard
                key={`exchange-${exchange.name.toLowerCase().replace(/\s+/g, "-")}`}
                {...exchange}
                className="bg-gray-900/50 backdrop-blur"
                imageClassName="aspect-[3/2]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="flex flex-col items-center w-full py-24 md:py-32 px-4 md:px-20">
        <div className="flex flex-col w-full max-w-7xl">
          <RoadmapCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="flex flex-col items-center w-full py-24 md:py-32 px-4 md:px-20">
        <div className="flex flex-col w-full">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              FAQs
            </h2>
          </div>

          <FaqSection />
        </div>
      </section>

      {/* Community Section */}
      <section className="flex flex-col w-full h-screen">
        <CommunitySection />
      </section>
      <Footer />
    </div>
  );
}
