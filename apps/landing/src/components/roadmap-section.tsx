import { Container } from "./container";
import { RoadmapCarousel } from "./roadmap-carousel";

export function RoadmapSection() {
  return (
    <section className="bg-black py-24 md:py-32">
      <Container>
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white">Roadmap</h2>
        </div>
        <RoadmapCarousel />
      </Container>
    </section>
  );
}
