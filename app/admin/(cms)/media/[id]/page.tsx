import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { GalleryForm } from "./gallery-form";
import { GalleryImages } from "./gallery-images";

export const metadata: Metadata = { title: "Sửa album" };

export default async function EditGallery({ params }: PageProps<"/admin/media/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const gallery =
    id === "new"
      ? null
      : (
          await supabase
            .from("photo_galleries")
            .select("id, title, category, event_date, photo_gallery_images(id, image_url, alt)")
            .eq("id", id)
            .order("sort_order", { referencedTable: "photo_gallery_images" })
            .maybeSingle()
        ).data;
  if (id !== "new" && !gallery) notFound();
  return (
    <>
      <Link href="/admin/media" className="text-sm text-muted-foreground hover:underline">← Thư viện ảnh</Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">{gallery ? gallery.title : "Tạo album"}</h1>
      <GalleryForm gallery={gallery} />
      {gallery && (
        <GalleryImages
          // remount after upload/delete so the list starts from the stored photos
          key={gallery.photo_gallery_images.map((img) => img.id).join()}
          galleryId={gallery.id}
          title={gallery.title}
          images={gallery.photo_gallery_images}
        />
      )}
    </>
  );
}
