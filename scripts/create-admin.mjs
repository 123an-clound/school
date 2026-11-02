// Creates (or promotes) a CMS admin. Uses the secret key, so run it only on a trusted machine:
//   node --env-file=.env.local scripts/create-admin.mjs <email> [--invite]
// Without --invite: creates a confirmed user with a random 16-character password and prints it once.
// With --invite: sends Supabase's invitation email so the person sets their own password.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [email, flag] = process.argv.slice(2);
if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> [--invite]");
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Existing account (e.g. already invited): reuse it instead of failing
const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw new Error(`listUsers failed: ${listError.message}`);
let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
let password;

if (!user && flag === "--invite") {
  const { data, error } = await db.auth.admin.inviteUserByEmail(email);
  if (error) throw new Error(`invite failed: ${error.message}`);
  user = data.user;
} else if (!user) {
  password = randomBytes(12).toString("base64url"); // 16 chars, above the 12-character minimum
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(`createUser failed: ${error.message}`);
  user = data.user;
}

const { error: adminError } = await db.from("school_admins").upsert({ user_id: user.id });
if (adminError) throw new Error(`school_admins insert failed: ${adminError.message}`);

console.log(`Admin ready: ${email}`);
if (password) console.log(`Temporary password (shown once, change it at /admin/account): ${password}`);
