"use client";

import { AdminForm, Field, TextArea, UploadField } from "@/components/admin/form";
import { saveClub } from "../actions";

type Club = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  advisor_name: string | null;
  sort_order: number;
} | null;

export function ClubForm({ club }: { club: Club }) {
  return (
    <AdminForm action={saveClub.bind(null, club?.id ?? null)} redirectTo={(id) => `/admin/clubs/${id}`}>
      <div className="max-w-2xl space-y-5">
        <Field name="name" label="Tên câu lạc bộ" defaultValue={club?.name} required maxLength={100} />
        <TextArea name="description" label="Giới thiệu ngắn" defaultValue={club?.description ?? ""} maxLength={1000} />
        <Field name="advisor_name" label="Giáo viên phụ trách" defaultValue={club?.advisor_name ?? ""} maxLength={100} />
        <UploadField name="image_url" label="Ảnh đại diện" bucket="school-media" defaultValue={club?.image_url} />
        <Field name="sort_order" label="Thứ tự" type="number" min={0} defaultValue={club?.sort_order ?? 0} className="w-32" />
      </div>
    </AdminForm>
  );
}
