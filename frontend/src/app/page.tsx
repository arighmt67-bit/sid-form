"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { FIELD_TYPES } from "@/lib/utils";

/* ══════════════════════════════════════════
   Animated Hero Graphic
   ══════════════════════════════════════════ */
function HeroGraphic() {
  return (
    <div className="relative hidden lg:flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute -top-20 right-0 w-80 h-80 rounded-full blur-[150px] opacity-[0.06] bg-accent" />
      <div className="absolute -bottom-20 left-10 w-60 h-60 rounded-full blur-[120px] opacity-[0.04] bg-accent-secondary" />

      {/* Rotating dashed ring */}
      <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-accent/15 animate-rotate-slow" />

      {/* Floating form cards */}
      <div className="relative w-72 space-y-4">
        {/* Card 1 — floating up */}
        <div className="animate-float-y rounded-xl border border-border bg-card shadow-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FDCE1B]/10 to-[#FFE98F]/10 flex items-center justify-center text-accent text-xs font-mono">1</div>
            <div className="flex-1 space-y-1">
              <div className="h-2 w-20 bg-muted rounded-full" />
              <div className="h-1.5 w-14 bg-muted rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-full bg-muted rounded-lg" />
            <div className="h-8 w-full bg-muted rounded-lg" />
            <div className="h-2 w-3/4 bg-muted rounded-full ml-1" />
          </div>
        </div>

        {/* Card 2 — floating down */}
        <div className="animate-float-y-delayed rounded-xl border border-border bg-card shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 rounded bg-accent/10 flex items-center justify-center">
              <span className="text-[10px] text-accent font-mono">✓</span>
            </div>
            <div className="h-2 w-24 bg-muted rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-accent/10 flex items-center justify-center">
              <span className="text-[10px] text-accent font-mono">✓</span>
            </div>
            <div className="h-2 w-16 bg-muted rounded-full" />
          </div>
        </div>

        {/* Decor: accent corner block */}
        <div className="absolute -bottom-6 -right-4 w-12 h-12 rounded-xl bg-accent shadow-accent rotate-12" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Feature Card
   ══════════════════════════════════════════ */
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <Card className="group cursor-default">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FDCE1B] to-[#FFE98F] text-white shadow-sm shadow-accent/20 mb-4 group-hover:shadow-accent-lg transition-shadow duration-300">
        <span className="text-lg">{icon}</span>
      </div>
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </Card>
  );
}

/* ══════════════════════════════════════════
   Pricing Card
   ══════════════════════════════════════════ */
function PricingCard({
  name,
  price,
  desc,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  desc: string;
  features: string[];
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="relative rounded-2xl bg-gradient-to-br from-[#FDCE1B] via-[#FFE98F] to-[#FDCE1B] p-[2px]">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FDCE1B] to-[#FFE98F] px-4 py-1 text-[11px] font-semibold text-white shadow-accent">
          Most Popular
        </div>
        <div className="h-full rounded-[calc(16px-2px)] bg-card p-8 pt-7">
          <h4 className="text-lg font-semibold mb-1">{name}</h4>
          <p className="text-3xl font-bold mb-1">
            {price}<span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-sm text-muted-foreground mb-5">{desc}</p>
          <ul className="space-y-2.5 mb-6">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-accent shrink-0">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/builder">
            <Button className="w-full justify-center">Start Free</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card padding="lg" className="flex flex-col">
      <h4 className="text-lg font-semibold mb-1">{name}</h4>
      <p className="text-3xl font-bold mb-1">
        {price}<span className="text-base font-normal text-muted-foreground">/mo</span>
      </p>
      <p className="text-sm text-muted-foreground mb-5">{desc}</p>
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-accent shrink-0">✓</span>
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" className="w-full justify-center">Get Started</Button>
    </Card>
  );
}

