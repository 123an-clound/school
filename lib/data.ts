import { cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/public";

// Public reads. Each cache entry is tagged with its table so admin writes can updateTag() it.

export const NEWS_PAGE_SIZE = 9;
const newsCard = "id, title, slug, summary, category, thumbnail_url, is_featured, is_pinned, published_at";

export async function getSchoolInfo() {
  "use cache";
  cacheTag("school_info");
  const { data, error } = await createClient().from("school_info").select("*").single();
  if (error) throw error;
  return data;
}

export async function getHeroSlides() {
  "use cache";
  cacheTag("hero_slides");
  const { data, error } = await createClient()
    .from("hero_slides")
    .select("id, title, subtitle, image_url, cta_label, cta_href")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

// Pinned first, then newest; the home page splits this into featured / pinned / tabs.
export async function getHomeNews() {
  "use cache";
  cacheTag("news_articles");
  const { data, error } = await createClient()
    .from("news_articles")
    .select(newsCard)
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  return data;
}

export async function getNewsPage(category: string | undefined, page: number) {
  "use cache";
  cacheTag("news_articles");
  let query = createClient()
    .from("news_articles")
    .select(newsCard, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE - 1);
  if (category) query = query.eq("category", category);
  const { data, count, error } = await query;
  if (error) throw error;
  return { items: data, total: count ?? 0 };
}

export async function getArticle(slug: string) {
  "use cache";
  cacheTag("news_articles");
  const { data, error } = await createClient()
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRelatedNews(category: string, excludeSlug: string) {
  "use cache";
  cacheTag("news_articles");
  const { data, error } = await createClient()
    .from("news_articles")
    .select(newsCard)
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(3);
  if (error) throw error;
  return data;
}

export async function getPublishedSlugs() {
  "use cache";
  cacheTag("news_articles");
  const { data, error } = await createClient()
    .from("news_articles")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPage(slug: string) {
  "use cache";
  cacheTag("site_pages");
  const { data, error } = await createClient().from("site_pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFaculty() {
  "use cache";
  cacheTag("faculty_members");
  const { data, error } = await createClient()
    .from("faculty_members")
    .select("*")
    .order("order_index")
    .order("full_name");
  if (error) throw error;
  return data;
}

export async function getClubs() {
  "use cache";
  cacheTag("clubs");
  const { data, error } = await createClient().from("clubs").select("*").order("sort_order").order("name");
  if (error) throw error;
  return data;
}

// Albums with their photos in admin order; albums without photos are left out
export async function getGalleries() {
  "use cache";
  cacheTag("photo_galleries", "photo_gallery_images");
  const { data, error } = await createClient()
    .from("photo_galleries")
    .select("id, title, category, event_date, photo_gallery_images!inner(id, image_url, alt)")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "photo_gallery_images" });
  if (error) throw error;
  return data;
}

export async function getAdmissions() {
  "use cache";
  cacheTag("admissions_info");
  const { data, error } = await createClient()
    .from("admissions_info")
    .select("*")
    .eq("is_active", true)
    .order("academic_year", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDocuments(category?: string) {
  "use cache";
  cacheTag("documents_forms");
  let query = createClient()
    .from("documents_forms")
    .select("*")
    .order("issued_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function search(q: string) {
  "use cache";
  cacheTag("news_articles", "site_pages", "documents_forms");
  const { data, error } = await createClient().rpc("school_search", { q });
  if (error) throw error;
  return data;
}
