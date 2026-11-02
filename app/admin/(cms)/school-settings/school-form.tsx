"use client";

import { AdminForm, Field, FormSection, TextArea, UploadField } from "@/components/admin/form";
import type { Tables } from "@/lib/supabase/database.types";
import { saveSchoolInfo } from "./actions";

type Info = Tables<"school_info">;

export function SchoolForm({ info }: { info: Info }) {
  const v = (k: keyof Info) => String(info[k] ?? "");
  const stats = (info.stats ?? {}) as Record<string, string | number | undefined>;
  return (
    <AdminForm action={saveSchoolInfo}>
      <div className="max-w-3xl space-y-6">
        <FormSection title="Thông tin chung">
          <Field name="name" label="Tên trường" defaultValue={v("name")} required maxLength={200} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="short_name" label="Tên ngắn" defaultValue={v("short_name")} maxLength={100} />
            <Field name="established_year" label="Năm thành lập" type="number" min={1800} max={2100} defaultValue={v("established_year")} />
          </div>
          <Field name="slogan" label="Khẩu hiệu" defaultValue={v("slogan")} maxLength={300} />
          <div className="grid gap-4 sm:grid-cols-2">
            <UploadField name="logo_url" label="Logo" bucket="school-media" defaultValue={v("logo_url")} />
            <UploadField name="favicon_url" label="Favicon (ảnh vuông)" bucket="school-media" defaultValue={v("favicon_url")} />
          </div>
        </FormSection>

        <FormSection title="Liên hệ">
          <Field name="address" label="Địa chỉ (theo địa giới hành chính mới)" defaultValue={v("address")} required maxLength={300} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="phone" label="Điện thoại văn phòng" defaultValue={v("phone")} required maxLength={30} />
            <Field name="hotline" label="Hotline" defaultValue={v("hotline")} maxLength={30} />
            <Field name="email" label="Email" type="email" defaultValue={v("email")} required />
          </div>
          <Field
            name="map_embed_url"
            label="Link nhúng bản đồ"
            hint="Google Maps → Chia sẻ → Nhúng bản đồ, copy phần src (bắt đầu bằng https://www.google.com/maps/embed)."
            defaultValue={v("map_embed_url")}
          />
        </FormSection>

        <FormSection title="Liên kết">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="facebook_url" label="Facebook" type="url" defaultValue={v("facebook_url")} placeholder="https://" />
            <Field name="youtube_url" label="YouTube" type="url" defaultValue={v("youtube_url")} placeholder="https://" />
            <Field name="score_lookup_url" label="Hệ thống tra cứu điểm" type="url" defaultValue={v("score_lookup_url")} placeholder="https://" />
            <Field name="education_department_url" label="Website Sở GD&ĐT" type="url" defaultValue={v("education_department_url")} placeholder="https://" />
          </div>
        </FormSection>

        <FormSection title="Thư ngỏ Hiệu trưởng">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="principal_name" label="Họ tên Hiệu trưởng" defaultValue={v("principal_name")} maxLength={100} />
            <Field name="principal_title" label="Chức danh" defaultValue={v("principal_title")} maxLength={100} />
          </div>
          <TextArea name="principal_message" label="Thông điệp" hint="Mỗi đoạn cách nhau một dòng trống." rows={8} defaultValue={v("principal_message")} maxLength={5000} />
          <UploadField name="principal_avatar_url" label="Ảnh chân dung" bucket="school-media" defaultValue={v("principal_avatar_url")} />
        </FormSection>

        <FormSection title="Chỉ số nổi bật (trang chủ)">
          <p className="text-sm text-muted-foreground">Số năm truyền thống tự tính từ năm thành lập. Để trống để ẩn chỉ số.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="graduation_rate" label="Tỷ lệ tốt nghiệp" placeholder="100%" defaultValue={String(stats.graduation_rate ?? "")} maxLength={20} />
            <Field name="university_rate" label="Tỷ lệ đỗ đại học" placeholder="96,8%" defaultValue={String(stats.university_rate ?? "")} maxLength={20} />
            <Field name="national_awards" label="Số giải HSG quốc gia" defaultValue={String(stats.national_awards ?? "")} maxLength={20} />
          </div>
        </FormSection>
      </div>
    </AdminForm>
  );
}
