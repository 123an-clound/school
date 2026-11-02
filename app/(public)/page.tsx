import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, GraduationCap, MessageSquareText, Pin } from "lucide-react";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { JsonLd } from "@/components/site/json-ld";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonAvatar } from "@/components/site/person-avatar";
import { getClubs, getGalleries, getHeroSlides, getHomeNews, getSchoolInfo } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { galleryCategories, newsCategories } from "@/lib/site";

const newsTabs = [
  { category: "thong-bao", label: "Thông báo mới" },
  { category: "giao-duc-dao-tao", label: "Hoạt động dạy học" },
  { category: "hoat-dong-doan-clb", label: "Phong trào học sinh" },
];

type Article = Awaited<ReturnType<typeof getHomeNews>>[number];

export default async function HomePage() {
  "use cache";
  const [school, slides, news, clubs, albums] = await Promise.all([getSchoolInfo(), getHeroSlides(), getHomeNews(), getClubs(), getGalleries()]);

  const featured: Article | undefined = news.find((a: Article) => a.is_featured) ?? news[0];
  const pinned = news.filter((a: Article) => a.is_pinned && a.id !== featured?.id).slice(0, 4);
  const stats = school.stats as Record<string, string | number | undefined>;
  const statItems = [
    school.established_year && { value: `${new Date().getFullYear() - school.established_year}+`, label: "Năm truyền thống" },
    stats.graduation_rate != null && { value: stats.graduation_rate, label: "Tỷ lệ tốt nghiệp THPT" },
    stats.university_rate != null && { value: stats.university_rate, label: "Tỷ lệ đỗ đại học" },
    stats.national_awards != null && { value: stats.national_awards, label: "Giải học sinh giỏi quốc gia" },
  ].filter(Boolean) as { value: string | number; label: string }[];

  const shortcuts = [
    school.score_lookup_url && { href: school.score_lookup_url, label: "Tra cứu điểm", icon: GraduationCap, external: true },
    { href: "/tai-lieu?loai=thoi-khoa-bieu", label: "Thời khóa biểu", icon: CalendarDays },
    { href: "/tai-lieu?loai=bieu-mau-hoc-sinh", label: "Biểu mẫu", icon: FileText },
    { href: "/tuyen-sinh#dang-ky-tu-van", label: "Đăng ký tư vấn tuyển sinh", icon: MessageSquareText },
  ].filter(Boolean) as { href: string; label: string; icon: typeof FileText; external?: boolean }[];

  return (
    <>
      <h1 className="sr-only">{school.name}</h1>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HighSchool",
          name: school.name,
          alternateName: school.short_name ?? undefined,
          url: process.env.NEXT_PUBLIC_SITE_URL,
          logo: school.logo_url ?? undefined,
          telephone: school.phone,
          email: school.email,
          address: { "@type": "PostalAddress", streetAddress: school.address, addressCountry: "VN" },
          foundingDate: school.established_year ? String(school.established_year) : undefined,
          sameAs: [school.facebook_url, school.youtube_url].filter(Boolean),
        }}
      />

      {slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        <section className="bg-primary px-4 py-20 text-center text-primary-foreground">
          <p className="font-heading text-3xl font-bold">{school.name}</p>
          {school.slogan && <p className="mt-3 text-lg text-white/90">{school.slogan}</p>}
        </section>
      )}

      <section aria-label="Lối tắt" className="mx-auto max-w-7xl px-4">
        <ul className="relative z-10 -mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {shortcuts.map(({ href, label, icon: Icon, external }) => {
            const content = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {label}
                  {external && <span className="sr-only"> (mở trong tab mới)</span>}
                </span>
              </>
            );
            const className =
              "flex h-full flex-col items-start gap-2 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-3";
            return (
              <li key={href}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                    {content}
                  </a>
                ) : (
                  <Link href={href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="news-heading" className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 id="news-heading" className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Tin tức &amp; Thông báo
          </h2>
          <Link href="/tin-tuc" className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
            Xem tất cả <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {featured && (
            <article className="overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-2">
              <div className="relative aspect-video bg-secondary">
                {featured.thumbnail_url && (
                  <Image src={featured.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
                )}
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">
                  {newsCategories[featured.category]} · <time dateTime={featured.published_at}>{formatDate(featured.published_at)}</time>
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-balance sm:text-2xl">
                  <Link href={`/tin-tuc/${featured.slug}`} className="hover:text-primary hover:underline">
                    {featured.title}
                  </Link>
                </h3>
                {featured.summary && <p className="mt-2 line-clamp-3 text-muted-foreground">{featured.summary}</p>}
              </div>
            </article>
          )}

          <div className="rounded-xl border border-l-4 border-l-brand-red bg-card p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-brand-red">
              <Pin aria-hidden className="size-4" /> Thông báo ghim
            </h3>
            {pinned.length > 0 ? (
              <ul className="mt-3 divide-y">
                {pinned.map((a: Article) => (
                  <li key={a.id} className="py-3">
                    <Link href={`/tin-tuc/${a.slug}`} className="font-medium hover:text-primary hover:underline">
                      {a.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <time dateTime={a.published_at}>{formatDate(a.published_at)}</time>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Hiện chưa có thông báo ghim.</p>
            )}
          </div>
        </div>

        <Tabs defaultValue={newsTabs[0].category} className="mt-10">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b">
            {newsTabs.map((t) => (
              <TabsTrigger key={t.category} value={t.category} className="flex-none px-3 text-base">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {newsTabs.map((t) => {
            const items = news.filter((a: Article) => a.category === t.category).slice(0, 4);
            return (
              <TabsContent key={t.category} value={t.category} className="pt-4">
                {items.length > 0 ? (
                  <ul className="grid gap-x-8 md:grid-cols-2">
                    {items.map((a: Article) => (
                      <li key={a.id} className="border-b py-3">
                        <Link href={`/tin-tuc/${a.slug}`} className="text-base font-medium hover:text-primary hover:underline">
                          {a.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <time dateTime={a.published_at}>{formatDate(a.published_at)}</time>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-muted-foreground">Chưa có bài viết trong mục này.</p>
                )}
                <Link
                  href={`/tin-tuc?chuyen-muc=${t.category}`}
                  className="mt-4 inline-flex items-center gap-1 text-base font-medium text-primary hover:underline"
                >
                  Xem thêm {t.label.toLowerCase()} <ArrowRight aria-hidden className="size-4" />
                </Link>
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      {school.principal_message && (
        <section aria-labelledby="principal-heading" className="border-y bg-card">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 md:grid-cols-[auto_1fr] md:items-start">
            <div className="mx-auto md:mx-0">
              {school.principal_avatar_url ? (
                <Image
                  src={school.principal_avatar_url}
                  alt={`Ảnh chân dung ${school.principal_name ?? "Hiệu trưởng"}`}
                  width={192}
                  height={240}
                  className="h-60 w-48 rounded-xl object-cover"
                />
              ) : (
                <span aria-hidden className="grid size-40 place-items-center rounded-full bg-secondary text-primary">
                  <GraduationCap className="size-16" />
                </span>
              )}
            </div>
            <div>
              <h2 id="principal-heading" className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                Thư ngỏ của Hiệu trưởng
              </h2>
              {String(school.principal_message)
                .split(/\n+/)
                .map((p: string, i: number) => (
                  <p key={i} className="mt-4 text-lg leading-relaxed">
                    {p}
                  </p>
                ))}
              {school.principal_name && (
                <p className="mt-6">
                  <span className="block font-heading text-lg font-bold">{school.principal_name}</span>
                  <span className="text-muted-foreground">{school.principal_title}</span>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {statItems.length > 0 && (
        <section aria-label="Chỉ số nổi bật" className="bg-primary text-primary-foreground">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-center lg:grid-cols-4">
            {statItems.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/85 sm:text-base">{s.label}</dt>
                <dd className="font-heading text-3xl font-bold text-brand-gold sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Clubs and photos only show once the school has added some (spec 3.1) */}
      {clubs.length > 0 && (
        <section aria-labelledby="clubs-heading" className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading id="clubs-heading" title="Góc CLB" href="/cau-lac-bo" />
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.slice(0, 4).map((c) => (
              <li key={c.id} className="rounded-xl border bg-card p-5 shadow-sm">
                <PersonAvatar name={c.name} src={c.image_url} size={56} />
                <h3 className="mt-3 font-heading text-lg font-bold">{c.name}</h3>
                {c.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {albums.length > 0 && (
        <section aria-labelledby="gallery-heading" className="border-t bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <SectionHeading id="gallery-heading" title="Thư viện ảnh" href="/thu-vien-anh" />
            <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {albums.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link href={`/thu-vien-anh#album-${a.id}`} className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={a.photo_gallery_images[0].image_url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                      />
                    </span>
                    <span className="mt-2 block font-medium group-hover:text-primary group-hover:underline">{a.title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {galleryCategories[a.category]} · {a.photo_gallery_images.length} ảnh
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeading({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="font-heading text-2xl font-bold text-primary sm:text-3xl">
        {title}
      </h2>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
        Xem tất cả <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
