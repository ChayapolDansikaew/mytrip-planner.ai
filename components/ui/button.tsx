import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.02em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3f78]/45 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#ff3f78] text-white shadow-[0_18px_60px_rgba(255,63,120,0.3)] hover:bg-[#ff6b95]",
        outline:
          "border border-white/55 bg-white/18 text-[#0f3a64] backdrop-blur hover:border-white hover:bg-white/34",
        ghost: "text-[#0f3a64] hover:bg-white/20 hover:text-[#082545]",
        secondary:
          "bg-[#b9f529] text-[#0f3a64] shadow-[0_18px_50px_rgba(185,245,41,0.24)] hover:bg-[#d5ff63]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
