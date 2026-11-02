import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { editablePages } from "@/lib/site";

export const metadata: Metadata = { title: "Trang tĩnh" };


export default async function PagesAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_pages").select("slug, title, updated_at");
  const bySlug = new Map((data ?? []).map((p: { slug: string; title: string; updated_at: string }) => [p.slug, p]));
  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-primary">Trang tĩnh</h1>
      <ul className="mt-6 divide-y rounded-xl border bg-card">
        {Object.entries(editablePages).map(([slug, meta]) => {
          const page = bySlug.get(slug);
          return (
            <li key={slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <Link href={`/admin/pages/${slug}`} className="font-medium hover:text-primary hover:underline">{page?.title ?? meta.title}</Link>
                <p className="text-sm text-muted-foreground">Hiển thị tại {meta.path}</p>
              </div>
              <span className="text-sm text-muted-foreground">{page ? `Cập nhật ${formatDateTime(page.updated_at)}` : "Chưa có nội dung"}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
