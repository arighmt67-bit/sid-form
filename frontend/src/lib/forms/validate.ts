import { isAnswerable, type FormComponent, type FormSchema } from "./types";

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  /** Data yang sudah dibersihkan — hanya field yang dikenal schema. */
  clean: Record<string, unknown>;
}

const MAX_TEXT = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validasi jawaban form DI SERVER.
 * Jangan pernah mengandalkan validasi browser — payload bisa dipalsukan.
 */
export function validateSubmission(
  schema: FormSchema,
  raw: unknown
): ValidationResult {
  const errors: Record<string, string> = {};
  const clean: Record<string, unknown> = {};

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, errors: { _form: "Data tidak valid." }, clean: {} };
  }
  const data = raw as Record<string, unknown>;
  const components = Array.isArray(schema?.components) ? schema.components : [];

  for (const c of components) {
    if (!isAnswerable(c)) continue;

    const value = data[c.key];
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);

    if (c.required && isEmpty) {
      errors[c.key] = `${c.label} wajib diisi.`;
      continue;
    }
    if (isEmpty) continue;

    const err = validateField(c, value);
    if (err) {
      errors[c.key] = err;
      continue;
    }
    clean[c.key] = normalize(c, value);
  }

  return { ok: Object.keys(errors).length === 0, errors, clean };
}

function validateField(c: FormComponent, value: unknown): string | null {
  switch (c.type) {
    case "email":
      if (typeof value !== "string" || !EMAIL_RE.test(value.trim()))
        return `${c.label} harus berupa email yang valid.`;
      return null;

    case "number":
      if (typeof value === "number" && Number.isFinite(value)) return null;
      if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value)))
        return null;
      return `${c.label} harus berupa angka.`;

    case "phoneNumber": {
      if (typeof value !== "string") return `${c.label} tidak valid.`;
      const digits = value.replace(/[\s\-()+]/g, "");
      if (!/^\d{8,15}$/.test(digits))
        return `${c.label} harus 8–15 digit angka.`;
      return null;
    }

    case "datetime":
      if (typeof value !== "string" || isNaN(Date.parse(value)))
        return `${c.label} harus tanggal yang valid.`;
      return null;

    case "select":
    case "radio":
      if (typeof value !== "string") return `${c.label} tidak valid.`;
      if (c.options?.length && !c.options.includes(value))
        return `${c.label} bukan pilihan yang tersedia.`;
      return null;

    case "checkbox": {
      const arr = Array.isArray(value) ? value : [value];
      if (!arr.every((v) => typeof v === "string" || typeof v === "boolean"))
        return `${c.label} tidak valid.`;
      if (c.options?.length) {
        const invalid = arr.filter(
          (v) => typeof v === "string" && !c.options!.includes(v)
        );
        if (invalid.length) return `${c.label} berisi pilihan tak dikenal.`;
      }
      return null;
    }

    case "textfield":
    case "textarea":
    case "signature":
    case "file":
      if (typeof value !== "string") return `${c.label} tidak valid.`;
      if (value.length > MAX_TEXT)
        return `${c.label} terlalu panjang (maks ${MAX_TEXT} karakter).`;
      return null;

    default:
      return null;
  }
}

function normalize(c: FormComponent, value: unknown): unknown {
  if (c.type === "number") return Number(value);
  if (c.type === "checkbox") return Array.isArray(value) ? value : [value];
  if (typeof value === "string") return value.trim();
  return value;
}
