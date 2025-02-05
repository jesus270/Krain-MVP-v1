import Image from "next/image";

export function UiPreview() {
  return (
    <div className="relative w-full overflow-hidden aspect-video bg-gray-900/50 backdrop-blur">
      <Image
        src="/ui-preview.webp"
        alt="UI Preview"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        priority
        className="object-cover"
        // quality={90}
      />
      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /> */}
    </div>
  );
}
