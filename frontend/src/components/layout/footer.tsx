import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FDCE1B] to-[#FFE98F] text-white font-bold text-xs">SF</div>
              <span className="font-display text-base tracking-tight">SID<span className="gradient-text">Form</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Build forms that people love to fill. Drag, drop, done.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Product</h4>
            <div className="space-y-2.5">
              <Link href="/builder" className="block text-sm text-foreground hover:text-accent transition-colors">Form Builder</Link>
              <Link href="/templates" className="block text-sm text-foreground hover:text-accent transition-colors">Templates</Link>
              <Link href="/#pricing" className="block text-sm text-foreground hover:text-accent transition-colors">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Resources</h4>
            <div className="space-y-2.5">
              <a href="#" className="block text-sm text-foreground hover:text-accent transition-colors">Documentation</a>
              <a href="#" className="block text-sm text-foreground hover:text-accent transition-colors">API Reference</a>
              <a href="#" className="block text-sm text-foreground hover:text-accent transition-colors">Help Center</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Company</h4>
            <div className="space-y-2.5">
              <a href="#" className="block text-sm text-foreground hover:text-accent transition-colors">About</a>
              <a href="#" className="block text-sm text-foreground hover:text-accent transition-colors">Blog</a>
              <a href="#" className="block text-sm text-foreground hover:text-accent transition-colors">Privacy</a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} SIDForm. Built with ♥ using Next.js, Form.io & @dnd-kit.</p>
        </div>
      </div>
    </footer>
  );
}
