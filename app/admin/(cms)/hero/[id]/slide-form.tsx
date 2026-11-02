"use client";

import { AdminForm, Check, Field, UploadField } from "@/components/admin/form";
import { saveSlide } from "../actions";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
} | null;

export function SlideForm({ slide }: { slide: Slide }) {
  return (
    <AdminForm action={saveSlide.bind(null, slide?.id ?? null)} redirectTo={(id) => `/admin/hero/${id}`}>
      <div className="max-w-2xl space-y-5">
        <Field name="title" label="Tiêu đề" defaultValue={slide?.title} required maxLength={200} />
        <Field name="subtitle" label="Mô tả ngắn" defaultValue={slide?.subtitle ?? ""} maxLength={300} />
        <UploadField name="image_url" label="Ảnh banner (khổ ngang, nên ≥ 1920×800)" bucket="school-media" defaultValue={slide?.image_url} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="cta_label" label="Chữ trên nút" defaultValue={slide?.cta_label ?? ""} maxLength={60} />
          <Field name="cta_href" label="Liên kết của nút" hint="https://… hoặc đường dẫn nội bộ như /tuyen-sinh" defaultValue={slide?.cta_href ?? ""} maxLength={2000} />
        </div>
        <Field name="sort_order" label="Thứ tự" type="number" min={0} defaultValue={slide?.sort_order ?? 0} className="w-32" />
        <Check name="is_active" label="Hiển thị trên trang chủ" defaultChecked={slide?.is_active ?? true} />
      </div>
    </AdminForm>
  );
}
