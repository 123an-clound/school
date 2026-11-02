// "Tuyển sinh lớp 10 – Đợt 1" -> "tuyen-sinh-lop-10-dot-1". đ/Đ has no NFD decomposition, so map it by hand.
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// First free slug among base, base-2, base-3… (`taken` = slugs already used by other rows).
export function nextFreeSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) if (!used.has(`${base}-${n}`)) return `${base}-${n}`;
}
