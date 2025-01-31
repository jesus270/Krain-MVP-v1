import { SocialNav } from "./social-nav";
import { Partners } from "./partners";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen bg-black"
      style={{
        backgroundImage: `
          radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 70% 50%, rgba(45, 212, 191, 0.1) 0%, transparent 50%)
        `,
      }}
    >
      <SocialNav />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="max-w-4xl text-4xl md:text-6xl font-bold text-white mb-4">
          The infrastructure layer fueling{" "}
          <span className="relative">
            AI agent eco
            <span className="absolute -inset-1 flex items-center justify-center gap-0.5">
              <span className="px-2 py-1 rounded-full bg-purple-600">B</span>
              <span className="px-2 py-1 rounded-full bg-purple-600">A</span>
            </span>
            ny
          </span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-8">
          Accelerate AI agent ecosystems with intelligent infrastructures.
        </p>
        <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium hover:opacity-90 transition-opacity">
          Enter app
        </button>
      </div>
      <Partners />
    </section>
  );
}
