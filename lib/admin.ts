import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { connection } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string; errors?: Record<string, string>; id?: string; at: number };
export type ActionState = Result | null;

export const done = (message: string, id?: string): Result => ({ ok: true, message, id, at: Date.now() });
export const failed = (message: string, errors?: Record<string, string>): Result => ({ ok: false, message, errors, at: Date.now() });
export const GENERIC = "Thao tác không thành công. Vui lòng thử lại.";

// The proxy only redirects for UX; every admin page and Server Action calls this.
export async function requireAdmin() {
  // Auth checks compare token expiry with Date.now(); keep them out of (runtime) prefetch prerenders
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");
  // A verified TOTP factor makes aal2 mandatory for the whole session. Passing the token makes Auth
  // look the factors up server-side; without it they come from the cookie, which the user can edit.
  // school_is_admin() enforces the same rule in the database.
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) redirect("/admin/login");
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(token);
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/admin/login?buoc=mfa");
  const { data: isAdmin } = await supabase.rpc("school_is_admin");
  if (!isAdmin) redirect("/admin/login?loi=khong-co-quyen");
  return { supabase, userId: data.claims.sub as string };
}

export function parse<T>(schema: z.ZodType<T>, formData: FormData) {
  const r = schema.safeParse(Object.fromEntries(formData));
  if (r.success) return { data: r.data, error: null };
  const errors = Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
  return { data: null, error: failed("Vui lòng kiểm tra lại các trường được đánh dấu.", errors) };
}

// Public pages cache reads by table name (lib/data.ts); refresh them after a write.
export function refresh(...tables: string[]) {
  tables.forEach((t) => updateTag(t));
  revalidatePath("/admin", "layout");
}

const BUCKETS = ["school-media", "school-documents"];

// Deletes the Storage object behind a public URL (…/object/public/<bucket>/<path>) when it is one of ours.
export async function removeFile(supabase: Awaited<ReturnType<typeof createClient>>, url: string | null | undefined) {
  const match = url?.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match || !BUCKETS.includes(match[1])) return;
  await supabase.storage.from(match[1]).remove([decodeURIComponent(match[2])]);
}

type Db = Awaited<ReturnType<typeof createClient>>;
// Table names are dynamic here; callers pass rows already validated by the zod schema for that table
const untyped = (db: Db) => db as unknown as SupabaseClient;

// Insert (id = null) or update a row; Storage files replaced in `fileFields` are deleted afterwards.
export async function saveRow(db: Db, table: string, id: string | null, row: Record<string, unknown>, fileFields: string[] = []) {
  const t = () => untyped(db).from(table);
  const before = id && fileFields.length ? (await t().select(fileFields.join(",")).eq("id", id).single()).data : null;
  const result = id ? await t().update(row).eq("id", id).select("id").single() : await t().insert(row).select("id").single();
  if (result.error) return null;
  for (const f of fileFields) {
    const old = (before as Record<string, string | null> | null)?.[f];
    if (old && old !== row[f]) await removeFile(db, old);
  }
  return result.data.id as string;
}

// Deletes a row and the Storage files it points to (CLAUDE.md rule 6).
export async function deleteRow(db: Db, table: string, id: string, fileFields: string[] = []) {
  const before = fileFields.length ? (await untyped(db).from(table).select(fileFields.join(",")).eq("id", id).single()).data : null;
  // .select() so a delete that matched nothing does not go on to remove the files
  const { data, error } = await untyped(db).from(table).delete().eq("id", id).select("id");
  if (error || !data?.length) return false;
  for (const f of fileFields) await removeFile(db, (before as Record<string, string | null> | null)?.[f]);
  return true;
}
