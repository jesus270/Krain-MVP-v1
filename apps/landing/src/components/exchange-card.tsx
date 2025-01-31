import Image from "next/image";

interface ExchangeCardProps {
  name: string;
  logo?: string;
  href?: string;
  className?: string;
  imageClassName?: string;
}

export function ExchangeCard({
  name,
  logo,
  href,
  className = "",
  imageClassName = "",
}: ExchangeCardProps) {
  const card = (
    <div
      className={`relative overflow-hidden ${className} border border-[#272442]`}
    >
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-105"
      >
        {card}
      </a>
    );
  }

  return card;
}
