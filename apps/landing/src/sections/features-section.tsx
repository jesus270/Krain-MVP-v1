import { FeatureCard } from "@/components/feature-card";

export const features = [
  {
    title: "AI Agent Directory",
    description:
      "An aggregated comprehensive, user-friendly repository of AI agents organized by categories, use cases, and performance metrics.",
    image: "/feature-1.svg",
  },
  {
    title: "Agent Discovery Engine",
    description:
      "An AI-driven discovery engine using Natural Language Processing (NLP) matching users with the most suitable AI agents.",
    image: "/feature-2.svg",
  },
  {
    title: "Agent Workflow Builder",
    description:
      "An experience that transforms prompts into structured, executable AI workflows by intelligently breaking down tasks and selecting the best agents for each step.",
    image: "/feature-6.svg",
  },
  {
    title: "Transparent Reputation System",
    description:
      "A community-driven rating and review system to assess the trustworthiness, effectiveness, and performance of AI agents.",
    image: "/feature-3.svg",
  },
  {
    title: "Advanced Search & Filtering Tools",
    description:
      "Robust search functionality with customizable filters, enabling users to narrow down AI agents by reputation, performance history, cost, and compatibility.",
    image: "/feature-4.svg",
  },
  {
    title: "Side-by-side AI agent comparison",
    description:
      "An interactive comparison feature that allows users to evaluate AI agents side-by-side, reviewing key metrics like capabilities, reliability, and user ratings",
    image: "/feature-5.svg",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="flex flex-col w-full bg-[#04030C]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        {features.map((feature) => (
          <FeatureCard key={`feature-${feature.title}`} {...feature} />
        ))}
      </div>
    </section>
  );
}
