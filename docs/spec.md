# Đặc tả: Cổng thông tin & CMS Trường THPT

Tài liệu yêu cầu sản phẩm (WHAT). Quy tắc kỹ thuật và bảo mật (HOW) nằm trong `CLAUDE.md`; mô hình dữ liệu nằm trong `supabase/migrations/`.

## 1. Tổng quan

- **Sản phẩm:** Website hoàn chỉnh cho một trường THPT tại Việt Nam, gồm hai phần:
  - **Public Portal:** Giới thiệu, cơ cấu tổ chức, tin tức, thông báo, tuyển sinh lớp 10, hoạt động Đoàn - Hội - CLB, tài liệu biểu mẫu, liên hệ.
  - **Admin CMS (`/admin`):** Quản trị viên (Ban Giám hiệu / phụ trách truyền thông) chỉnh sửa toàn bộ nội dung. Dữ liệu được lưu trên Supabase; trang public cập nhật ngay sau khi bấm Lưu.
- **Người dùng:** học sinh, phụ huynh (đặc biệt phụ huynh học sinh lớp 9 tìm hiểu tuyển sinh), giáo viên và khách tham quan; quản trị viên của trường.
- **Mục tiêu đo được:**
  - Phụ huynh tìm được chỉ tiêu, điểm chuẩn và form tư vấn trong ≤ 2 lần bấm từ trang chủ.
  - Quản trị viên đăng một tin có ảnh trong ≤ 3 phút mà không cần hỗ trợ kỹ thuật.
  - Lighthouse mobile ≥ 90 (Performance, Accessibility, SEO); LCP < 2.5s, CLS < 0.1.

## 2. Thiết kế & bản sắc

Giao diện thể hiện tính giáo dục và uy tín, trang trọng nhưng trẻ trung, thân thiện với học sinh và phụ huynh.

- **Primary (xanh Navy tri thức):** `#0F2C59` / `#1E3A8A`.
- **Accent:** đỏ truyền thống `#C81E1E`; vàng danh dự `#D97706` / `#F59E0B` (thành tích, huy chương).
- **Neutral:** nền `#F8FAFC`, chữ `#0F172A`.
- **Typography:** `Be Vietnam Pro` (hoặc `Inter`) cho nội dung; serif trang trọng như `Merriweather` cho tiêu đề và thư ngỏ. Font phải có subset tiếng Việt.
- **Yêu cầu chung:** responsive Mobile/Tablet/Desktop, breadcrumbs, đạt WCAG 2.1 AA (tương phản, bàn phím, focus, alt ảnh). Mức này cao hơn yêu cầu của TT 26/2020/TT-BTTTT (WCAG 1.0 bắt buộc, 2.x khuyến nghị) và đáp ứng TT 37/2020/TT-BGDĐT Điều 12 (Unicode, hỗ trợ di động, hỗ trợ người khuyết tật, tìm kiếm toàn văn, RSS).

## 3. Chức năng — Public Portal

1. **Trang chủ (`/`)**
   - Header: topbar (hotline, email, mạng xã hội) + menu chính (Giới thiệu, Tin tức, Tuyển sinh, Hoạt động CLB, Đội ngũ, Tài liệu, Liên hệ) + tìm kiếm + nút đăng nhập Admin.
   - Hero carousel: banner do admin quản lý, kèm tiêu đề và nút CTA. Có nút tạm dừng; không tự chạy khi người dùng bật giảm chuyển động.
   - Thư ngỏ Hiệu trưởng: ảnh chân dung và thông điệp.
   - Chỉ số nổi bật: bộ đếm (năm truyền thống, tỷ lệ tốt nghiệp, tỷ lệ đỗ đại học, số giải quốc gia), lấy từ cấu hình trường.
   - Tin tiêu điểm và thông báo ghim: tab *Thông báo mới*, *Hoạt động dạy học*, *Phong trào học sinh*; thông báo ghim nổi bật.
   - Lối tắt: *Tra cứu điểm* (link sang hệ thống điểm trường đang dùng), *Thời khóa biểu*, *Biểu mẫu*, *Đăng ký tư vấn tuyển sinh*.
   - Góc CLB và thư viện ảnh: chỉ hiển thị khi đã có dữ liệu.
   - Footer: bản đồ, thông tin liên hệ, bản quyền, link Bộ GD&ĐT và Sở GD&ĐT, link Chính sách bảo mật.
