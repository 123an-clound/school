import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { RichText } from "@/components/site/rich-text";
import { getPage } from "@/lib/data";

// Pages whose whole body is edited in /admin/pages
export async function StaticPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHeader title={page.title} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <RichText html={page.content} />
      </div>
    </>
  );
}
