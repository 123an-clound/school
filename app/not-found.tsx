import Link from "next/link";
import PublicLayout from "./(public)/layout";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="grid place-items-center px-4 py-24 text-center">
        <div>
          <p className="font-heading text-6xl font-bold text-primary">404</p>
          <h1 className="mt-4 text-2xl font-semibold">Không tìm thấy trang</h1>
          <p className="mt-2 text-muted-foreground">Trang bạn tìm có thể đã được đổi địa chỉ hoặc không còn tồn tại.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants({ className: "h-11 px-5 text-base" })}>
              Về trang chủ
            </Link>
            <Link href="/tuyen-sinh" className={buttonVariants({ variant: "outline", className: "h-11 px-5 text-base" })}>
              Tuyển sinh lớp 10
            </Link>
            <Link href="/tim-kiem" className={buttonVariants({ variant: "outline", className: "h-11 px-5 text-base" })}>
              Tìm kiếm
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
