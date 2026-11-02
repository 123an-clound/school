-- ==============================================================================
-- RLS / PRIVILEGE SELF-CHECK
-- Run as the postgres role (Supabase SQL editor or psql) after the migrations are applied.
-- Runs in one transaction and rolls back. A failed assertion aborts with its message;
-- success returns 'RLS checks passed'. Not a pgTAP file: do not move it into supabase/tests.
-- ==============================================================================
BEGIN;

-- Fixtures
INSERT INTO auth.users (id, email) VALUES
    ('00000000-0000-0000-0000-0000000000a1', 'rls-admin@test.local'),
    ('00000000-0000-0000-0000-0000000000b2', 'rls-user@test.local'),
    ('00000000-0000-0000-0000-0000000000c3', 'rls-mfa-admin@test.local');
INSERT INTO public.school_admins (user_id) VALUES ('00000000-0000-0000-0000-0000000000a1'), ('00000000-0000-0000-0000-0000000000c3');
-- c3 has enrolled TOTP, so it is only admin in an aal2 session
INSERT INTO auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-0000000000c3', 'rls', 'totp', 'verified', now(), now());
INSERT INTO public.news_articles (title, slug, content, category, status, published_at, updated_at) VALUES
    ('Đã đăng', 'rls-published', '<p>x</p>', 'thong-bao', 'published', now() - INTERVAL '1 hour', now() - INTERVAL '1 hour'),
    ('Hẹn giờ', 'rls-scheduled', '<p>x</p>', 'thong-bao', 'published', now() + INTERVAL '1 day', now());
INSERT INTO public.news_articles (title, slug, content, category) VALUES ('Bản nháp', 'rls-draft', '<p>x</p>', 'thong-bao');
INSERT INTO public.admission_inquiries (student_name, parent_name, phone, consent_at) VALUES ('HS', 'PH', '0900000000', now());
INSERT INTO public.school_info (name, address, phone, email) VALUES ('x', 'x', 'x', 'x') ON CONFLICT (id) DO NOTHING;

-- Constraints
DO $$
BEGIN
    ASSERT NOT has_function_privilege('anon', 'public.school_is_admin()', 'EXECUTE'), 'anon can execute school_is_admin()';
    ASSERT (SELECT status FROM public.news_articles WHERE slug = 'rls-draft') = 'draft', 'articles do not default to draft';
    BEGIN
        INSERT INTO public.school_info (name, address, phone, email) VALUES ('x', 'x', 'x', 'x');
        RAISE EXCEPTION 'school_info accepted a second row';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
    BEGIN
        INSERT INTO public.admission_inquiries (student_name, parent_name, phone, consent_at) VALUES ('x', 'x', '<script>', now());
        RAISE EXCEPTION 'invalid phone accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;
    BEGIN
        INSERT INTO public.hero_slides (title, image_url, cta_href) VALUES ('x', 'x', 'javascript:alert(1)');
        RAISE EXCEPTION 'javascript: link accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;
END;
$$;

-- Anonymous visitor
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', true);
DO $$
BEGIN
    ASSERT NOT EXISTS (SELECT 1 FROM public.news_articles WHERE slug IN ('rls-draft', 'rls-scheduled')), 'anon sees draft/scheduled articles';
    ASSERT EXISTS (SELECT 1 FROM public.news_articles WHERE slug = 'rls-published'), 'anon cannot see published articles';

    ASSERT EXISTS (SELECT 1 FROM public.school_search('DA DANG') WHERE path = '/tin-tuc/rls-published'), 'accent-insensitive search misses "Đã đăng"';
    ASSERT NOT EXISTS (SELECT 1 FROM public.school_search('hen gio') WHERE path = '/tin-tuc/rls-scheduled'), 'search leaks scheduled articles';
    ASSERT NOT EXISTS (SELECT 1 FROM public.school_search('ban nhap') WHERE path = '/tin-tuc/rls-draft'), 'search leaks drafts';

    PERFORM public.increment_article_view('rls-published');
    PERFORM public.increment_article_view('rls-draft');

    BEGIN
        PERFORM 1 FROM public.admission_inquiries;
        RAISE EXCEPTION 'anon can read admission_inquiries';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO public.admission_inquiries (student_name, parent_name, phone, consent_at) VALUES ('x', 'x', '0900000000', now());
        RAISE EXCEPTION 'anon can insert inquiries directly (bypassing Turnstile)';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        UPDATE public.news_articles SET title = 'hacked';
        RAISE EXCEPTION 'anon can update articles';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        PERFORM 1 FROM public.school_admins;
        RAISE EXCEPTION 'anon can read school_admins';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
