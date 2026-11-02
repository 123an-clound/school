import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AccountSecurity } from "./account-security";

export const metadata: Metadata = { title: "Tài khoản & bảo mật" };

export default async function AccountPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-6 font-heading text-2xl font-bold text-primary">Tài khoản & bảo mật</h1>
      <AccountSecurity />
    </>
  );
}
