import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const pages = ["", "/gioi-thieu", "/tin-tuc", "/tuyen-sinh", "/doi-ngu", "/cau-lac-bo", "/thu-vien-anh", "/tai-lieu", "/lien-he", "/hoi-dap", "/chinh-sach-bao-mat"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles: { slug: string; updated_at: string }[] = await getPublishedSlugs();
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}` })),
    ...articles.map((a) => ({ url: `${siteUrl}/tin-tuc/${a.slug}`, lastModified: a.updated_at })),
  ];
}
