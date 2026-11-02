import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { MemberForm } from "./member-form";

export const metadata: Metadata = { title: "Sửa giáo viên" };

export default async function EditMember({ params }: PageProps<"/admin/faculty/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const [member, departments] = await Promise.all([
    id === "new" ? null : supabase.from("faculty_members").select("*").eq("id", id).maybeSingle().then((r) => r.data),
    supabase.from("faculty_members").select("department").then((r) => [...new Set((r.data ?? []).map((d: { department: string }) => d.department))]),
  ]);
  if (id !== "new" && !member) notFound();
  return (
    <>
      <Link href="/admin/faculty" className="text-sm text-muted-foreground hover:underline">← Đội ngũ</Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">{member ? member.full_name : "Thêm giáo viên"}</h1>
      <MemberForm member={member} departments={departments} />
    </>
  );
}
