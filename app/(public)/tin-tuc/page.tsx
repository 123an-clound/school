import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { cn } from "cn";
import { Search } from "lucide-react";
import { NewsCard } from "@/components/site/news-card";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NEWS_PAGE_SIZE, getNewsPage, search } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { newsCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tin tức & Thông báo",
  description: "Tin tức, thông báo, hoạt động và lấy ý kiến của nhà trường.",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

type Params = { category?: string; q: string; page: number };

const href = ({ category, page }: Partial<Params>) => {
  const sp = new URLSearchParams();
  if (category) sp.set("chuyen-muc", category);
  if (page && page > 1) sp.set("trang", String(page));
  const s = sp.toString();
  return s ? `/tin-tuc?${s}` : "/tin-tuc";
};

export default function NewsPage(props: PageProps<"/tin-tuc">) {
  return (
    <>
      <PageHeader title="Tin tức & Thông báo" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Suspense fallback={<p className="min-h-dvh text-muted-foreground">Đang tải danh sách bài viết…</p>}>
          <NewsResults searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function NewsResults({ searchParams }: Pick<PageProps<"/tin-tuc">, "searchParams">) {
  const sp = await searchParams;
  const rawCategory = typeof sp["chuyen-muc"] === "string" ? sp["chuyen-muc"] : undefined;
  const params: Params = {
    category: rawCategory && rawCategory in newsCategories ? rawCategory : undefined,
    q: typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "",
    page: Math.max(1, Math.floor(Number(sp.trang)) || 1),
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Chuyên mục">
          <ul className="flex flex-wrap gap-2">
            {[[undefined, "Tất cả"] as const, ...Object.entries(newsCategories)].map(([key, label]) => {
              const active = params.category === key && !params.q;
              return (
                <li key={key ?? "all"}>
                  <Link
                    href={href({ category: key })}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Form action="/tin-tuc" role="search" className="flex w-full gap-2 lg:w-80">
          <label htmlFor="news-q" className="sr-only">
            Tìm bài viết
          </label>
          <Input id="news-q" name="q" type="search" defaultValue={params.q} placeholder="Tìm bài viết…" className="h-10" />
          <Button type="submit" size="icon" className="size-10 shrink-0" aria-label="Tìm">
            <Search />
          </Button>
        </Form>
      </div>
      {params.q.length >= 2 ? <SearchResults q={params.q} /> : <Listing {...params} />}
    </>
  );
}

async function SearchResults({ q }: { q: string }) {
  const results = (await search(q)).filter((r: { kind: string }) => r.kind === "news");
  return (
    <section aria-live="polite" className="mt-8">
      <h2 className="text-lg font-semibold">
        {results.length} bài viết khớp với “{q}”
      </h2>
      <ul className="mt-4 divide-y rounded-xl border bg-card">
        {results.map((r: { path: string; title: string; excerpt: string | null; published_at: string }) => (
          <li key={r.path} className="p-4">
            <Link href={r.path} className="font-heading text-lg font-bold hover:text-primary hover:underline">
              {r.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              <time dateTime={r.published_at}>{formatDate(r.published_at)}</time>
            </p>
            {r.excerpt && <p className="mt-1 text-muted-foreground">{r.excerpt}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Listing({ category, page }: Params) {
  const { items, total } = await getNewsPage(category, page);
  const pages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));

  if (items.length === 0) return <p className="mt-8 text-muted-foreground">Chưa có bài viết trong mục này.</p>;

  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a: Parameters<typeof NewsCard>[0]["article"] & { id: string }, i: number) => (
          <NewsCard key={a.id} article={a} eager={i === 0} />
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label="Phân trang" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <Link
                  href={href({ category, page: p })}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Trang ${p}`}
                  className={cn(
                    "grid size-10 place-items-center rounded-md border font-medium",
                    p === page ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                  )}
                >
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
