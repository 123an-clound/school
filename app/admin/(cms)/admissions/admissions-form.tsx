"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminForm, Check, Field, FormSection, TextArea, UploadField } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAdmissions } from "./actions";

type Benchmark = { year: string; score: number; max_score: number; note?: string };
type Info = {
  id: string;
  academic_year: string;
  target_quota: number;
  admission_criteria: string;
  benchmark_scores: unknown; // jsonb, written by this form
  guide_file_url: string | null;
  registration_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
} | null;

export function AdmissionsForm({ info }: { info: Info }) {
  const [rows, setRows] = useState<Benchmark[]>((info?.benchmark_scores as Benchmark[] | undefined) ?? []);
  const update = (i: number, patch: Partial<Benchmark>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <AdminForm action={saveAdmissions.bind(null, info?.id ?? null)} redirectTo={(id) => `/admin/admissions?nam=${id}`}>
      <div className="max-w-3xl space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="academic_year" label="Năm học" hint="Ví dụ: 2026 - 2027" defaultValue={info?.academic_year} required maxLength={20} />
          <Field name="target_quota" label="Chỉ tiêu (học sinh)" type="number" min={0} defaultValue={info?.target_quota ?? 0} required />
          <Field name="start_date" label="Bắt đầu nhận hồ sơ" type="date" defaultValue={info?.start_date ?? ""} />
          <Field name="end_date" label="Hạn cuối" type="date" defaultValue={info?.end_date ?? ""} />
        </div>
        <TextArea
          name="admission_criteria"
          label="Phương thức tuyển sinh"
          hint="Theo TT 30/2024: Toán, Ngữ văn và môn thứ ba do Sở GD&ĐT chọn."
          rows={5}
          defaultValue={info?.admission_criteria ?? ""}
          required
          maxLength={3000}
        />
        <Field name="registration_url" label="Link hệ thống đăng ký / tra cứu của Sở GD&ĐT" type="url" defaultValue={info?.registration_url ?? ""} placeholder="https://" />
        <UploadField name="guide_file_url" label="File hướng dẫn (PDF)" bucket="school-documents" defaultValue={info?.guide_file_url} />

        <FormSection title="Điểm chuẩn (3 năm gần nhất được hiển thị)">
          <input type="hidden" name="benchmark_scores" value={JSON.stringify(rows.map((r) => ({ ...r, note: r.note || undefined })))} />
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[6rem_7rem_7rem_1fr_auto]">
              <label className="text-sm font-medium">
                Năm
                <Input value={r.year} onChange={(e) => update(i, { year: e.target.value })} inputMode="numeric" maxLength={4} className="mt-1 h-10" />
              </label>
              <label className="text-sm font-medium">
                Điểm chuẩn
                <Input type="number" step="0.01" min={0} value={r.score} onChange={(e) => update(i, { score: Number(e.target.value) })} className="mt-1 h-10" />
              </label>
              <label className="text-sm font-medium">
                Thang điểm
                <Input type="number" step="0.01" min={1} value={r.max_score} onChange={(e) => update(i, { max_score: Number(e.target.value) })} className="mt-1 h-10" />
              </label>
              <label className="col-span-2 text-sm font-medium sm:col-span-1">
                Ghi chú
                <Input value={r.note ?? ""} onChange={(e) => update(i, { note: e.target.value })} maxLength={300} className="mt-1 h-10" />
              </label>
              <Button type="button" variant="ghost" aria-label={`Xóa dòng năm ${r.year}`} onClick={() => setRows((all) => all.filter((_, j) => j !== i))}>
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((all) => [...all, { year: String(new Date().getFullYear()), score: 0, max_score: 50 }])}
          >
            <Plus /> Thêm năm
          </Button>
        </FormSection>
        <Check name="is_active" label="Hiển thị trên trang Tuyển sinh" defaultChecked={info?.is_active ?? true} />
      </div>
    </AdminForm>
  );
}
