import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/site/page-header";
import { getGalleries } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { galleryCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thư viện ảnh",
  description: "Hình ảnh các hoạt động khai giảng, ngoại khóa, thể thao, câu lạc bộ của nhà trường.",
};

export default async function GalleryPage() {
  const albums = await getGalleries();
  return (
    <>
      <PageHeader title="Thư viện ảnh" />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10">
        {albums.map((album, a) => (
          <section key={album.id} id={`album-${album.id}`} aria-labelledby={`album-${album.id}-heading`} className="scroll-mt-24">
            <h2 id={`album-${album.id}-heading`} className="font-heading text-2xl font-bold text-primary">
              {album.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {galleryCategories[album.category]}
              {album.event_date && (
                <>
                  {" · "}
                  <time dateTime={album.event_date}>{formatDate(album.event_date)}</time>
                </>
              )}
              {` · ${album.photo_gallery_images.length} ảnh`}
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {album.photo_gallery_images.map((img, i) => (
                <li key={img.id}>
                  <a href={img.image_url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={img.image_url}
                      alt={img.alt || `${album.title} – ảnh ${i + 1}`}
                      fill
                      fetchPriority={a === 0 && i < 2 ? "high" : undefined}
                      loading={a === 0 && i < 4 ? "eager" : undefined}
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                    />
                    <span className="sr-only"> (mở ảnh gốc trong tab mới)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {albums.length === 0 && <p className="text-muted-foreground">Thư viện ảnh đang được cập nhật.</p>}
      </div>
    </>
  );
}
