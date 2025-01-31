import { Card, CardContent, CardHeader } from "@krain/ui/components/ui/card";

interface PhaseCardProps {
  phase: string;
  title: string;
  features: string[];
}

export function PhaseCard({ phase, title, features }: PhaseCardProps) {
  return (
    <Card className="bg-gray-900/50 backdrop-blur border-gray-800 h-full">
      <CardHeader>
        <div className="relative">
          <h3 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            {phase}
          </h3>
        </div>
        <h4 className="text-xl font-medium text-white mt-4">{title}</h4>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="text-gray-400 flex items-start">
              <span className="mr-2 text-purple-500">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
