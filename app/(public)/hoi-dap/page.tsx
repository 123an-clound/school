import type { Metadata } from "next";
import { StaticPage } from "@/components/site/static-page";

export const metadata: Metadata = { title: "Hỏi đáp", description: "Giải đáp các câu hỏi thường gặp của phụ huynh và học sinh." };

export default function FaqPage() {
  return <StaticPage slug="hoi-dap" />;
}
