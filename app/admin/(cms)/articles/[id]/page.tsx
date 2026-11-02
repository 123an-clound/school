import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { toVnInput } from "@/lib/format";
import { deleteArticle } from "../actions";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = { title: "Soạn bài" };

export default async function EditArticle({ params }: PageProps<"/admin/articles/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const article = isNew ? null : (await supabase.from("news_articles").select("*").eq("id", id).maybeSingle()).data;
  if (!isNew && !article) notFound();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/articles" className="text-sm text-muted-foreground hover:underline">← Tin tức & Thông báo</Link>
          <h1 className="font-heading text-2xl font-bold text-primary">{isNew ? "Viết bài mới" : "Sửa bài viết"}</h1>
        </div>
        {article && (
          <div className="flex gap-2">
            <Link href={`/admin/articles/${article.id}/preview`} className={buttonVariants({ variant: "outline" })}>Xem trước</Link>
            <DeleteButton action={deleteArticle.bind(null, article.id)} what="bài viết này" redirectTo="/admin/articles" />
          </div>
        )}
      </div>
      <ArticleForm
        article={article ? { ...article, published_at: toVnInput(article.published_at) } : { published_at: toVnInput(new Date().toISOString()) }}
      />
    </>
  );
}
