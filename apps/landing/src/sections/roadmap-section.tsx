import { RoadmapCarousel } from "../components/roadmap-carousel";

export function RoadmapSection() {
  return (
    <section
      id="roadmap"
      className="relative flex flex-col w-full py-24 md:py-32 px-4 md:px-20 bg-[#04030C]"
    >
      <div className="flex flex-col w-full max-w-7xl">
        <RoadmapCarousel />
      </div>
    </section>
  );
}
