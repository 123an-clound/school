import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";

type Crumb = { href: string; label: string };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function PageHeader({ title, crumbs = [], children }: { title: string; crumbs?: Crumb[]; children?: React.ReactNode }) {
  const trail = [{ href: "/", label: "Trang chủ" }, ...crumbs];
  return (
    <div className="border-b bg-card">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          // The current page is the last item and, as Google allows, has no URL
          itemListElement: [...trail, { href: undefined, label: title }].map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: c.href && `${siteUrl}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {trail.map((c) => (
              <li key={c.href} className="flex items-center gap-1">
                <Link href={c.href} className="hover:text-primary hover:underline">
                  {c.label}
                </Link>
                <ChevronRight aria-hidden className="size-3.5" />
              </li>
            ))}
            <li aria-current="page" className="font-medium text-foreground">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="mt-3 font-heading text-3xl font-bold text-balance text-primary sm:text-4xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