2. **Giới thiệu (`/gioi-thieu`):**
   - Nội dung: lịch sử, tầm nhìn - sứ mệnh - giá trị cốt lõi, cơ sở vật chất, sơ đồ và cơ cấu tổ chức, chức năng nhiệm vụ. Soạn trong CMS.
   - Mỗi thành viên Ban Giám hiệu hiển thị họ tên, chức vụ, điện thoại, email và nhiệm vụ phụ trách (TT 37/2020 Điều 9.1.a).
3. **Tin tức (`/tin-tuc`, `/tin-tuc/[slug]`)**
   - Danh sách có phân trang, lọc theo chuyên mục, tìm kiếm theo từ khóa (gõ không dấu vẫn ra kết quả).
   - Trang chi tiết: ngày đăng, lượt xem, mục lục tự động, bài liên quan, nút chia sẻ.
   - Chuyên mục **Lấy ý kiến** (TT 37/2020 Điều 9.5): mỗi bài nêu vấn đề xin ý kiến, nội dung, email tiếp nhận và hạn chót.
   - Chỉ đăng tin của chính nhà trường. Đăng lại tin tổng hợp từ nguồn khác thì phải có giấy phép (NĐ 147/2024 Điều 24.3).
   - Có RSS (`/rss.xml`).
4. **Tuyển sinh lớp 10 (`/tuyen-sinh`):**
   - Kế hoạch, chỉ tiêu, phương thức (Toán, Ngữ văn + môn thứ ba do Sở chọn, theo TT 30/2024).
   - Điểm chuẩn 3 năm gần nhất: bảng + biểu đồ, ghi rõ thang điểm từng năm.
   - Hướng dẫn nộp hồ sơ, file hướng dẫn PDF, danh sách dự tuyển (PDF).
   - Link sang hệ thống đăng ký/tra cứu kết quả trực tuyến của Sở (TT 37/2020 Điều 9.4).
   - Form "Đăng ký nhận tư vấn".
5. **Đội ngũ (`/doi-ngu`):** giáo viên theo tổ chuyên môn; card gồm ảnh, học vị, chức vụ, thành tích. Chưa có ảnh thì hiển thị chữ cái đầu.
6. **Tài liệu (`/tai-lieu`):**
   - Tải biểu mẫu, kế hoạch, thời khóa biểu (PDF), văn bản; lọc theo loại.
   - Các chuyên mục bắt buộc:
     - **Công khai** (TT 09/2024): nội dung theo Điều 4, 5, 8, 9 kèm báo cáo thường niên PDF. Đăng trước 30/6 hằng năm, cập nhật trong 10 ngày làm việc khi có thay đổi, giữ tối thiểu 5 năm.
     - **Niên giám thống kê 5 năm** (TT 37/2020 Điều 9.9).
     - **Tài nguyên số** (Điều 9.10): học liệu số, bài giảng, sách điện tử, kèm link thư viện tài nguyên của Sở/Bộ.
7. **Liên hệ & Hỏi đáp (`/lien-he`, `/hoi-dap`):** form gửi thư đến nhà trường (lưu vào CMS), trang hỏi đáp soạn trong CMS, bản đồ và chỉ dẫn đường đi (TT 37/2020 Điều 9.1.b).
8. **Chính sách bảo mật (`/chinh-sach-bao-mat`):** nội dung do nhà trường cung cấp, bắt buộc có trước khi bật form. Nêu loại dữ liệu, mục đích, bên kiểm soát, thời hạn lưu và quyền của chủ thể dữ liệu.
9. **Tìm kiếm toàn văn (`/tim-kiem`):** tìm trên tin tức, trang tĩnh và tên tài liệu (TT 37/2020 Điều 12.4).

## 4. Chức năng — Admin CMS

