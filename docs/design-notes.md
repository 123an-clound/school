# Ghi chú thiết kế

## Điều hướng (2026-11-01)

- Đã xem:
  - https://www.shadcnblocks.com/block/navbar14 — mega menu cho giáo dục; bản **Pro** (trả phí), không dùng code.
  - https://www.shadcnblocks.com/block/navbar1 — NavigationMenu trên desktop, Sheet + accordion trên mobile; chỉ tham khảo pattern.
- Chọn: 7 mục menu phẳng (spec mục 3.1, không có menu con), nên không cần dropdown hay mega menu.
  - Desktop (≥ 1024px): nav ngang, mục đang xem có gạch chân đỏ và `aria-current="page"`.
  - Mobile: nút mở Sheet (Radix Dialog: giữ focus bên trong, đóng bằng Esc) gồm ô tìm kiếm, 7 mục menu, hotline, link đăng nhập.
  - Topbar navy (hotline, email, mạng xã hội) chỉ hiện từ 768px; header chính sticky.
- Code tự viết bằng primitive shadcn có sẵn (`sheet`, `button`, `input`): `components/site/main-nav.tsx`.

## Thị giác

- Phong cách: tối giản, lưới rõ, ưu tiên nội dung (ui-ux-pro-max: Minimalism & Swiss), chuyển động nhẹ. Bảng màu và font theo spec mục 2.
- Tương phản: vàng `#d97706` dưới chữ navy chỉ đạt 4.3:1, nên token `--brand-gold` dùng `#f59e0b` (6.4:1). Không dùng vàng cho chữ trên nền trắng.
- Carousel: không dùng `stopOnMouseEnter` của Embla, vì plugin tự chạy lại khi rời chuột dù người dùng đã bấm tạm dừng.
