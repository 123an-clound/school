"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Enrollment = { factorId: string; qr: string; secret: string };

export function AccountSecurity() {
  const [verified, setVerified] = useState<{ id: string } | null | undefined>(undefined);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    createClient()
      .auth.mfa.listFactors()
      .then(({ data }) => setVerified(data?.totp.find((f) => f.status === "verified") ?? null));
  }, []);

  async function startEnroll() {
    setBusy(true);
    const supabase = createClient();
    // Drop half-finished enrolments so a new QR code can be issued
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all.filter((f) => f.status === "unverified") ?? []) await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Admin ${Date.now()}` });
    setBusy(false);
    if (error || !data) return void toast.error("Không bật được xác thực 2 lớp. Vui lòng thử lại.");
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify(form: FormData) {
    if (!enrollment) return;
    setBusy(true);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code: String(form.get("code") ?? "").trim() });
    setBusy(false);
    if (error) return void toast.error("Mã không đúng hoặc đã hết hạn.");
    toast.success("Đã bật xác thực 2 lớp. Từ lần đăng nhập sau sẽ cần mã từ ứng dụng.");
    setVerified({ id: enrollment.factorId });
    setEnrollment(null);
  }

  async function changePassword(form: FormData) {
    const password = String(form.get("password") ?? "");
    if (password.length < 12) return void toast.error("Mật khẩu cần tối thiểu 12 ký tự.");
    if (password !== form.get("confirm")) return void toast.error("Hai mật khẩu không khớp.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return void toast.error("Không đổi được mật khẩu. Có thể cần đăng nhập lại trước khi đổi.");
    toast.success("Đã đổi mật khẩu.");
  }

  const submit = (fn: (f: FormData) => Promise<void>) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    fn(new FormData(form)).then(() => form.reset());
  };

  return (
    <div className="max-w-xl space-y-8">
      <section aria-labelledby="mfa-heading" className="rounded-xl border bg-card p-5">
        <h2 id="mfa-heading" className="font-semibold">Xác thực 2 lớp (TOTP)</h2>
        {verified === undefined ? (
          <p className="mt-2 text-sm text-muted-foreground">Đang kiểm tra…</p>
        ) : verified ? (
          <p className="mt-2 text-sm">Đã bật. Mỗi lần đăng nhập cần nhập mã 6 số từ ứng dụng xác thực.</p>
        ) : enrollment ? (
          <form onSubmit={submit(verify)} className="mt-3 space-y-3">
            <p className="text-sm">Quét mã bằng Google Authenticator, Microsoft Authenticator… rồi nhập mã 6 số.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URI SVG from Supabase, nothing to optimise */}
            <img src={enrollment.qr} alt="Mã QR để thêm tài khoản vào ứng dụng xác thực" width={180} height={180} className="rounded-md border bg-white p-2" />
            <p className="text-xs break-all text-muted-foreground">Hoặc nhập khóa thủ công: {enrollment.secret}</p>
            <label htmlFor="code" className="block text-sm font-medium">Mã 6 số</label>
            <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className="h-10 w-40 tracking-[0.3em]" />
            <Button type="submit" disabled={busy}>Xác nhận</Button>
          </form>
        ) : (
          <>
            <p className="mt-2 text-sm">Chưa bật. Nên bật để bảo vệ tài khoản quản trị.</p>
            <Button className="mt-3" onClick={startEnroll} disabled={busy}>Bật xác thực 2 lớp</Button>
          </>
        )}
      </section>

      <section aria-labelledby="pw-heading" className="rounded-xl border bg-card p-5">
        <h2 id="pw-heading" className="font-semibold">Đổi mật khẩu</h2>
        <form onSubmit={submit(changePassword)} className="mt-3 space-y-3">
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Mật khẩu mới (tối thiểu 12 ký tự)</label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className="mt-1 h-10" />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium">Nhập lại mật khẩu mới</label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required className="mt-1 h-10" />
          </div>
          <Button type="submit" disabled={busy}>Đổi mật khẩu</Button>
        </form>
      </section>
    </div>
  );
}
