import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Tổng quan" };

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const head = { count: "exact" as const, head: true };
  const [articles, notices, views, pending, unread, recent] = await Promise.all([
    supabase.from("news_articles").select("id", head),
    supabase.from("news_articles").select("id", head).eq("category", "thong-bao"),
    supabase.from("news_articles").select("views_count"),
    supabase.from("admission_inquiries").select("id", head).eq("status", "pending"),
    supabase.from("contact_messages").select("id", head).eq("status", "new"),
    supabase.from("news_articles").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);
  const totalViews = (views.data ?? []).reduce((sum: number, r: { views_count: number }) => sum + r.views_count, 0);

  const cards = [
    { label: "Bài viết", value: articles.count ?? 0, href: "/admin/articles" },
    { label: "Thông báo", value: notices.count ?? 0, href: "/admin/articles?cm=thong-bao" },
    { label: "Tổng lượt xem", value: totalViews.toLocaleString("vi-VN"), href: "/admin/articles" },
    { label: "Tư vấn chờ xử lý", value: pending.count ?? 0, href: "/admin/inquiries?tt=pending" },
    { label: "Thư liên hệ mới", value: unread.count ?? 0, href: "/admin/messages" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Tổng quan</h1>
        <Link href="/admin/articles/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Viết bài mới
        </Link>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md">
            <dt className="text-sm text-muted-foreground">{c.label}</dt>
            <dd className="mt-1 font-heading text-3xl font-bold text-primary">{c.value}</dd>
          </Link>
        ))}
      </dl>
      <section aria-labelledby="recent-heading" className="mt-10">
        <h2 id="recent-heading" className="text-lg font-semibold">Bài cập nhật gần đây</h2>
        <ul className="mt-3 divide-y rounded-xl border bg-card">
          {(recent.data ?? []).map((a: { id: string; title: string; status: string; updated_at: string }) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <Link href={`/admin/articles/${a.id}`} className="font-medium hover:text-primary hover:underline">{a.title}</Link>
              <span className="text-sm text-muted-foreground">
                {a.status === "draft" ? "Nháp" : "Đã đăng"} · {formatDateTime(a.updated_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
