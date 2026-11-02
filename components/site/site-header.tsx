import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Mail, Phone, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DesktopNav, MobileNav } from "@/components/site/main-nav";
import { getSchoolInfo } from "@/lib/data";

export async function SiteHeader() {
  const school = await getSchoolInfo();
  const hotline: string = school.hotline ?? school.phone;

  return (
    <>
      <div className="hidden bg-primary text-sm text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-6">
            <a href={`tel:${hotline.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 hover:underline">
              <Phone aria-hidden className="size-4" />
              Hotline: {hotline}
            </a>
            <a href={`mailto:${school.email}`} className="inline-flex items-center gap-1.5 hover:underline">
              <Mail aria-hidden className="size-4" />
              {school.email}
            </a>
          </div>
          <div className="flex items-center gap-6">
            {school.facebook_url && (
              <a href={school.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Facebook<span className="sr-only"> (mở trong tab mới)</span>
              </a>
            )}
            {school.youtube_url && (
              <a href={school.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                YouTube<span className="sr-only"> (mở trong tab mới)</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:h-20">
          <Link href="/" className="mr-auto flex min-w-0 items-center gap-3">
            {school.logo_url ? (
              <Image src={school.logo_url} alt="" width={48} height={48} className="size-10 shrink-0 object-contain lg:size-12" />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground lg:size-12">
                <GraduationCap aria-hidden className="size-6" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-heading text-base font-bold text-primary lg:text-lg">
                {school.short_name ?? school.name}
              </span>
              {school.slogan && (
                <span className="hidden truncate text-xs text-muted-foreground sm:block">{school.slogan}</span>
              )}
            </span>
          </Link>
          <DesktopNav />
          <Link href="/tim-kiem" aria-label="Tìm kiếm" className={buttonVariants({ variant: "ghost", size: "icon", className: "size-11" })}>
            <Search className="size-5" />
          </Link>
          <Link href="/admin/login" className={buttonVariants({ variant: "outline", className: "hidden lg:inline-flex" })}>
            Đăng nhập
          </Link>
          <MobileNav hotline={hotline} />
        </div>
      </header>
    </>
  );
}
