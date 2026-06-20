import { type VariantProps, cva } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-[#FDCE1B] to-[#FFE98F] text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-accent-lg hover:brightness-105",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted hover:border-accent/30 hover:shadow-sm",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
        accent: "bg-accent text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-accent-lg hover:brightness-105",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-sm",
        default: "h-11 rounded-xl px-5 text-sm",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
