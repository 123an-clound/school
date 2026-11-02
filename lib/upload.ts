"use client";

import { createClient } from "@/lib/supabase/client";

export type Bucket = "school-media" | "school-documents";

// Mirrors the bucket limits in supabase/migrations so the admin gets a clear message before uploading.
const rules: Record<Bucket, { max: number; types: string[]; label: string }> = {
  "school-media": { max: 5 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp"], label: "ảnh JPG, PNG, WebP tối đa 5 MB" },
  "school-documents": {
    max: 20 * 1024 * 1024,
    types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    label: "PDF, Word, Excel tối đa 20 MB",
  },
};

export const acceptFor = (bucket: Bucket) => rules[bucket].types.join(",");

// Re-encodes photos as WebP at most 1920px wide; keeps the original if that does not make it smaller.
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1920 / bitmap.width);
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = await canvas.convertToBlob({ type: "image/webp", quality: 0.85 });
  return webp.size < file.size ? webp : file;
}

export async function uploadFile(file: File, bucket: Bucket) {
  const rule = rules[bucket];
  if (!rule.types.includes(file.type)) throw new Error(`Sai định dạng. Chỉ nhận ${rule.label}.`);
  const body = bucket === "school-media" ? await compress(file) : file;
  if (body.size > rule.max) throw new Error(`File quá lớn. Chỉ nhận ${rule.label}.`);

  const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext}`; // never the original name: it may hold personal data
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType: body.type, upsert: false });
  if (error) throw new Error("Tải lên không thành công. Vui lòng thử lại.");
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl, size: body.size, ext };
}