1. **Đăng nhập (`/admin/login`):** email/mật khẩu, CAPTCHA, MFA (TOTP), thông báo lỗi rõ ràng. Phiên tự gia hạn theo cơ chế Supabase; đăng xuất thu hồi phiên. Không có trang đăng ký công khai.
2. **Tổng quan (`/admin/dashboard`):** tổng số bài viết, tổng thông báo, tổng lượt xem, số đăng ký tư vấn `pending`, số thư liên hệ mới; bài cập nhật gần đây; lối tắt "Viết bài mới".
3. **Thông tin trường (`/admin/school-settings`):** tên, slogan, địa chỉ, hotline, email, mạng xã hội, link tra cứu điểm, link Sở GD&ĐT, bản đồ; logo, favicon; thư ngỏ và ảnh Hiệu trưởng; các chỉ số nổi bật.
4. **Banner trang chủ (`/admin/hero`):** thêm, sửa, xóa, sắp xếp và bật/tắt slide.
5. **Trang tĩnh (`/admin/pages`):** soạn nội dung Giới thiệu, Chính sách bảo mật, Hướng dẫn nộp hồ sơ.
6. **Tin tức & Thông báo (`/admin/articles`)**
   - Danh sách: tìm kiếm, lọc theo chuyên mục và trạng thái (Nháp / Đã đăng), sắp xếp theo ngày.
   - Soạn bài:
     - Tiêu đề, slug tự sinh (sửa được), chuyên mục, ảnh đại diện có xem trước.
     - Rich text: heading, đậm, danh sách, chèn ảnh, chèn link.
     - Bật/tắt "Ghim thông báo", "Tin tiêu điểm".
     - Lưu nháp, Đăng ngay hoặc hẹn giờ đăng.
   - Thao tác: Sửa, Xem trước, Xóa (có modal xác nhận). Mọi thao tác có toast thành công/thất bại.
7. **Tuyển sinh (`/admin/admissions`):**
   - Cập nhật chỉ tiêu, phương thức, điểm chuẩn (kèm thang điểm), thời gian, file hướng dẫn, link hệ thống của Sở.
   - Danh sách đăng ký tư vấn: trạng thái `Chờ xử lý` / `Đã liên hệ` / `Đã giải quyết`, ghi chú.
   - Xóa bản ghi khi có yêu cầu: phản hồi trong 2 ngày làm việc, xóa trong 20 ngày (NĐ 356/2025 Điều 5.4).
8. **Đội ngũ (`/admin/faculty`):** thêm, sửa, xóa giáo viên; chọn tổ; tải ảnh chân dung; kéo thả sắp xếp thứ tự.
9. **Thư viện ảnh (`/admin/media`):** tạo album, tải nhiều ảnh, nhập mô tả ảnh (alt), sắp xếp ảnh.
10. **Tài liệu (`/admin/documents`):** tải PDF/Word/Excel, chọn loại, số hiệu, ngày ban hành.
11. **CLB (`/admin/clubs`):** thêm, sửa, xóa, sắp xếp.
12. **Thư liên hệ (`/admin/messages`):** xem và đánh dấu đã đọc.

## 5. Căn cứ pháp lý (đối chiếu ngày 2026-11-01)

Thông tin dưới đây do đội phát triển tra cứu, không phải tư vấn pháp lý. Nhà trường hoặc luật sư cần xác nhận các mục ở phần Open questions.

| Văn bản | Hiệu lực | Áp dụng cho dự án |
|---|---|---|
| Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 | 01/01/2026 | Đồng ý, dữ liệu trẻ em, chuyển dữ liệu xuyên biên giới, hồ sơ đánh giá tác động, báo vi phạm trong 72 giờ |
| NĐ 356/2025/NĐ-CP (thay NĐ 13/2023) | 01/01/2026 | Bên kiểm soát phải chứng minh được sự đồng ý; cấm ô đồng ý tick sẵn; lưu trên cloud nước ngoài = chuyển xuyên biên giới (Điều 17.1.a); thời hạn xử lý yêu cầu xóa |
| NĐ 330/2026/NĐ-CP | 19/08/2026 | Phạt tổ chức 30–50 triệu đồng nếu không lập/nộp hồ sơ chuyển dữ liệu xuyên biên giới |
| TT 09/2024/TT-BGDĐT (thay TT 36/2017) | 19/07/2024 | Nội dung và thời hạn công khai |
| TT 37/2020/TT-BGDĐT | 20/11/2020 | Điều 9: nội dung bắt buộc trên cổng thông tin của trường; Điều 12: Unicode, di động, người khuyết tật, tìm kiếm toàn văn, RSS, IPv6/DNSSEC |
| TT 26/2020/TT-BTTTT | 01/01/2021 | Hỗ trợ người khuyết tật cho trang của đơn vị sự nghiệp dùng ngân sách |
| TT 30/2024/TT-BGDĐT | 14/02/2025 | Quy chế tuyển sinh: Toán, Ngữ văn + môn thứ ba do Sở chọn (công bố trước 31/3) |
| NĐ 147/2024/NĐ-CP | 25/12/2024 | Trang thông tin nội bộ không cần giấy phép; đăng tin tổng hợp thì phải có phép |
| NQ 202/2025/QH15, Luật 72/2025/QH15 | 12/06/2025; cấp huyện kết thúc từ 01/07/2025 | Còn 34 tỉnh/thành, địa chỉ hai cấp; THPT do Sở GD&ĐT quản lý |
| Luật An ninh mạng 116/2025/QH15 | 01/07/2026 | Hệ thống thông tin được phân 5 cấp độ (đang chờ nghị định hướng dẫn) |
| TT 48/2025/TT-BKHCN | 10/02/2026 | Tên miền `.edu.vn` chỉ cấp cho tổ chức giáo dục; dùng hay không là tùy trường (TT 37/2020 Điều 3.1.b) |

