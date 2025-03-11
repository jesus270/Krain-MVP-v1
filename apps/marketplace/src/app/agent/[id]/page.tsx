import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { getAgentById } from "@/app/actions/agents";
import { AgentDetailsContent } from "./components/agent-details-content";
import { AgentPricing } from "./components/agent-pricing";
import { ReviewsSection } from "./components/reviews-section";
import { AIAgent } from "@/app/types";
import { Toaster } from "sonner";

// Convert database Agent to AIAgent type
function convertToAIAgent(dbAgent: any): AIAgent {
  return {
    id: dbAgent.id.toString(),
    name: dbAgent.name,
    rating: dbAgent.rating || 0,
    reviewsCount: dbAgent.reviewsCount || 0,
    category: dbAgent.category,
    tags: dbAgent.tags || [],
    description: dbAgent.description || "",
    imageUrl: dbAgent.imageUrl || "",
    blockchainsSupported: dbAgent.blockchainsSupported || [],
    tokenSymbol: dbAgent.tokenSymbol || "",
    tokenName: dbAgent.tokenName || "",
    cmcTokenLink: dbAgent.cmcTokenLink || "",
    websiteUrl: dbAgent.websiteUrl || "",
    supportEmail: dbAgent.supportEmail || "",
    companyName: dbAgent.companyName || "",
    contactName: dbAgent.contactName || "",
    contactEmail: dbAgent.contactEmail || "",
    contactPhone: dbAgent.contactPhone || "",
    pricing: dbAgent.pricing || [],
    industryFocus: dbAgent.industryFocus || [],
    socialMedia: dbAgent.socialMedia || {},
  };
}

type PageParams = {
  id: string;
};

export default async function AgentDetails({ params }: { params: PageParams }) {
  const { id } = params;
  const dbAgent = await getAgentById(id);

  if (!dbAgent) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">Agent not found</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  // Convert db agent to AIAgent type
  const agent = convertToAIAgent(dbAgent);
  const agentId = parseInt(agent.id);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <Toaster />
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 hover:text-blue-500"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </Link>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <div>
          <AgentDetailsContent agent={agent} />
          <ReviewsSection agentId={agentId} />
        </div>
        <AgentPricing agent={agent} />
      </div>
    </div>
  );
}
