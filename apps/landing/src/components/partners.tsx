import Image from "next/image";
import Link from "next/link";

export function Partners() {
  const partners = [
    {
      name: "Decubate",
      url: "https://decubate.com",
      logo: "/logo-decubate.svg",
    },
    {
      name: "Kairon",
      url: "https://kairon.ai",
      logo: "/logo-kairon.svg",
    },
    {
      name: "Base",
      url: "https://base.org",
      logo: "/logo-base.svg",
    },
    {
      name: "Moonpay",
      url: "https://moonpay.com",
      logo: "/logo-moonpay.svg",
    },
    {
      name: "Exodus",
      url: "https://exodus.com",
      logo: "/logo-exodus.svg",
    },
    {
      name: "Phantom",
      url: "https://phantom.com",
      logo: "/logo-phantom.svg",
    },
  ];

  return (
    <div className="relative flex justify-center gap-4 sm:gap-5 md:gap-12 opacity-50 mx-4 sm:mx-8 md:mx-12 flex-wrap mb-8 md:mb-12">
      {partners.map((partner, i) => (
        <div
          key={partner.name}
          className="relative w-24 sm:w-28 md:w-32 h-6 sm:h-7 md:h-8 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        >
          <Link
            href={partner.url}
            target="_blank"
            className="relative w-full h-full block"
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              fill
              sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
              className="object-contain"
            />
          </Link>
        </div>
      ))}
    </div>
  );
}
