"use server";

import { done, failed, parse, refresh, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { admissionsSchema } from "@/lib/admin-schemas";

export async function saveAdmissions(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(admissionsSchema, formData);
  if (error) return error;
  const savedId = await saveRow(supabase, "admissions_info", id, data, ["guide_file_url"]);
  // academic_year is UNIQUE: the likely failure is a year that already exists
  if (!savedId) return failed("Không lưu được. Kiểm tra năm học đã tồn tại chưa.");
  refresh("admissions_info");
  return id ? done("Đã lưu thông tin tuyển sinh.") : done("Đã tạo năm tuyển sinh mới.", savedId);
}

