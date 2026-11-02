import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { deleteMessage, markRead } from "./actions";
import { MarkReadButton } from "./mark-read";

export const metadata: Metadata = { title: "Thư liên hệ" };

type Message = { id: string; full_name: string; email: string; phone: string | null; subject: string; message: string; status: string; created_at: string };

export default async function MessagesAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(300);
  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-primary">Thư liên hệ</h1>
      <ul className="mt-6 space-y-4">
        {(data ?? []).map((m: Message) => (
          <li key={m.id} className={m.status === "new" ? "rounded-xl border border-l-4 border-l-brand-red bg-card p-5" : "rounded-xl border bg-card p-5"}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {m.status === "new" && <span className="mr-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-900">Mới</span>}
                  {m.subject}
                </p>
                <p className="text-sm">
                  {m.full_name} · <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>
                  {m.phone && <> · <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a></>}
                </p>
                <p className="text-xs text-muted-foreground">Gửi lúc {formatDateTime(m.created_at)}</p>
              </div>
              <div className="flex gap-2">
                {m.status === "new" && <MarkReadButton action={markRead.bind(null, m.id)} />}
                <DeleteButton action={deleteMessage.bind(null, m.id)} what={`thư “${m.subject}”`} compact />
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-muted p-3 text-sm whitespace-pre-line">{m.message}</p>
          </li>
        ))}
      </ul>
      {(data ?? []).length === 0 && <p className="mt-4 text-muted-foreground">Chưa có thư.</p>}
    </>
  );
}
