import { TypeIcon as type, LucideIcon } from "lucide-react";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  className?: string;
  imageClassName?: string;
}

export function FeatureCard({
  title,
  description,
  image,
  className = "",
  imageClassName = "",
}: FeatureCardProps) {
  return (
    <div
      className={`relative overflow-hidden ${className} border border-[#272442]`}
    >
      <div className={`relative w-full ${imageClassName} p-8`}>
        <Image
          src={image || "https://placehold.co/400x300"}
          alt={title}
          width={400}
          height={300}
          className="w-full h-auto"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}
