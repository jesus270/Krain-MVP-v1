import { Container } from "./container";
import { ContractDisplay } from "./contract-display";
import { TokenFeature } from "./token-feature";
import {
  Unlock,
  Coins,
  ScrollText,
  Award,
  Droplets,
  PiggyBank,
  Vote,
  Flame,
} from "lucide-react";
import Image from "next/image";

const tokenFeatures = [
  { icon: Unlock, title: "UNLOCK PREMIUM\nAI FEATURES" },
  { icon: Coins, title: "AGENT HUB PRIMARY\nCURRENCY" },
  { icon: ScrollText, title: "AGENT HUB\nSUBSCRIPTIONS" },
  { icon: Award, title: "AGENT PERFORMANCE\nREWARDS" },
  { icon: Droplets, title: "AGENT TOKEN\nLIQUIDITY PAIRING" },
  { icon: PiggyBank, title: "EARN\nSTAKING REWARDS" },
  { icon: Vote, title: "PARTICIPATE\nIN GOVERNANCE" },
  { icon: Flame, title: "TOKEN BUYBACKS\n& BURNS MECHANISM" },
];

export function TokenSection() {
  return (
    <section className="bg-[#04030C] py-24 md:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 50%, rgba(45, 212, 191, 0.1) 0%, transparent 50%)
          `,
        }}
      />
      <Container className="relative">
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white">$KRAIN</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
            The Krain ecosystem is powered by the $Krain token, built to enhance
            the ecosystem experience by providing access to premium app
            features, generous staking rewards, community governance voting and
            more.
          </p>
        </div>
        <ContractDisplay address="0×000000000000000000000000" />
        <div className="relative h-96">
          <Image
            src="https://placehold.co/400x300"
            alt="Krain Token"
            width={400}
            height={300}
            className="mx-auto relative"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {tokenFeatures.map((feature) => (
            <TokenFeature key={feature.title} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
