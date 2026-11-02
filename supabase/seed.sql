-- ==============================================================================
-- INITIAL SEED DATA FOR HIGH SCHOOL WEB PORTAL
-- Fictional sample school (do not deploy as-is: replace with the real school's data).
-- Safe to re-run: never overwrites or duplicates existing rows.
-- ==============================================================================

-- 1. SCHOOL GENERAL INFO (singleton)
INSERT INTO public.school_info (
    name,
    short_name,
    slogan,
    principal_name,
    principal_title,
    principal_message,
    established_year,
    address,
    phone,
    hotline,
    email,
    stats
) VALUES (
    'Trường Trung Học Phổ Thông Ánh Dương',
    'THPT Ánh Dương',
    'Dạy tốt - Học tốt - Rèn luyện vì ngày mai lập nghiệp',
    'TS. Nguyễn Văn Minh',
    'Hiệu trưởng nhà trường',
    'Chào mừng quý thầy cô, quý phụ huynh cùng toàn thể các em học sinh thân mến đến với Cổng thông tin điện tử của Trường THPT Ánh Dương. Với bề dày lịch sử và truyền thống hiếu học, nhà trường luôn kiên trì mục tiêu giáo dục toàn diện: Đạo đức - Trí tuệ - Thể chất - Thẩm mỹ. Chúng tôi cam kết xây dựng một môi trường học đường an toàn, hạnh phúc, khuyến khích tư duy sáng tạo và phát triển năng lực hội nhập toàn cầu cho mỗi học sinh.',
    1975,
    'Số 10 Đường Hòa Bình, Phường Cầu Giấy, TP. Hà Nội',
    '(024) 0000 0000',
    '0900 000 000',
    'lienhe@anhduong.example',
    '{"students_count": 1950, "teachers_count": 105, "graduation_rate": "100%", "university_rate": "96.8%", "national_awards": 52}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. HERO SLIDES
INSERT INTO public.hero_slides (title, subtitle, image_url, cta_label, cta_href, sort_order)
SELECT * FROM (VALUES
    ('Tuyển sinh lớp 10 năm học 2025 - 2026', 'Chỉ tiêu, điểm chuẩn và hướng dẫn nộp hồ sơ', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&h=800&q=80', 'Tìm hiểu tuyển sinh', '/tuyen-sinh', 0),
    ('Môi trường học tập hạnh phúc', 'Hơn 45 năm truyền thống dạy tốt - học tốt', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&h=800&q=80', 'Xem lịch năm học', '/tai-lieu?loai=ke-hoach-tuan', 1)
) AS v(title, subtitle, image_url, cta_label, cta_href, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

-- 3. FACULTY MEMBERS (no portraits/contacts: UI shows initials until the school uploads real data)
INSERT INTO public.faculty_members (full_name, position, department, degree, bio, order_index, is_leadership)
SELECT * FROM (VALUES
    ('TS. Nguyễn Văn Minh', 'Hiệu trưởng', 'Ban Giám hiệu', 'Tiến sĩ Quản lý Giáo dục', 'Hơn 28 năm cống hiến cho ngành giáo dục.', 1, true),
    ('ThS. Trần Thị Mai Lan', 'Phó Hiệu trưởng', 'Ban Giám hiệu', 'Thạc sĩ Ngữ Văn', 'Phụ trách công tác chuyên môn dạy học và bồi dưỡng học sinh giỏi.', 2, true),
    ('ThS. Lê Hoàng Long', 'Phó Hiệu trưởng', 'Ban Giám hiệu', 'Thạc sĩ Khoa học Máy tính', 'Phụ trách cơ sở vật chất, phong trào thanh niên và chuyển đổi số.', 3, true),
    ('Thầy Vũ Đình Trọng', 'Tổ trưởng chuyên môn', 'Tổ Toán - Tin', 'Thạc sĩ Toán học', 'Nhiều năm bồi dưỡng đội tuyển Toán đạt giải cấp thành phố và quốc gia.', 4, false),
    ('Cô Đỗ Bích Hạnh', 'Tổ phó chuyên môn', 'Tổ Ngữ Văn', 'Cử nhân Sư phạm Ngữ Văn', 'Giáo viên dạy giỏi cấp thành phố, truyền cảm hứng văn học trẻ.', 5, false),
    ('Cô Nguyễn Phương Thảo', 'Bí thư Đoàn trường', 'Đoàn Thanh niên', 'Thạc sĩ Tiếng Anh', 'Nhiệt huyết với công tác phong trào học sinh, cố vấn CLB Tiếng Anh.', 6, false)
) AS v(full_name, position, department, degree, bio, order_index, is_leadership)
WHERE NOT EXISTS (SELECT 1 FROM public.faculty_members);

-- 4. NEWS & ARTICLES
INSERT INTO public.news_articles (title, slug, summary, content, category, status, thumbnail_url, is_featured, is_pinned, views_count, published_at)
VALUES
(
    'Thông báo Kế hoạch Tuyển sinh vào lớp 10 năm học 2025 - 2026',
    'thong-bao-ke-hoach-tuyen-sinh-lop-10-2025-2026',
    'Nhà trường trân trọng thông báo phương án, chỉ tiêu và các mốc thời gian quan trọng trong kỳ thi tuyển sinh vào lớp 10 THPT.',
    '<p>Căn cứ theo hướng dẫn của Sở Giáo dục và Đào tạo, Hội đồng Tuyển sinh Trường THPT thông báo phương án tuyển sinh vào lớp 10 cho năm học mới 2025 - 2026 như sau:</p><h2>1. Chỉ tiêu tuyển sinh</h2><p>Năm học 2025 - 2026, nhà trường tuyển sinh 12 lớp với tổng số 540 học sinh, bao gồm 4 lớp định hướng Tự nhiên (Toán - Lý - Hóa - Tin), 4 lớp định hướng Xã hội (Văn - Sử - Địa - Ngoại ngữ) và 4 lớp Tăng cường Ngoại ngữ Quốc tế.</p><h2>2. Phương thức tuyển sinh</h2><p>Tuyển sinh dựa trên kết quả kỳ thi chung do Sở GD&amp;ĐT tổ chức với 3 môn bắt buộc: Toán, Ngữ văn và Ngoại ngữ.</p><p>Mọi thắc mắc phụ huynh vui lòng liên hệ trực tiếp văn phòng Tuyển sinh hoặc gửi biểu mẫu tư vấn tại website.</p>',
    'tuyen-sinh',
    'published',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&h=450&q=80',
    true,
    true,
    1450,
    now()
),
(
    'Học sinh nhà trường xuất sắc giành 8 giải trong Kỳ thi Học sinh Giỏi Quốc gia',
    'hoc-sinh-xuat-sac-gianh-8-giai-hsg-quoc-gia',
    'Tuyên dương các em học sinh đạt thành tích xuất sắc tại kỳ thi chọn Học sinh giỏi Quốc gia năm học vừa qua.',
    '<p>Tại kỳ thi Học sinh giỏi Quốc gia do Bộ Giáo dục và Đào tạo tổ chức, đội tuyển nhà trường đã xuất sắc đem về 8 giải thưởng gồm 2 giải Nhì, 4 giải Ba và 2 giải Khuyến khích ở các bộ môn Toán học, Vật lý và Tin học.</p><p>Đây là minh chứng rõ nét cho tinh thần nỗ lực không ngừng nghỉ của thầy và trò nhà trường trong suốt năm học vừa qua.</p>',
    'tin-nha-truong',
    'published',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&h=450&q=80',
    true,
    false,
    890,
    now() - INTERVAL '2 days'
),
(
    'Sôi nổi Ngày hội Văn hóa Thanh niên và Chung kết giải Thể thao học đường',
    'ngay-hoi-van-hoa-thanh-nien-the-thao-hoc-duong',
    'Chuỗi hoạt động thể thao, văn nghệ chào mừng kỷ niệm ngày thành lập Đoàn TNCS Hồ Chí Minh 26/3 đã diễn ra sôi nổi.',
    '<p>Trong hai ngày cuối tuần, Đoàn trường đã tổ chức thành công Hội trại truyền thống kết hợp giải bóng đá, bóng rổ giữa các khối lớp. Các tiết mục flashmob và hội chợ ẩm thực dân gian đã mang lại không khí vui tươi, gắn kết tinh thần đoàn kết học sinh.</p>',
    'hoat-dong-doan-clb',
    'published',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&h=450&q=80',
    false,
    false,
    620,
    now() - INTERVAL '4 days'
),
(
    'Thông báo Lịch thi Học kỳ II và Kế hoạch Ôn tập cho học sinh toàn trường',
    'thong-bao-lich-thi-hoc-ky-ii-ke-hoach-on-tap',
    'Kế hoạch chi tiết về thời gian, phòng thi và quy chế thi học kỳ dành cho học sinh khối 10, 11 và 12.',
    '<p>Nhà trường thông báo tới phụ huynh và học sinh lịch thi khảo sát và kiểm tra đánh giá cuối học kỳ II. Đề nghị học sinh có mặt đúng giờ và tuân thủ nghiêm ngặt quy chế phòng thi.</p>',
    'thong-bao',
    'published',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&h=450&q=80',
    false,
    true,
    1120,
    now() - INTERVAL '5 days'
)
ON CONFLICT (slug) DO NOTHING;

-- 5. ADMISSION SPECS (guide PDF is uploaded by the school via the CMS)
INSERT INTO public.admissions_info (
    academic_year,
    target_quota,
    admission_criteria,
    benchmark_scores,
    start_date,
    end_date
) VALUES (
    '2025 - 2026',
    540,
    'Tuyển sinh theo điểm xét tuyển 3 môn thi chung của Sở GD&ĐT (Toán, Ngữ Văn, Ngoại ngữ). Cộng điểm ưu tiên theo quy chế hiện hành của Bộ GD&ĐT.',
    '[{"year": "2024", "score": 39.5, "max_score": 40, "note": "Lớp thường: 39.5, Lớp Tiếng Anh tăng cường: 41.0 (thang 40 + điểm ưu tiên)"}, {"year": "2023", "score": 38.75, "max_score": 50, "note": "Điểm chuẩn nguyện vọng 1"}, {"year": "2022", "score": 39.0, "max_score": 50, "note": "Điểm chuẩn nguyện vọng 1"}]'::jsonb,
    '2025-05-15',
    '2025-07-20'
) ON CONFLICT (academic_year) DO NOTHING;

-- 6. CLUBS
INSERT INTO public.clubs (name, description, sort_order)
SELECT * FROM (VALUES
    ('CLB Tiếng Anh', 'Sinh hoạt hùng biện, tranh biện và giao lưu văn hóa bằng tiếng Anh hằng tuần.', 0),
    ('CLB Âm nhạc', 'Biểu diễn trong các ngày lễ, hội diễn văn nghệ và chương trình chào cờ.', 1),
    ('CLB Nghiên cứu khoa học', 'Thực hiện dự án khoa học kỹ thuật, tham gia cuộc thi KHKT cấp thành phố.', 2),
    ('CLB Bóng rổ', 'Tập luyện 3 buổi/tuần, thi đấu giải bóng rổ học sinh THPT.', 3)
) AS v(name, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.clubs);

-- 6b. PHOTO GALLERY (one sample album; reuses the seed photos above)
WITH album AS (
    INSERT INTO public.photo_galleries (title, category, event_date)
    SELECT 'Hoạt động học tập và ngoại khóa', 'ngoai-khoa', DATE '2025-10-20'
    WHERE NOT EXISTS (SELECT 1 FROM public.photo_galleries)
    RETURNING id
)
INSERT INTO public.photo_gallery_images (gallery_id, image_url, alt, sort_order)
SELECT album.id, v.url, v.alt, v.ord
FROM album, (VALUES
    ('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=900&q=80', 'Học sinh thảo luận nhóm bên bàn học', 0),
    ('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&h=900&q=80', 'Khuôn viên trường', 1),
    ('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&h=900&q=80', 'Học sinh ôn bài', 2),
    ('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&h=900&q=80', 'Buổi sinh hoạt tập thể', 3)
) AS v(url, alt, ord);

-- 7. STATIC PAGES
INSERT INTO public.site_pages (slug, title, content)
VALUES
    ('gioi-thieu', 'Giới thiệu nhà trường', '<h2>Lịch sử hình thành</h2><p>Trường THPT Ánh Dương được thành lập năm 1975.</p><h2>Tầm nhìn - Sứ mệnh</h2><p>Xây dựng môi trường giáo dục toàn diện, hiện đại và hội nhập.</p><h2>Cơ sở vật chất</h2><p>Phòng thí nghiệm, thư viện số, sân bóng đá và nhà thi đấu đa năng.</p>'),
    ('chinh-sach-bao-mat', 'Chính sách bảo mật dữ liệu cá nhân', '<p>[Nhà trường cần thay nội dung này bằng chính sách chính thức trước khi phát hành website.]</p>'),
    ('hoi-dap', 'Hỏi đáp', '<h2>Nhà trường có xe đưa đón học sinh không?</h2><p>Nhà trường không tổ chức xe đưa đón; học sinh có thể gửi xe đạp, xe máy điện tại nhà xe của trường.</p><h2>Làm thế nào để xin giấy xác nhận học sinh?</h2><p>Phụ huynh liên hệ văn phòng nhà trường trong giờ hành chính, mang theo căn cước của phụ huynh.</p>'),
    ('huong-dan-nop-ho-so', 'Hướng dẫn nộp hồ sơ', '<p>Thí sinh đăng ký dự tuyển trực tuyến trên hệ thống của Sở GD&amp;ĐT, sau đó nộp hồ sơ bản giấy tại văn phòng nhà trường theo lịch tuyển sinh.</p><ul><li>Phiếu đăng ký dự tuyển.</li><li>Học bạ THCS (bản sao).</li><li>Giấy tờ chứng nhận ưu tiên (nếu có).</li></ul>')
ON CONFLICT (slug) DO NOTHING;

-- Documents and gallery photos are not seeded: they need real files uploaded to Storage via the CMS.
