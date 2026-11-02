"use server";

import { GENERIC, done, failed, parse, refresh, requireAdmin, type ActionState } from "@/lib/admin";
import { pageSchema } from "@/lib/admin-schemas";
import { sanitizeHtml } from "@/lib/sanitize";
import { editablePages } from "@/lib/site";

export async function savePage(slug: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  // Bound arguments come back from the client, so re-check them
  if (!(slug in editablePages)) return failed(GENERIC);
  const { data, error } = parse(pageSchema, formData);
  if (error) return error;
  const { error: dbError } = await supabase
    .from("site_pages")
    .upsert({ slug, title: data.title, content: sanitizeHtml(data.content) });
  if (dbError) return failed(GENERIC);
  refresh("site_pages");
  return done("Đã lưu trang.");
}
