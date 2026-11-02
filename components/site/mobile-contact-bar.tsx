import Link from "next/link";
import { MessageSquareText, Phone } from "lucide-react";
import { getSchoolInfo } from "@/lib/data";

// Always-visible call / admissions actions on phones; the spacer keeps it from covering the footer.
export async function MobileContactBar() {
  "use cache";
  const school = await getSchoolInfo();
  const hotline: string = school.hotline ?? school.phone;
  return (
    <>
      <div aria-hidden className="h-16 lg:hidden" />
      <nav
        aria-label="Liên hệ nhanh"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-card/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgb(15_44_89/0.08)] backdrop-blur lg:hidden"
      >
        <a
          href={`tel:${hotline.replace(/[^\d+]/g, "")}`}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-primary/20 font-semibold text-primary"
        >
          <Phone aria-hidden className="size-5" /> Gọi hotline
        </a>
        <Link
          href="/tuyen-sinh#dang-ky-tu-van"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-gold font-semibold text-primary"
        >
          <MessageSquareText aria-hidden className="size-5" /> Đăng ký tư vấn
        </Link>
      </nav>
    </>
  );
}
