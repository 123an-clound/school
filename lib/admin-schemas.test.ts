import { describe, expect, it } from "vitest";
import { admissionsSchema, articleSchema, gallerySchema, heroSlideSchema, idList, imageEdits, newImageUrls, optionalUrl, schoolInfoSchema, vnDateTime } from "./admin-schemas";

describe("admin URL rules", () => {
  it("accepts https and internal paths only", () => {
    expect(optionalUrl.parse("/tuyen-sinh")).toBe("/tuyen-sinh");
    expect(optionalUrl.parse("https://moet.gov.vn")).toBe("https://moet.gov.vn");
    expect(optionalUrl.parse("  ")).toBeNull();
    for (const bad of ["javascript:alert(1)", "//evil.example", "http://a.b", "data:text/html,x"]) {
      expect(optionalUrl.safeParse(bad).success).toBe(false);
    }
  });

  it("only takes Google Maps embeds for the map", () => {
    const base = { name: "x", address: "x", phone: "x", email: "a@b.vn" };
    expect(schoolInfoSchema.safeParse({ ...base, map_embed_url: "https://www.google.com/maps/embed?pb=1" }).success).toBe(true);
    expect(schoolInfoSchema.safeParse({ ...base, map_embed_url: "https://evil.example/maps/embed" }).success).toBe(false);
  });
});

describe("admin form parsing", () => {
  it("reads datetime-local input as Vietnam time", () => {
    expect(vnDateTime.parse("2026-11-01T07:00")).toBe("2026-11-01T00:00:00.000Z");
  });

  it("maps checkboxes and drops unknown fields", () => {
    const r = heroSlideSchema.parse({ title: "A", image_url: "https://x.y/a.webp", sort_order: "2", is_active: "on", id: "evil" });
    expect(r).toMatchObject({ title: "A", sort_order: 2, is_active: true, cta_href: null });
    expect(r).not.toHaveProperty("id");
  });

  it("rejects unknown article categories and malformed benchmarks", () => {
    const article = { title: "T", content: "<p>x</p>", category: "spam", status: "draft", published_at: "2026-11-01T07:00" };
    expect(articleSchema.safeParse(article).success).toBe(false);
    const adm = { academic_year: "2026 - 2027", target_quota: "500", admission_criteria: "x" };
    expect(admissionsSchema.safeParse({ ...adm, benchmark_scores: "[{\"year\":\"2025\",\"score\":40,\"max_score\":50}]" }).success).toBe(true);
    expect(admissionsSchema.safeParse({ ...adm, benchmark_scores: "{oops" }).success).toBe(false);
  });
});

describe("gallery and reorder input", () => {
  const id = "3f1e2d4c-5b6a-4789-8abc-def012345678";

  it("only takes known album categories", () => {
    expect(gallerySchema.safeParse({ title: "Khai giảng", category: "khai-giang", event_date: "" }).data).toMatchObject({ event_date: null });
    expect(gallerySchema.safeParse({ title: "x", category: "spam" }).success).toBe(false);
  });

  it("validates ids, image URLs and alt text passed straight to Server Actions", () => {
    expect(idList.safeParse([id]).success).toBe(true);
    expect(idList.safeParse(["1; drop table"]).success).toBe(false);
    expect(newImageUrls.safeParse([]).success).toBe(false);
    expect(newImageUrls.safeParse(["javascript:alert(1)"]).success).toBe(false);
    expect(imageEdits.parse([{ id, alt: "  " }])).toEqual([{ id, alt: null }]);
    expect(imageEdits.safeParse([{ id, alt: "x".repeat(301) }]).success).toBe(false);
  });
});
