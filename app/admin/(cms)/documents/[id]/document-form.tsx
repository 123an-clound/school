"use client";

import { useState } from "react";
import { AdminForm, Field, SelectField, UploadField } from "@/components/admin/form";
import { documentCategories } from "@/lib/site";
import { saveDocument } from "../actions";

type Doc = {
  id: string;
  title: string;
  code_number: string | null;
  category: string;
  file_url: string;
  file_size: string | null;
  file_type: string | null;
  issued_date: string | null;
} | null;

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

export function DocumentForm({ doc }: { doc: Doc }) {
  const [meta, setMeta] = useState({ size: doc?.file_size ?? "", type: doc?.file_type ?? "" });
  return (
    <AdminForm action={saveDocument.bind(null, doc?.id ?? null)} redirectTo={(id) => `/admin/documents/${id}`}>
      <div className="max-w-2xl space-y-5">
        <UploadField
          name="file_url"
          label="File tài liệu"
          bucket="school-documents"
          defaultValue={doc?.file_url}
          onUploaded={({ size, ext }) => setMeta({ size: formatSize(size), type: ext })}
        />
        <input type="hidden" name="file_size" value={meta.size} />
        <input type="hidden" name="file_type" value={meta.type} />
        <Field name="title" label="Tên tài liệu" defaultValue={doc?.title} required maxLength={300} />
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField name="category" label="Loại" defaultValue={doc?.category ?? "bieu-mau-hoc-sinh"} options={documentCategories} />
          <Field name="code_number" label="Số hiệu" defaultValue={doc?.code_number ?? ""} maxLength={100} />
          <Field name="issued_date" label="Ngày ban hành" type="date" defaultValue={doc?.issued_date ?? ""} />
        </div>
      </div>
    </AdminForm>
  );
}