RESET ROLE;

DO $$
BEGIN
    ASSERT (SELECT views_count FROM public.news_articles WHERE slug = 'rls-published') = 1, 'view counter did not increment';
    ASSERT (SELECT views_count FROM public.news_articles WHERE slug = 'rls-draft') = 0, 'draft view was counted';
    ASSERT (SELECT updated_at FROM public.news_articles WHERE slug = 'rls-published') = now() - INTERVAL '1 hour', 'view bump changed updated_at';
END;
$$;

-- Signed-in user who is NOT an admin (e.g. someone who self-registered)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-0000000000b2", "role": "authenticated"}', true);
DO $$
DECLARE n INT;
BEGIN
    ASSERT NOT (SELECT public.school_is_admin()), 'normal user is admin';
    ASSERT NOT EXISTS (SELECT 1 FROM public.news_articles WHERE slug = 'rls-draft'), 'normal user sees drafts';
    ASSERT NOT EXISTS (SELECT 1 FROM public.admission_inquiries), 'normal user reads inquiries';

    UPDATE public.news_articles SET title = 'hacked';
    GET DIAGNOSTICS n = ROW_COUNT;
    ASSERT n = 0, 'normal user updated articles';
    UPDATE public.school_info SET name = 'hacked';
    GET DIAGNOSTICS n = ROW_COUNT;
    ASSERT n = 0, 'normal user updated school_info';
    DELETE FROM public.faculty_members;
    GET DIAGNOSTICS n = ROW_COUNT;
    ASSERT n = 0, 'normal user deleted faculty';

    BEGIN
        INSERT INTO public.news_articles (title, slug, content, category) VALUES ('x', 'rls-x', 'x', 'thong-bao');
        RAISE EXCEPTION 'normal user inserted an article';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO storage.objects (bucket_id, name) VALUES ('school-media', 'rls-user.png');
        RAISE EXCEPTION 'normal user uploaded to storage';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
RESET ROLE;

-- Admin
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-0000000000a1", "role": "authenticated"}', true);
DO $$
DECLARE n INT;
BEGIN
    ASSERT (SELECT public.school_is_admin()), 'admin is not recognised';
    ASSERT EXISTS (SELECT 1 FROM public.news_articles WHERE slug = 'rls-draft'), 'admin cannot see drafts';
    ASSERT EXISTS (SELECT 1 FROM public.admission_inquiries), 'admin cannot read inquiries';

    UPDATE public.news_articles SET title = 'Đã sửa' WHERE slug = 'rls-published';
    GET DIAGNOSTICS n = ROW_COUNT;
    ASSERT n = 1, 'admin cannot update articles';
    UPDATE public.admission_inquiries SET status = 'contacted';
    GET DIAGNOSTICS n = ROW_COUNT;
    ASSERT n >= 1, 'admin cannot update inquiries';
    INSERT INTO storage.objects (bucket_id, name) VALUES ('school-media', 'rls-admin.png');

    BEGIN
        INSERT INTO public.school_admins (user_id) VALUES ('00000000-0000-0000-0000-0000000000b2');
        RAISE EXCEPTION 'school_admins is writable through the API';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
RESET ROLE;

DO $$
BEGIN
    ASSERT (SELECT updated_at FROM public.news_articles WHERE slug = 'rls-published') = now(), 'edit did not bump updated_at';
END;
$$;

-- Admin with MFA enrolled: a password-only (aal1) token must not grant admin rights, even via the API
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-0000000000c3", "role": "authenticated", "aal": "aal1"}', true);
DO $$
DECLARE n INT;
BEGIN
    ASSERT NOT (SELECT public.school_is_admin()), 'aal1 session of an MFA admin counts as admin';
    ASSERT NOT EXISTS (SELECT 1 FROM public.admission_inquiries), 'aal1 session of an MFA admin reads inquiries';
    UPDATE public.news_articles SET title = 'x' WHERE slug = 'rls-published';
    GET DIAGNOSTICS n = ROW_COUNT;
    ASSERT n = 0, 'aal1 session of an MFA admin updated an article';
END;
$$;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-0000000000c3", "role": "authenticated", "aal": "aal2"}', true);
DO $$
BEGIN
    ASSERT (SELECT public.school_is_admin()), 'aal2 session of an MFA admin is not recognised';
END;
$$;
RESET ROLE;

-- Server-side form path (service role) still works
SET LOCAL ROLE service_role;
INSERT INTO public.admission_inquiries (student_name, parent_name, phone, consent_at) VALUES ('HS2', 'PH2', '0900000001', now());
RESET ROLE;

SELECT 'RLS checks passed' AS result;
ROLLBACK;
