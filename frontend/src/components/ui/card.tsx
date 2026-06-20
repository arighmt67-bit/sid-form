import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "featured";
  padding?: "sm" | "default" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "default", children, ...props }, ref) => {
    const paddingMap = { sm: "p-4", default: "p-6", lg: "p-8 md:p-10" };

    if (variant === "featured") {
      return (
        <div className={cn("rounded-2xl bg-gradient-to-br from-[#FDCE1B] via-[#FFE98F] to-[#FDCE1B] p-[2px]", className)} ref={ref} {...props}>
          <div className={cn("h-full w-full rounded-[calc(16px-2px)] bg-card", paddingMap[padding])}>{children}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border bg-card",
          paddingMap[padding],
          variant === "default" && "shadow-sm hover:shadow-md transition-shadow duration-200",
          variant === "elevated" && "shadow-lg hover:shadow-xl transition-shadow duration-200",
          className
        )}
        {...props}
      >{children}</div>
    );
  }
);
Card.displayName = "Card";
export { Card };
