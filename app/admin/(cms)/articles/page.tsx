import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { newsCategories } from "@/lib/site";
import { deleteArticle } from "./actions";

export const metadata: Metadata = { title: "Tin tức & Thông báo" };

const box = "h-10 rounded-lg border border-input bg-card px-3 text-sm";
const isScheduled = (a: { status: string; published_at: string }) => a.status === "published" && Date.parse(a.published_at) > Date.now();

export default async function ArticlesAdmin({ searchParams }: PageProps<"/admin/articles">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const category = typeof sp.cm === "string" && sp.cm in newsCategories ? sp.cm : "";
  const status = sp.tt === "draft" || sp.tt === "published" ? sp.tt : "";
  const asc = sp.sx === "cu";

  let query = supabase
    .from("news_articles")
    .select("id, title, slug, category, status, is_pinned, is_featured, published_at, views_count")
    .order("published_at", { ascending: asc })
    .limit(200);
  if (q) query = query.ilike("title", `%${q.replace(/[%_]/g, "")}%`);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  const { data: articles } = await query;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Tin tức & Thông báo</h1>
        <Link href="/admin/articles/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Viết bài mới
        </Link>
      </div>

      <Form action="/admin/articles" className="mt-6 flex flex-wrap items-end gap-3" role="search">
        <div>
          <label htmlFor="q" className="block text-sm font-medium">Tìm theo tiêu đề</label>
          <input id="q" name="q" defaultValue={q} className={`${box} mt-1 w-64`} />
        </div>
        <div>
          <label htmlFor="cm" className="block text-sm font-medium">Chuyên mục</label>
          <select id="cm" name="cm" defaultValue={category} className={`${box} mt-1`}>
            <option value="">Tất cả</option>
            {Object.entries(newsCategories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tt" className="block text-sm font-medium">Trạng thái</label>
          <select id="tt" name="tt" defaultValue={status} className={`${box} mt-1`}>
            <option value="">Tất cả</option>
            <option value="draft">Nháp</option>
            <option value="published">Đã đăng / hẹn giờ</option>
          </select>
        </div>
        <div>
          <label htmlFor="sx" className="block text-sm font-medium">Sắp xếp</label>
          <select id="sx" name="sx" defaultValue={asc ? "cu" : ""} className={`${box} mt-1`}>
            <option value="">Mới nhất</option>
            <option value="cu">Cũ nhất</option>
          </select>
        </div>
        <button type="submit" className={buttonVariants({ variant: "outline", className: "h-10" })}>Lọc</button>
      </Form>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Tiêu đề</th>
              <th scope="col" className="px-4 py-3">Chuyên mục</th>
              <th scope="col" className="px-4 py-3">Trạng thái</th>
              <th scope="col" className="px-4 py-3">Ngày đăng</th>
              <th scope="col" className="px-4 py-3 text-right">Lượt xem</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(articles ?? []).map((a) => {
              const scheduled = isScheduled(a);
              return (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/articles/${a.id}`} className="hover:text-primary hover:underline">{a.title}</Link>
                    {(a.is_pinned || a.is_featured) && (
                      <span className="ml-2 text-xs text-muted-foreground">{[a.is_pinned && "Ghim", a.is_featured && "Tiêu điểm"].filter(Boolean).join(" · ")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{newsCategories[a.category]}</td>
                  <td className="px-4 py-3">
                    <span className={a.status === "draft" ? "rounded bg-muted px-2 py-0.5" : scheduled ? "rounded bg-amber-100 px-2 py-0.5 text-amber-900" : "rounded bg-emerald-100 px-2 py-0.5 text-emerald-900"}>
                      {a.status === "draft" ? "Nháp" : scheduled ? "Hẹn giờ" : "Đã đăng"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(a.published_at)}</td>
                  <td className="px-4 py-3 text-right">{a.views_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/articles/${a.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Sửa</Link>
                      <Link href={`/admin/articles/${a.id}/preview`} className={buttonVariants({ variant: "outline", size: "sm" })}>Xem trước</Link>
                      <DeleteButton action={deleteArticle.bind(null, a.id)} what={`bài “${a.title}”`} compact />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(articles ?? []).length === 0 && <p className="p-6 text-muted-foreground">Không có bài viết phù hợp.</p>}
      </div>
    </>
  );
}
