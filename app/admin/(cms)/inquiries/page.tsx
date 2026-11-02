import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { deleteInquiry, updateInquiry } from "./actions";
import { InquiryStatusForm } from "./status-form";

export const metadata: Metadata = { title: "Đăng ký tư vấn" };

const statusLabels: Record<string, string> = { pending: "Chờ xử lý", contacted: "Đã liên hệ", resolved: "Đã giải quyết" };

type Inquiry = {
  id: string;
  parent_name: string;
  student_name: string;
  phone: string;
  email: string | null;
  middle_school: string | null;
  question: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export default async function InquiriesAdmin({ searchParams }: PageProps<"/admin/inquiries">) {
  const { supabase } = await requireAdmin();
  const { tt } = await searchParams;
  const status = typeof tt === "string" && tt in statusLabels ? tt : "";
  let query = supabase.from("admission_inquiries").select("*").order("created_at", { ascending: false }).limit(300);
  if (status) query = query.eq("status", status);
  const { data } = await query;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-primary">Đăng ký tư vấn tuyển sinh</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dữ liệu cá nhân của phụ huynh, học sinh: chỉ dùng để tư vấn. Khi gia đình yêu cầu xóa, phản hồi trong 2 ngày làm việc và xóa trong 20 ngày.
      </p>
      <nav aria-label="Lọc trạng thái" className="mt-4 flex flex-wrap gap-2">
        {[["", "Tất cả"], ...Object.entries(statusLabels)].map(([k, v]) => (
          <Link
            key={k}
            href={k ? `/admin/inquiries?tt=${k}` : "/admin/inquiries"}
            aria-current={status === k ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm", status === k ? "border-primary bg-primary text-primary-foreground" : "bg-card")}
          >
            {v}
          </Link>
        ))}
      </nav>
      <ul className="mt-6 space-y-4">
        {(data ?? []).map((r: Inquiry) => (
          <li key={r.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {r.parent_name} <span className="font-normal text-muted-foreground">— phụ huynh em {r.student_name}</span>
                </p>
                <p className="text-sm">
                  <a href={`tel:${r.phone}`} className="font-medium text-primary hover:underline">{r.phone}</a>
                  {r.email && <> · <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></>}
                  {r.middle_school && <> · {r.middle_school}</>}
                </p>
                <p className="text-xs text-muted-foreground">Gửi lúc {formatDateTime(r.created_at)}</p>
              </div>
              <DeleteButton action={deleteInquiry.bind(null, r.id)} what={`đăng ký của ${r.parent_name}`} compact />
            </div>
            {r.question && <p className="mt-3 rounded-lg bg-muted p-3 text-sm whitespace-pre-line">{r.question}</p>}
            <InquiryStatusForm action={updateInquiry.bind(null, r.id)} status={r.status} notes={r.admin_notes ?? ""} labels={statusLabels} />
          </li>
        ))}
      </ul>
      {(data ?? []).length === 0 && <p className="mt-4 text-muted-foreground">Không có đăng ký.</p>}
    </>
  );
}
