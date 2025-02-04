import { Card, CardContent, CardHeader } from "@krain/ui/components/ui/card";
import Image from "next/image";

interface PhaseCardProps {
  phase: string;
  title: string;
  subtitle: string;
  features: string[];
}

export function PhaseCard({
  phase,
  title,
  subtitle,
  features,
}: PhaseCardProps) {
  const backgroundImage = `/phase-${phase}.svg`;

  return (
    <div className="w-full max-w-[470px] min-h-[400px] relative mx-auto">
      <div className="relative w-full max-w-[380px] h-[200px]">
        <Image
          src={backgroundImage}
          alt={phase}
          fill
          className="object-contain object-left-top"
          priority
        />
      </div>
      <div className="absolute top-[140px] right-4 md:right-12 w-[75%]">
        <ul className="space-y-3">
          <li className="text-white text-sm md:text-base font-medium mb-2">
            {title}
            <br />
            {subtitle}
          </li>
          {features.map((feature) => (
            <li
              key={feature}
              className="text-white/70 text-xs md:text-sm pl-3 relative leading-relaxed"
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
