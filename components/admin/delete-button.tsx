"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/admin";

export function DeleteButton({
  action,
  what,
  redirectTo,
  compact,
}: {
  action: () => Promise<ActionState>;
  what: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={compact ? "sm" : "default"} disabled={pending} aria-label={compact ? `Xóa ${what}` : undefined}>
          <Trash2 /> {compact ? null : "Xóa"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa {what}?</AlertDialogTitle>
          <AlertDialogDescription>Thao tác này không hoàn tác được. File đính kèm (nếu có) cũng bị xóa khỏi kho lưu trữ.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              startTransition(async () => {
                const result = await action();
                (result?.ok ? toast.success : toast.error)(result?.message ?? "Thao tác không thành công.");
                if (result?.ok && redirectTo) router.push(redirectTo);
              })
            }
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
