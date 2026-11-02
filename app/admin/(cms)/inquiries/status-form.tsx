"use client";

import { useActionState, useEffect, useId, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/admin";

export function InquiryStatusForm({
  action,
  status,
  notes,
  labels,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  status: string;
  notes: string;
  labels: Record<string, string>;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const [, startTransition] = useTransition();
  const id = useId();
  useEffect(() => {
    if (state) (state.ok ? toast.success : toast.error)(state.message);
  }, [state]);
  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => dispatch(data));
      }}
    >
      <label htmlFor={`${id}-s`} className="text-sm font-medium">
        Trạng thái
        <select id={`${id}-s`} name="status" defaultValue={status} className="mt-1 block h-10 rounded-lg border border-input bg-card px-3">
          {Object.entries(labels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <label htmlFor={`${id}-n`} className="min-w-64 flex-1 text-sm font-medium">
        Ghi chú nội bộ
        <input id={`${id}-n`} name="admin_notes" defaultValue={notes} maxLength={2000} className="mt-1 block h-10 w-full rounded-lg border border-input bg-card px-3" />
      </label>
      <Button type="submit" variant="outline" disabled={pending} className="h-10">
        {pending ? "Đang lưu…" : "Cập nhật"}
      </Button>
    </form>
  );
}
