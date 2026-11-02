import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/gioi-thieu",
  "/tin-tuc",
  "/tin-tuc?chuyen-muc=thong-bao",
  "/tin-tuc/thong-bao-ke-hoach-tuyen-sinh-lop-10-2025-2026",
  "/tuyen-sinh",
  "/doi-ngu",
  "/cau-lac-bo",
  "/thu-vien-anh",
  "/tai-lieu",
  "/lien-he",
  "/hoi-dap",
  "/chinh-sach-bao-mat",
  "/tim-kiem?q=tuyen%20sinh",
  "/admin/login",
];

for (const path of routes) {
  test(`${path} loads, fits the screen and has no serious axe issues`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    // Cross-origin frames (Google Maps, Turnstile) are outside our control
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude("iframe").analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}

test("unknown pages return 404 with the site menu", async ({ page }) => {
  expect((await page.goto("/khong-ton-tai"))?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("pages share a default preview image", async ({ page, request }) => {
  await page.goto("/gioi-thieu");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  const res = await request.get(new URL(og!).pathname);
  expect(res.headers()["content-type"]).toBe("image/png");
});

test("phones get a fixed call / admissions bar", async ({ page, isMobile }) => {
  await page.goto("/gioi-thieu");
  const bar = page.getByRole("navigation", { name: "Liên hệ nhanh" });
  if (isMobile) {
    await expect(bar.getByRole("link", { name: "Gọi hotline" })).toHaveAttribute("href", /^tel:/);
    await expect(bar.getByRole("link", { name: "Đăng ký tư vấn" })).toBeVisible();
  } else {
    await expect(bar).toBeHidden();
  }
});

test("search matches without diacritics", async ({ page }) => {
  await page.goto("/tim-kiem?q=tuyen%20sinh");
  await expect(page.getByRole("main").getByRole("link", { name: /tuyển sinh/i }).first()).toBeVisible();
});

test("first Tab reaches the skip link", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Bỏ qua, đến nội dung chính" })).toBeFocused();
});

test("hero carousel can be paused", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /tạm dừng/i })).toBeVisible();
});

test("structured data, RSS and sitemap are served", async ({ page, request }) => {
  await page.goto("/tin-tuc/thong-bao-ke-hoach-tuyen-sinh-lop-10-2025-2026");
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent!)["@type"]));
  expect(types).toEqual(expect.arrayContaining(["NewsArticle", "BreadcrumbList"]));
  const rss = await request.get("/rss.xml");
  expect(rss.headers()["content-type"]).toContain("xml");
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/thu-vien-anh");
});

test("every gallery photo has alt text", async ({ page }) => {
  await page.goto("/thu-vien-anh");
  const alts = await page.getByRole("main").locator("li img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt") ?? ""));
  expect(alts.length).toBeGreaterThan(0);
  expect(alts.filter((a) => !a.trim())).toEqual([]);
});
