import { describe, expect, it } from "vitest";
import { admissionInquirySchema, contactMessageSchema } from "./validation";

const inquiry = {
  student_name: " Nguyễn Văn A ",
  parent_name: "Nguyễn Văn B",
  phone: "0912 345.678",
  email: "",
  middle_school: "",
  question: "Học phí?",
  consent: "on",
};

const errorsOf = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));

describe("admissionInquirySchema", () => {
  it("normalizes input and drops unknown fields", () => {
    const r = admissionInquirySchema.safeParse({ ...inquiry, status: "resolved", id: 1 });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({
      student_name: "Nguyễn Văn A",
      parent_name: "Nguyễn Văn B",
      phone: "0912345678",
      question: "Học phí?",
      consent: "on",
    });
  });

  it("rejects missing consent with a Vietnamese message", () => {
    expect(errorsOf(admissionInquirySchema.safeParse({ ...inquiry, consent: undefined }))).toEqual({
      consent: "Bạn cần đồng ý với Chính sách bảo mật để gửi",
    });
  });

  it("rejects bad phone numbers and blank required fields", () => {
    const r = admissionInquirySchema.safeParse({ ...inquiry, phone: "12345", parent_name: "   " });
    expect(errorsOf(r)).toEqual({
      phone: "Số điện thoại không hợp lệ",
      parent_name: "Vui lòng nhập thông tin này",
    });
    expect(admissionInquirySchema.safeParse({ ...inquiry, phone: "+84912345678" }).success).toBe(true);
    expect(admissionInquirySchema.safeParse({ ...inquiry, phone: "024 3833 1234" }).success).toBe(true);
  });

  it("enforces DB length limits", () => {
    const r = admissionInquirySchema.safeParse({ ...inquiry, question: "x".repeat(2001) });
    expect(errorsOf(r)).toEqual({ question: "Tối đa 2000 ký tự" });
  });
});

describe("contactMessageSchema", () => {
  const message = { full_name: "Trần C", email: " c@example.com ", subject: "Hỏi", message: "Nội dung", consent: "on" };

  it("requires a valid email and allows a blank phone", () => {
    expect(contactMessageSchema.safeParse({ ...message, phone: "" }).data?.email).toBe("c@example.com");
    expect(errorsOf(contactMessageSchema.safeParse({ ...message, email: "abc" }))).toEqual({
      email: "Email không hợp lệ",
    });
    expect(errorsOf(contactMessageSchema.safeParse({ ...message, email: undefined }))).toHaveProperty("email");
  });
});
