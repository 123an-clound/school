"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { submitContact, submitInquiry, type FormState } from "@/app/(public)/actions";
import { Turnstile } from "@/components/site/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FieldProps = {
  name: string;
  label: string;
  state: FormState;
  required?: boolean;
  textarea?: boolean;
} & React.ComponentProps<"input">;

function Field({ name, label, state, required, textarea, ...props }: FieldProps) {
  const error = state?.errors?.[name];
  const describedBy = error ? `${name}-error` : undefined;
  const shared = {
    id: name,
    name,
    required,
    defaultValue: state?.values?.[name],
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };
  return (
    <div>
      <label htmlFor={name} className="block font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : <span className="font-normal text-muted-foreground"> (không bắt buộc)</span>}
      </label>
      {textarea ? (
        <textarea
          {...shared}
          rows={4}
          maxLength={props.maxLength}
          className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />
      ) : (
        <Input {...shared} {...props} className="mt-1.5 h-11 bg-card" />
      )}
      {error && (
        <p id={describedBy} className="mt-1 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function useToast(state: FormState) {
  useEffect(() => {
    if (state) (state.ok ? toast.success : toast.error)(state.message);
  }, [state]);
}

function Consent({ state }: { state: FormState }) {
  const error = state?.errors?.consent;
  return (
    <div>
      <div className="flex items-start gap-3">
        {/* Never pre-checked: silence is not consent (NĐ 356/2025); only restored after a failed attempt */}
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          defaultChecked={state?.values?.consent === "on"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-error" : undefined}
          className="mt-1 size-5 shrink-0 accent-primary"
        />
        <label htmlFor="consent">
          Tôi đồng ý để nhà trường xử lý thông tin trên nhằm liên hệ, phản hồi, theo{" "}
          <Link href="/chinh-sach-bao-mat" className="font-medium text-primary underline">
            Chính sách bảo mật
          </Link>
          . <span className="text-destructive">*</span>
        </label>
      </div>
      {error && (
        <p id="consent-error" className="mt-1 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// Off-screen field that people never see or reach; bots tend to fill it
function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function Footer({ state, pending, label }: { state: FormState; pending: boolean; label: string }) {
  return (
    <>
      {/* Remounted with the form after every attempt: Turnstile tokens are single-use */}
      <Turnstile />
      {/* Success has its own panel; only failures are shown next to the button */}
      <p role="status" className="font-medium text-destructive">
        {state && !state.ok ? state.message : ""}
      </p>
      <Button type="submit" disabled={pending} className="h-11 px-6 text-base">
        {pending ? "Đang gửi…" : label}
      </Button>
    </>
  );
}

// Thank-you state with next steps; replaces the form until the visitor chooses to send another
function Success({ title, message, links, again, onAgain }: { title: string; message: string; links: { href: string; label: string }[]; again: string; onAgain: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} aria-labelledby="form-success" className="rounded-xl border border-primary/25 bg-secondary p-6 outline-none">
      <h3 id="form-success" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
        <CircleCheck aria-hidden className="size-6 shrink-0" /> {title}
      </h3>
      <p className="mt-2">{message}</p>
      <p className="mt-4 font-medium">Trong lúc chờ, bạn có thể:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="font-medium text-primary underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" className="mt-5 h-11 px-5 text-base" onClick={onAgain}>
        {again}
      </Button>
    </div>
  );
}

export function InquiryForm() {
  const [state, action, pending] = useActionState(submitInquiry, null);
  const [sendAgainAt, setSendAgainAt] = useState<number>();
  useToast(state);
  if (state?.ok && state.at !== sendAgainAt)
    return (
      <Success
        title="Đã nhận đăng ký tư vấn"
        message={state.message}
        again="Gửi đăng ký khác"
        onAgain={() => setSendAgainAt(state.at)}
        links={[
          { href: "/tuyen-sinh", label: "Xem kế hoạch, chỉ tiêu và điểm chuẩn các năm" },
          { href: "/tai-lieu?loai=tuyen-sinh", label: "Tải biểu mẫu, danh sách tuyển sinh" },
          { href: "/hoi-dap", label: "Đọc các câu hỏi thường gặp" },
        ]}
      />
    );
  return (
    // New key per response: clears the form after success, restores `values` after a failure
    <form key={state?.at ?? 0} action={action} noValidate className="relative space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="parent_name" label="Họ tên phụ huynh" required maxLength={100} autoComplete="name" state={state} />
        <Field name="student_name" label="Họ tên học sinh" required maxLength={100} state={state} />
        <Field name="phone" label="Số điện thoại" required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} state={state} />
        <Field name="email" label="Email" type="email" autoComplete="email" maxLength={254} state={state} />
      </div>
      <Field name="middle_school" label="Trường THCS đang học" maxLength={200} state={state} />
      <Field name="question" label="Nội dung cần tư vấn" textarea maxLength={2000} state={state} />
      <Consent state={state} />
      <Footer state={state} pending={pending} label="Gửi đăng ký tư vấn" />
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, null);
  const [sendAgainAt, setSendAgainAt] = useState<number>();
  useToast(state);
  if (state?.ok && state.at !== sendAgainAt)
    return (
      <Success
        title="Đã gửi thư đến nhà trường"
        message={state.message}
        again="Gửi thư khác"
        onAgain={() => setSendAgainAt(state.at)}
        links={[
          { href: "/hoi-dap", label: "Đọc các câu hỏi thường gặp" },
          { href: "/tin-tuc?chuyen-muc=thong-bao", label: "Xem thông báo mới của nhà trường" },
        ]}
      />
    );
  return (
    <form key={state?.at ?? 0} action={action} noValidate className="relative space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="full_name" label="Họ tên" required maxLength={100} autoComplete="name" state={state} />
        <Field name="email" label="Email" required type="email" autoComplete="email" maxLength={254} state={state} />
        <Field name="phone" label="Số điện thoại" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} state={state} />
        <Field name="subject" label="Tiêu đề" required maxLength={200} state={state} />
      </div>
      <Field name="message" label="Nội dung" required textarea maxLength={5000} state={state} />
      <Consent state={state} />
      <Footer state={state} pending={pending} label="Gửi thư" />
    </form>
  );
}
