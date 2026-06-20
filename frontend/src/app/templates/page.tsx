"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";

const templates = [
  { id: "contact", name: "Contact Form", icon: "📬", desc: "Classic contact form with name, email, and message.", fields: 4 },
  { id: "survey", name: "Customer Survey", icon: "📊", desc: "Multi-step survey with rating scales and open feedback.", fields: 8 },
  { id: "registration", name: "Event Registration", icon: "🎟️", desc: "Registration form with date picker and file upload.", fields: 6 },
  { id: "feedback", name: "Feedback Form", icon: "💬", desc: "Quick feedback collection with star ratings.", fields: 5 },
  { id: "order", name: "Order Form", icon: "🛒", desc: "Product order form with quantity and payment details.", fields: 7 },
  { id: "application", name: "Job Application", icon: "💼", desc: "Employment application with file upload for CV.", fields: 10 },
  { id: "rsvp", name: "Event RSVP", icon: "🎉", desc: "Simple RSVP form with guest count.", fields: 3 },
  { id: "checklist", name: "Inspection Checklist", icon: "✅", desc: "Checklist form with pass/fail items.", fields: 12 },
  { id: "poll", name: "Quick Poll", icon: "📋", desc: "Single-question poll with radio options.", fields: 1 },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Templates</SectionLabel>
            <h1 className="mt-4 font-display text-3xl md:text-[3.25rem] leading-[1.15]">
              Start with a{" "}
              <span className="gradient-text">template</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Pick a pre-built template and customize it to your needs. 
              All templates are drag-and-drop editable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((t) => (
              <Link key={t.id} href={`/builder`}>
                <Card className="group h-full hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent-secondary/10 text-2xl group-hover:shadow-accent transition-shadow duration-300">
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 group-hover:text-accent transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {t.desc}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                          {t.fields} fields
                        </span>
                        <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Use Template →
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Blank form CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Prefer to start from scratch?
            </p>
            <Link href="/builder">
              <Button size="lg" variant="outline">
                Start with Blank Form
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
