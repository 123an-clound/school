import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ClubForm } from "./club-form";

export const metadata: Metadata = { title: "Sửa câu lạc bộ" };

export default async function EditClub({ params }: PageProps<"/admin/clubs/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const club = id === "new" ? null : (await supabase.from("clubs").select("*").eq("id", id).maybeSingle()).data;
  if (id !== "new" && !club) notFound();
  return (
    <>
      <Link href="/admin/clubs" className="text-sm text-muted-foreground hover:underline">← Câu lạc bộ</Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">{club ? club.name : "Thêm câu lạc bộ"}</h1>
      <ClubForm club={club} />
    </>
  );
}
