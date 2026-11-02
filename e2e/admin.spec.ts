import { expect, test } from "@playwright/test";
import { db, login, toast } from "./helpers";

const email = process.env.E2E_ADMIN_EMAIL ?? "";
const password = process.env.E2E_ADMIN_PASSWORD ?? "";
const tag = `E2E ${Date.now()}`;

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  // Safety net if a test failed half-way; the album delete is checked by its own test
  await db().from("news_articles").delete().like("title", `${tag}%`);
});

test("anonymous visitors are sent to the login page", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("a signed-in user who is not an admin is turned away", async ({ page }) => {
  const userEmail = `e2e-nonadmin-${Date.now()}@example.invalid`;
  const userPassword = `Np-${crypto.randomUUID()}`;
  const { data, error } = await db().auth.admin.createUser({ email: userEmail, password: userPassword, email_confirm: true });
  expect(error).toBeNull();
  try {
    await login(page, userEmail, userPassword);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(/không có quyền/i);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  } finally {
    await db().auth.admin.deleteUser(data.user!.id);
  }
});

test.describe("as admin", () => {
  test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await login(page, email, password);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("a published article shows on the home page and /tin-tuc without a redeploy", async ({ page }) => {
    const title = `${tag} bài viết kiểm thử`;
    await page.goto("/admin/articles/new");
    await page.getByRole("textbox", { name: "Tiêu đề", exact: true }).fill(title);
    await page.getByRole("textbox", { name: "Nội dung" }).fill("Nội dung kiểm thử tự động.");
    await page.getByLabel("Trạng thái").selectOption("published");
    await page.getByRole("button", { name: "Lưu", exact: true }).click();
    await expect(toast(page, /Đã/)).toBeVisible();

    await page.goto("/tin-tuc");
    await expect(page.getByRole("link", { name: title })).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
    await db().from("news_articles").delete().eq("title", title);
  });

  test("drag-and-drop faculty order is saved", async ({ page }) => {
    const { data: before } = await db().from("faculty_members").select("id, order_index");
    try {
      await page.goto("/admin/faculty");
      const rows = page.getByRole("main").getByRole("listitem").filter({ has: page.getByRole("button", { name: /^Đưa .* lên$/ }) });
      // The first link of each row is the member's name
      const names = () => rows.evaluateAll((lis) => lis.map((li) => li.querySelector("a")!.textContent));
      await expect(rows.first()).toBeVisible();
      const initial = await names();
      expect(initial.length).toBeGreaterThan(1);

      await rows.nth(1).locator("[draggable=true]").dragTo(rows.nth(0));
      await expect.poll(async () => (await names()).slice(0, 2)).toEqual([initial[1], initial[0]]);
      await page.getByRole("button", { name: "Lưu thứ tự" }).click();
      await expect(toast(page, "Đã lưu thứ tự.")).toBeVisible();

      await page.reload();
      await expect.poll(async () => (await names()).slice(0, 2)).toEqual([initial[1], initial[0]]);
    } finally {
      await Promise.all((before ?? []).map((m) => db().from("faculty_members").update({ order_index: m.order_index }).eq("id", m.id)));
    }
  });

  test("uploads of the wrong type or size are refused with a message", async ({ page }) => {
    await page.goto("/admin/documents/new");
    await page.waitForLoadState("networkidle"); // a file chosen before hydration fires no React onChange
    const file = page.locator('input[type="file"]');
    await file.setInputFiles({ name: "ghi-chu.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
    await expect(toast(page, "Sai định dạng")).toBeVisible();
    await file.setInputFiles({ name: "lon.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(21 * 1024 * 1024) });
    await expect(toast(page, "File quá lớn")).toBeVisible();
  });

  test("album photos get alt text, and deleting the album removes the files", async ({ page }) => {
    const title = `${tag} album`;
    await page.goto("/admin/media/new");
    await page.getByLabel("Tên album").fill(title);
    await page.getByRole("button", { name: "Tạo album" }).click();
    await expect(page).toHaveURL(/\/admin\/media\/[0-9a-f-]{36}$/);

    const photo = await page.screenshot(); // any real PNG will do
    await page.getByLabel("Chọn ảnh để tải lên").setInputFiles({ name: "anh.png", mimeType: "image/png", buffer: photo });
    await expect(toast(page, "Đã thêm 1 ảnh.")).toBeVisible();
    await page.getByLabel("Mô tả ảnh số 1").fill("Ảnh kiểm thử tự động");
    await page.getByRole("button", { name: "Lưu mô tả và thứ tự ảnh" }).click();
    await expect(toast(page, "Đã lưu ảnh.")).toBeVisible();

    const { data: images } = await db().from("photo_gallery_images").select("image_url, photo_galleries!inner(title)").eq("photo_galleries.title", title);
    const path = images![0].image_url.split("/school-media/")[1];
    expect((await db().storage.from("school-media").list("", { search: path })).data).toHaveLength(1);

    await page.goto("/thu-vien-anh");
    await expect(page.getByRole("img", { name: "Ảnh kiểm thử tự động" })).toBeVisible();

    await page.goto("/admin/media");
    await page.getByRole("button", { name: `Xóa album “${title}” và toàn bộ ảnh` }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Xóa" }).click();
    await expect(toast(page, "Đã xóa album.")).toBeVisible();
    expect((await db().storage.from("school-media").list("", { search: path })).data).toHaveLength(0);
    expect((await db().from("photo_galleries").select("id").eq("title", title)).data).toHaveLength(0);
  });
});
