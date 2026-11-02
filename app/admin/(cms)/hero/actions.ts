"use server";

import { GENERIC, deleteRow, done, failed, parse, refresh, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { heroSlideSchema } from "@/lib/admin-schemas";

export async function saveSlide(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(heroSlideSchema, formData);
  if (error) return error;
  const savedId = await saveRow(supabase, "hero_slides", id, data, ["image_url"]);
  if (!savedId) return failed(GENERIC);
  refresh("hero_slides");
  return id ? done("Đã lưu banner.") : done("Đã thêm banner.", savedId);
}

export async function deleteSlide(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!(await deleteRow(supabase, "hero_slides", id, ["image_url"]))) return failed(GENERIC);
  refresh("hero_slides");
  return done("Đã xóa banner.");
}
