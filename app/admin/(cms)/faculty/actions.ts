"use server";

import { GENERIC, deleteRow, done, failed, parse, refresh, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { facultySchema, idList } from "@/lib/admin-schemas";

export async function saveMember(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(facultySchema, formData);
  if (error) return error;
  const savedId = await saveRow(supabase, "faculty_members", id, data, ["avatar_url"]);
  if (!savedId) return failed(GENERIC);
  refresh("faculty_members");
  return id ? done("Đã lưu thông tin giáo viên.") : done("Đã thêm giáo viên.", savedId);
}

export async function deleteMember(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!(await deleteRow(supabase, "faculty_members", id, ["avatar_url"]))) return failed(GENERIC);
  refresh("faculty_members");
  return done("Đã xóa giáo viên.");
}

// Drag-and-drop order from the faculty list: position in `ids` becomes order_index
export async function reorderMembers(ids: string[]): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = idList.safeParse(ids);
  if (!parsed.success) return failed(GENERIC);
  const results = await Promise.all(parsed.data.map((id, i) => supabase.from("faculty_members").update({ order_index: i }).eq("id", id)));
  if (results.some((r) => r.error)) return failed(GENERIC);
  refresh("faculty_members");
  return done("Đã lưu thứ tự.");
}
