"use server";

import { GENERIC, deleteRow, done, failed, parse, refresh, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { clubSchema } from "@/lib/admin-schemas";

export async function saveClub(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(clubSchema, formData);
  if (error) return error;
  const savedId = await saveRow(supabase, "clubs", id, data, ["image_url"]);
  if (!savedId) return failed(GENERIC);
  refresh("clubs");
  return id ? done("Đã lưu câu lạc bộ.") : done("Đã thêm câu lạc bộ.", savedId);
}

export async function deleteClub(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!(await deleteRow(supabase, "clubs", id, ["image_url"]))) return failed(GENERIC);
  refresh("clubs");
  return done("Đã xóa câu lạc bộ.");
}