**Yêu cầu rút ra**
- **Đồng ý:**
  - Ô đồng ý không được tick sẵn; im lặng không được coi là đồng ý.
  - Lưu thời điểm đồng ý (`consent_at`).
  - Phụ huynh là người khai và đồng ý thay học sinh.
- **Chuyển dữ liệu xuyên biên giới:** dùng Supabase Cloud (máy chủ ngoài Việt Nam) hoặc Vercel tức là chuyển dữ liệu cá nhân ra nước ngoài.
  - Phạm vi gồm cả dữ liệu giáo viên (họ tên, ảnh, SĐT) và tài khoản admin, không chỉ dữ liệu form.
  - Cách 1: lập và nộp hồ sơ đánh giá tác động chuyển dữ liệu xuyên biên giới (Mẫu 09) trong 60 ngày.
  - Cách 2: tự host Supabase trên máy chủ tại Việt Nam. Code không phải đổi.
- **Hồ sơ đánh giá tác động xử lý dữ liệu:** Mẫu 10, nộp trong 60 ngày kể từ khi bắt đầu xử lý, cập nhật 6 tháng một lần. Chưa rõ trường có được miễn không (xem Open questions).
- **Bảo mật vận hành:**
  - Không ghi dữ liệu cá nhân vào log.
  - Có quy trình báo vi phạm cho cơ quan chuyên trách trong 72 giờ (Mẫu 08).
  - Xác nhận với nhà cung cấp cloud rằng dữ liệu được mã hóa khi lưu và khi truyền.
- **Địa chỉ và hiển thị:** địa chỉ theo địa giới mới; ngày giờ theo giờ Việt Nam; giao diện hoàn toàn tiếng Việt.

## 6. Phân pha & tiêu chí nghiệm thu

**P1 — MVP phát hành được** (gồm đủ nội dung bắt buộc của TT 37/2020 Điều 9 và TT 09/2024)
- Phạm vi:
  - Public: layout, trang chủ (trừ CLB/ảnh), Giới thiệu (gồm Ban Giám hiệu), Đội ngũ, Tin tức (gồm Lấy ý kiến, RSS), Tuyển sinh + form, Tài liệu (mọi chuyên mục), Liên hệ + Hỏi đáp, Chính sách bảo mật, Tìm kiếm toàn văn.
  - Admin: đăng nhập, dashboard, thông tin trường, banner, trang tĩnh, tin tức, tuyển sinh + đăng ký tư vấn, đội ngũ, tài liệu, thư liên hệ.
  - SEO cơ bản: metadata/OG, sitemap, robots, JSON-LD `HighSchool`, `NewsArticle`, `BreadcrumbList`; `/admin` noindex.
- Nghiệm thu:
  - Trước khi bật form và trước khi lưu dữ liệu giáo viên lên production:
    - Chính sách bảo mật chính thức đã được đăng.
    - Đã chọn phương án lưu trữ dữ liệu (mục 5).
    - Đã có người chịu trách nhiệm nộp hồ sơ trong 60 ngày.
  - Upload sai định dạng hoặc quá dung lượng bị từ chối và có thông báo; xóa bản ghi thì file trên Storage cũng bị xóa.
  - Admin bấm Lưu → bài hiện ở trang chủ và `/tin-tuc` mà không cần deploy lại.
  - Bản nháp và bài hẹn giờ không xem được từ bên ngoài, kể cả khi gọi thẳng API.
  - Tài khoản đăng nhập nhưng không phải quản trị viên bị chặn khỏi `/admin` và mọi thao tác ghi.
  - Form tư vấn:
    - Thiếu đồng ý, SĐT sai hoặc CAPTCHA lỗi → báo lỗi rõ, không lưu.
    - Gửi trùng trong 10 phút → bị chặn.
    - Thành công → toast, và bản ghi `pending` xuất hiện trong admin.
  - Mobile 375px không cuộn ngang; mọi thao tác dùng được bằng bàn phím; axe không có lỗi mức serious.
  - Đạt các chỉ số Lighthouse ở mục 1.
  - Kiểm tra RLS (`supabase/checks/rls_check.sql`) pass.

