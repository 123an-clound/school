"use client";

import { AdminForm, Check, Field, FormSection, SelectField, TextArea, UploadField } from "@/components/admin/form";
import { RichEditor } from "@/components/admin/rich-editor";
import { newsCategories } from "@/lib/site";
import { saveArticle } from "./actions";

type Article = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string;
  category?: string;
  thumbnail_url?: string | null;
  is_featured?: boolean;
  is_pinned?: boolean;
  status?: string;
  published_at: string; // datetime-local value in Vietnam time
  author_name?: string | null;
};

export function ArticleForm({ article }: { article: Article }) {
  return (
    <AdminForm action={saveArticle.bind(null, article.id ?? null)} redirectTo={(id) => `/admin/articles/${id}`}>
      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <Field name="title" label="Tiêu đề" defaultValue={article.title} required maxLength={300} />
          <Field name="slug" label="Đường dẫn (slug)" hint="Để trống để tự tạo từ tiêu đề, ví dụ: khai-giang-nam-hoc-moi" defaultValue={article.slug} maxLength={200} />
          <TextArea name="summary" label="Tóm tắt" rows={3} defaultValue={article.summary ?? ""} maxLength={500} />
          <RichEditor name="content" label="Nội dung" defaultValue={article.content ?? ""} />
        </div>
        <div className="space-y-5">
          <FormSection title="Đăng bài">
            <SelectField name="status" label="Trạng thái" defaultValue={article.status ?? "draft"} options={{ draft: "Lưu nháp", published: "Đăng (hoặc hẹn giờ)" }} />
            <Field name="published_at" label="Thời gian đăng (giờ Việt Nam)" hint="Chọn thời điểm trong tương lai để hẹn giờ." type="datetime-local" defaultValue={article.published_at} required />
            <Check name="is_pinned" label="Ghim thông báo" defaultChecked={article.is_pinned} />
            <Check name="is_featured" label="Tin tiêu điểm" defaultChecked={article.is_featured} />
          </FormSection>
          <FormSection title="Phân loại">
            <SelectField name="category" label="Chuyên mục" defaultValue={article.category ?? "thong-bao"} options={newsCategories} />
            <Field name="author_name" label="Người viết / đơn vị" defaultValue={article.author_name ?? "Ban Truyền Thông"} maxLength={100} />
          </FormSection>
          <FormSection title="Ảnh đại diện">
            <UploadField name="thumbnail_url" label="Ảnh đại diện" bucket="school-media" defaultValue={article.thumbnail_url} />
          </FormSection>
        </div>
      </div>
    </AdminForm>
  );
}
