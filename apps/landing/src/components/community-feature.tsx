interface CommunityFeatureProps {
  title: string;
  className?: string;
}

export function CommunityFeature({
  title,
  className = "",
}: CommunityFeatureProps) {
  return (
    <div
      className={`relative flex flex-col justify-end min-h-24 pl-4 ${className}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-lg"
        style={{
          background: `linear-gradient(360deg, #D0B9F9 -35.48%, rgba(255, 255, 255, 0) 100%),
          radial-gradient(1396.3% 29.03% at 50% 89.78%, rgba(145, 91, 240, 0.9) 0%, rgba(145, 91, 240, 0) 23.91%),
          radial-gradient(4075% 32.57% at 0% 100%, #1FC5D6 0%, rgba(31, 197, 214, 0) 30.62%)`,
          backdropFilter: "blur(12.7px)",
          boxShadow:
            "0 0 10px rgba(145, 91, 240, 0.5), 0 0 20px rgba(31, 197, 214, 0.3)",
        }}
      />
      <p className="text-xs text-[#EFF0F3] uppercase tracking-wider leading-[19.6px] text-left underline-offset-[from-font] decoration-skip-ink-none">
        {title}
      </p>
    </div>
  );
}
