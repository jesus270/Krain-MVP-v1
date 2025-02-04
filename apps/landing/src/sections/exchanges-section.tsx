import { ExchangeCard } from "../components/exchange-card";

export const exchanges = [{ name: "Exchanges To Be Announced" }];

export function ExchangesSection() {
  return (
    <section
      id="exchanges"
      className="flex flex-col items-center w-full py-24 md:py-32 bg-[#04030C]"
    >
      <div className="flex flex-col items-center w-full max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-sm font-medium tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#4E516A] via-white to-[#4E516A]">
            Available on
          </h2>
        </div>

        <div className="flex items-center justify-center w-full max-w-5xl">
          {exchanges.map((exchange) => (
            <ExchangeCard
              key={`exchange-${exchange.name.toLowerCase().replace(/\s+/g, "-")}`}
              {...exchange}
              className="bg-gray-900/50 backdrop-blur"
              imageClassName="aspect-[3/2]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
