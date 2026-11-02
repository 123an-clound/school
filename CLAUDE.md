@AGENTS.md

# Cổng thông tin & CMS Trường THPT

- Yêu cầu sản phẩm, phân pha, tiêu chí nghiệm thu, open questions: `docs/spec.md`.
- Mô hình dữ liệu: `supabase/migrations/` là nguồn sự thật duy nhất, không mô tả lại schema ở file khác. Muốn đổi schema thì thêm migration mới.
- Trạng thái (2026-11-01):
  - Đã có migration init, `supabase/seed.sql`, `supabase/checks/rls_check.sql` và `supabase/config.toml` (CLI 2.122.0; đã tắt sign-up, bật CAPTCHA và MFA).
  - Seed là trường hư cấu "THPT Ánh Dương", phải thay bằng dữ liệu thật trước khi phát hành.
  - Code P1 + P2 đã viết: toàn bộ trang public (mục 3 spec, gồm `/cau-lac-bo`, `/thu-vien-anh`), RSS, sitemap, robots, 2 form công khai, CMS `/admin` (mục 4, gồm `/admin/clubs`, `/admin/media`, kéo thả thứ tự giáo viên). Ghi chú thiết kế: `docs/design-notes.md`.
  - Test e2e trong `e2e/` (Playwright dùng Chrome đã cài, đọc `.env.local`; test admin cần `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` và tự dọn dữ liệu test). Kết quả rà soát bảo mật và rủi ro còn mở: `docs/security-review.md`.
  - Demo chạy chung project Supabase có sẵn "123an-clound's Project" (ref `xsspvdgnhelzprcqaiek`, Singapore) với các app khác, nên mọi object của trường có tên riêng (`school_admins`, `school_is_admin()`, `school_*`). Không đổi cài đặt Auth của project này (CAPTCHA đăng nhập chưa có hiệu lực). Production sẽ dùng project riêng.
  - Migration + seed đã áp lên project đó; `rls_check` pass trên Supabase thật; `lib/supabase/database.types.ts` sinh từ project này.
  - Áp SQL: `npx supabase db query --linked --project-ref <ref> -f <file>`. Gộp file SQL bằng công cụ giữ nguyên UTF-8 (bash `cat`, Python): `Get-Content -Raw` của PowerShell 5.1 đọc file không BOM theo ANSI và làm hỏng tiếng Việt.

## Stack (phiên bản kiểm tra trên npm ngày 2026-11-01)

- Next.js 16 App Router + TypeScript strict, React 19. `create-next-app` mặc định bật Cache Components.
- Tailwind CSS v4 (cấu hình trong CSS) + shadcn/ui (`npx shadcn@latest add …` tự cài Radix), `lucide-react`, `sonner`.
- `motion` (`motion/react`) cho chuyển động; carousel dùng shadcn Carousel (Embla).
- Supabase: `@supabase/ssr` + `@supabase/supabase-js` (Postgres, Auth, Storage).
- TipTap 3 cho rich text, `sanitize-html` để lọc HTML phía server, `zod` 4 để validate.
- Test: Vitest + Playwright.
- Không dùng: TanStack Query, MDX editor, mock-data fallback, GSAP.
- Tra API trước khi code:
  - Docs Next đúng phiên bản nằm trong `node_modules/next/dist/docs/` (xem `AGENTS.md`). Ngoài ra dùng context7 hoặc nextjs.org.
  - Next 16 dùng `proxy.ts` (export `proxy`, chỉ chạy Node runtime) thay cho `middleware.ts` (deprecated).

## Khởi tạo (một lần, đã kiểm tra với create-next-app 16.4.3)

`create-next-app` từ chối chạy trong thư mục đã có `CLAUDE.md`, `supabase/`, `.env.example`, nên phải tạo ở thư mục tạm rồi chuyển vào:

```powershell
npx create-next-app@latest ..\school-web-init --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --cache-components --disable-git --yes
Get-ChildItem -Force ..\school-web-init | Move-Item -Destination .
Remove-Item ..\school-web-init
```

