import { describe, expect, it } from "vitest";
import { sanitizeHtml, withHeadingIds } from "./sanitize";

describe("sanitizeHtml", () => {
  it("removes scripts, event handlers and javascript: links", () => {
    const dirty = `<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a><img src="https://a.b/c.png" onerror="x()">`;
    expect(sanitizeHtml(dirty)).toBe(`<p>Hi</p><a>x</a><img src="https://a.b/c.png" />`);
  });

  it("forces rel on new-tab links and drops other targets", () => {
    expect(sanitizeHtml(`<a href="https://moet.gov.vn" target="_blank">Bộ</a>`)).toBe(
      `<a href="https://moet.gov.vn" target="_blank" rel="noopener noreferrer">Bộ</a>`
    );
    expect(sanitizeHtml(`<a href="/tin-tuc" target="_top">x</a>`)).toBe(`<a href="/tin-tuc">x</a>`);
  });

  it("rejects non-https images and iframes", () => {
    expect(sanitizeHtml(`<img src="http://a.b/c.png"><iframe src="https://evil"></iframe>`)).toBe(`<img />`);
  });
});

describe("withHeadingIds", () => {
  it("builds a table of contents with unique, prefixed ids", () => {
    const { html, toc } = withHeadingIds("<h2>Lịch sử</h2><p>x</p><h3>Đoàn &amp; Hội</h3><h2>Lịch sử</h2>");
    expect(toc.map((t) => t.id)).toEqual(["muc-lich-su", "muc-doan-hoi", "muc-lich-su-2"]);
    expect(toc[1]).toEqual({ id: "muc-doan-hoi", text: "Đoàn & Hội", level: 3 });
    expect(html).toContain('<h2 id="muc-lich-su-2">Lịch sử</h2>');
  });
});
