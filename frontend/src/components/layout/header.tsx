"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FDCE1B] to-[#FFE98F] text-white font-bold text-sm shadow-sm shadow-accent/20">
            SF
          </div>
          <span className="font-display text-lg tracking-tight text-foreground">
            SID<span className="gradient-text">Form</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
          <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/builder">
            <Button size="sm" className="group text-accent-foreground">
              Start Building
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
