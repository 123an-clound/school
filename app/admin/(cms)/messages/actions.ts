"use server";

import { GENERIC, done, failed, refresh, requireAdmin, type ActionState } from "@/lib/admin";

export async function markRead(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("contact_messages").update({ status: "read" }).eq("id", id).select("id");
  if (error || !data?.length) return failed(GENERIC);
  refresh();
  return done("Đã đánh dấu đã đọc.");
}

export async function deleteMessage(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("contact_messages").delete().eq("id", id).select("id");
  if (error || !data?.length) return failed(GENERIC);
  refresh();
  return done("Đã xóa thư.");
}
