"use server";

import { GENERIC, deleteRow, done, failed, parse, refresh, requireAdmin, saveRow, type ActionState } from "@/lib/admin";
import { documentSchema } from "@/lib/admin-schemas";

export async function saveDocument(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = parse(documentSchema, formData);
  if (error) return error;
  const savedId = await saveRow(supabase, "documents_forms", id, data, ["file_url"]);
  if (!savedId) return failed(GENERIC);
  refresh("documents_forms");
  return id ? done("Đã lưu tài liệu.") : done("Đã thêm tài liệu.", savedId);
}

export async function deleteDocument(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  // Public disclosures must stay online for 5 years (TT 09/2024/TT-BGDĐT)
  const { data } = await supabase.from("documents_forms").select("category, issued_date, created_at").eq("id", id).single();
  const issued = Date.parse(data?.issued_date ?? data?.created_at ?? "");
  if (data?.category === "cong-khai" && Date.now() - issued < 5 * 365.25 * 24 * 3600_000) {
    return failed("Tài liệu công khai phải lưu tối thiểu 5 năm (TT 09/2024), chưa thể xóa.");
  }
  if (!(await deleteRow(supabase, "documents_forms", id, ["file_url"]))) return failed(GENERIC);
  refresh("documents_forms");
  return done("Đã xóa tài liệu.");
}
