import { Card, CardContent, CardHeader } from "@krain/ui/components/ui/card";
import Image from "next/image";

interface PhaseCardProps {
  phase: string;
  title: string;
  features: string[];
}

type PhaseNumber = "ONE" | "TWO" | "THREE";

export function PhaseCard({ phase, title, features }: PhaseCardProps) {
  const phaseMap: Record<PhaseNumber, string> = {
    ONE: "1",
    TWO: "2",
    THREE: "3",
  };
  const phaseNumber = (phase.split(" ")[1] || "ONE") as PhaseNumber;
  const backgroundImage = `/phase-${phaseMap[phaseNumber]}.svg`;

  return (
    <div className="w-[420px] h-[400px] relative">
      <div className="relative w-[380px] h-[200px]">
        <Image
          src={backgroundImage}
          alt={phase}
          fill
          className="object-contain object-left-top"
          priority
        />
      </div>
      <div className="absolute top-[140px] right-12 w-[66%]">
        <ul className="space-y-2.5">
          <li className="text-white text-base font-medium mb-1">{title}</li>
          {features.map((feature) => (
            <li
              key={feature}
              className="text-white/70 text-[13px] pl-3 relative leading-normal"
            >
              <span className="absolute -left-0 text-white/70">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
