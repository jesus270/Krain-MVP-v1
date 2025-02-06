import { TypeIcon as type, LucideIcon } from "lucide-react";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
}

export function FeatureCard({ title, description, image }: FeatureCardProps) {
  return (
    <div className={`relative border border-[#272442]`}>
      <div className={`relative flex items-center justify-center`}>
        <Image
          src={image}
          alt={title}
          width={1280}
          height={960}
          className="object-cover"
        />
      </div>
      <div className="p-6 pt-0">
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}
