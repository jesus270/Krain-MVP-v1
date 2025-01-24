"use client";

import { BotIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface AgentImageProps {
  imageUrl: string;
  name: string;
}

export function AgentImage({ imageUrl, name }: AgentImageProps) {
  const [failedImage, setFailedImage] = useState(false);

  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
      {imageUrl.startsWith("http") && !failedImage ? (
        <Image
          src={imageUrl}
          alt={`${name} icon`}
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          onError={() => setFailedImage(true)}
        />
      ) : (
        <BotIcon className="h-10 w-10 text-white" />
      )}
    </div>
  );
}
