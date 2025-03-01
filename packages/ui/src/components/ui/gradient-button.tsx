import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@krain/ui/lib/utils";

const gradientButtonVariants = cva(
  "group/gradient-btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-white",
        outline: "text-white",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-md",
        sm: "h-8 px-3 py-1.5 text-xs rounded-md",
        lg: "h-10 px-8 py-2.5 rounded-md",
        xl: "px-4 py-2.5 md:px-5 md:py-3.5 text-sm md:text-base rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  children: React.ReactNode;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(gradientButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div
          className="absolute inset-0 rounded-[inherit] opacity-50 group-hover/gradient-btn:opacity-90 transition-opacity"
          style={{
            background: `linear-gradient(120deg,
              #1FC5D6 0%,
              #915BF0 50%,
              rgb(47, 45, 64) 75%
            )`,
          }}
        />
        <div
          className="absolute inset-0 rounded-[inherit] opacity-50 group-hover/gradient-btn:opacity-90 transition-opacity"
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
  },
);
GradientButton.displayName = "GradientButton";

export { GradientButton, gradientButtonVariants };
