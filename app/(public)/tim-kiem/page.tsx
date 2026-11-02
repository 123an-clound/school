import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { search } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Tìm kiếm", robots: { index: false } };

const kinds: Record<string, string> = { news: "Tin tức", page: "Trang", document: "Tài liệu" };
type Hit = { kind: string; title: string; path: string; excerpt: string | null; published_at: string | null };

export default function SearchPage(props: PageProps<"/tim-kiem">) {
  return (
    <>
      <PageHeader title="Tìm kiếm" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Suspense fallback={<p className="min-h-dvh text-muted-foreground">Đang tìm…</p>}>
          <Results searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/tim-kiem">, "searchParams">) {
  const { q: raw } = await searchParams;
  const q = typeof raw === "string" ? raw.trim().slice(0, 100) : "";
  const hits: Hit[] = q.length >= 2 ? await search(q) : [];

  return (
    <>
      <Form action="/tim-kiem" role="search" className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Từ khóa
        </label>
        <Input id="q" name="q" type="search" defaultValue={q} placeholder="Nhập từ khóa, ví dụ: tuyen sinh" className="h-12 bg-card text-base" />
        <Button type="submit" className="h-12 px-5 text-base">
          <Search /> Tìm
        </Button>
      </Form>
      <p className="mt-2 text-sm text-muted-foreground">Tìm trong tin tức, trang giới thiệu và tên tài liệu; gõ không dấu vẫn được.</p>

      {q.length >= 2 && (
        <section aria-live="polite" className="mt-8">
          <h2 className="text-lg font-semibold">
            {hits.length} kết quả cho “{q}”
          </h2>
          <ul className="mt-4 divide-y rounded-xl border bg-card">
            {hits.map((h) => (
              <li key={`${h.kind}:${h.path}`} className="p-4">
                <p className="text-sm font-medium text-primary">{kinds[h.kind]}</p>
                {h.kind === "document" ? (
                  <a href={h.path} className="font-heading text-lg font-bold hover:underline">
                    {h.title}
                  </a>
                ) : (
                  <Link href={h.path} className="font-heading text-lg font-bold hover:underline">
                    {h.title}
                  </Link>
                )}
                {h.excerpt && <p className="mt-1 text-muted-foreground">{h.excerpt}</p>}
                {h.published_at && h.kind === "news" && (
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={h.published_at}>{formatDate(h.published_at)}</time>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
