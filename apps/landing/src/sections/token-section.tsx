import { ContractDisplay } from "../components/contract-display";
import { TokenFeature } from "../components/token-feature";

const tokenFeatures = [
  { iconPath: "/icon-square-star.svg", title: "UNLOCK PREMIUM\nAI FEATURES" },
  { iconPath: "/icon-square-krain.svg", title: "AGENT HUB PRIMARY\nCURRENCY" },
  { iconPath: "/icon-square-robot.svg", title: "AGENT HUB\nSUBSCRIPTIONS" },
  { iconPath: "/icon-square-reward.svg", title: "AGENT PERFORMANCE\nREWARDS" },
  {
    iconPath: "/icon-square-liquid.svg",
    title: "AGENT TOKEN\nLIQUIDITY PAIRING",
  },
  { iconPath: "/icon-square-coins.svg", title: "EARN\nSTAKING REWARDS" },
  { iconPath: "/icon-square-vote.svg", title: "PARTICIPATE\nIN GOVERNANCE" },
  {
    iconPath: "/icon-square-burn.svg",
    title: "TOKEN BUYBACKS\n& BURNS MECHANISM",
  },
];

export function TokenSection() {
  return (
    <section
      id="token"
      className="relative flex flex-col w-full py-24 bg-[#04030C]"
    >
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/bg-token.svg"
          src="/bg-token.mp4"
        />
      </div>
      <div className="flex flex-col items-center w-full max-w-7xl px-4 z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white">$KRAIN</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
            The Krain ecosystem is powered by the $KRAIN token, built to enhance
            the ecosystem experience by providing access to premium app
            features, generous staking rewards, community governance voting and
            more.
          </p>
        </div>

        <ContractDisplay address="0×000000000000000000000000" />

        <div className="h-96" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full">
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
