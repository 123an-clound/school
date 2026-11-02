import { z } from "zod";

// Admin form schemas. Limits mirror supabase/migrations; URLs follow CLAUDE.md rule 7 (https:// or an internal path).
const required = "Vui lòng nhập thông tin này";
const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const text = (max = 500) => z.string(required).trim().min(1, required).max(max, `Tối đa ${max} ký tự`);
export const optional = (max = 500) => z.preprocess(blank, z.string().trim().max(max, `Tối đa ${max} ký tự`).nullable().default(null));
const urlRule = z
  .string()
  .trim()
  .regex(/^(\/(?!\/)|https:\/\/)\S*$/, "Chỉ nhận đường dẫn bắt đầu bằng https:// hoặc /");
export const optionalUrl = z.preprocess(blank, urlRule.max(2000).nullable().default(null));
export const httpsUrl = z.string(required).trim().regex(/^https:\/\/\S+$/, "Cần đường dẫn https://");
export const optionalHttpsUrl = z.preprocess(blank, httpsUrl.nullable().default(null));
export const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
export const int = (min = 0) => z.coerce.number("Cần nhập số").int("Cần số nguyên").min(min, `Tối thiểu ${min}`);
export const optionalDate = z.preprocess(blank, z.iso.date("Ngày không hợp lệ").nullable().default(null));
// <input type="datetime-local"> has no zone; the school is always in UTC+7 (no DST)
export const vnDateTime = z
  .string(required)
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Thời gian không hợp lệ")
  .transform((s) => new Date(`${s}:00+07:00`).toISOString());

export const schoolInfoSchema = z.object({
  name: text(200),
  short_name: optional(100),
  slogan: optional(300),
  address: text(300),
  phone: text(30),
  hotline: optional(30),
  email: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.email("Email không hợp lệ")),
  facebook_url: optionalHttpsUrl,
  youtube_url: optionalHttpsUrl,
  score_lookup_url: optionalHttpsUrl,
  education_department_url: optionalHttpsUrl,
  map_embed_url: z.preprocess(
    blank,
    z.string().trim().startsWith("https://www.google.com/maps/embed", "Chỉ nhận link nhúng Google Maps (https://www.google.com/maps/embed…)").nullable().default(null)
  ),
  logo_url: optionalHttpsUrl,
  favicon_url: optionalHttpsUrl,
  principal_name: optional(100),
  principal_title: optional(100),
  principal_message: optional(5000),
  principal_avatar_url: optionalHttpsUrl,
  established_year: z.preprocess(blank, z.coerce.number().int().min(1800).max(2100).nullable().default(null)),
  graduation_rate: optional(20),
  university_rate: optional(20),
  national_awards: optional(20),
});

export const heroSlideSchema = z.object({
  title: text(200),
  subtitle: optional(300),
  image_url: httpsUrl,
  cta_label: optional(60),
  cta_href: optionalUrl,
  sort_order: int(),
  is_active: checkbox,
});

export const newsCategoryKeys = ["thong-bao", "tin-nha-truong", "hoat-dong-doan-clb", "tuyen-sinh", "giao-duc-dao-tao", "lay-y-kien"] as const;

export const articleSchema = z.object({
  title: text(300),
  slug: z.preprocess(blank, z.string().trim().max(200).nullable().default(null)),
  summary: optional(500),
  content: z.string().max(200_000, "Nội dung quá dài"),
  category: z.enum(newsCategoryKeys, "Chọn chuyên mục"),
  thumbnail_url: optionalHttpsUrl,
  is_featured: checkbox,
  is_pinned: checkbox,
  status: z.enum(["draft", "published"]),
  published_at: vnDateTime,
  author_name: optional(100),
});

export const pageSchema = z.object({ title: text(200), content: z.string().max(200_000, "Nội dung quá dài") });

export const facultySchema = z.object({
  full_name: text(100),
  position: text(100),
  department: text(100),
  degree: optional(200),
  email: z.preprocess(blank, z.email("Email không hợp lệ").nullable().default(null)),
  phone: optional(30),
  bio: optional(1000),
  avatar_url: optionalHttpsUrl,
  order_index: int(),
  is_leadership: checkbox,
});

export const documentCategoryKeys = ["cong-khai", "ke-hoach-tuan", "thoi-khoa-bieu", "bieu-mau-hoc-sinh", "van-ban-phap-quy", "tuyen-sinh", "nien-giam", "tai-nguyen-so"] as const;

export const documentSchema = z.object({
  title: text(300),
  code_number: optional(100),
  category: z.enum(documentCategoryKeys, "Chọn loại tài liệu"),
  file_url: httpsUrl,
  file_size: optional(20),
  file_type: optional(10),
  issued_date: optionalDate,
});

const benchmark = z.object({
  year: z.string().regex(/^\d{4}$/, "Năm gồm 4 chữ số"),
  score: z.number().min(0),
  max_score: z.number().positive(),
  note: z.string().max(300).optional(),
});

export const admissionsSchema = z.object({
  academic_year: text(20),
  target_quota: int(),
  admission_criteria: text(3000),
  benchmark_scores: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s || "[]");
      } catch {
        ctx.addIssue({ code: "custom", message: "Dữ liệu điểm chuẩn không hợp lệ" });
        return z.NEVER;
      }
    })
    .pipe(z.array(benchmark, "Dữ liệu điểm chuẩn không hợp lệ").max(10)),
  guide_file_url: optionalHttpsUrl,
  registration_url: optionalHttpsUrl,
  start_date: optionalDate,
  end_date: optionalDate,
  is_active: checkbox,
});

export const clubSchema = z.object({
  name: text(100),
  description: optional(1000),
  image_url: optionalHttpsUrl,
  advisor_name: optional(100),
  sort_order: int(),
});

export const gallerySchema = z.object({
  title: text(200),
  category: z.enum(["khai-giang", "ngoai-khoa", "the-thao", "clb", "tri-an"], "Chọn loại album"),
  event_date: optionalDate,
});

// Server Actions called with plain arguments (not FormData) still validate them
export const idList = z.array(z.uuid()).max(500);
export const newImageUrls = z.array(httpsUrl).min(1).max(50);
export const imageEdits = z.array(z.object({ id: z.uuid(), alt: optional(300) })).max(500);

export const inquiryUpdateSchema = z.object({
  status: z.enum(["pending", "contacted", "resolved"]),
  admin_notes: optional(2000),
});
