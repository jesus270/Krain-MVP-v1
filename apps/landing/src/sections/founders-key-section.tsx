import { Button } from "@krain/ui/components/ui/button";
import { GradientButton } from "@krain/ui/components/ui/gradient-button";
import Link from "next/link";
import { HammerIcon } from "lucide-react";

// Define benefits based on the mockup
const benefits = [
  "3X → $450 USD of $KRAIN Tokens",
  "25% APY $KRAIN Staking Rewards Starting Now",
  "2X (Double) Your $KRAIN Airdrop Distribution",
  "Share in Dedicated 15% of $KRAIN Airdrop Pool",
  "Whitelabel Hosting License, $1200/yr Value",
  "Tradeable Digital Asset on ArenaVS and OpenSea",
  "Additional Future Benefits",
];

export function FoundersKeySection() {
  return (
    <section
      id="community"
      className="relative flex flex-col w-full min-h-screen py-16 md:py-24 overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-[#04030C] bg-cover bg-center bg-no-repeat h-[60%] md:h-auto"
        style={{
          backgroundImage: `url('/bg-community.webp')`,
        }}
      />

      {/* Radial Gradient */}
      <div
        className="absolute inset-0 h-[60%] md:h-auto"
        style={{
          background: `radial-gradient(83.11% 74.6% at 50% 100%, #04030C 0%, rgba(4, 3, 12, 0.9) 35%, rgba(4, 3, 12, 0.7) 55.36%, rgba(4, 3, 12, 0) 74%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 w-full">
          {/* Left Column: Video */}
          <div className="w-full md:w-2/5 flex justify-center">
            <div className="relative aspect-square overflow-hidden rounded-lg w-full max-w-md xl:max-w-lg shadow-[0_0_30px_5px_rgba(255,255,255,0.4)]">
              <video
                src="/krain-key.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Text Content & Buttons */}
          <div className="w-full md:w-3/5 text-white flex flex-col items-start">
            {/* Minting Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-[rgba(98,55,239,0.2)] to-[rgba(55,199,239,0.2)] rounded-lg shadow-md">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6237EF] to-[#37C7EF] bg-clip-text text-transparent">
                <HammerIcon className="w-5 h-5 xl:w-6 xl:h-6 text-[#6237EF]" />
                <span className="font-semibold text-xs sm:text-sm xl:text-base">
                  <span>Minting </span>
                  <span>MAY 6</span>
                </span>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-left mb-4">
              Founders Key
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-300 text-left mb-4 max-w-lg xl:text-lg xl:max-w-xl">
              Unlock $2,000+ in Value. $KRAIN, Staking, Airdrops, Hosting, and
              More—All with One Key. Only 1500 available.
            </p>

            {/* Price */}
            <div className="mb-4 text-left">
              <p className="text-xs sm:text-sm text-gray-400 xl:text-base">
                Price (converted to ETH at sale)
              </p>
              <p className="text-xl sm:text-2xl font-semibold xl:text-3xl">
                Whitelist: $150 each
                <br />
                Public: $200 each, $150 for 5+
              </p>
            </div>

            {/* Waves Info */}
            <p className="text-xs sm:text-sm text-gray-400 text-left mb-6 xl:text-base"></p>

            {/* Benefits List */}
            <ul className="space-y-3 mb-8 w-full">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex gap-3 items-center">
                  <img
                    src="/icon-square-star.svg"
                    alt="Star"
                    className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12"
                  />
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full">
              {/*
              <Link
                href="https://whitelist.krain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <GradientButton className="rounded-full p-6 cursor-pointer w-full sm:w-auto">
                  <div className="font-medium">Join Whitelist</div>
                </GradientButton>
              </Link>
              */}
              <Link
                href="https://krain.arenavs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full rounded-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-6 cursor-pointer flex items-center gap-2"
                >
                  <span className="">Buy Now </span>
                  <img
                    src="/logo-arenavs.svg"
                    alt="Arena"
                    className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12"
                  />
                </Button>
              </Link>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-8">
              The sale will take place on the{" "}
              <Link href="https://arenavs.com/marketplace" target="_blank">
                Arena VS Marketplace
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
