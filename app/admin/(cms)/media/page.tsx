import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { galleryCategories } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { deleteGallery } from "./actions";

export const metadata: Metadata = { title: "Thư viện ảnh" };

export default async function MediaAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("photo_galleries")
    .select("id, title, category, event_date, photo_gallery_images(image_url, sort_order)")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "photo_gallery_images" });
  const albums = data ?? [];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Thư viện ảnh</h1>
        <Link href="/admin/media/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Tạo album
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Album chưa có ảnh không hiển thị trên website.</p>
      <ul className="mt-6 divide-y rounded-xl border bg-card">
        {albums.map((a) => {
          const cover = a.photo_gallery_images[0]?.image_url;
          return (
            <li key={a.id} className="flex flex-wrap items-center gap-4 p-4">
              {cover ? (
                <Image src={cover} alt="" width={96} height={64} className="h-16 w-24 rounded-md object-cover" />
              ) : (
                <span aria-hidden className="grid h-16 w-24 place-items-center rounded-md bg-secondary text-muted-foreground">
                  <ImageIcon className="size-6" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/admin/media/${a.id}`} className="font-medium hover:text-primary hover:underline">{a.title}</Link>
                <p className="text-sm text-muted-foreground">
                  {galleryCategories[a.category]} · {a.photo_gallery_images.length} ảnh
                  {a.event_date && ` · ${formatDate(a.event_date)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/media/${a.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Sửa</Link>
                <DeleteButton action={deleteGallery.bind(null, a.id)} what={`album “${a.title}” và toàn bộ ảnh`} compact />
              </div>
            </li>
          );
        })}
      </ul>
      {albums.length === 0 && <p className="mt-4 text-muted-foreground">Chưa có album. Mục “Thư viện ảnh” trên trang chủ sẽ được ẩn.</p>}
    </>
  );
}
