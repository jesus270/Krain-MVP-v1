import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { agents } from "@/app/agent-data";
import { AgentDetailsContent } from "./components/agent-details-content";
import { AgentPricing } from "./components/agent-pricing";

interface PageProps {
  params: {
    id: string;
  };
}

export default function AgentDetails({ params }: PageProps) {
  const agent = agents.find((a) => a.id === params.id);

  if (!agent) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">Agent not found</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 hover:text-blue-500"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </Link>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <AgentDetailsContent agent={agent} />
        <AgentPricing agent={agent} />
      </div>
    </div>
  );
}
