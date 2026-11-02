import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PersonAvatar } from "@/components/site/person-avatar";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { deleteClub } from "./actions";

export const metadata: Metadata = { title: "Câu lạc bộ" };

type Club = { id: string; name: string; image_url: string | null; advisor_name: string | null; sort_order: number };

export default async function ClubsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("clubs").select("id, name, image_url, advisor_name, sort_order").order("sort_order").order("name");
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Câu lạc bộ</h1>
        <Link href="/admin/clubs/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Thêm câu lạc bộ
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Hiển thị ở “Góc CLB” trên trang chủ và trang Hoạt động CLB, theo thứ tự tăng dần.</p>
      <ul className="mt-6 divide-y rounded-xl border bg-card">
        {(data ?? []).map((c: Club) => (
          <li key={c.id} className="flex flex-wrap items-center gap-4 p-4">
            <PersonAvatar name={c.name} src={c.image_url} size={48} />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/clubs/${c.id}`} className="font-medium hover:text-primary hover:underline">{c.name}</Link>
              <p className="text-sm text-muted-foreground">
                Thứ tự {c.sort_order}
                {c.advisor_name && ` · Phụ trách: ${c.advisor_name}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/clubs/${c.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Sửa</Link>
              <DeleteButton action={deleteClub.bind(null, c.id)} what={c.name} compact />
            </div>
          </li>
        ))}
      </ul>
      {(data ?? []).length === 0 && <p className="mt-4 text-muted-foreground">Chưa có câu lạc bộ. Mục “Góc CLB” trên trang chủ sẽ được ẩn.</p>}
    </>
  );
}
