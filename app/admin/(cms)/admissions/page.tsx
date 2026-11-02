import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { AdmissionsForm } from "./admissions-form";

export const metadata: Metadata = { title: "Tuyển sinh" };

type Row = { id: string; academic_year: string; is_active: boolean };

export default async function AdmissionsAdmin({ searchParams }: PageProps<"/admin/admissions">) {
  const { supabase } = await requireAdmin();
  const { nam } = await searchParams;
  const { data: years } = await supabase.from("admissions_info").select("id, academic_year, is_active").order("academic_year", { ascending: false });
  const list = (years ?? []) as Row[];
  const isNew = nam === "moi";
  const selectedId = isNew ? null : typeof nam === "string" ? nam : list[0]?.id;
  const current = selectedId ? (await supabase.from("admissions_info").select("*").eq("id", selectedId).maybeSingle()).data : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Tuyển sinh lớp 10</h1>
        <Link href="/admin/inquiries" className={buttonVariants({ variant: "outline", className: "h-10" })}>Danh sách đăng ký tư vấn</Link>
      </div>
      <nav aria-label="Năm học" className="mt-4 flex flex-wrap gap-2">
        {list.map((y) => (
          <Link
            key={y.id}
            href={`/admin/admissions?nam=${y.id}`}
            aria-current={y.id === current?.id ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm", y.id === current?.id ? "border-primary bg-primary text-primary-foreground" : "bg-card")}
          >
            {y.academic_year}
            {y.is_active ? " (đang hiển thị)" : ""}
          </Link>
        ))}
        <Link href="/admin/admissions?nam=moi" className="inline-flex items-center gap-1 rounded-full border bg-card px-4 py-1.5 text-sm">
          <Plus className="size-4" /> Năm học mới
        </Link>
      </nav>
      <p className="mt-2 text-sm text-muted-foreground">Trang công khai hiển thị năm học mới nhất đang bật “Hiển thị”.</p>
      <div className="mt-6">
        <AdmissionsForm key={current?.id ?? "new"} info={isNew ? null : current} />
      </div>
    </>
  );
}
