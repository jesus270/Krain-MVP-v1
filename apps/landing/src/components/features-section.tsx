import { Container } from "./container"
import { UiPreview } from "./ui-preview"

export function FeaturesSection() {
  return (
    <section className="bg-black py-24 md:py-32">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The only AI agent portal
            <br />
            you'll ever need
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Find high performing AI agents based on your exact criteria, performance index and trust scores.
          </p>
        </div>
        <UiPreview />
      </Container>
    </section>
  )
}

