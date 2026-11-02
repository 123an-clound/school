import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { savePage } from "../actions";
import { editablePages } from "@/lib/site";
import { PageForm } from "./page-form";

export const metadata: Metadata = { title: "Sửa trang" };

export default async function EditPage({ params }: PageProps<"/admin/pages/[slug]">) {
  const { supabase } = await requireAdmin();
  const { slug } = await params;
  const meta = editablePages[slug];
  if (!meta) notFound();
  const { data: page } = await supabase.from("site_pages").select("title, content").eq("slug", slug).maybeSingle();
  return (
    <>
      <Link href="/admin/pages" className="text-sm text-muted-foreground hover:underline">← Trang tĩnh</Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">{page?.title ?? meta.title}</h1>
      <PageForm action={savePage.bind(null, slug)} title={page?.title ?? meta.title} content={page?.content ?? ""} />
    </>
  );
}
