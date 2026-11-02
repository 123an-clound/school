import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";

// Service-role client for test setup/cleanup only (bypasses RLS)
export const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

// Cloudflare's test site key passes at once; wait for the token the widget writes into the form
export async function waitForCaptcha(page: Page) {
  await expect(page.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, { timeout: 20_000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await waitForCaptcha(page);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

export const toast = (page: Page, text: string | RegExp) => page.locator("[data-sonner-toast]").filter({ hasText: text });
