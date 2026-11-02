import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { SchoolForm } from "./school-form";

export const metadata: Metadata = { title: "Thông tin trường" };

export default async function SchoolSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("school_info").select("*").single();
  return (
    <>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">Thông tin trường</h1>
      {data ? <SchoolForm info={data} /> : <p className="text-muted-foreground">Chưa có dữ liệu trường. Hãy chạy migration và seed trước.</p>}
    </>
  );
}
