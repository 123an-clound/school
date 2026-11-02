"use client";

import { AdminForm, Field, SelectField } from "@/components/admin/form";
import { galleryCategories } from "@/lib/site";
import { saveGallery } from "../actions";

type Gallery = { id: string; title: string; category: string; event_date: string | null } | null;

export function GalleryForm({ gallery }: { gallery: Gallery }) {
  return (
    <AdminForm action={saveGallery.bind(null, gallery?.id ?? null)} redirectTo={(id) => `/admin/media/${id}`} submitLabel={gallery ? "Lưu album" : "Tạo album"}>
      <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field name="title" label="Tên album" defaultValue={gallery?.title} required maxLength={200} />
        </div>
        <SelectField name="category" label="Loại" options={galleryCategories} defaultValue={gallery?.category ?? "ngoai-khoa"} />
        <Field name="event_date" label="Ngày diễn ra" type="date" defaultValue={gallery?.event_date ?? ""} />
      </div>
    </AdminForm>
  );
}
