import { getHomeNews, getSchoolInfo } from "@/lib/data";

// RSS feed required by TT 37/2020/TT-BGDĐT Điều 12. Built from cached reads, so it is prerendered.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Item = { slug: string; title: string; summary: string | null; published_at: string };

export async function GET() {
  const [school, news] = await Promise.all([getSchoolInfo(), getHomeNews()]);
  const items = (news as Item[])
    .slice()
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .slice(0, 20)
    .map(
      (a) => `<item>
  <title>${esc(a.title)}</title>
  <link>${siteUrl}/tin-tuc/${a.slug}</link>
  <guid isPermaLink="true">${siteUrl}/tin-tuc/${a.slug}</guid>
  <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
  ${a.summary ? `<description>${esc(a.summary)}</description>` : ""}
</item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${esc(school.name)}</title>
  <link>${siteUrl}</link>
  <description>Tin tức và thông báo của ${esc(school.name)}</description>
  <language>vi</language>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
