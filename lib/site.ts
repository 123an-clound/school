export const mainNav = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/tuyen-sinh", label: "Tuyển sinh" },
  { href: "/cau-lac-bo", label: "Hoạt động CLB" },
  { href: "/doi-ngu", label: "Đội ngũ" },
  { href: "/tai-lieu", label: "Tài liệu" },
  { href: "/lien-he", label: "Liên hệ" },
] as const;

// Keys match the news_articles.category CHECK constraint
export const newsCategories: Record<string, string> = {
  "thong-bao": "Thông báo",
  "tin-nha-truong": "Tin nhà trường",
  "hoat-dong-doan-clb": "Hoạt động Đoàn - CLB",
  "tuyen-sinh": "Tuyển sinh",
  "giao-duc-dao-tao": "Giáo dục - Đào tạo",
  "lay-y-kien": "Lấy ý kiến",
};

// Keys match the documents_forms.category CHECK constraint
export const documentCategories: Record<string, string> = {
  "cong-khai": "Công khai (TT 09/2024)",
  "ke-hoach-tuan": "Kế hoạch",
  "thoi-khoa-bieu": "Thời khóa biểu",
  "bieu-mau-hoc-sinh": "Biểu mẫu",
  "van-ban-phap-quy": "Văn bản",
  "tuyen-sinh": "Tuyển sinh",
  "nien-giam": "Niên giám thống kê",
  "tai-nguyen-so": "Tài nguyên số",
};

// Keys match the photo_galleries.category CHECK constraint
export const galleryCategories: Record<string, string> = {
  "khai-giang": "Khai giảng",
  "ngoai-khoa": "Ngoại khóa",
  "the-thao": "Thể thao",
  clb: "Câu lạc bộ",
  "tri-an": "Tri ân",
};

// Pages editable in /admin/pages; each slug is rendered by a public route
export const editablePages: Record<string, { title: string; path: string }> = {
  "gioi-thieu": { title: "Giới thiệu nhà trường", path: "/gioi-thieu" },
  "chinh-sach-bao-mat": { title: "Chính sách bảo mật dữ liệu cá nhân", path: "/chinh-sach-bao-mat" },
  "hoi-dap": { title: "Hỏi đáp", path: "/hoi-dap" },
  "huong-dan-nop-ho-so": { title: "Hướng dẫn nộp hồ sơ", path: "/tuyen-sinh" },
};
