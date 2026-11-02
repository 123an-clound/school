import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cn } from "cn";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { getDocuments, getSchoolInfo } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { documentCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tài liệu",
  description: "Biểu mẫu, kế hoạch, thời khóa biểu, văn bản, công khai, niên giám thống kê và tài nguyên số.",
};

type Doc = {
  id: string;
  title: string;
  code_number: string | null;
  category: string;
  file_url: string;
  file_size: string | null;
  file_type: string | null;
  issued_date: string | null;
};

const notes: Record<string, string> = {
  "cong-khai": "Nội dung công khai theo Thông tư 09/2024/TT-BGDĐT, cập nhật trước ngày 30/6 hằng năm và lưu tối thiểu 5 năm.",
  "nien-giam": "Niên giám thống kê 5 năm gần nhất của nhà trường.",
  "tai-nguyen-so": "Học liệu số, bài giảng, sách điện tử của nhà trường.",
};

export default function DocumentsPage(props: PageProps<"/tai-lieu">) {
  return (
    <>
      <PageHeader title="Tài liệu" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Suspense fallback={<p className="min-h-dvh text-muted-foreground">Đang tải tài liệu…</p>}>
          <Documents searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Documents({ searchParams }: Pick<PageProps<"/tai-lieu">, "searchParams">) {
  const { loai } = await searchParams;
  const category = typeof loai === "string" && loai in documentCategories ? loai : undefined;
  const [docs, school] = await Promise.all([getDocuments(category), getSchoolInfo()]);

  return (
    <>
      <nav aria-label="Loại tài liệu">
        <ul className="flex flex-wrap gap-2">
          {[[undefined, "Tất cả"] as const, ...Object.entries(documentCategories)].map(([key, label]) => (
            <li key={key ?? "all"}>
              <Link
                href={key ? `/tai-lieu?loai=${key}` : "/tai-lieu"}
                aria-current={category === key ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                  category === key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {category && notes[category] && <p className="mt-6 text-muted-foreground">{notes[category]}</p>}
      {category === "tai-nguyen-so" && school.education_department_url && (
        <p className="mt-2">
          <a href={school.education_department_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
            Thư viện tài nguyên của Sở GD&ĐT<span className="sr-only"> (mở trong tab mới)</span>
          </a>
        </p>
      )}

      {docs.length > 0 ? (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {docs.map((d: Doc) => (
            <li key={d.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-muted-foreground">
                  {[documentCategories[d.category], d.code_number && `Số: ${d.code_number}`, d.issued_date && `Ngày ${formatDate(d.issued_date)}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <a
                href={d.file_url}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent"
              >
                <FileDown aria-hidden className="size-4" />
                Tải về
                <span className="sr-only"> {d.title}</span>
                {(d.file_type || d.file_size) && (
                  <span className="text-muted-foreground uppercase">({[d.file_type, d.file_size].filter(Boolean).join(", ")})</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-muted-foreground">Chưa có tài liệu trong mục này.</p>
      )}
    </>
  );
}
