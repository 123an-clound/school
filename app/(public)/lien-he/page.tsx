import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { ContactForm } from "@/components/site/public-forms";
import { getSchoolInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Địa chỉ, điện thoại, email, bản đồ chỉ đường và form gửi thư đến nhà trường.",
};

const tel = (s: string) => `tel:${s.replace(/[^\d+]/g, "")}`;

export default async function ContactPage() {
  const school = await getSchoolInfo();
  return (
    <>
      <PageHeader title="Liên hệ" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[2fr_3fr]">
        <section aria-labelledby="info-heading" className="space-y-6">
          <h2 id="info-heading" className="font-heading text-2xl font-bold text-primary">
            {school.name}
          </h2>
          <ul className="space-y-4 text-lg">
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
              <span>{school.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
              <span>
                Văn phòng: <a href={tel(school.phone)} className="font-medium hover:underline">{school.phone}</a>
                {school.hotline && (
                  <>
                    <br />
                    Hotline: <a href={tel(school.hotline)} className="font-medium hover:underline">{school.hotline}</a>
                  </>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
              <a href={`mailto:${school.email}`} className="font-medium break-all hover:underline">
                {school.email}
              </a>
            </li>
          </ul>
          {/* TT 37/2020/TT-BGDĐT Điều 9.1.b: map and directions */}
          {school.map_embed_url ? (
            <iframe
              src={school.map_embed_url}
              title={`Bản đồ đường đến ${school.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="h-72 w-full rounded-xl border"
            />
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex font-medium text-primary underline"
            >
              Xem chỉ đường trên Google Maps<span className="sr-only"> (mở trong tab mới)</span>
            </a>
          )}
          <p className="text-muted-foreground">
            Câu hỏi thường gặp xem tại trang{" "}
            <Link href="/hoi-dap" className="font-medium text-primary underline">
              Hỏi đáp
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="form-heading" className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 id="form-heading" className="font-heading text-2xl font-bold text-primary">
            Gửi thư cho nhà trường
          </h2>
          <p className="mt-2 mb-6 text-muted-foreground">Thư được chuyển đến văn phòng nhà trường.</p>
          <ContactForm />
        </section>
      </div>
    </>
  );
}
