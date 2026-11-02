"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createContext, useActionState, useContext, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { FileUp, ImageUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/admin";
import { acceptFor, uploadFile, type Bucket } from "@/lib/upload";

const StateContext = createContext<ActionState>(null);
const inputClass = "mt-1.5 h-10 bg-card";
const boxClass =
  "mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

// Submits through onSubmit (not the form `action` prop) so React does not reset the fields:
// a failed save keeps everything the admin typed.
export function AdminForm({
  action,
  children,
  submitLabel = "Lưu",
  redirectTo,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  redirectTo?: (id: string) => string;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    (state.ok ? toast.success : toast.error)(state.message);
    if (state.ok && state.id && redirectTo) router.push(redirectTo(state.id));
  }, [state, redirectTo, router]);

  return (
    <StateContext value={state}>
      <form
        noValidate
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => dispatch(data));
        }}
      >
        {children}
        <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t bg-background/95 px-1 py-3">
          <Button type="submit" disabled={pending} className="h-10 px-5">
            {pending ? "Đang lưu…" : submitLabel}
          </Button>
          {state && !state.ok && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {state.message}
            </p>
          )}
        </div>
      </form>
    </StateContext>
  );
}

function useFieldError(name: string) {
  const error = useContext(StateContext)?.errors?.[name];
  return { error, aria: { "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${name}-error` : undefined } };
}

function Label({ name, label, hint, error }: { name: string; label: string; hint?: string; error?: string }) {
  return (
    <>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <ErrorText name={name} error={error} />}
    </>
  );
}

function ErrorText({ name, error }: { name: string; error: string }) {
  return (
    <p id={`${name}-error`} className="mt-1 text-sm font-medium text-destructive">
      {error}
    </p>
  );
}

type FieldProps = { name: string; label: string; hint?: string } & Omit<React.ComponentProps<"input">, "name">;

export function Field({ name, label, hint, ...props }: FieldProps) {
  const { error, aria } = useFieldError(name);
  return (
    <div>
      <Label name={name} label={label} hint={hint} />
      <Input id={name} name={name} {...aria} {...props} className={`${inputClass} ${props.className ?? ""}`} />
      {error && <ErrorText name={name} error={error} />}
    </div>
  );
}

export function TextArea({ name, label, hint, rows = 4, ...props }: { name: string; label: string; hint?: string; rows?: number } & Omit<React.ComponentProps<"textarea">, "name">) {
  const { error, aria } = useFieldError(name);
  return (
    <div>
      <Label name={name} label={label} hint={hint} />
      <textarea id={name} name={name} rows={rows} {...aria} {...props} className={boxClass} />
      {error && <ErrorText name={name} error={error} />}
    </div>
  );
}

export function SelectField({ name, label, options, ...props }: { name: string; label: string; options: Record<string, string> } & Omit<React.ComponentProps<"select">, "name">) {
  const { error, aria } = useFieldError(name);
  return (
    <div>
      <Label name={name} label={label} />
      <select id={name} name={name} {...aria} {...props} className={`${boxClass} h-10 py-0`}>
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      {error && <ErrorText name={name} error={error} />}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-10 items-center gap-3 text-sm font-medium">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-primary" />
      {label}
    </label>
  );
}

// Uploads straight to Storage with the admin's session (bucket policy: admins only) and
// submits the resulting public URL in a hidden input.
export function UploadField({
  name,
  label,
  bucket,
  defaultValue,
  onUploaded,
}: {
  name: string;
  label: string;
  bucket: Bucket;
  defaultValue?: string | null;
  onUploaded?: (info: { size: number; ext: string; fileName: string }) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { error, aria } = useFieldError(name);
  const isImage = bucket === "school-media";

  return (
    <div>
      <p id={`${name}-label`} className="text-sm font-medium">
        {label}
      </p>
      <p className="text-xs text-muted-foreground">{isImage ? "JPG, PNG, WebP; ảnh được nén còn ≤ 5 MB." : "PDF, Word, Excel tối đa 20 MB."}</p>
      <input type="hidden" name={name} value={url} />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {url &&
          (isImage ? (
            <Image src={url} alt="Ảnh đã chọn" width={160} height={90} className="h-20 w-auto rounded-md border object-cover" />
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="max-w-xs truncate text-sm text-primary underline">
              {decodeURIComponent(url.split("/").pop() ?? "")}
            </a>
          ))}
        <input
          ref={fileRef}
          type="file"
          accept={acceptFor(bucket)}
          aria-labelledby={`${name}-label`}
          {...aria}
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            try {
              const result = await uploadFile(file, bucket);
              setUrl(result.url);
              onUploaded?.({ size: result.size, ext: result.ext, fileName: file.name });
              toast.success("Đã tải lên.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Tải lên không thành công.");
            } finally {
              setBusy(false);
            }
          }}
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
          {isImage ? <ImageUp /> : <FileUp />}
          {busy ? "Đang tải lên…" : url ? "Thay file" : "Chọn file"}
        </Button>
        {url && (
          <Button type="button" variant="ghost" onClick={() => setUrl("")}>
            <X /> Bỏ
          </Button>
        )}
      </div>
      {error && <ErrorText name={name} error={error} />}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border bg-card p-5">
      <legend className="px-1 font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
