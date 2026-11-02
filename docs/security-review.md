# Rà soát bảo mật trước phát hành

- **Dự án:** Cổng thông tin & CMS THPT (`school-web`). Chưa có commit git; rà soát trên cây làm việc ngày 2026-11-01.
- **Môi trường đã kiểm tra:**
  - Bản build production (`next build` + `next start`) chạy trên http://localhost:3000.
  - Project Supabase demo dùng chung "123an-clound's Project" (ref `xsspvdgnhelzprcqaiek`, Singapore).
  - Chưa có môi trường staging hay production. Mọi kết luận về HTTPS, edge, backup và cấu hình Auth của production đều là UNVERIFIED.
- **Phạm vi:**
  - Toàn bộ code app (trang public, `/admin`, Server Actions, `proxy.ts`).
  - Migrations, RLS, grants, Storage policies.
  - Dependencies, secrets, security headers, cookie phiên.
- **Không gồm:** hạ tầng production, DNS, WAF, quy trình vận hành.
- **Chuẩn tham chiếu:** checklist 20 mục (website-security-gate), đối chiếu OWASP ASVS 5.0 mức L1 và một số mục L2 (V6 Authentication, V7 Session, V8 Authorization, V5 File handling). Đây không phải chứng nhận ASVS.

## Mô hình mối đe dọa (tóm tắt)

| | |
|---|---|
| Tài sản | Dữ liệu cá nhân trong form tư vấn và liên hệ (họ tên phụ huynh/học sinh, SĐT, email); tài khoản quản trị; tính toàn vẹn của nội dung công khai (tin, công khai theo TT 09/2024) |
| Tác nhân | Khách và bot (spam form, cào dữ liệu); người dùng đã đăng nhập nhưng không phải admin (project Supabase dùng chung với app khác); kẻ đã biết mật khẩu admin; admin bất cẩn (upload, link) |
| Điểm vào | Server Actions công khai (`submitInquiry`, `submitContact`); Server Actions của admin; Supabase Data API (publishable key là public); Supabase Storage; trang `/admin/login` |
| Ranh giới tin cậy | Trình duyệt → Next server (zod, Turnstile, `requireAdmin`); trình duyệt hoặc Next → Supabase (RLS + grants; secret key chỉ dùng ở server) |
| Tình huống lạm dụng chính | Lách Turnstile bằng cách gọi thẳng REST để insert (chặn: anon không có quyền INSERT); đọc bài nháp/hẹn giờ qua API; người dùng thường ghi nội dung; bỏ qua MFA; XSS qua rich text; upload file độc |

## Kết quả 20 mục

