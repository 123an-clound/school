import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewsCard } from "@/components/site/news-card";
import { PageHeader } from "@/components/site/page-header";
import { PersonAvatar } from "@/components/site/person-avatar";
import { getClubs, getNewsPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hoạt động CLB",
  description: "Các câu lạc bộ của học sinh và tin hoạt động Đoàn - CLB.",
};

const newsCategory = "hoat-dong-doan-clb";

export default async function ClubsPage() {
  const [clubs, news] = await Promise.all([getClubs(), getNewsPage(newsCategory, 1)]);
  return (
    <>
      <PageHeader title="Hoạt động CLB" />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10">
        <section aria-labelledby="clubs-heading">
          <h2 id="clubs-heading" className="font-heading text-2xl font-bold text-primary">
            Các câu lạc bộ
          </h2>
          {clubs.length > 0 ? (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((c) => (
                <li key={c.id} className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
                  <PersonAvatar name={c.name} src={c.image_url} size={64} />
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-bold">{c.name}</h3>
                    {c.advisor_name && <p className="text-sm font-medium text-primary">Phụ trách: {c.advisor_name}</p>}
                    {c.description && <p className="mt-2 text-sm">{c.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">Danh sách câu lạc bộ đang được cập nhật.</p>
          )}
        </section>

        <section aria-labelledby="club-news-heading">
          <div className="flex items-end justify-between gap-4">
            <h2 id="club-news-heading" className="font-heading text-2xl font-bold text-primary">
              Tin hoạt động Đoàn - CLB
            </h2>
            <Link href={`/tin-tuc?chuyen-muc=${newsCategory}`} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
              Xem tất cả <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {news.items.length > 0 ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.items.slice(0, 6).map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">Chưa có bài viết.</p>
          )}
          <p className="mt-6">
            <Link href="/thu-vien-anh" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Xem thư viện ảnh hoạt động <ArrowRight aria-hidden className="size-4" />
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
