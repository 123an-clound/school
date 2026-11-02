"use client";

import { Button } from "@/components/ui/button";

// Generic message only: error details are never shown to visitors
export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-bold text-primary">Đã có lỗi xảy ra</h1>
      <p className="mt-2 text-muted-foreground">Trang tạm thời chưa tải được. Vui lòng thử lại sau ít phút.</p>
      <Button onClick={reset} className="mt-6 h-11 px-5 text-base">
        Thử lại
      </Button>
    </div>
  );
}
