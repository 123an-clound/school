import { describe, expect, it } from "vitest";
import { nextFreeSlug, slugify } from "./slug";

describe("slugify", () => {
  it("strips Vietnamese diacritics and maps đ/Đ to d", () => {
    expect(slugify("Tuyển sinh lớp 10 – Đợt 1")).toBe("tuyen-sinh-lop-10-dot-1");
    expect(slugify("Đoàn Thanh niên đạt giải")).toBe("doan-thanh-nien-dat-giai");
  });

  it("handles precomposed and decomposed input alike", () => {
    expect(slugify("Khai giảng".normalize("NFC"))).toBe(slugify("Khai giảng".normalize("NFD")));
  });

  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  Thông báo!!! (khẩn) ")).toBe("thong-bao-khan");
    expect(slugify("---")).toBe("");
  });
});

describe("nextFreeSlug", () => {
  it("keeps a free slug and suffixes taken ones", () => {
    expect(nextFreeSlug("khai-giang", [])).toBe("khai-giang");
    expect(nextFreeSlug("khai-giang", ["khai-giang"])).toBe("khai-giang-2");
    expect(nextFreeSlug("khai-giang", ["khai-giang", "khai-giang-2", "khai-giang-3"])).toBe("khai-giang-4");
  });
});
