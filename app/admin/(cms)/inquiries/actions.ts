"use server";

import { GENERIC, done, failed, parse, refresh, requireAdmin, type ActionState } from "@/lib/admin";
import { inquiryUpdateSchema } from "@/lib/admin-schemas";

export async function updateInquiry(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(inquiryUpdateSchema, formData);
  if (error) return error;
  const { data: rows, error: dbError } = await supabase.from("admission_inquiries").update(data).eq("id", id).select("id");
  if (dbError || !rows?.length) return failed(GENERIC);
  refresh();
  return done("Đã cập nhật.");
}

// Deletion on the family's request (NĐ 356/2025: respond within 2 working days, delete within 20 days)
export async function deleteInquiry(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("admission_inquiries").delete().eq("id", id).select("id");
  if (error || !data?.length) return failed(GENERIC);
  refresh();
  return done("Đã xóa bản ghi.");
}
