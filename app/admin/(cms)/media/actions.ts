"use server";

import { z } from "zod";
import { GENERIC, deleteRow, done, failed, parse, refresh, removeFile, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { gallerySchema, imageEdits, newImageUrls } from "@/lib/admin-schemas";

const tables = ["photo_galleries", "photo_gallery_images"];

export async function saveGallery(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(gallerySchema, formData);
  if (error) return error;
  const savedId = await saveRow(supabase, "photo_galleries", id, data);
  if (!savedId) return failed(GENERIC);
  refresh(...tables);
  return id ? done("Đã lưu album.") : done("Đã tạo album. Giờ bạn có thể tải ảnh lên.", savedId);
}

export async function deleteGallery(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  // The row delete cascades to the images; their Storage files have to go separately
  const { data: images } = await supabase.from("photo_gallery_images").select("image_url").eq("gallery_id", id);
  if (!(await deleteRow(supabase, "photo_galleries", id))) return failed(GENERIC);
  await Promise.all((images ?? []).map((img) => removeFile(supabase, img.image_url)));
  refresh(...tables);
  return done("Đã xóa album.");
}

export async function addImages(galleryId: string, urls: string[]): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(galleryId);
  const list = newImageUrls.safeParse(urls);
  if (!id.success || !list.success) return failed(GENERIC);
  const { data: last } = await supabase
    .from("photo_gallery_images")
    .select("sort_order")
    .eq("gallery_id", id.data)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const start = (last?.sort_order ?? -1) + 1;
  const { error } = await supabase
    .from("photo_gallery_images")
    .insert(list.data.map((image_url, i) => ({ gallery_id: id.data, image_url, sort_order: start + i })));
  if (error) return failed(GENERIC);
  refresh(...tables);
  return done(`Đã thêm ${list.data.length} ảnh.`);
}

// Saves alt text and order (position in the list) for every photo of one album
export async function saveImages(galleryId: string, items: { id: string; alt: string | null }[]): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(galleryId);
  const list = imageEdits.safeParse(items);
  if (!id.success || !list.success) return failed("Mô tả ảnh tối đa 300 ký tự.");
  const results = await Promise.all(
    list.data.map((img, i) =>
      supabase.from("photo_gallery_images").update({ alt: img.alt, sort_order: i }).eq("id", img.id).eq("gallery_id", id.data)
    )
  );
  if (results.some((r) => r.error)) return failed(GENERIC);
  refresh(...tables);
  return done("Đã lưu ảnh.");
}

export async function deleteImage(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!(await deleteRow(supabase, "photo_gallery_images", id, ["image_url"]))) return failed(GENERIC);
  refresh(...tables);
  return done("Đã xóa ảnh.");
}
