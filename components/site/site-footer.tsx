import Link from "next/link";
import { getSchoolInfo } from "@/lib/data";

export async function SiteFooter() {
  "use cache";
  const school = await getSchoolInfo();

  const links = [
    { href: "https://moet.gov.vn", label: "Bộ Giáo dục và Đào tạo", external: true },
    school.education_department_url && { href: school.education_department_url, label: "Sở Giáo dục và Đào tạo", external: true },
    school.score_lookup_url && { href: school.score_lookup_url, label: "Tra cứu điểm", external: true },
    { href: "/hoi-dap", label: "Hỏi đáp" },
    { href: "/chinh-sach-bao-mat", label: "Chính sách bảo mật" },
    { href: "/rss.xml", label: "RSS" },
  ].filter(Boolean) as { href: string; label: string; external?: boolean }[];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold">{school.name}</p>
          <dl className="mt-4 space-y-2 text-sm text-white/85">
            <div>
              <dt className="inline font-semibold text-white">Địa chỉ: </dt>
              <dd className="inline">{school.address}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-white">Điện thoại: </dt>
              <dd className="inline">
                <a href={`tel:${school.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{school.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold text-white">Email: </dt>
              <dd className="inline">
                <a href={`mailto:${school.email}`} className="hover:underline">{school.email}</a>
              </dd>
            </div>
          </dl>
        </div>

        <nav aria-label="Liên kết chân trang">
          <p className="font-semibold">Liên kết</p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            {links.map((link) => (
              <li key={link.href}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {link.label}
                    <span className="sr-only"> (mở trong tab mới)</span>
                  </a>
                ) : (
                  <Link href={link.href} className="hover:underline">{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {school.map_embed_url && (
          <div className="md:col-span-2 lg:col-span-1">
            <p className="font-semibold">Bản đồ</p>
            <iframe
              src={school.map_embed_url}
              title={`Bản đồ đường đến ${school.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="mt-4 h-56 w-full rounded-lg border-0"
            />
          </div>
        )}
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-sm text-white/85">
          © {new Date().getFullYear()} {school.name}
        </p>
      </div>
    </footer>
  );
}
