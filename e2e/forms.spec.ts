import { expect, test } from "@playwright/test";
import { db, toast, waitForCaptcha } from "./helpers";

// Fake, unique contact details; rows are deleted afterwards
const phone = `09${Date.now().toString().slice(-8)}`;
const email = `e2e-${Date.now()}@example.invalid`;

test.afterAll(async () => {
  await db().from("admission_inquiries").delete().eq("phone", phone);
  await db().from("contact_messages").delete().eq("email", email);
});

test("admission inquiry: validation, success, then duplicate blocked", async ({ page }) => {
  await page.goto("/tuyen-sinh");
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Gửi đăng ký tư vấn" }) });
  const submit = form.getByRole("button", { name: "Gửi đăng ký tư vấn" });

  await waitForCaptcha(page);
  await form.getByLabel("Họ tên phụ huynh").fill("Kiểm thử E2E");
  await form.getByLabel("Họ tên học sinh").fill("Học sinh E2E");
  await form.getByLabel("Số điện thoại").fill("123");
  await submit.click();
  await expect(form.getByText("Vui lòng kiểm tra lại các trường được đánh dấu.")).toBeVisible();
  await expect(form.getByLabel("Số điện thoại")).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator("#consent")).toHaveAttribute("aria-invalid", "true");

  await form.getByLabel("Số điện thoại").fill(phone);
  await form.locator("#consent").check();
  await waitForCaptcha(page);
  await submit.click();
  await expect(toast(page, "Đã gửi đăng ký.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Đã nhận đăng ký tư vấn" })).toBeVisible();

  const { data } = await db().from("admission_inquiries").select("status").eq("phone", phone);
  expect(data).toEqual([{ status: "pending" }]);

  await page.getByRole("button", { name: "Gửi đăng ký khác" }).click();
  await form.getByLabel("Họ tên phụ huynh").fill("Kiểm thử E2E");
  await form.getByLabel("Họ tên học sinh").fill("Học sinh E2E");
  await form.getByLabel("Số điện thoại").fill(phone);
  await form.locator("#consent").check();
  await waitForCaptcha(page);
  await submit.click();
  await expect(toast(page, "Số điện thoại này vừa đăng ký.")).toBeVisible();
  expect((await db().from("admission_inquiries").select("id").eq("phone", phone)).data).toHaveLength(1);
});

test("contact message is stored", async ({ page }) => {
  await page.goto("/lien-he");
  const form = page.locator("form").filter({ has: page.getByLabel("Tiêu đề") });
  await form.getByLabel("Họ tên").fill("Kiểm thử E2E");
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Tiêu đề").fill("Thư kiểm thử");
  await form.getByLabel(/Nội dung/).fill("Nội dung thư kiểm thử tự động.");
  await form.locator("#consent").check();
  await waitForCaptcha(page);
  await form.getByRole("button", { name: /Gửi/ }).click();
  await expect(toast(page, "Đã gửi thư.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Đã gửi thư đến nhà trường" })).toBeVisible();
  expect((await db().from("contact_messages").select("status").eq("email", email)).data).toEqual([{ status: "new" }]);
});
