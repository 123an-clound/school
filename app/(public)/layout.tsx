import { MobileContactBar } from "@/components/site/mobile-contact-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

// Also wraps app/not-found.tsx so a 404 keeps the site menu
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-card px-4 py-2 font-medium text-primary shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Bỏ qua, đến nội dung chính
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <MobileContactBar />
    </>
  );
}
