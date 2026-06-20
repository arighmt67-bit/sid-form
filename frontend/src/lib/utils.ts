import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GRADIENT = "linear-gradient(135deg, #FDCE1B, #FFE98F)";
export const GRADIENT_TEXT = "bg-clip-text text-transparent bg-gradient-to-r from-[#FDCE1B] to-[#FFE98F]";

export const FIELD_TYPES = [
  { type: "textfield", label: "Text Input", icon: "Aa" },
  { type: "textarea", label: "Text Area", icon: "¶" },
  { type: "number", label: "Number", icon: "#" },
  { type: "email", label: "Email", icon: "@" },
  { type: "phoneNumber", label: "Phone", icon: "☎" },
  { type: "select", label: "Dropdown", icon: "▾" },
  { type: "radio", label: "Radio Group", icon: "◉" },
  { type: "checkbox", label: "Checkbox", icon: "☑" },
  { type: "datetime", label: "Date / Time", icon: "📅" },
  { type: "file", label: "File Upload", icon: "📎" },
  { type: "signature", label: "Signature", icon: "✎" },
  { type: "heading", label: "Heading", icon: "H" },
  { type: "paragraph", label: "Paragraph", icon: "¶" },
  { type: "divider", label: "Divider", icon: "—" },
] as const;

export type FieldType = (typeof FIELD_TYPES)[number]["type"];

export function createBlankForm(title = "Untitled Form") {
  return {
    title,
    display: "form" as const,
    components: [] as any[],
    settings: { theme: "minimalist-modern", submitLabel: "Submit" },
  };
}
