"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/admin";

export function MarkReadButton({ action }: { action: () => Promise<ActionState> }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await action();
          (r?.ok ? toast.success : toast.error)(r?.message ?? "Thao tác không thành công.");
        })
      }
    >
      <Check /> Đã đọc
    </Button>
  );
}
