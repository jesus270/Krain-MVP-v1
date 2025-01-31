import { Container } from "./container"
import { ExchangeCard } from "./exchange-card"

const exchanges = [{ name: "Exchange 1" }, { name: "Exchange 2" }, { name: "Exchange 3" }]

export function ExchangesSection() {
  return (
    <section className="bg-black py-24 md:py-32">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-sm font-medium tracking-wider text-gray-400 uppercase">Available on</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {exchanges.map((exchange) => (
            <ExchangeCard key={exchange.name} {...exchange} />
          ))}
        </div>
      </Container>
    </section>
  )
}