| ID | Kiểm soát | Trạng thái | Bằng chứng | Việc cần làm / kiểm tra còn lại |
|---|---|---|---|---|
| 01 | Hash mật khẩu | PASS (Supabase thật) | Supabase Auth lưu bcrypt: tiền tố `$2a$`, độ dài 60 (chỉ đọc tiền tố). App không tự lưu mật khẩu | — |
| 02 | Giới hạn đăng nhập | UNVERIFIED | `config.toml`: `sign_in_sign_ups = 30`/5 phút/IP, CAPTCHA Turnstile, MFA TOTP. Project demo dùng chung chưa bật CAPTCHA (không đổi cài đặt toàn project); chưa chạy thử vượt ngưỡng vì sẽ khóa IP của các app khác | Trên project production: bật CAPTCHA với secret thật, xác nhận rate limit trong dashboard, chạy thử 31 lần sai trên staging |
| 03 | Phiên hết hạn | PASS (tĩnh + local) | JWT 3600 s (đọc từ token, không in token); refresh token rotation; mỗi request admin gọi `getClaims()` (kiểm chữ ký và hạn); đăng xuất xong vào `/admin/dashboard` bị chuyển về login (`cookie-check`) | Access token cũ vẫn dùng được tới khi hết hạn (≤ 1 giờ): giới hạn chung của JWT. Cân nhắc đặt `timebox`/`inactivity_timeout` trên production |
| 04 | Không để log debug | PASS (tĩnh) | Không có `console.*` trong `app/ lib/ components/`; không có source map trong build; không ghi PII vào log | Khi gắn Sentry: bật lọc PII |
| 05 | Secret không ra frontend | PASS (build local) | `.next/static` không chứa secret: chỉ có chuỗi `"sb_secret_"` trong supabase-js dùng để nhận diện tiền tố. `NEXT_PUBLIC_*` chỉ gồm URL, publishable key, Turnstile site key, site URL. `lib/supabase/admin.ts` có `import 'server-only'` | `.env.local` có secret key và mật khẩu admin demo (đã gitignore); đổi cả hai khi chuyển sang project thật |
| 06 | Ẩn lỗi chi tiết | PASS (local) | Server action giả → 400 "Invalid Server Action request."; URL mã hóa sai → 500 "Internal Server Error" (21 byte, không có stack); Server Actions chỉ trả `GENERIC`; `error.tsx` chỉ hiện thông báo chung | — |
| 07 | Giới hạn loại file | PASS (Supabase thật) | Upload thẳng vào Storage (không qua app): `text/html` và `image/svg+xml` bị 415, anon bị 403 (RLS); tên file là uuid; file nằm ở origin `supabase.co`, không phải origin của site; e2e: file `.txt` bị từ chối kèm thông báo | Storage chỉ kiểm tra Content-Type khai báo, không kiểm tra magic bytes; chỉ admin upload được. Chưa quét malware cho file Office |
| 08 | Giới hạn dung lượng | PASS (Supabase thật) | Ảnh 6 MB và PDF 21 MB bị 413 ở Storage; client báo "File quá lớn" (e2e); Server Action giới hạn body mặc định 1 MB | — |
| 09 | Validate lại ở server | PASS (unit + e2e) | zod cho mọi Server Action, kể cả action nhận tham số thường (`idList`, `imageEdits`, `newImageUrls`); field lạ bị bỏ (test "drops unknown fields"); CHECK constraint trong DB; form sai bị từ chối và không lưu (e2e) | — |
| 10 | IDOR | PASS (Supabase thật) | Không có tài nguyên theo từng user; bảng PII chỉ admin đọc được (`rls_check`: user thường không đọc được inquiries); bài nháp/hẹn giờ không đọc được qua API | — |
| 11 | User thường thử quyền admin | PASS (Supabase thật + e2e) | `rls_check` pass trên Supabase thật; e2e: user đăng nhập nhưng không phải admin bị chặn; mỗi trang và action admin gọi `requireAdmin()`; **đã sửa** lỗ hổng bỏ qua MFA (xem dưới) | — |
| 12 | Truy vấn tham số hóa | PASS (tĩnh) | App chỉ truy vấn qua supabase-js/PostgREST; `school_search(q)` là SQL function, không dùng SQL động; `EXECUTE format(%I)` chỉ có trong migration, chạy trên danh sách tên bảng cố định; e2e `/tim-kiem?q=';drop…` → 200 | — |
| 13 | Bắt buộc HTTPS | UNVERIFIED | Header HSTS `max-age=63072000` và CSP `upgrade-insecure-requests` đã có; mọi kết nối tới Supabase là https | Kiểm tra TLS và redirect trên domain thật (Vercel preview/production) |
| 14 | Security headers | PASS (local) | Response 200, 404, 400 đều có CSP (`frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS | CSP có `script-src 'unsafe-inline'` (không dùng nonce để giữ render tĩnh), nên CSP không chặn được XSS kiểu inline. Lớp chặn chính là `sanitize-html` + React escaping |
| 15 | Cookie HttpOnly + Secure + SameSite | **FAIL** | Cookie `sb-<ref>-auth-token`: `HttpOnly=false` (thiết kế của `@supabase/ssr`: browser client cần đọc phiên để upload, MFA, đăng xuất), `SameSite=Lax`, `Path=/`. **Đã sửa:** thêm `Secure` khi `NEXT_PUBLIC_SITE_URL` là https (trên localhost http chưa kiểm tra được) | Cần chủ dự án chấp nhận rủi ro, hoặc refactor: đăng nhập, upload, MFA chuyển qua Server Action với cookie HttpOnly. Nếu có XSS thì token phiên admin bị đánh cắp được |
| 16 | CORS hẹp | PASS (local) | Next không trả `Access-Control-Allow-Origin`; preflight lạ → 405; Server Actions của Next từ chối Origin khác Host (tĩnh). Supabase API dùng CORS `*` theo thiết kế, xác thực bằng bearer token chứ không bằng cookie | — |
| 17 | DB không public | **FAIL** (demo) | Data API public là chủ đích, và RLS/grants đã kiểm chứng. Nhưng network restrictions của project demo đang mở `0.0.0.0/0` và `::/0` cho kết nối Postgres trực tiếp (vẫn cần mật khẩu + SSL) | Project production: giới hạn IP Postgres; không đổi project dùng chung |
| 18 | Quyền DB tối thiểu | PASS (Supabase thật) | GRANT tường minh trên 13 bảng; anon chỉ SELECT nội dung công khai, không INSERT được bảng PII (form đi qua service role ở server); `db advisors` đã rà; **đã thu hồi** EXECUTE `school_is_admin()` khỏi anon/PUBLIC | `increment_article_view` cho anon gọi tùy ý (có thể thổi phồng lượt xem; chỉ ảnh hưởng tính toàn vẹn số liệu) |
| 19 | Lớp edge/WAF | UNVERIFIED | Chưa deploy. Kế hoạch: Vercel (có sẵn chống DDoS) + Cloudflare cho IPv6/DNSSEC (spec mục 9); Turnstile cho form | Đánh giá khi chọn hosting |
| 20 | Backup + giám sát lỗi | **FAIL** | Chưa cấu hình giám sát lỗi (Sentry). Gói Free không có backup tự động; spec mục 9 đề xuất `supabase db dump` hằng tuần và thử khôi phục | Chọn gói Supabase; cấu hình dump + thử restore; gắn Sentry có lọc PII; giao người phụ trách cảnh báo |

## Đã sửa trong đợt rà soát

1. **Bỏ qua MFA (High).**
   - Lỗi ở app: `requireAdmin` gọi `getAuthenticatorAssuranceLevel()` không kèm token. Danh sách factor khi đó đọc từ cookie mà người dùng sửa được, nên ai có mật khẩu chỉ cần xóa factor trong cookie là vào được `/admin` ở mức aal1.
   - Lỗi ở DB: `school_is_admin()` không kiểm tra `aal`, nên token aal1 gọi thẳng REST vẫn có quyền admin.
   - Sửa app: `lib/admin.ts` truyền access token, để Auth tự tra factor ở server.
   - Sửa DB: migration `20261101120000_admin_requires_mfa_session.sql` bắt buộc aal2 với admin đã đăng ký TOTP.
   - Kiểm chứng: thêm case vào `rls_check.sql`. Negative control (chỉ áp migration init) phải fail, và đã fail đúng như vậy.
2. **anon có quyền gọi `school_is_admin()` (Low).** Migration `20261101130000_revoke_anon_school_is_admin.sql`, kèm assertion trong `rls_check`.
3. **Cookie phiên thiếu `Secure` (Medium).** Thêm `cookieOptions.secure` khi site chạy HTTPS, áp cho cả 3 Supabase client.
4. **Kiểm tra quyền chạy trong lúc prefetch prerender.** Thêm `connection()` vào `requireAdmin`, nên phần kiểm tra chỉ chạy khi có request thật. Hết lỗi `Date.now()` trong log server.

## Lệnh đã chạy và kết quả

| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit`, `npx eslint`, `npx vitest run` | Sạch; 22/22 test pass |
| `npm run build` | Pass |
| `npx playwright test` (Chrome; desktop 1440 + mobile 375) | 54/54 pass, gồm: axe không có lỗi serious/critical trên 15 route × 2 cỡ màn hình; form (validate, lưu, chặn trùng); admin (chặn anon/non-admin, đăng bài hiện ngay, kéo thả, upload sai bị từ chối, xóa album xóa luôn file); log server không có lỗi |
| `supabase/checks/rls_check.sql` trên Supabase thật | `RLS checks passed` |
| Harness PGlite (legacy + strict, có negative control) | Pass; negative control bắt được lỗi |
| `supabase db advisors --type all` (lọc object của trường) | 20 mục: 3 WARN SECURITY DEFINER (2 là chủ đích, 1 đã thu hồi), 1 INFO `school_admins` không có policy (chủ đích), 13 WARN hiệu năng `multiple_permissive_policies` (chỉ ảnh hưởng truy cập của admin), 3 INFO index chưa dùng |
| `npm audit` | 6 lỗi (2 low, 4 moderate), đều nằm trong công cụ dev/build: deepmerge qua CLI `shadcn`, minimatch qua eslint. Không có trong bundle runtime |
| Thử upload thẳng vào Storage (service role và anon) | 415 / 413 / 403 như bảng trên; bản ghi đối chứng đã xóa |
| Quét secret trong `.next/static` và trong repo | Không có secret |

## Rủi ro còn lại (chưa được coi là security-ready)

- Mục 15, 17, 20 đang FAIL; mục 02, 13, 19 cần môi trường production để kiểm chứng.
- Project demo dùng chung với các app khác:
  - user Auth nằm chung một danh sách;
  - CAPTCHA đăng nhập chưa có hiệu lực;
  - Postgres mở mọi IP.
  Production phải dùng project riêng.
- File cũ `supabase/schema.sql` (schema có lỗ hổng từ trước) vẫn còn trong thư mục, cần xóa trước commit đầu tiên.
- Ảnh đã chèn vào bài rồi bị xóa khỏi nội dung vẫn còn trên Storage (file mồ côi).
- Chuyển dữ liệu cá nhân ra nước ngoài (Supabase Singapore) cần hồ sơ theo NĐ 356/2025 (spec mục 5). Đây là việc pháp lý, không phải lỗi code.
