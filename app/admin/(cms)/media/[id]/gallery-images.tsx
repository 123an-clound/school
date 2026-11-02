"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageUp } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptFor, uploadFile } from "@/lib/upload";
import { addImages, deleteImage, saveImages } from "../actions";

type Img = { id: string; image_url: string; alt: string | null };

export function GalleryImages({ galleryId, title, images }: { galleryId: string; title: string; images: Img[] }) {
  const [items, setItems] = useState(images);
  const [uploading, setUploading] = useState("");
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const changed = items.some((img, i) => img.id !== images[i].id || (img.alt ?? "") !== (images[i].alt ?? ""));

  async function upload(files: File[]) {
    const urls: string[] = [];
    for (const [i, file] of files.entries()) {
      setUploading(`Đang tải ảnh ${i + 1}/${files.length}…`);
      try {
        urls.push((await uploadFile(file, "school-media")).url);
      } catch (err) {
        toast.error(`Ảnh ${i + 1}: ${err instanceof Error ? err.message : "Tải lên không thành công."}`);
      }
    }
    setUploading("");
    if (!urls.length) return;
    const r = await addImages(galleryId, urls);
    (r?.ok ? toast.success : toast.error)(r?.message ?? "Thao tác không thành công.");
  }

  return (
    <section aria-labelledby={`${uid}-heading`} className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${uid}-heading`} className="font-heading text-xl font-bold text-primary">
          Ảnh trong album ({items.length})
        </h2>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={acceptFor("school-media")}
          aria-label="Chọn ảnh để tải lên"
          className="sr-only"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])].slice(0, 50);
            e.target.value = "";
            if (files.length) void upload(files);
          }}
        />
        <Button type="button" variant="outline" className="h-10" disabled={!!uploading || changed} onClick={() => fileRef.current?.click()}>
          <ImageUp /> {uploading || "Tải ảnh lên"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn nhiều ảnh cùng lúc (tối đa 50). Mô tả ảnh giúp người khiếm thị biết nội dung ảnh; để trống sẽ dùng “{title} – ảnh số …”.
        {changed && " Hãy lưu thay đổi trước khi tải thêm ảnh."}
      </p>
      <div aria-live="polite" className="sr-only">
        {uploading}
      </div>

      {items.length > 0 && (
        <div className="mt-4">
          <SortableList items={items} onChange={setItems} label={(img) => `ảnh số ${items.indexOf(img) + 1}`}>
            {(img, i) => (
              <>
                <Image src={img.image_url} alt="" width={96} height={64} className="h-16 w-24 rounded-md object-cover" />
                <div className="min-w-48 flex-1">
                  <label htmlFor={`${uid}-alt-${img.id}`} className="block text-sm font-medium">
                    Mô tả ảnh số {i + 1}
                  </label>
                  <Input
                    id={`${uid}-alt-${img.id}`}
                    value={img.alt ?? ""}
                    maxLength={300}
                    placeholder={`${title} – ảnh ${i + 1}`}
                    onChange={(e) => setItems(items.map((it) => (it.id === img.id ? { ...it, alt: e.target.value } : it)))}
                    className="mt-1 h-10 bg-card"
                  />
                </div>
                <DeleteButton action={deleteImage.bind(null, img.id)} what={`ảnh số ${i + 1}`} compact />
              </>
            )}
          </SortableList>
          <div className="sticky bottom-0 mt-4 flex items-center gap-3 border-t bg-background/95 py-3">
            <Button
              type="button"
              className="h-10 px-5"
              disabled={!changed || pending}
              onClick={() =>
                startTransition(async () => {
                  const r = await saveImages(galleryId, items.map(({ id, alt }) => ({ id, alt })));
                  (r?.ok ? toast.success : toast.error)(r?.message ?? "Thao tác không thành công.");
                })
              }
            >
              {pending ? "Đang lưu…" : "Lưu mô tả và thứ tự ảnh"}
            </Button>
            {changed && !pending && <p className="text-sm text-muted-foreground">Có thay đổi chưa lưu.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
