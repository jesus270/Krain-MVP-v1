import { Button } from "@krain/ui/components/ui/button";
import { CommunityFeature } from "./community-feature";

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
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 50% 80%, rgba(45, 212, 191, 0.1) 0%, transparent 60%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative pt-24 pb-40">
        <div className="text-center space-y-6 mb-16">
          <p className="text-sm font-medium tracking-wider text-gray-400 uppercase">
            KRAIN COMMUNITY
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto">
            Connect with 100,000s of crypto users in the KRAIN ecosystem
          </h2>
          <Button
            variant="secondary"
            className="bg-purple-600/20 hover:bg-purple-600/30 text-white"
          >
            Join community
          </Button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <CommunityFeature key={index} title={feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
