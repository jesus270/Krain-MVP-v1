import { FeatureCard } from "@/components/feature-card";

export const features = [
  {
    title: "AI Agent Portal",
    description:
      "An aggregated comprehensive, user-friendly repository of AI agents organized by categories, use cases, and performance metrics.",
    image: "/feature-ai-agent-portal.webp",
  },
  {
    title: "Agent Discovery Engine",
    description:
      "An AI-driven discovery engine using Natural Language Processing (NLP) matching users with the most suitable AI agents.",
    image: "/feature-agent-discovery-engine.webp",
  },
  {
    title: "Agent Workflow Builder",
    description:
      "An experience that transforms prompts into structured, executable AI workflows by intelligently breaking down tasks and selecting the best agents for each step.",
    image: "/feature-workflow-builder.webp",
  },
  {
    title: "Transparent Reputation System",
    description:
      "A community-driven rating and review system to assess the trustworthiness, effectiveness, and performance of AI agents.",
    image: "/feature-rep-system.webp",
  },
  {
    title: "Advanced Search & Filtering Tools",
    description:
      "Robust search functionality with customizable filters, enabling users to narrow down AI agents by reputation, performance history, cost, and compatibility.",
    image: "/feature-search.webp",
  },
  {
    title: "Side-by-side AI agent comparison",
    description:
      "An interactive comparison feature that allows users to evaluate AI agents side-by-side, reviewing key metrics like capabilities, reliability, and user ratings",
    image: "/feature-side-by-side.webp",
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
