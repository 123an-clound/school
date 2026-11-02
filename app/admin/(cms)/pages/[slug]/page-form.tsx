"use client";

import { AdminForm, Field } from "@/components/admin/form";
import { RichEditor } from "@/components/admin/rich-editor";
import type { ActionState } from "@/lib/admin";

export function PageForm({ action, title, content }: { action: (s: ActionState, f: FormData) => Promise<ActionState>; title: string; content: string }) {
  return (
    <AdminForm action={action}>
      <Field name="title" label="Tiêu đề trang" defaultValue={title} required maxLength={200} />
      <RichEditor name="content" label="Nội dung" defaultValue={content} />
    </AdminForm>
  );
}
