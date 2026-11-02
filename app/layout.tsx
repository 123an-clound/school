import type { Metadata } from "next";
import { Be_Vietnam_Pro, Merriweather } from "next/font/google";
import { Toaster } from "sonner";
import { getSchoolInfo } from "@/lib/data";
import "./globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const serif = Merriweather({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["700"], // headings only; the variable font is ~170 KB and delayed LCP on mobile
  preload: false, // keeps its ~60 KB off the critical path; headings swap in from a metric-matched fallback
});

// Name, slogan and favicon are edited in /admin/school-settings
export async function generateMetadata(): Promise<Metadata> {
  const school = await getSchoolInfo();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: school.name, template: `%s | ${school.short_name ?? school.name}` },
    description: school.slogan ?? undefined,
    icons: school.favicon_url ? { icon: school.favicon_url } : undefined,
    openGraph: { siteName: school.name, locale: "vi_VN", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
