import sanitize from "sanitize-html";
import { slugify } from "@/lib/slug";

// Allowlist for TipTap output. Applied before saving and again before rendering (stored-XSS defence in depth).
const options: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
    "blockquote", "img", "hr", "code", "pre", "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const { target, ...rest } = attribs;
      return {
        tagName,
        attribs: target === "_blank" ? { ...rest, target, rel: "noopener noreferrer" } : rest,
      };
    },
  },
};

export const sanitizeHtml = (html: string) => sanitize(html, options);

// Adds ids to h2/h3 for the table of contents. Prefixed so a heading can never reuse an id like "main".
export function withHeadingIds(html: string) {
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const seen = new Map<string, number>();
  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    const base = `muc-${slugify(text) || "phan"}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    toc.push({ id, text, level: level === "2" ? 2 : 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { html: out, toc };
}