/* ══════════════════════════════════════════
   Landing Page
   ══════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      <Header />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[180px] opacity-[0.05] bg-accent" />
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            {/* Text */}
            <div>
              <SectionLabel>No Code Required</SectionLabel>
              <h1 className="mt-4 font-display text-[2.75rem] md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground">
                Build forms that
                <br />
                <span className="gradient-text">people love</span> to fill.
              </h1>
              <div className="relative inline-block">
                <div className="absolute bottom-[-0.25rem] left-0 h-2 md:h-3 w-full rounded-sm bg-gradient-to-r from-accent/15 to-accent-secondary/10" />
              </div>
              <p className="mt-6 max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed">
                SIDForm lets anyone create beautiful, responsive online forms with 
                drag & drop simplicity. No coding. No complexity. Just forms that work.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/builder">
                  <Button size="xl" className="group">
                    Start Building Free
                    <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button variant="outline" size="xl">
                    Browse Templates
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">14+</span> field types
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="font-semibold text-foreground">Drag & Drop</span> builder
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="font-semibold text-foreground">100%</span> free tier
                </div>
              </div>
            </div>

            {/* Graphic */}
            <HeroGraphic />
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>Powerful Features</SectionLabel>
            <h2 className="mt-4 font-display text-3xl md:text-[3.25rem] leading-[1.15]">
              Everything you need to{" "}
              <span className="gradient-text">build forms</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              From simple contact forms to complex multi-step surveys — SIDForm 
              has all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon="🎯" title="Drag & Drop Builder" desc="Visually build forms by dragging fields onto your canvas. Real-time preview as you design." />
            <FeatureCard icon="🧩" title="14+ Field Types" desc="Text, email, number, dropdown, radio, checkbox, file upload, signature, date picker & more." />
            <FeatureCard icon="🎨" title="Beautiful by Default" desc="Every form is designed with the Minimalist Modern aesthetic — clean, professional, and responsive." />
            <FeatureCard icon="🔗" title="JSON Schema Native" desc="All forms are stored as standard JSON Schema. Export, import, and integrate with any platform." />
            <FeatureCard icon="📊" title="Submission Dashboard" desc="View, filter, and export all form submissions. Built-in analytics to understand response patterns." />
            <FeatureCard icon="⚡" title="Conditional Logic" desc="Show or hide fields based on user input. Create intelligent, adaptive forms without code." />
          </div>
        </div>
      </section>

      {/* ── Field Types Showcase ── */}
      <section className="py-28 md:py-36 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>Field Types</SectionLabel>
            <h2 className="mt-4 font-display text-3xl md:text-[3.25rem] leading-[1.15]">
              14+ ways to{" "}
              <span className="gradient-text">collect data</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {FIELD_TYPES.map((field) => (
              <div
                key={field.type}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-accent/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/5 text-lg">
                  {field.icon}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{field.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inverted Stats Section ── */}
      <section className="relative py-28 md:py-36 bg-foreground dot-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[150px] opacity-[0.08] bg-accent" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-14">
            <SectionLabel className="border-accent/50 bg-accent/20 [&>span]:text-accent-foreground [&>span:first-child]:bg-accent-foreground">
              Why SIDForm
            </SectionLabel>
            <h2 className="mt-4 font-display text-3xl md:text-[3.25rem] leading-[1.15] text-white">
              Built for the{" "}
              <span className="gradient-text">modern web</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "14+", label: "Field Types" },
              { num: "Drag", label: "& Drop Builder" },
              { num: "JSON", label: "Schema Native" },
              { num: "MIT", label: "Open Source" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1.5">{stat.num}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-4 font-display text-3xl md:text-[3.25rem] leading-[1.15]">
              Start free,{" "}
              <span className="gradient-text">scale as you grow</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              No hidden fees. No surprises. Just fair pricing for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <PricingCard
              name="Starter"
              price="Free"
              desc="For personal projects"
              features={["Up to 5 forms", "100 submissions/mo", "Basic field types", "Email notifications"]}
            />
            <PricingCard
              name="Pro"
              price="$15"
              desc="For professionals"
              features={["Unlimited forms", "10,000 submissions/mo", "All field types", "Conditional logic", "File uploads", "Custom branding"]}
              featured
            />
            <PricingCard
              name="Enterprise"
              price="$49"
              desc="For teams"
              features={["Everything in Pro", "Unlimited submissions", "Team collaboration", "API access", "Priority support", "SSO / SAML"]}
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="relative py-28 md:py-44 bg-foreground dot-pattern overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full blur-[180px] opacity-[0.06] bg-accent" />
        <div className="mx-auto max-w-3xl px-6 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-[3.25rem] leading-[1.15] text-white mb-6">
            Ready to build your
            <br />
            <span className="gradient-text">first form?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            No coding. No complexity. Just drag, drop, and publish. Start building today.
          </p>
          <Link href="/builder">
            <Button size="xl" className="group">
              Start Building — It&apos;s Free
              <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