**P2**
- Phạm vi: Thư viện ảnh, CLB, kéo thả thứ tự giáo viên, cùng các trang admin tương ứng.
- Nghiệm thu:
  - Kéo thả thứ tự giáo viên được lưu lại.
  - Ảnh album có alt.

**P3 — chỉ làm khi được yêu cầu**
- Lịch sự kiện năm học.
- Thời khóa biểu dạng bảng.
- Thống kê lượt xem theo tháng.
- Vai trò Biên tập viên + quy trình duyệt bài.
- Email báo khi có đăng ký tư vấn mới.

## 7. Vai trò

| Vai trò | Quyền |
|---|---|
| Khách | Xem nội dung đã đăng; gửi form tư vấn/liên hệ |
| Quản trị viên (có trong `school_admins`) | Toàn quyền CMS, xem dữ liệu tư vấn/liên hệ |

Chưa có vai trò Biên tập viên (xem Open questions).

## 8. Out of scope

- Lưu điểm, sổ liên lạc, tài khoản học sinh/phụ huynh: chỉ link sang hệ thống trường đang dùng (vnEdu, SMAS…).
- Thanh toán học phí, đa ngôn ngữ, ứng dụng mobile, chat trực tuyến.

## 9. Vận hành

- **Deploy:** Vercel (preview → production) + Supabase.
- **Gói Supabase** (theo trang pricing, kiểm tra ngày 2026-11-01):
  - Gói Free: DB 500 MB, Storage 1 GB, mỗi file tối đa 50 MB, không có backup tự động, không có PITR, và project bị tạm dừng sau 1 tuần không hoạt động.
  - Khuyến nghị dùng gói Pro cho production.
  - Nếu vẫn dùng Free: chạy `supabase db dump` tự động hằng tuần, lưu ngoài Supabase và có thử khôi phục.
- **IPv6 + DNSSEC** (TT 37/2020 Điều 12.7): Vercel chưa hỗ trợ IPv6 cho domain riêng.
  - Đặt Cloudflare (proxy, dual-stack) phía trước, hoặc chọn hosting có IPv6.
  - Bật DNSSEC tại nhà cung cấp DNS.
- **Giám sát:** theo dõi lỗi (vd. Sentry), không ghi dữ liệu cá nhân vào log.
- **Sự cố dữ liệu:** có quy trình và người phụ trách báo cơ quan chuyên trách trong 72 giờ.
- **Công khai:** cập nhật trước 30/6 hằng năm; không xóa tài liệu công khai khi chưa đủ 5 năm.

## 10. Open questions

1. Dữ liệu thật của trường (tên, logo, nội dung) thay cho dữ liệu mẫu "THPT Ánh Dương" — ai cung cấp, khi nào?
2. Giáo viên có được tự viết bài (nháp) để Ban Giám hiệu duyệt không? Nếu có → thêm vai trò Biên tập viên (P3).
3. **Nơi lưu dữ liệu:** Supabase Cloud ở nước ngoài + nộp hồ sơ chuyển dữ liệu xuyên biên giới, hay tự host Supabase tại Việt Nam? Phải chốt trước khi lên production; không ảnh hưởng việc viết code.
4. Trường THPT công lập có được coi là "cơ quan nhà nước có thẩm quyền" để được miễn hồ sơ đánh giá tác động (Luật 91/2025 Điều 20.6.a, 21.6) không? Cần luật sư hoặc Sở xác nhận.
5. Thời hạn lưu dữ liệu tư vấn/liên hệ (đề xuất 12 tháng) và ai duyệt Chính sách bảo mật?
6. Domain: dùng `.edu.vn` (trường đăng ký với tư cách tổ chức giáo dục) hay dùng domain do Sở cấp? Sở có tiêu chí riêng cho website trường không?
7. Website được xếp cấp độ hệ thống thông tin nào theo Luật An ninh mạng 116/2025 (đang chờ nghị định)?
8. Gói Supabase: Free (không có backup, bị tạm dừng khi không hoạt động) hay Pro?
9. Có cần email thông báo khi có đăng ký tư vấn mới không?
