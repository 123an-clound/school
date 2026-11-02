"use server";

import { GENERIC, done, failed, parse, refresh, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { schoolInfoSchema } from "@/lib/admin-schemas";

export async function saveSchoolInfo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(schoolInfoSchema, formData);
  if (error) return error;
  const { graduation_rate, university_rate, national_awards, ...row } = data;
  // Keep stats keys this form does not edit
  const { data: current } = await supabase.from("school_info").select("stats").single();
  const stats = { ...((current?.stats ?? {}) as Record<string, unknown>), graduation_rate, university_rate, national_awards };
  // Singleton row: boolean primary key "true"
  const saved = await saveRow(supabase, "school_info", "true", { ...row, stats }, ["logo_url", "favicon_url", "principal_avatar_url"]);
  if (!saved) return failed(GENERIC);
  refresh("school_info");
  return done("Đã lưu thông tin trường.");
}
