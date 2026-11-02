import type { Metadata } from "next";
import { ExternalLink, FileDown } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { InquiryForm } from "@/components/site/public-forms";
import { RichText } from "@/components/site/rich-text";
import { getAdmissions, getDocuments, getPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tuyển sinh lớp 10",
  description: "Kế hoạch, chỉ tiêu, phương thức, điểm chuẩn các năm và đăng ký tư vấn tuyển sinh lớp 10.",
};

type Benchmark = { year: string; score: number; max_score: number; note?: string };
type Doc = { id: string; title: string; file_url: string; issued_date: string | null };

const external = "inline-flex items-center gap-1.5 font-medium text-primary underline underline-offset-2";

export default async function AdmissionsPage() {
  const [info, guide, docs] = await Promise.all([getAdmissions(), getPage("huong-dan-nop-ho-so"), getDocuments("tuyen-sinh")]);
  const benchmarks = ((info?.benchmark_scores ?? []) as Benchmark[]).slice().sort((a, b) => b.year.localeCompare(a.year)).slice(0, 3);

  return (
    <>
      <PageHeader title="Tuyển sinh lớp 10">
        {info && <p className="mt-2 text-lg text-muted-foreground">Năm học {info.academic_year}</p>}
      </PageHeader>
      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10">
        {info ? (
          <>
            <section aria-labelledby="plan-heading">
              <h2 id="plan-heading" className="font-heading text-2xl font-bold text-primary">
                Kế hoạch & chỉ tiêu
              </h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-5">
                  <dt className="text-sm text-muted-foreground">Chỉ tiêu</dt>
                  <dd className="mt-1 font-heading text-3xl font-bold text-primary">{info.target_quota} học sinh</dd>
                </div>
                {info.start_date && (
                  <div className="rounded-xl border bg-card p-5">
                    <dt className="text-sm text-muted-foreground">Bắt đầu nhận hồ sơ</dt>
                    <dd className="mt-1 text-xl font-semibold">{formatDate(info.start_date)}</dd>
                  </div>
                )}
                {info.end_date && (
                  <div className="rounded-xl border bg-card p-5">
                    <dt className="text-sm text-muted-foreground">Hạn cuối</dt>
                    <dd className="mt-1 text-xl font-semibold">{formatDate(info.end_date)}</dd>
                  </div>
                )}
              </dl>
              <h3 className="mt-8 text-lg font-semibold">Phương thức tuyển sinh</h3>
              <p className="mt-2 text-lg leading-relaxed whitespace-pre-line">{info.admission_criteria}</p>
              {info.registration_url && (
                <p className="mt-4">
                  <a href={info.registration_url} target="_blank" rel="noopener noreferrer" className={external}>
                    Đăng ký dự tuyển và tra cứu kết quả trên hệ thống của Sở GD&ĐT <ExternalLink aria-hidden className="size-4" />
                    <span className="sr-only"> (mở trong tab mới)</span>
                  </a>
                </p>
              )}
            </section>

            {benchmarks.length > 0 && (
              <section aria-labelledby="scores-heading">
                <h2 id="scores-heading" className="font-heading text-2xl font-bold text-primary">
                  Điểm chuẩn các năm gần đây
                </h2>
                <p className="mt-2 text-muted-foreground">Thang điểm có thể khác nhau giữa các năm, hãy so sánh theo tỷ lệ trên thang điểm.</p>
                <div className="mt-5 overflow-x-auto rounded-xl border bg-card">
                  <table className="w-full text-left">
                    <caption className="sr-only">Điểm chuẩn tuyển sinh lớp 10 theo năm</caption>
                    <thead className="bg-secondary text-sm">
                      <tr>
                        <th scope="col" className="px-4 py-3">Năm</th>
                        <th scope="col" className="px-4 py-3">Điểm chuẩn</th>
                        <th scope="col" className="px-4 py-3">Thang điểm</th>
                        <th scope="col" className="px-4 py-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {benchmarks.map((b) => (
                        <tr key={b.year}>
                          <th scope="row" className="px-4 py-3 font-semibold">{b.year}</th>
                          <td className="px-4 py-3 font-heading text-lg font-bold text-primary">{b.score}</td>
                          <td className="px-4 py-3">{b.max_score}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Visual summary of the table above, so hidden from assistive tech */}
                <div aria-hidden className="mt-6 space-y-3">
                  {benchmarks.map((b) => (
                    <div key={b.year} className="grid grid-cols-[3.5rem_1fr] items-center gap-3 text-sm">
                      <span className="font-semibold">{b.year}</span>
                      <div className="h-7 rounded-md bg-secondary">
                        <div
                          className="flex h-full items-center justify-end rounded-md bg-primary px-2 font-semibold text-primary-foreground"
                          style={{ width: `${Math.min(100, (b.score / b.max_score) * 100)}%` }}
                        >
                          {b.score}/{b.max_score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Thông tin tuyển sinh năm học mới đang được cập nhật.</p>
        )}

        <section aria-labelledby="guide-heading">
          <h2 id="guide-heading" className="font-heading text-2xl font-bold text-primary">
            Hướng dẫn nộp hồ sơ
          </h2>
          {guide && <RichText html={guide.content} className="mt-4" />}
          {info?.guide_file_url && (
            <p className="mt-4">
              <a href={info.guide_file_url} className={external}>
                <FileDown aria-hidden className="size-4" /> Tải file hướng dẫn (PDF)
              </a>
            </p>
          )}
          {docs.length > 0 && (
            <>
              <h3 className="mt-8 text-lg font-semibold">Danh sách dự tuyển & văn bản tuyển sinh</h3>
              <ul className="mt-3 space-y-2">
                {docs.map((d: Doc) => (
                  <li key={d.id}>
                    <a href={d.file_url} className={external}>
                      <FileDown aria-hidden className="size-4" /> {d.title}
                    </a>
                    {d.issued_date && <span className="ml-2 text-sm text-muted-foreground">({formatDate(d.issued_date)})</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section id="dang-ky-tu-van" aria-labelledby="form-heading" className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 id="form-heading" className="font-heading text-2xl font-bold text-primary">
            Đăng ký nhận tư vấn tuyển sinh
          </h2>
          <p className="mt-2 mb-6 text-muted-foreground">Phụ huynh điền thông tin, nhà trường sẽ gọi lại để tư vấn.</p>
          <InquiryForm />
        </section>
      </div>
    </>
  );
}
