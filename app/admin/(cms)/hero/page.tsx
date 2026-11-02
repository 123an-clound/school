import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { deleteSlide } from "./actions";

export const metadata: Metadata = { title: "Banner trang chủ" };

type Slide = { id: string; title: string; image_url: string; sort_order: number; is_active: boolean };

export default async function HeroAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("hero_slides").select("id, title, image_url, sort_order, is_active").order("sort_order");
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Banner trang chủ</h1>
        <Link href="/admin/hero/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Thêm banner
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Banner hiển thị theo thứ tự tăng dần; tắt “Hiển thị” để ẩn mà không xóa.</p>
      <ul className="mt-6 divide-y rounded-xl border bg-card">
        {(data ?? []).map((s: Slide) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 p-4">
            <Image src={s.image_url} alt="" width={160} height={67} className="h-16 w-40 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/hero/${s.id}`} className="font-medium hover:text-primary hover:underline">{s.title}</Link>
              <p className="text-sm text-muted-foreground">Thứ tự {s.sort_order} · {s.is_active ? "Đang hiển thị" : "Đang ẩn"}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/hero/${s.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Sửa</Link>
              <DeleteButton action={deleteSlide.bind(null, s.id)} what={`banner “${s.title}”`} compact />
            </div>
          </li>
        ))}
      </ul>
      {(data ?? []).length === 0 && <p className="mt-4 text-muted-foreground">Chưa có banner. Trang chủ sẽ hiển thị tên và khẩu hiệu của trường.</p>}
    </>
  );
}