Sau đó:
1. Thêm `!.env.example`, `supabase/.temp/` và `supabase/.branches/` vào `.gitignore`. Template có dòng `.env*`, dòng này cũng bỏ qua `.env.example`.
2. Thêm dòng `@AGENTS.md` vào đầu file này. `next dev` tự sinh và cập nhật `AGENTS.md`.
3. Chạy `git init`.
4. Chạy `npx shadcn@latest init`.

## Lệnh

```bash
npm run dev | npm run build | npm run lint
npx vitest run
npx playwright test
npx supabase init        # một lần: tạo supabase/config.toml, giữ nguyên migrations/seed
npx supabase start       # cần Docker
npx supabase db reset    # áp migrations + seed.sql
npx supabase gen types typescript --local > lib/supabase/database.types.ts
npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts   # project cloud
node --env-file=.env.local scripts/create-admin.mjs <email> [--invite]   # tạo/cấp quyền admin
```

Kiểm tra RLS: chạy `supabase/checks/rls_check.sql` trong SQL editor (Studio local: http://127.0.0.1:54323). Kết quả phải là `RLS checks passed`. Chạy lại mỗi khi đổi DB.

## Supabase clients (`lib/supabase/`)

Theo hướng dẫn chính thức của Supabase cho Next 16, cộng thêm `public.ts` và `admin.ts`:

- `client.ts`: `createBrowserClient` với publishable key. Dùng cho `/admin` và component đếm lượt xem (RPC `increment_article_view`).
- `server.ts`: `createServerClient` với cookies. Chỉ dùng cho `/admin` và Server Actions của admin.
- `proxy.ts`: `updateSession` (gọi `getClaims()`). Được dùng trong file `proxy.ts` ở gốc dự án với matcher `/admin/:path*`. Không refresh session trên trang public, vì CDN có thể cache `Set-Cookie` và trả nhầm phiên của người khác.
- `public.ts`: `createClient` với publishable key, **không cookies**. Dùng để đọc dữ liệu public bên trong `'use cache'`, vì `cookies()` không dùng được trong scope cache.
- `admin.ts`: `SUPABASE_SECRET_KEY` (bỏ qua RLS), có `import 'server-only'`. CHỈ dùng để insert form công khai và cho script mời admin.
- Types lấy từ `database.types.ts` sinh tự động, không tự viết interface trùng lặp.

## Quy tắc bảo mật (bắt buộc)

1. Admin = có dòng trong `school_admins`, kiểm tra bằng `school_is_admin()`. Đã đăng nhập chưa chắc là admin.
   - Tắt "Allow new users to sign up": `config.toml` đã tắt; production phải tắt trong dashboard.
   - Mời admin bằng `auth.admin.inviteUserByEmail` (cần secret key, chạy từ script server), sau đó insert vào `school_admins`.
2. Proxy chỉ dùng để redirect cho UX. MỖI Server Action và Route Handler của admin phải tự gọi `auth.getClaims()` rồi kiểm tra `school_is_admin()`.
   - Dùng `getUser()` khi cần bản ghi user mới nhất.
   - Không dùng `getSession()` để phân quyền.
3. Mọi input đều validate bằng zod ở server. Chỉ nhận các field được phép (không mass-assign).
4. HTML từ TipTap phải qua `sanitize-html` (allowlist) trước khi lưu. Chỉ render HTML đã lọc.
5. Form công khai:
   - Turnstile: verify ở server bằng `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` (`secret`, `response`). Token chỉ dùng được một lần và hết hạn sau 300 giây.
   - Honeypot.
   - Chặn trùng SĐT/email trong 10 phút.
   - Bắt buộc checkbox đồng ý chính sách, lưu thời điểm vào `consent_at`.
   - Insert qua `admin.ts`. Anon không có quyền insert, đây là chủ đích để không ai lách được Turnstile bằng REST API.
6. Upload:
   - Bucket đã giới hạn MIME và dung lượng. Client nén ảnh trước khi upload (≤ 5 MB, ưu tiên webp).
   - Tên file là uuid.
   - Khi xóa bản ghi thì xóa luôn object; path suy từ public URL `/object/public/<bucket>/<path>`.
7. URL do admin nhập chỉ được là `https://` hoặc đường dẫn nội bộ `/`. Bản đồ chỉ nhận `https://www.google.com/maps/embed…`.
8. Supabase Auth: MFA TOTP (miễn phí) và CAPTCHA Turnstile đã bật trong `config.toml`; production phải bật trong dashboard với secret thật.
   - Khi đăng nhập, truyền `options.captchaToken` cho `signInWithPassword`. Supabase tự verify token này, nên KHÔNG tự gọi siteverify với cùng token.
   - Mật khẩu tối thiểu 12 ký tự.
9. Security headers trong `next.config`:
   - CSP: `frame-src` cho Google Maps + `challenges.cloudflare.com`; `frame-ancestors 'none'`.
   - `nosniff`, `Referrer-Policy`.
   - Lỗi chỉ trả thông báo chung.
10. Bảng hoặc hàm mới:
    - Bật RLS.
    - `GRANT` tường minh cho `anon`/`authenticated`/`service_role`. Từ 30/10/2026 Supabase không tự cấp quyền nữa; thiếu grant sẽ báo lỗi `42501`.
    - Thêm case vào `rls_check.sql`.
11. Không bao giờ đặt `SUPABASE_SECRET_KEY` hay `TURNSTILE_SECRET_KEY` dưới tiền tố `NEXT_PUBLIC_`. Project mới chỉ có publishable/secret key, không còn `anon`/`service_role` key.

## Quy ước dữ liệu & hiển thị

- Không hardcode nội dung: mọi nội dung lấy từ Supabase. Dev dùng Supabase local + seed, không dùng mock.
- Không ghi dữ liệu cá nhân (tên, SĐT, email, nội dung form) vào `console.log`, log server hay Sentry. Căn cứ pháp lý: `docs/spec.md` mục 5.
- Bài viết: public chỉ thấy bài có `status='published'` và `published_at <= now()`. Lượt xem tăng qua RPC gọi từ client sau khi trang hiển thị.
- Cache:
  - Trang public đọc dữ liệu trong `'use cache'` kèm `cacheTag('<tên bảng>')`.
  - Server Action của admin, sau khi ghi: gọi `updateTag('<tên bảng>')` để lần đọc kế tiếp lấy dữ liệu mới; gọi `revalidatePath(path, 'page')` khi đường dẫn có segment động.
  - `revalidateTag` bắt buộc có tham số thứ hai (vd. `'max'`).
- Ngày giờ: `Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })`. Server chạy giờ UTC.
- Slug:
  - Bỏ dấu (NFD + xóa dấu kết hợp) và đổi `đ/Đ` thành `d`.
  - Slug trùng thì thêm hậu tố `-2`, `-3`.
  - Bắt buộc có unit test.
- Tìm kiếm: so khớp không dấu (vd. `unaccent`) để người dùng gõ "tuyen sinh" vẫn ra kết quả.
- Điểm chuẩn luôn hiển thị kèm `max_score` vì thang điểm đổi theo năm.
- `next/image`: thêm `remotePatterns` cho domain Supabase Storage và `images.unsplash.com` (ảnh seed).
- Font qua `next/font` với `subsets: ['latin', 'vietnamese']`.
- Carousel: có nút tạm dừng; tắt autoplay khi `prefers-reduced-motion`; ảnh slide đầu đặt `priority` (LCP).
- Mỗi route segment có `error.tsx`, `not-found.tsx`. Mọi thao tác admin báo kết quả bằng toast; thao tác xóa có modal xác nhận.
- Trang public KHÔNG dùng `loading.tsx` hay `<Suspense>` bọc cả trang: trang tĩnh lớn hơn ~12 KB bị React tách khỏi shell, trình duyệt vẽ fallback rồi đẩy footer (CLS 0,57 trên Lighthouse mobile). Chỉ bọc `<Suspense>` quanh phần đọc `searchParams`, fallback có `min-h-dvh` để footer nằm ngoài màn hình tới khi dữ liệu về. `/tin-tuc/[slug]` đọc `params` trực tiếp với `instant = false`.

## Definition of done

1. lint + typecheck + build sạch.
2. Vitest + Playwright pass.
3. `rls_check.sql` pass (nếu có đổi DB).
4. Kiểm tra trên trình duyệt ở 375px và desktop.
5. axe không có lỗi mức serious.

Phần nào chưa kiểm tra được thì ghi rõ.
