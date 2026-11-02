"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Turnstile } from "@/components/site/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const DENIED = "Tài khoản này không có quyền quản trị.";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<"password" | "mfa">(params.get("buoc") === "mfa" ? "mfa" : "password");
  const [error, setError] = useState(params.get("loi") === "khong-co-quyen" ? DENIED : "");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0); // remounts Turnstile: tokens are single-use

  async function finish(supabase: ReturnType<typeof createClient>) {
    const { data: isAdmin } = await supabase.rpc("school_is_admin");
    if (!isAdmin) {
      await supabase.auth.signOut();
      setStep("password");
      setError(DENIED);
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  }

  async function onPassword(form: FormData) {
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      // Verified by Supabase Auth when CAPTCHA protection is enabled for the project; never re-verified here
      options: { captchaToken: String(form.get("cf-turnstile-response") ?? "") || undefined },
    });
    if (signInError) {
      setAttempt((n) => n + 1);
      // Same message for unknown email and wrong password
      return setError(signInError.code === "captcha_failed" ? "Chưa xác minh CAPTCHA. Vui lòng thử lại." : "Email hoặc mật khẩu không đúng.");
    }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") return setStep("mfa");
    await finish(supabase);
  }

  async function onCode(form: FormData) {
    const supabase = createClient();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp.find((f) => f.status === "verified");
    if (!factor) return setError("Không tìm thấy thiết bị xác thực. Vui lòng đăng nhập lại.");
    const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: String(form.get("code") ?? "").trim() });
    if (mfaError) return setError("Mã xác thực không đúng hoặc đã hết hạn.");
    await finish(supabase);
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(e.currentTarget);
        try {
          await (step === "password" ? onPassword(data) : onCode(data));
        } catch {
          setError("Không kết nối được máy chủ. Vui lòng thử lại.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {step === "password" ? (
        <>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" autoComplete="username" required className="mt-1.5 h-11" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Mật khẩu
            </label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1.5 h-11" />
          </div>
          <Turnstile key={attempt} />
        </>
      ) : (
        <div>
          <label htmlFor="code" className="block text-sm font-medium">
            Mã 6 số từ ứng dụng xác thực
          </label>
          <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus className="mt-1.5 h-11 tracking-[0.3em]" />
        </div>
      )}
      <p role="alert" className="min-h-5 text-sm font-medium text-destructive">
        {error}
      </p>
      <Button type="submit" disabled={busy} className="h-11 w-full text-base">
        {busy ? "Đang kiểm tra…" : step === "password" ? "Đăng nhập" : "Xác nhận"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/" className="text-muted-foreground hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </form>
  );
}
