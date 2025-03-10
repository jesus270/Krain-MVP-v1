"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";

import { cn } from "@krain/ui/lib/utils";

const labelVariants = cva(
  "flex items-center gap-2 text-sm leading-none font-medium select-none group-[[data-disabled=true]]:pointer-events-none group-[[data-disabled=true]]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ variant: "default" }), className)}
      {...props}
    />
  );
}

export { Label };
