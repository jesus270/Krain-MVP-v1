import Image from "next/image";

export function UiPreview() {
  return (
    <div className="relative w-full aspect-video bg-gray-900/50 backdrop-blur">
      <Image
        src="/ui-preview.svg"
        alt="UI Preview"
        width={3840}
        height={2160}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}
