import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { formatDate } from "@/lib/format";
import { newsCategories } from "@/lib/site";

type Card = { slug: string; title: string; summary: string | null; category: string; thumbnail_url: string | null; published_at: string };

// `eager`: the first card above the fold is often the page's LCP image
export function NewsCard({ article, eager }: { article: Card; eager?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative grid aspect-video place-items-center bg-secondary">
        {article.thumbnail_url ? (
          <Image src={article.thumbnail_url} alt="" fill fetchPriority={eager ? "high" : undefined} loading={eager ? "eager" : undefined} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <Newspaper aria-hidden className="size-10 text-primary/40" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground">
          {newsCategories[article.category]} · <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
        </p>
        <h2 className="mt-2 font-heading text-lg leading-snug font-bold">
          <Link href={`/tin-tuc/${article.slug}`} className="hover:text-primary hover:underline">
            {article.title}
          </Link>
        </h2>
        {article.summary && <p className="mt-2 line-clamp-3 text-muted-foreground">{article.summary}</p>}
      </div>
    </article>
  );
}
