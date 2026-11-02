import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { PersonAvatar } from "@/components/site/person-avatar";
import { RichText } from "@/components/site/rich-text";
import { getFaculty, getPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Lịch sử, tầm nhìn, sứ mệnh, cơ cấu tổ chức và Ban Giám hiệu nhà trường.",
};

type Member = Awaited<ReturnType<typeof getFaculty>>[number];

export default async function AboutPage() {
  const [page, faculty] = await Promise.all([getPage("gioi-thieu"), getFaculty()]);
  const leaders = faculty.filter((m: Member) => m.is_leadership);

  return (
    <>
      <PageHeader title={page?.title ?? "Giới thiệu"} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {page && <RichText html={page.content} />}

        {/* TT 37/2020/TT-BGDĐT Điều 9.1.a: name, title, phone, email and duties of each leader */}
        <section aria-labelledby="leaders-heading" className="mt-14">
          <h2 id="leaders-heading" className="font-heading text-2xl font-bold text-primary">
            Ban Giám hiệu
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {leaders.map((m: Member) => (
              <li key={m.id} className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <PersonAvatar name={m.full_name} src={m.avatar_url} size={72} />
                <div className="min-w-0">
                  <p className="font-heading text-lg font-bold">{m.full_name}</p>
                  <p className="font-medium text-primary">{m.position}</p>
                  {m.bio && <p className="mt-2 text-muted-foreground">{m.bio}</p>}
                  <div className="mt-3 space-y-1 text-sm">
                    {m.phone && (
                      <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:underline">
                        <Phone aria-hidden className="size-4" /> {m.phone}
                      </a>
                    )}
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="flex items-center gap-2 break-all hover:underline">
                        <Mail aria-hidden className="size-4" /> {m.email}
                      </a>
                    )}
                    {!m.phone && !m.email && <p className="text-muted-foreground">Liên hệ qua văn phòng nhà trường.</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
