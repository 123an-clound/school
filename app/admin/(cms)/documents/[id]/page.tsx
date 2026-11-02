import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { DocumentForm } from "./document-form";

export const metadata: Metadata = { title: "Sửa tài liệu" };

export default async function EditDocument({ params }: PageProps<"/admin/documents/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const doc = id === "new" ? null : (await supabase.from("documents_forms").select("*").eq("id", id).maybeSingle()).data;
  if (id !== "new" && !doc) notFound();
  return (
    <>
      <Link href="/admin/documents" className="text-sm text-muted-foreground hover:underline">← Tài liệu</Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">{doc ? "Sửa tài liệu" : "Tải tài liệu lên"}</h1>
      <DocumentForm doc={doc} />
    </>
  );
}
