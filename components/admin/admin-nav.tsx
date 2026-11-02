"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "cn";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/admin/dashboard", label: "Tổng quan" },
  { href: "/admin/articles", label: "Tin tức & Thông báo" },
  { href: "/admin/pages", label: "Trang tĩnh" },
  { href: "/admin/hero", label: "Banner trang chủ" },
  { href: "/admin/admissions", label: "Tuyển sinh" },
  { href: "/admin/inquiries", label: "Đăng ký tư vấn" },
  { href: "/admin/faculty", label: "Đội ngũ" },
  { href: "/admin/clubs", label: "Câu lạc bộ" },
  { href: "/admin/media", label: "Thư viện ảnh" },
  { href: "/admin/documents", label: "Tài liệu" },
  { href: "/admin/messages", label: "Thư liên hệ" },
  { href: "/admin/school-settings", label: "Thông tin trường" },
  { href: "/admin/account", label: "Tài khoản & bảo mật" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav aria-label="Menu quản trị" className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-white/10",
              active && "bg-white/15 text-white shadow-[inset_3px_0_0_var(--brand-gold)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <div className="flex shrink-0 gap-1 lg:mt-4 lg:flex-col lg:border-t lg:border-white/15 lg:pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap hover:bg-white/10">
          <ExternalLink aria-hidden className="size-4" /> Xem website<span className="sr-only"> (mở trong tab mới)</span>
        </Link>
        <Button
          variant="ghost"
          className="justify-start px-3 text-sm text-white hover:bg-white/10 hover:text-white"
          onClick={async () => {
            await createClient().auth.signOut();
            router.replace("/admin/login");
            router.refresh();
          }}
        >
          <LogOut /> Đăng xuất
        </Button>
      </div>
    </nav>
  );
}
