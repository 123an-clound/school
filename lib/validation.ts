import { z } from "zod";

// Limits mirror the CHECK constraints in supabase/migrations.
const required = "Vui lòng nhập thông tin này";
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const trim = (v: unknown) => (typeof v === "string" ? v.trim() : v);

const text = (max: number) =>
  z.string(required).trim().min(1, required).max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max, `Tối đa ${max} ký tự`).optional());

// Separators are stripped so "0912 345 678" and "0912.345.678" count as the same number for the duplicate check.
const phone = z
  .string(required)
  .transform((s) => s.replace(/[\s.()-]/g, ""))
  .pipe(z.string().regex(/^(\+84|0)\d{9,10}$/, "Số điện thoại không hợp lệ"));
const email = z.preprocess(trim, z.email("Email không hợp lệ").max(254, "Email quá dài"));
// Unchecked checkboxes are absent from FormData, so silence never counts as consent (NĐ 356/2025).
const consent = z.literal("on", "Bạn cần đồng ý với Chính sách bảo mật để gửi");

export const admissionInquirySchema = z.object({
  student_name: text(100),
  parent_name: text(100),
  phone,
  email: z.preprocess(blankToUndefined, email.optional()),
  middle_school: optionalText(200),
  question: optionalText(2000),
  consent,
});

export const contactMessageSchema = z.object({
  full_name: text(100),
  email,
  phone: z.preprocess(blankToUndefined, phone.optional()),
  subject: text(200),
  message: text(5000),
  consent,
});
