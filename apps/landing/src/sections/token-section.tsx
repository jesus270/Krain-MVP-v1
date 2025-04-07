import { ContractDisplay } from "../components/contract-display";
import { TokenFeature } from "../components/token-feature";
import { VideoBackground } from "@/components/video-background";

const tokenFeatures = [
  { iconPath: "/icon-square-star.svg", title: "UNLOCK PREMIUM\nAI FEATURES" },
  { iconPath: "/icon-square-krain.svg", title: "AI APP PORTAL\nPRIMARY CURRENCY" },
  { iconPath: "/icon-square-robot.svg", title: "AI APP PORTAL\nSUBSCRIPTIONS" },
  { iconPath: "/icon-square-reward.svg", title: "APP PERFORMANCE\nREWARDS" },
  {
    iconPath: "/icon-square-liquid.svg",
    title: "AI APP TOKEN\nLIQUIDITY PAIRING",
  },
  { iconPath: "/icon-square-coins.svg", title: "EARN\nSTAKING REWARDS" },
  { iconPath: "/icon-square-vote.svg", title: "PARTICIPATE\nIN GOVERNANCE" },
  {
    iconPath: "/icon-square-burn.svg",
    title: "TOKEN BUYBACK\n& BURN MECHANISMS",
  },
];

export function TokenSection() {
  return (
    <section
      id="token"
      className="relative flex flex-col py-24 bg-[#04030C] w-full items-center justify-center"
    >
      <div className="absolute inset-0 overflow-hidden flex items-center md:items-start">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-[50%] -translate-y-16 object-cover md:translate-y-8 md:h-full"
        >
          <source src="/bg-token.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#04030C] via-transparent via-50% to-[#04030C]" />
      <div className="flex flex-col items-center w-full px-4 z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-6">
          <h2 className="text-4xl md:text-6xl font-bold text-white">$KRAIN</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
            The Krain ecosystem is powered by the $KRAIN token, built to enhance
            the ecosystem experience by providing access to premium app
            features, generous staking rewards, community governance voting and
            more.
          </p>
        </div>

        <ContractDisplay address="0×000000000000000000000000" />

        <div className="h-[24rem] md:h-[48rem]" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full max-w-7xl px-4">
          {tokenFeatures.map((feature) => (
            <TokenFeature
              key={feature.title.replace(/\s+/g, "-").toLowerCase()}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
