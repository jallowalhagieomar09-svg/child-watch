import type {
  report_category,
  report_agency,
  report_status,
  report_language,
} from "@/integrations/supabase/types";

export const CATEGORIES: { key: string; agency: "police" | "welfare" | "both"; emoji: string }[] = [
  { key: "abuse", agency: "both", emoji: "🛑" },
  { key: "neglect", agency: "welfare", emoji: "🏚️" },
  { key: "child_labor", agency: "welfare", emoji: "🛠️" },
  { key: "trafficking", agency: "police", emoji: "🚨" },
  { key: "early_marriage", agency: "welfare", emoji: "💍" },
  { key: "school_safety", agency: "welfare", emoji: "🏫" },
  { key: "other", agency: "both", emoji: "❓" },
];

export const STATUSES: string[] = [
  "received",
  "under_review",
  "in_progress",
  "resolved",
  "closed",
];

export function generateTrackingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let out = "";
  const arr = new Uint32Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
    for (let i = 0; i < 10; i++) out += alphabet[arr[i] % alphabet.length];
  } else {
    for (let i = 0; i < 10; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${out.slice(0, 4)}-${out.slice(4, 7)}-${out.slice(7, 10)}`;
}

export type ReportCategory = NonNullable<unknown> & string;
export type ReportAgency = "police" | "welfare" | "both";
export type ReportStatus = "received" | "under_review" | "in_progress" | "resolved" | "closed";
export type ReportLanguage = "en" | "mandinka" | "wolof" | "fula" | "jola";
// Re-export for convenience
export type {
  report_category,
  report_agency,
  report_status,
  report_language,
};
