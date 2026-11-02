import type { Metadata } from "next";
import { StaticPage } from "@/components/site/static-page";

export const metadata: Metadata = { title: "Chính sách bảo mật", description: "Chính sách bảo vệ dữ liệu cá nhân của nhà trường." };

export default function PrivacyPage() {
  return <StaticPage slug="chinh-sach-bao-mat" />;
}
