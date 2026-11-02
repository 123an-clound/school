import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { PersonAvatar } from "@/components/site/person-avatar";
import { getFaculty } from "@/lib/data";
import { slugify } from "@/lib/slug";

export const metadata: Metadata = {
  title: "Đội ngũ",
  description: "Đội ngũ cán bộ, giáo viên theo tổ chuyên môn.",
};

type Member = Awaited<ReturnType<typeof getFaculty>>[number];

export default async function FacultyPage() {
  const faculty: Member[] = await getFaculty();
  // Keep admin-defined order; departments appear in the order of their first member
  const departments = [...new Set(faculty.map((m) => m.department as string))];

  return (
    <>
      <PageHeader title="Đội ngũ" />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
        {departments.map((dept) => (
          <section key={dept} aria-labelledby={`dept-${slugify(dept)}`}>
            <h2 id={`dept-${slugify(dept)}`} className="font-heading text-2xl font-bold text-primary">
              {dept}
            </h2>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {faculty
                .filter((m) => m.department === dept)
                .map((m) => (
                  <li key={m.id} className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
                    <PersonAvatar name={m.full_name} src={m.avatar_url} size={64} />
                    <div className="min-w-0">
                      <p className="font-heading text-lg font-bold">{m.full_name}</p>
                      <p className="font-medium text-primary">{m.position}</p>
                      {m.degree && <p className="text-sm text-muted-foreground">{m.degree}</p>}
                      {m.bio && <p className="mt-2 text-sm">{m.bio}</p>}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        {faculty.length === 0 && <p className="text-muted-foreground">Danh sách đội ngũ đang được cập nhật.</p>}
      </div>
    </>
  );
}
