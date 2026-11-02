import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";

// Everything under here reads the session, so it renders per request behind this boundary.
export default function CmsLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 text-muted-foreground">Đang kiểm tra phiên đăng nhập…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="bg-primary text-primary-foreground lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <p className="hidden px-6 pt-6 font-heading text-lg font-bold lg:block">Quản trị website</p>
        <AdminNav />
      </aside>
      <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
