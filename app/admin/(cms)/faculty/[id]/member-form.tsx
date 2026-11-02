"use client";

import { AdminForm, Check, Field, TextArea, UploadField } from "@/components/admin/form";
import { saveMember } from "../actions";

type Member = {
  id: string;
  full_name: string;
  position: string;
  department: string;
  degree: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  order_index: number;
  is_leadership: boolean;
} | null;

export function MemberForm({ member, departments }: { member: Member; departments: string[] }) {
  return (
    <AdminForm action={saveMember.bind(null, member?.id ?? null)} redirectTo={(id) => `/admin/faculty/${id}`}>
      <div className="max-w-2xl space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="full_name" label="Họ tên (kèm học hàm nếu có)" defaultValue={member?.full_name} required maxLength={100} />
          <Field name="position" label="Chức vụ" defaultValue={member?.position} required maxLength={100} />
          <Field name="department" label="Tổ chuyên môn / bộ phận" list="departments" defaultValue={member?.department} required maxLength={100} />
          <Field name="degree" label="Học vị" defaultValue={member?.degree ?? ""} maxLength={200} />
          <Field name="phone" label="Điện thoại công vụ" type="tel" defaultValue={member?.phone ?? ""} maxLength={30} />
          <Field name="email" label="Email công vụ" type="email" defaultValue={member?.email ?? ""} maxLength={254} />
        </div>
        <datalist id="departments">
          {["Ban Giám hiệu", ...departments].filter((d, i, a) => a.indexOf(d) === i).map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        <TextArea name="bio" label="Thành tích / nhiệm vụ phụ trách" defaultValue={member?.bio ?? ""} maxLength={1000} />
        <UploadField name="avatar_url" label="Ảnh chân dung" bucket="school-media" defaultValue={member?.avatar_url} />
        <Field name="order_index" label="Thứ tự" type="number" min={0} defaultValue={member?.order_index ?? 0} className="w-32" />
        <Check name="is_leadership" label="Thuộc Ban Giám hiệu (hiện ở trang Giới thiệu kèm điện thoại, email)" defaultChecked={member?.is_leadership} />
      </div>
    </AdminForm>
  );
}
