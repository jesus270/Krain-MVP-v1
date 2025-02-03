import { Container } from "./container";
import { FeatureCard } from "./feature-card";

const features = [
  {
    title: "AI Agent Portal",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "https://placehold.co/400x300",
    className: "md:col-span-2 lg:col-span-3",
    imageClassName: "aspect-[2/1]",
  },
  {
    title: "Agent discovery engine",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "https://placehold.co/400x300",
    className: "md:col-span-2 lg:col-span-3",
    imageClassName: "aspect-[2/1]",
  },
  {
    title: "Transparent reputation system",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "https://placehold.co/400x300",
  },
  {
    title: "Advanced search and filtering tools",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "https://placehold.co/400x300",
  },
  {
    title: "Side-by-side AI agent comparison",
    description:
      "Identify market movers before they gain traction with AI-driven sentiment forecasting, real-time on-chain data analysis, and proactive alerts tailored to your trading performances.",
    image: "https://placehold.co/400x300",
  },
];

export function FeaturesGridSection() {
  return (
    <section className="bg-[#04030C] py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
