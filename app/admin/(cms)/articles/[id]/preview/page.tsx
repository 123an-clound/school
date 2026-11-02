import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata: Metadata = { title: "Xem trước" };

export default async function PreviewArticle({ params }: PageProps<"/admin/articles/[id]/preview">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { data: a } = await supabase.from("news_articles").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();
  return (
    <>
      <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
        Bản xem trước — {a.status === "draft" ? "bài đang là nháp, khách chưa xem được." : `đăng lúc ${formatDateTime(a.published_at)}.`}{" "}
        <Link href={`/admin/articles/${a.id}`} className="font-medium underline">Quay lại sửa</Link>
      </p>
      <article className="mx-auto mt-8 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-primary">{a.title}</h1>
        {a.summary && <p className="mt-4 text-xl font-medium">{a.summary}</p>}
        <div className="rich-text mt-6" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.content) }} />
      </article>
    </>
  );
}
