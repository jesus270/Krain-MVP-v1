import { ButtonHTMLAttributes } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GradientButton({
  children,
  className,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={`group relative px-4 py-2.5 md:px-5 md:py-3.5 rounded-full text-white text-sm md:text-base font-medium ${className}`}
      {...props}
    >
      {/* <div className="absolute inset-0 rounded-full bg-[#1f1e2a]" /> */}
      <div
        className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-90 transition-opacity"
        style={{
          background: `linear-gradient(120deg,
            #1FC5D6 0%,
            #915BF0 50%,
            rgb(47, 45, 64) 75%
          )`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-90 transition-opacity"
        style={{
          padding: "1px",
          background: `linear-gradient(120deg,
            #1FC5D6 0%,
            rgba(31, 196, 214, 0.50) 50%,
            rgba(31, 196, 214, 0.25) 75%
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
      <span className="relative z-10 block">{children}</span>
    </button>
  );
}
