import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
}

export function SectionLabel({ children, animated = true, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full bg-accent",
          animated && "animate-pulse-dot"
        )}
      />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        {children}
      </span>
    </div>
  );
}
