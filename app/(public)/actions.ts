"use server";

import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { admissionInquirySchema, contactMessageSchema } from "@/lib/validation";

// `values` echoes the submission back to the same visitor so a failed attempt keeps what they typed.
export type FormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  at: number;
} | null;

const GENERIC_ERROR = "Không gửi được. Vui lòng thử lại sau hoặc gọi điện cho nhà trường.";
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

const fieldErrors = (error: z.ZodError) =>
  Object.fromEntries(error.issues.map((i) => [String(i.path[0]), i.message]));

// Shared pipeline for public forms: honeypot -> zod -> Turnstile -> 10-minute duplicate block -> insert.
// Inserts use the secret key because anon has no INSERT grant (so the REST API cannot skip these checks).
async function submit<T extends { consent: string }>(
  formData: FormData,
  schema: z.ZodType<T>,
  table: "admission_inquiries" | "contact_messages",
  dedupeField: "phone" | "email",
  success: string,
  duplicate: string
): Promise<FormState> {
  const at = Date.now();
  const values = Object.fromEntries(
    [...formData].filter(([k, v]) => typeof v === "string" && k !== "website" && !k.startsWith("cf-")) as [string, string][]
  );
  // Bots fill every field; pretend success so they do not retry
  if (formData.get("website")) return { ok: true, message: success, at };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Vui lòng kiểm tra lại các trường được đánh dấu.", errors: fieldErrors(parsed.error), values, at };

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    return { ok: false, message: "Chưa xác minh được bạn không phải robot. Vui lòng thử lại.", values, at };
  }

  // consent is recorded as consent_at, not stored as a field
  const row: Record<string, unknown> = { ...parsed.data };
  delete row.consent;
  const db = createAdminClient();
  const { count, error: countError } = await db
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(dedupeField, String(row[dedupeField]))
    .gte("created_at", new Date(at - DUPLICATE_WINDOW_MS).toISOString());
  if (countError) return { ok: false, message: GENERIC_ERROR, values, at };
  if (count) return { ok: false, message: duplicate, values, at };

  // No logging of the error object: it can echo the submitted personal data
  // `row` matches this table: it was produced by the zod schema passed in for it
  const { error } = await db.from(table).insert({ ...row, consent_at: new Date(at).toISOString() } as never);
  if (error) return { ok: false, message: GENERIC_ERROR, values, at };
  return { ok: true, message: success, at };
}

export async function submitInquiry(_prev: FormState, formData: FormData) {
  return submit(
    formData,
    admissionInquirySchema,
    "admission_inquiries",
    "phone",
    "Đã gửi đăng ký. Nhà trường sẽ liên hệ với phụ huynh trong thời gian sớm nhất.",
    "Số điện thoại này vừa đăng ký. Vui lòng chờ 10 phút trước khi gửi lại."
  );
}

export async function submitContact(_prev: FormState, formData: FormData) {
  return submit(
    formData,
    contactMessageSchema,
    "contact_messages",
    "email",
    "Đã gửi thư. Nhà trường sẽ phản hồi qua email của bạn.",
    "Email này vừa gửi thư. Vui lòng chờ 10 phút trước khi gửi lại."
  );
}
