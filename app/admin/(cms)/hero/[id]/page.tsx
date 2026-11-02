import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { SlideForm } from "./slide-form";

export const metadata: Metadata = { title: "Sửa banner" };

export default async function EditSlide({ params }: PageProps<"/admin/hero/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const slide = id === "new" ? null : (await supabase.from("hero_slides").select("*").eq("id", id).maybeSingle()).data;
  if (id !== "new" && !slide) notFound();
  return (
    <>
      <Link href="/admin/hero" className="text-sm text-muted-foreground hover:underline">← Banner trang chủ</Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">{slide ? "Sửa banner" : "Thêm banner"}</h1>
      <SlideForm slide={slide} />
    </>
  );
}
