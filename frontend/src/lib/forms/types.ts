import type { FieldType } from "@/lib/utils";

/** Satu field dalam schema form (bentuk yang disimpan di kolom `schema`). */
export interface FormComponent {
  key: string;
  type: FieldType;
  label: string;
  input?: boolean;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormSchema {
  components: FormComponent[];
}

export type FormStatus = "draft" | "published" | "closed";

export interface FormRecord {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  schema: FormSchema;
  status: FormStatus;
  require_login: boolean;
  schema_version: number;
  submission_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Field yang hanya tampilan — tidak menghasilkan jawaban. */
export const PRESENTATIONAL_TYPES: ReadonlySet<string> = new Set([
  "heading",
  "paragraph",
  "divider",
]);

export function isAnswerable(c: FormComponent): boolean {
  return !PRESENTATIONAL_TYPES.has(c.type);
}
