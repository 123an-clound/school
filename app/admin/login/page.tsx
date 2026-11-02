import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main id="main" className="grid flex-1 place-items-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-primary">Đăng nhập quản trị</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Dành cho cán bộ được nhà trường cấp tài khoản.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
