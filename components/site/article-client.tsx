"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// Counts one view per article per browser session, after the page has rendered.
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still count, at most once per mount
    }
    createClient().rpc("increment_article_view", { article_slug: slug }).then(() => undefined);
  }, [slug]);
  return null;
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Chia sẻ:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center rounded-md border bg-card px-3 text-sm font-medium hover:bg-accent"
      >
        Facebook<span className="sr-only"> (mở trong tab mới)</span>
      </a>
      <Button
        type="button"
        variant="outline"
        className="h-9"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }}
        aria-label={`Sao chép liên kết bài “${title}”`}
      >
        <Link2 /> Sao chép liên kết
      </Button>
      <span role="status" className="text-sm text-muted-foreground">
        {copied ? "Đã sao chép" : ""}
      </span>
    </div>
  );
}
