import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { ShareButtons, ViewCounter } from "@/components/site/article-client";
import { JsonLd } from "@/components/site/json-ld";
import { NewsCard } from "@/components/site/news-card";
import { PageHeader } from "@/components/site/page-header";
import { getArticle, getPublishedSlugs, getRelatedNews, getSchoolInfo } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { sanitizeHtml, withHeadingIds } from "@/lib/sanitize";
import { newsCategories } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateStaticParams() {
  const rows: { slug: string }[] = await getPublishedSlugs();
  // Cache Components requires at least one sample param; an unknown slug just renders the 404 page.
  return rows.length ? rows.map(({ slug }) => ({ slug })) : [{ slug: "chua-co-bai-viet" }];
}

export async function generateMetadata({ params }: PageProps<"/tin-tuc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary ?? undefined,
    alternates: { canonical: `/tin-tuc/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary ?? undefined,
      publishedTime: article.published_at,
      images: article.thumbnail_url ? [article.thumbnail_url] : undefined,
    },
  };
}

// Listed slugs are prerendered in full; a slug published after the build shows (public)/loading.tsx on
// first visit. A second Suspense boundary here made the browser paint its fallback first (CLS 0.57), so
// client navigations into an article wait for it instead of validating as instant.
export const instant = false;

export default async function ArticlePage({ params }: PageProps<"/tin-tuc/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const [related, school] = await Promise.all([getRelatedNews(article.category, slug), getSchoolInfo()]);
  const { html, toc } = withHeadingIds(sanitizeHtml(article.content));
  const url = `${siteUrl}/tin-tuc/${slug}`;
  const category = newsCategories[article.category];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.summary ?? undefined,
          image: article.thumbnail_url ? [article.thumbnail_url] : undefined,
          datePublished: article.published_at,
          dateModified: article.updated_at,
          author: { "@type": "Organization", name: article.author_name ?? school.name },
          publisher: { "@type": "EducationalOrganization", name: school.name },
          mainEntityOfPage: url,
        }}
      />
      <PageHeader title={article.title} crumbs={[{ href: "/tin-tuc", label: "Tin tức" }, { href: `/tin-tuc?chuyen-muc=${article.category}`, label: category }]}>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            Đăng ngày <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
          </span>
          {article.author_name && <span>{article.author_name}</span>}
          <span className="inline-flex items-center gap-1">
            <Eye aria-hidden className="size-4" /> {article.views_count} lượt xem
          </span>
        </p>
      </PageHeader>
      <ViewCounter slug={slug} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_18rem]">
        {toc.length > 1 && (
          <aside className="lg:order-last">
            <nav aria-labelledby="toc-heading" className="rounded-xl border bg-card p-5 lg:sticky lg:top-24">
              <h2 id="toc-heading" className="font-semibold">
                Mục lục
              </h2>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
                    <a href={`#${item.id}`} className="hover:text-primary hover:underline">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
        <article className="min-w-0">
          {article.thumbnail_url && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-xl bg-secondary">
              <Image src={article.thumbnail_url} alt="" fill fetchPriority="high" loading="eager" sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            </div>
          )}
          {article.summary && <p className="mb-6 text-xl leading-relaxed font-medium">{article.summary}</p>}
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="mt-10 border-t pt-6">
            <ShareButtons url={url} title={article.title} />
          </div>
        </article>

      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 id="related-heading" className="font-heading text-2xl font-bold text-primary">
              Bài liên quan
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a: Parameters<typeof NewsCard>[0]["article"] & { id: string }) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
