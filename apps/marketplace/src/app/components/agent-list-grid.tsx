import { AIAgent } from "../types";
import { ListAgentCard } from "./list-agent-card";

interface AgentListGridProps {
  agents: AIAgent[];
  onFilter: (type: string, value: string) => void;
  title?: string;
}

export function AgentListGrid({ agents, onFilter, title }: AgentListGridProps) {
  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <ListAgentCard key={agent.id} agent={agent} onFilter={onFilter} />
        ))}
      </div>
    </div>
  );
}
