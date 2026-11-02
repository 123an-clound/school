"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableList } from "@/components/admin/sortable-list";
import { PersonAvatar } from "@/components/site/person-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteMember, reorderMembers } from "./actions";

type Member = { id: string; full_name: string; position: string; department: string; avatar_url: string | null; is_leadership: boolean };

export function FacultyList({ members }: { members: Member[] }) {
  const [items, setItems] = useState(members);
  const [pending, startTransition] = useTransition();
  const changed = items.some((m, i) => m.id !== members[i]?.id);

  return (
    <>
      <SortableList items={items} onChange={setItems} label={(m) => m.full_name}>
        {(m) => (
          <>
            <PersonAvatar name={m.full_name} src={m.avatar_url} size={48} />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/faculty/${m.id}`} className="font-medium hover:text-primary hover:underline">{m.full_name}</Link>
              <p className="text-sm text-muted-foreground">
                {m.position} · {m.department}
                {m.is_leadership && " · Ban Giám hiệu"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/faculty/${m.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Sửa</Link>
              <DeleteButton action={deleteMember.bind(null, m.id)} what={m.full_name} compact />
            </div>
          </>
        )}
      </SortableList>
      <div className="sticky bottom-0 mt-4 flex items-center gap-3 border-t bg-background/95 py-3">
        <Button
          type="button"
          className="h-10 px-5"
          disabled={!changed || pending}
          onClick={() =>
            startTransition(async () => {
              const r = await reorderMembers(items.map((m) => m.id));
              (r?.ok ? toast.success : toast.error)(r?.message ?? "Thao tác không thành công.");
            })
          }
        >
          {pending ? "Đang lưu…" : "Lưu thứ tự"}
        </Button>
        {changed && !pending && <p className="text-sm text-muted-foreground">Thứ tự mới chưa được lưu.</p>}
      </div>
    </>
  );
}
