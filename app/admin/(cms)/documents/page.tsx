import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { documentCategories } from "@/lib/site";
import { deleteDocument } from "./actions";

export const metadata: Metadata = { title: "Tài liệu" };

type Doc = { id: string; title: string; category: string; code_number: string | null; issued_date: string | null; file_url: string };

export default async function DocumentsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("documents_forms")
    .select("id, title, category, code_number, issued_date, file_url")
    .order("issued_date", { ascending: false })
    .limit(300);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Tài liệu</h1>
        <Link href="/admin/documents/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Tải tài liệu lên
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Tên tài liệu</th>
              <th scope="col" className="px-4 py-3">Loại</th>
              <th scope="col" className="px-4 py-3">Số hiệu</th>
              <th scope="col" className="px-4 py-3">Ngày ban hành</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data ?? []).map((d: Doc) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium">
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">{d.title}</a>
                </td>
                <td className="px-4 py-3">{documentCategories[d.category]}</td>
                <td className="px-4 py-3">{d.code_number}</td>
                <td className="px-4 py-3">{d.issued_date && formatDate(d.issued_date)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/documents/${d.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Sửa</Link>
                    <DeleteButton action={deleteDocument.bind(null, d.id)} what={`tài liệu “${d.title}”`} compact />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data ?? []).length === 0 && <p className="p-6 text-muted-foreground">Chưa có tài liệu.</p>}
      </div>
    </>
  );
}
