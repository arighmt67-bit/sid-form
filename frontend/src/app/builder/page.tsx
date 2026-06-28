"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { FIELD_TYPES, type FieldType, createBlankForm } from "@/lib/utils";

/* ══════════════════════════════════════════
   Sortable Field Item
   ══════════════════════════════════════════ */
function SortableField({
  field,
  isCanvas,
  onRemove,
}: {
  field: BuilderField;
  isCanvas?: boolean;
  onRemove?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border p-4 bg-card transition-all duration-200 select-none ${
        isDragging ? "opacity-40 shadow-xl z-50" : "shadow-sm hover:shadow-md"
      } ${isCanvas ? "cursor-grab active:cursor-grabbing border-border" : "border-accent/20 hover:border-accent/40 cursor-grab active:cursor-grabbing"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5" {...attributes} {...listeners}>
          <div className="w-5 text-muted-foreground text-xs">⠿</div>
          <span className="text-sm font-medium">{field.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {field.type}
          </span>
          {isCanvas && onRemove && (
            <button
              onClick={() => onRemove(field.id)}
              className="text-muted-foreground hover:text-red-500 transition-colors text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Field Preview */}
      <div className="pointer-events-none">
        {field.type === "textfield" && (
          <div className="h-9 w-full rounded-lg border border-border bg-muted/30 px-3 flex items-center">
            <span className="text-xs text-muted-foreground/50">Text input...</span>
          </div>
        )}
        {field.type === "textarea" && (
          <div className="h-20 w-full rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="text-xs text-muted-foreground/50">Long text...</span>
          </div>
        )}
        {field.type === "email" && (
          <div className="h-9 w-full rounded-lg border border-border bg-muted/30 px-3 flex items-center">
            <span className="text-xs text-muted-foreground/50">email@example.com</span>
          </div>
        )}
        {field.type === "number" && (
          <div className="h-9 w-32 rounded-lg border border-border bg-muted/30 px-3 flex items-center">
            <span className="text-xs text-muted-foreground/50">123</span>
          </div>
        )}
        {field.type === "select" && (
          <div className="h-9 w-full rounded-lg border border-border bg-muted/30 px-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground/50">Choose...</span>
            <span className="text-xs text-muted-foreground/40">▾</span>
          </div>
        )}
        {field.type === "radio" && (
          <div className="space-y-1.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-full border border-border" />
                <span className="text-xs text-muted-foreground/50">Option {n}</span>
              </div>
            ))}
          </div>
        )}
        {field.type === "checkbox" && (
          <div className="space-y-1.5">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded border border-border" />
                <span className="text-xs text-muted-foreground/50">Checkbox {n}</span>
              </div>
            ))}
          </div>
        )}
        {field.type === "phoneNumber" && (
          <div className="h-9 w-48 rounded-lg border border-border bg-muted/30 px-3 flex items-center">
            <span className="text-xs text-muted-foreground/50">+62 8xx xxxx</span>
          </div>
        )}
        {field.type === "datetime" && (
          <div className="h-9 w-48 rounded-lg border border-border bg-muted/30 px-3 flex items-center">
            <span className="text-xs text-muted-foreground/50">📅 Pick a date...</span>
          </div>
        )}
        {field.type === "file" && (
          <div className="h-16 w-full rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/50">📎 Drop files or click</span>
          </div>
        )}
        {field.type === "signature" && (
          <div className="h-20 w-full rounded-lg border border-border bg-muted/10 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40 italic">Sign here...</span>
          </div>
        )}
        {field.type === "heading" && (
          <h3 className="text-lg font-display text-foreground">Section Heading</h3>
        )}
        {field.type === "paragraph" && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a descriptive paragraph that provides context or instructions for the form.
          </p>
        )}
        {field.type === "divider" && (
          <div className="h-px w-full bg-border" />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Sidebar Field Palette
   ══════════════════════════════════════════ */
function FieldPalette() {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Field Palette
      </h3>
      {FIELD_TYPES.map((field) => (
        <div
          key={field.type}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-grab active:cursor-grabbing hover:bg-muted hover:border-accent/20 border border-transparent transition-all duration-150"
          data-field-type={field.type}
        >
          <span className="w-5 text-center text-muted-foreground text-xs">{field.icon}</span>
          <span className="text-foreground font-medium">{field.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
interface BuilderField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
}

/* ══════════════════════════════════════════
   Form Builder Page
   ══════════════════════════════════════════ */
let fieldIdCounter = 0;

export default function BuilderPage() {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* Add field from palette */
  const handlePaletteClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-field-type]") as HTMLElement | null;
    if (!target) return;
    const type = target.getAttribute("data-field-type") as FieldType;
    const fieldInfo = FIELD_TYPES.find((f) => f.type === type);
    if (!fieldInfo) return;

    const newField: BuilderField = {
      id: `field-${++fieldIdCounter}-${Date.now()}`,
      type,
      label: fieldInfo.label,
    };
    setFields((prev) => [...prev, newField]);
  }, []);

  /* Drag start */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  /* Drag end — reorder fields */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      const result = [...prev];
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  /* Remove field */
  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  /* Export JSON */
  const exportJSON = useCallback(() => {
    const form = createBlankForm(formTitle);
    form.components = fields.map((f) => ({
      key: f.id,
      type: f.type,
      label: f.label,
      input: true,
    }));
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [formTitle, fields]);

  /* Save Form to Backend */
  const saveFormToBackend = async () => {
    const formPayload = {
      title: formTitle,
      description: "Saved from SID Form Builder",
      components: fields.map((f) => ({
        key: f.id,
        type: f.type,
        label: f.label,
        input: true,
      })),
    };
    try {
      const res = await fetch("http://localhost:8001/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload),
      });
      if (res.ok) {
        alert("Form successfully saved to Backend API! 🎉");
      } else {
        alert("Failed to save form. API Error.");
      }
    } catch (err) {
      alert("Error connecting to backend API (port 8001). Is it running?");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Builder Toolbar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              ← Back
            </Link>
            <div className="h-5 w-px bg-border" />
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="bg-transparent text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-accent/30 rounded px-1.5 py-0.5"
              placeholder="Form Title"
            />
            <SectionLabel animated={false} className="hidden sm:inline-flex">
              Draft
            </SectionLabel>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {fields.length} field{fields.length !== 1 ? "s" : ""}
            </span>
            <Button variant="outline" size="sm" onClick={exportJSON} disabled={fields.length === 0}>
              Export JSON
            </Button>
            <Button size="sm" onClick={saveFormToBackend} disabled={fields.length === 0}>
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Body */}
      <div className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex gap-8">
            {/* Sidebar Palette */}
            <aside className="hidden md:block w-56 shrink-0">
              <div className="sticky top-36 rounded-xl border border-border bg-card p-4 shadow-sm" onClick={handlePaletteClick}>
                <FieldPalette />
              </div>
            </aside>

            {/* Canvas */}
            <main className="flex-1 min-w-0">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="max-w-2xl mx-auto space-y-3">
                    {fields.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
                        <div className="flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/10 to-accent-secondary/10">
                          <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Start building your form</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Click any field type from the left sidebar to add it to your form. 
                          Drag to reorder.
                        </p>
                      </div>
                    ) : (
                      fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          isCanvas
                          onRemove={removeField}
                        />
                      ))
                    )}

                    {/* Submit button preview */}
                    {fields.length > 0 && (
                      <div className="pt-4">
                        <Button size="lg" className="w-full justify-center opacity-70 pointer-events-none">
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <SortableField
                      field={fields.find((f) => f.id === activeId)!}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </main>

            {/* Properties Panel */}
            <aside className="hidden xl:block w-64 shrink-0">
              <div className="sticky top-36 rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Properties
                </h3>
                {fields.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Click a field to edit its properties.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      {fields.length} field{fields.length !== 1 ? "s" : ""} in form
                    </div>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {fields.map((f) => (
                        <div key={f.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-muted cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-4 text-center text-muted-foreground">
                              {FIELD_TYPES.find((ft) => ft.type === f.type)?.icon}
                            </span>
                            <span className="truncate max-w-[120px]">{f.label}</span>
                          </div>
                          <button
                            onClick={() => removeField(f.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
