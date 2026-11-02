"use server";

import { GENERIC, done, failed, parse, refresh, removeFile, requireAdmin, type ActionState } from "@/lib/admin";
import { articleSchema } from "@/lib/admin-schemas";
import { sanitizeHtml } from "@/lib/sanitize";
import { nextFreeSlug, slugify } from "@/lib/slug";

const storageUrls = (html: string) => [...html.matchAll(/src="([^"]+\/storage\/v1\/object\/public\/[^"]+)"/g)].map((m) => m[1]);

export async function saveArticle(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(articleSchema, formData);
  if (error) return error;

  const base = slugify(data.slug || data.title) || "bai-viet";
  const { data: same } = await supabase.from("news_articles").select("id, slug").like("slug", `${base}%`);
  const slug = nextFreeSlug(base, (same ?? []).filter((r) => r.id !== id).map((r) => r.slug));
  const row = { ...data, slug, content: sanitizeHtml(data.content) };

  const before = id ? (await supabase.from("news_articles").select("thumbnail_url").eq("id", id).single()).data : null;
  const result = id
    ? await supabase.from("news_articles").update(row).eq("id", id).select("id").single()
    : await supabase.from("news_articles").insert(row).select("id").single();
  if (result.error) return failed(GENERIC);
  if (before?.thumbnail_url && before.thumbnail_url !== row.thumbnail_url) await removeFile(supabase, before.thumbnail_url);

  refresh("news_articles");
  return id ? done(slug === base ? "Đã lưu bài viết." : `Đã lưu. Slug trùng nên được đổi thành “${slug}”.`) : done("Đã tạo bài viết.", result.data.id);
}

export async function deleteArticle(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data: article } = await supabase.from("news_articles").select("thumbnail_url, content").eq("id", id).single();
  const { data: deleted, error } = await supabase.from("news_articles").delete().eq("id", id).select("id");
  if (error || !article || !deleted?.length) return failed(GENERIC);
  for (const url of [article.thumbnail_url, ...storageUrls(article.content)]) await removeFile(supabase, url);
  refresh("news_articles");
  return done("Đã xóa bài viết.");
}
