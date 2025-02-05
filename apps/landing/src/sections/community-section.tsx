import { Button } from "@krain/ui/components/ui/button";
import { CommunityFeature } from "../components/community-feature";
import { GradientButton } from "../components/gradient-button";
import Image from "next/image";
import { TelegramLogo } from "@krain/ui/components/icons/logo-telegram";
import Link from "next/link";

const features = [
  "GET REAL-TIME SUPPORT FROM OUR TEAM",
  "ACCESS EXCLUSIVE EARLY INSIGHTS",
  "JOIN EDUCATIONAL COMMUNITY EVENTS",
  "COLLABORATE WITH LIKEMINDED AI AGENT USERS AND CREATORS",
  "BE ELIGIBLE AS A BETA TESTER",
  "ACCESS COMPETITIONS TO WIN SPECIAL REWARDS",
  "EARLY ACCESS TO PARTNER PROJECTS AND ECOSYSTEM INTEGRATIONS & GOVERNANCE",
  "RECEIVE SPECIAL LOYALTY AND LONG-TERM INCENTIVES",
];

export function CommunitySection() {
  return (
    <section id="community" className="relative flex flex-col w-full h-screen">
      <div className="relative overflow-hidden h-screen">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-[#04030C] bg-cover bg-center bg-no-repeat h-screen"
          style={{
            backgroundImage: `url('/bg-community.webp')`,
          }}
        />

        {/* Radial Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(83.11% 74.6% at 50% 100%, #04030C 0%, rgba(4, 3, 12, 0.9) 35%, rgba(4, 3, 12, 0.7) 55.36%, rgba(4, 3, 12, 0) 74%)`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-65% to-black" />

        {/* Content */}
        <div className="relative flex flex-col items-center justify-between pt-24 pb-40 h-screen">
          <div className="text-center space-y-6 mb-16">
            <p
              className="text-sm font-medium tracking-[0.3em] uppercase"
              style={{
                background: `linear-gradient(0deg, #EFF0F3, #EFF0F3),
                linear-gradient(90deg, #4E516A 0%, #FFFFFF 30.43%, #FFFFFF 72.77%, #4E516A 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              KRAIN COMMUNITY
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto mb-4">
              Connect with 100,000s of crypto users in the KRAIN ecosystem
            </h2>
            <Link href={"https://t.me/krainofficial"}>
              <div className="flex items-center justify-center gap-2 mt-8">
                <GradientButton>
                  <div className="flex items-center gap-2">
                    <TelegramLogo className="w-5 h-5" />
                    <div className="text-sm font-medium">Join community</div>
                  </div>
                </GradientButton>
              </div>
            </Link>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <CommunityFeature key={index} title={feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
