-- ==============================================================================
-- HIGH SCHOOL WEB PORTAL & CMS — INITIAL SCHEMA (SUPABASE POSTGRESQL)
-- Source of truth for the data model. Change it with a new migration, not by editing this file
-- after it has been applied.
-- ==============================================================================

-- 0. ADMINS
-- Membership = full CMS access. Rows are created only via service role (invite script / SQL editor):
-- RLS is enabled with no policies, so anon/authenticated can neither read nor write this table.
CREATE TABLE public.school_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE FUNCTION public.school_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (SELECT 1 FROM public.school_admins WHERE user_id = (SELECT auth.uid()));
$$;

CREATE FUNCTION public.school_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- 1. SCHOOL GENERAL SETTINGS & INFO (singleton: the boolean PK allows exactly one row)
CREATE TABLE public.school_info (
    id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
    name TEXT NOT NULL,
    short_name TEXT,
    slogan TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    principal_name TEXT,
    principal_title TEXT DEFAULT 'Hiệu trưởng nhà trường',
    principal_message TEXT,
    principal_avatar_url TEXT,
    established_year INT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    hotline TEXT,
    email TEXT NOT NULL,
    website_url TEXT,
    facebook_url TEXT,
    youtube_url TEXT,
    score_lookup_url TEXT, -- external grade lookup (vnEdu, SMAS...): grades are never stored here
    education_department_url TEXT, -- Sở GD&ĐT link in the footer
    -- Rendered as an iframe src, so only Google Maps embeds are accepted
    map_embed_url TEXT CHECK (map_embed_url LIKE 'https://www.google.com/maps/embed%'),
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.school_info
    FOR EACH ROW EXECUTE FUNCTION public.school_set_updated_at();

-- 2. HOMEPAGE HERO SLIDES
CREATE TABLE public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_label TEXT,
    -- Internal path or https only: blocks javascript: links
    cta_href TEXT CHECK (cta_href ~ '^(/|https://)'),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. NEWS & ANNOUNCEMENTS
CREATE TABLE public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL, -- sanitized HTML (sanitize on the server before saving)
    -- lay-y-kien: public consultation items required by Thông tư 37/2020/TT-BGDĐT Điều 9.5
    category TEXT NOT NULL CHECK (category IN ('thong-bao', 'tin-nha-truong', 'hoat-dong-doan-clb', 'tuyen-sinh', 'giao-duc-dao-tao', 'lay-y-kien')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    thumbnail_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    views_count INT NOT NULL DEFAULT 0,
    author_name TEXT DEFAULT 'Ban Truyền Thông',
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_published ON public.news_articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_news_category ON public.news_articles(category, published_at DESC);
CREATE INDEX idx_news_pinned ON public.news_articles(is_pinned, published_at DESC);

-- Column list excludes views_count so view bumps do not count as edits
CREATE TRIGGER set_updated_at
    BEFORE UPDATE OF title, slug, summary, content, category, status, thumbnail_url,
                     is_featured, is_pinned, author_name, published_at
    ON public.news_articles
    FOR EACH ROW EXECUTE FUNCTION public.school_set_updated_at();

-- Public view counter: the only way anon can change an article
CREATE FUNCTION public.increment_article_view(article_slug TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    UPDATE public.news_articles
    SET views_count = views_count + 1
    WHERE slug = article_slug AND status = 'published' AND published_at <= now();
$$;

-- 4. FACULTY & STAFF MEMBERS
CREATE TABLE public.faculty_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL, -- e.g. "Ban Giám hiệu", "Tổ Toán - Tin", "Tổ Ngữ Văn"...
    avatar_url TEXT,
    degree TEXT, -- e.g. "Thạc sĩ Toán học", "Cử nhân Sư phạm Ngữ Văn"
    email TEXT,
    phone TEXT,
    bio TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_leadership BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_faculty_dept ON public.faculty_members(department);

-- 5. ADMISSIONS SPECIFICATIONS & BENCHMARKS
CREATE TABLE public.admissions_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL UNIQUE, -- e.g. "2025 - 2026"
    target_quota INT NOT NULL,
    admission_criteria TEXT NOT NULL,
    -- [{"year": "2024", "score": 39.5, "max_score": 40, "note": "..."}] — max_score because scales change by year
    benchmark_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    guide_file_url TEXT,
    registration_url TEXT, -- Sở GD&ĐT online registration/results system (TT 37/2020 Điều 9.4)
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.admissions_info
    FOR EACH ROW EXECUTE FUNCTION public.school_set_updated_at();

-- 6. ADMISSION INQUIRIES (personal data of minors' families)
-- No anon policy: the public form inserts through a Server Action (zod + Turnstile + rate limit)
-- using the service role, so the anon key cannot be used to bypass those checks via the REST API.
CREATE TABLE public.admission_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL CHECK (char_length(student_name) BETWEEN 1 AND 100),
    parent_name TEXT NOT NULL CHECK (char_length(parent_name) BETWEEN 1 AND 100),
    phone TEXT NOT NULL CHECK (phone ~ '^[0-9+() .-]{8,20}$'),
    email TEXT CHECK (char_length(email) <= 254),
    middle_school TEXT CHECK (char_length(middle_school) <= 200),
    question TEXT CHECK (char_length(question) <= 2000),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
    admin_notes TEXT,
    consent_at TIMESTAMPTZ NOT NULL, -- when the parent accepted the privacy policy
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CONTACT MESSAGES (/lien-he) — same write path as inquiries
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
    email TEXT NOT NULL CHECK (char_length(email) <= 254),
    phone TEXT CHECK (phone ~ '^[0-9+() .-]{8,20}$'),
    subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
    message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
    consent_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. PHOTO GALLERIES (cover = first image by sort_order)
CREATE TABLE public.photo_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'ngoai-khoa' CHECK (category IN ('khai-giang', 'ngoai-khoa', 'the-thao', 'clb', 'tri-an')),
    event_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.photo_gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID NOT NULL REFERENCES public.photo_galleries(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt TEXT, -- UI falls back to "<gallery title> – ảnh <n>"
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photo_gallery_images_gallery ON public.photo_gallery_images(gallery_id, sort_order);

-- 9. DOCUMENTS & ACADEMIC FORMS
CREATE TABLE public.documents_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    code_number TEXT,
    -- cong-khai: disclosures (TT 09/2024/TT-BGDĐT, keep >= 5 years); tuyen-sinh: candidate lists,
    -- nien-giam: 5-year statistics, tai-nguyen-so: digital resources (TT 37/2020/TT-BGDĐT Điều 9.8-9.10)
    category TEXT NOT NULL CHECK (category IN ('ke-hoach-tuan', 'thoi-khoa-bieu', 'bieu-mau-hoc-sinh', 'van-ban-phap-quy',
                                               'cong-khai', 'tuyen-sinh', 'nien-giam', 'tai-nguyen-so')),
    file_url TEXT NOT NULL,
    file_size TEXT,
    file_type TEXT DEFAULT 'pdf',
    issued_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. CLUBS (homepage "Góc CLB")
CREATE TABLE public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    advisor_name TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. EDITABLE STATIC PAGES (gioi-thieu, chinh-sach-bao-mat, huong-dan-nop-ho-so...)
CREATE TABLE public.site_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '', -- sanitized HTML
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_pages
    FOR EACH ROW EXECUTE FUNCTION public.school_set_updated_at();

-- 12. FULL-TEXT SEARCH (/tim-kiem, TT 37/2020/TT-BGDĐT Điều 12.4): accent-insensitive, so "tuyen sinh"
-- finds "Tuyển sinh". Invoker rights: RLS still hides drafts and scheduled articles from visitors.
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- Definer wrapper: visitor roles may not hold EXECUTE on extension functions. The two-argument
-- unaccent is used because the one-argument form looks the dictionary up via search_path.
CREATE FUNCTION public.school_unaccent(t TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT lower(extensions.unaccent('extensions.unaccent'::regdictionary, t));
$$;

CREATE FUNCTION public.school_search(q TEXT)
RETURNS TABLE (kind TEXT, title TEXT, path TEXT, excerpt TEXT, published_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    WITH term AS (SELECT '%' || public.school_unaccent(trim(q)) || '%' AS t),
    hits AS (
        SELECT 'news'::text AS kind, a.title, '/tin-tuc/' || a.slug AS path, a.summary AS excerpt, a.published_at
        FROM public.news_articles a, term
        WHERE a.status = 'published' AND a.published_at <= now()
          AND public.school_unaccent(a.title || ' ' || coalesce(a.summary, '') || ' ' || a.content) LIKE term.t
        UNION ALL
        SELECT 'page', p.title,
               CASE p.slug WHEN 'huong-dan-nop-ho-so' THEN '/tuyen-sinh' ELSE '/' || p.slug END, NULL, p.updated_at
        FROM public.site_pages p, term
        WHERE public.school_unaccent(p.title || ' ' || p.content) LIKE term.t
        UNION ALL
        SELECT 'document', d.title, d.file_url, d.code_number, d.issued_date::timestamptz
        FROM public.documents_forms d, term
        WHERE public.school_unaccent(d.title || ' ' || coalesce(d.code_number, '')) LIKE term.t
    )
    SELECT * FROM hits ORDER BY published_at DESC NULLS LAST LIMIT 50
$$;

-- ==============================================================================
-- PRIVILEGES (least privilege on top of RLS)
-- Since 2026-10-30 Supabase no longer auto-grants new public tables to the Data API roles, so every
-- grant below is required; the REVOKE only matters on projects that still have the old defaults.
-- Statements name this app's tables explicitly: the project may be shared with another app, whose
-- tables must keep their own privileges (never use ALL TABLES IN SCHEMA here).
-- ==============================================================================

REVOKE ALL ON public.school_admins, public.school_info, public.hero_slides, public.news_articles,
    public.faculty_members, public.admissions_info, public.admission_inquiries, public.contact_messages,
    public.photo_galleries, public.photo_gallery_images, public.documents_forms, public.clubs, public.site_pages
    FROM anon, authenticated;

-- Secret key (service_role, bypasses RLS): public form inserts + admin scripts
GRANT ALL ON public.school_admins, public.school_info, public.hero_slides, public.news_articles,
    public.faculty_members, public.admissions_info, public.admission_inquiries, public.contact_messages,
    public.photo_galleries, public.photo_gallery_images, public.documents_forms, public.clubs, public.site_pages
    TO service_role;

-- Policies call school_is_admin() as the requesting role
GRANT EXECUTE ON FUNCTION public.school_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_article_view(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.school_search(TEXT), public.school_unaccent(TEXT) TO anon, authenticated;

GRANT SELECT ON public.school_info, public.hero_slides, public.news_articles, public.faculty_members,
    public.admissions_info, public.photo_galleries, public.photo_gallery_images, public.documents_forms,
    public.clubs, public.site_pages
    TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.school_info, public.hero_slides, public.news_articles,
    public.faculty_members, public.admissions_info, public.photo_galleries, public.photo_gallery_images,
    public.documents_forms, public.clubs, public.site_pages
    TO authenticated;

GRANT SELECT, UPDATE, DELETE ON public.admission_inquiries, public.contact_messages TO authenticated;

-- ==============================================================================
-- ROW LEVEL SECURITY
-- "authenticated" alone is NOT admin: every write requires public.school_is_admin().
-- ==============================================================================

ALTER TABLE public.school_admins ENABLE ROW LEVEL SECURITY;

-- Public content: anyone reads, admins write
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['school_info', 'hero_slides', 'faculty_members', 'admissions_info',
                             'photo_galleries', 'photo_gallery_images', 'documents_forms', 'clubs', 'site_pages']
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
        EXECUTE format('CREATE POLICY "Admin write" ON public.%I FOR ALL TO authenticated
                        USING ((SELECT public.school_is_admin())) WITH CHECK ((SELECT public.school_is_admin()))', t);
    END LOOP;
END;
$$;

-- Articles: public sees only published, non-scheduled rows; admins see drafts too
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON public.news_articles FOR SELECT TO anon, authenticated
    USING (status = 'published' AND published_at <= now());
CREATE POLICY "Admin write" ON public.news_articles FOR ALL TO authenticated
    USING ((SELECT public.school_is_admin())) WITH CHECK ((SELECT public.school_is_admin()));

-- Personal data: admins only (public inserts go through the service role)
ALTER TABLE public.admission_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON public.admission_inquiries FOR ALL TO authenticated
    USING ((SELECT public.school_is_admin())) WITH CHECK ((SELECT public.school_is_admin()));

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON public.contact_messages FOR ALL TO authenticated
    USING ((SELECT public.school_is_admin())) WITH CHECK ((SELECT public.school_is_admin()));

-- ==============================================================================
-- STORAGE
-- Public buckets serve files by URL without a policy; listing/upload/update/delete is admin-only.
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('school-media', 'school-media', true, 5242880, -- 5 MB, compress on the client first
        ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('school-documents', 'school-documents', true, 20971520, -- 20 MB
        ARRAY['application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
-- No ON CONFLICT: a same-named bucket from another app must fail the migration, not be taken over.

CREATE POLICY "Admin manage school files" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id IN ('school-media', 'school-documents') AND (SELECT public.school_is_admin()))
    WITH CHECK (bucket_id IN ('school-media', 'school-documents') AND (SELECT public.school_is_admin()));
