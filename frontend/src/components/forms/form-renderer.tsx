"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FormComponent } from "@/lib/forms/types";
import { isAnswerable } from "@/lib/forms/types";

interface Props {
  slug: string;
  title: string;
  description: string;
  components: FormComponent[];
}

const inputBase =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow";

export function FormRenderer({ slug, title, description, components }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [topError, setTopError] = useState<string | null>(null);

  const setValue = (key: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const toggleCheckbox = (key: string, option: string) =>
    setValues((prev) => {
      const cur = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      return {
        ...prev,
        [key]: cur.includes(option)
          ? cur.filter((o) => o !== option)
          : [...cur, option],
      };
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    setTopError(null);

    try {
      const res = await fetch(`/api/f/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });

      if (res.ok) {
        setStatus("done");
        return;
      }

      const payload = await res.json().catch(() => ({}));

      if (res.status === 401 && payload.needLogin) {
        window.location.href = `/login?next=${encodeURIComponent(`/f/${slug}`)}`;
        return;
      }
      if (res.status === 422 && payload.fields) {
        setErrors(payload.fields);
        setTopError("Ada isian yang perlu diperbaiki.");
      } else {
        setTopError(payload.error ?? "Gagal mengirim jawaban.");
      }
      setStatus("idle");
    } catch {
      setTopError("Koneksi bermasalah. Cek internet lalu coba lagi.");
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl">
          ✓
        </div>
        <h1 className="font-display text-2xl text-foreground">Terkirim!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Jawaban kamu untuk <strong>{title}</strong> sudah kami terima.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setValues({});
            setStatus("idle");
          }}
        >
          Isi lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </header>

      {topError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {topError}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6" noValidate>
        {components.map((c) => {
          const err = errors[c.key];
          const answerable = isAnswerable(c);

          return (
            <div key={c.key} className={answerable ? "space-y-2" : ""}>
              {answerable && (
                <label
                  htmlFor={c.key}
                  className="block text-sm font-medium text-foreground"
                >
                  {c.label}
                  {c.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}

              <FieldInput
                c={c}
                value={values[c.key]}
                onChange={(v) => setValue(c.key, v)}
                onToggle={(opt) => toggleCheckbox(c.key, opt)}
              />

              {err && <p className="text-xs text-red-500">{err}</p>}
            </div>
          );
        })}

        <div className="pt-2">
          <Button type="submit" size="lg" disabled={status === "sending"}>
            {status === "sending" ? "Mengirim…" : "Kirim Jawaban"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldInput({
  c,
  value,
  onChange,
  onToggle,
}: {
  c: FormComponent;
  value: unknown;
  onChange: (v: unknown) => void;
  onToggle: (option: string) => void;
}) {
  const opts = c.options?.length ? c.options : ["Opsi 1", "Opsi 2", "Opsi 3"];
  const str = typeof value === "string" ? value : "";

  switch (c.type) {
    case "heading":
      return (
        <h2 className="font-display text-xl text-foreground pt-4">{c.label}</h2>
      );
    case "paragraph":
      return (
        <p className="text-sm text-muted-foreground leading-relaxed">{c.label}</p>
      );
    case "divider":
      return <div className="h-px w-full bg-border my-2" />;

    case "textarea":
      return (
        <textarea
          id={c.key}
          rows={4}
          className={inputBase}
          placeholder={c.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "select":
      return (
        <select
          id={c.key}
          className={inputBase}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Pilih —</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );

    case "radio":
      return (
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="radio"
                name={c.key}
                value={o}
                checked={str === o}
                onChange={() => onChange(o)}
                className="accent-[#FDCE1B]"
              />
              <span className="text-foreground">{o}</span>
            </label>
          ))}
        </div>
      );

    case "checkbox": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={arr.includes(o)}
                onChange={() => onToggle(o)}
                className="accent-[#FDCE1B]"
              />
              <span className="text-foreground">{o}</span>
            </label>
          ))}
        </div>
      );
    }

    case "datetime":
      return (
        <input
          id={c.key}
          type="date"
          className={inputBase}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          id={c.key}
          type="number"
          className={inputBase}
          placeholder={c.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "email":
      return (
        <input
          id={c.key}
          type="email"
          className={inputBase}
          placeholder={c.placeholder ?? "nama@sekolahmu.co.id"}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "phoneNumber":
      return (
        <input
          id={c.key}
          type="tel"
          className={inputBase}
          placeholder={c.placeholder ?? "08xx xxxx xxxx"}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "file":
    case "signature":
      return (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          {c.type === "file" ? "📎 Upload file" : "✎ Tanda tangan"} — belum tersedia
          di versi ini.
        </div>
      );

    default:
      return (
        <input
          id={c.key}
          type="text"
          className={inputBase}
          placeholder={c.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
