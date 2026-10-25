import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-50 border border-[var(--color-line)] font-[family-name:var(--font-mono)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] border-[var(--color-accent)]",
        secondary:
          "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-accent2)] hover:text-black hover:border-[var(--color-accent2)]",
        outline:
          "border-[var(--color-line-strong)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]",
        ghost:
          "border-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]",
        danger:
          "bg-[var(--color-alert)] text-black border-[var(--color-alert)] hover:opacity-90",
      },
      size: {
        default: "h-11 min-h-[44px] px-4 py-2",
        sm: "h-11 min-h-[44px] rounded px-3 text-xs",
        lg: "h-12 min-h-[48px] rounded px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
