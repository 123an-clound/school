import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { FacultyList } from "./faculty-list";

export const metadata: Metadata = { title: "Đội ngũ" };

export default async function FacultyAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("faculty_members")
    .select("id, full_name, position, department, avatar_url, is_leadership")
    .order("order_index")
    .order("full_name");
  const members = data ?? [];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Đội ngũ</h1>
        <Link href="/admin/faculty/new" className={buttonVariants({ className: "h-10" })}>
          <Plus /> Thêm giáo viên
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Kéo biểu tượng ⋮⋮ hoặc dùng nút mũi tên để sắp xếp, rồi bấm “Lưu thứ tự”. Trang Đội ngũ hiển thị theo thứ tự này.</p>
      <div className="mt-6">
        {/* key: remount after a save or delete so the list starts from the stored order */}
        <FacultyList key={members.map((m) => m.id).join()} members={members} />
      </div>
    </>
  );
}
