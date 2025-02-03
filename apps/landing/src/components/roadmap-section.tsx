import { Container } from "./container";
import { RoadmapCarousel } from "./roadmap-carousel";

export function RoadmapSection() {
  return (
    <section className="bg-[#04030C] py-24 md:py-32">
      <Container>
        <RoadmapCarousel />
      </Container>
    </section>
  );
}
