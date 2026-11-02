"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { toast } from "sonner";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { cn } from "cn";
import { uploadFile } from "@/lib/upload";

// TipTap editor posting its HTML through a hidden input. The server sanitizes it before saving.
export function RichEditor({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [html, setHtml] = useState(defaultValue);
  // State rather than a ref: the toolbar handlers are built during render
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"], HTMLAttributes: { rel: null, target: null } },
      }),
      Image,
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "rich-text min-h-72 px-4 py-3 outline-none", "aria-label": label, role: "textbox", "aria-multiline": "true" } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && {
        h2: e.isActive("heading", { level: 2 }),
        h3: e.isActive("heading", { level: 3 }),
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        bullet: e.isActive("bulletList"),
        ordered: e.isActive("orderedList"),
        quote: e.isActive("blockquote"),
        link: e.isActive("link"),
      },
  });

  const tools = editor
    ? [
        { label: "Tiêu đề lớn", icon: Heading2, on: active?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: "Tiêu đề nhỏ", icon: Heading3, on: active?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: "In đậm", icon: Bold, on: active?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { label: "In nghiêng", icon: Italic, on: active?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { label: "Danh sách", icon: List, on: active?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
        { label: "Danh sách số", icon: ListOrdered, on: active?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
        { label: "Trích dẫn", icon: Quote, on: active?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
        {
          label: "Chèn liên kết",
          icon: Link2,
          on: active?.link,
          run: () => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const href = window.prompt("Địa chỉ liên kết (https://… hoặc /…). Để trống để bỏ liên kết.", prev ?? "https://");
            if (href === null) return;
            if (!href.trim()) return void editor.chain().focus().unsetLink().run();
            if (!/^(https:\/\/|\/(?!\/)|mailto:|tel:)/.test(href.trim())) return void toast.error("Chỉ nhận liên kết https://, /, mailto: hoặc tel:");
            editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
          },
        },
        { label: "Chèn ảnh", icon: ImagePlus, on: false, run: () => fileInput?.click() },
        { label: "Hoàn tác", icon: Undo2, on: false, run: () => editor.chain().focus().undo().run() },
        { label: "Làm lại", icon: Redo2, on: false, run: () => editor.chain().focus().redo().run() },
      ]
    : [];

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={html} />
      <div className="mt-1.5 overflow-hidden rounded-lg border border-input bg-card focus-within:ring-3 focus-within:ring-ring/50">
        <div role="toolbar" aria-label={`Định dạng ${label.toLowerCase()}`} className="flex flex-wrap gap-1 border-b bg-muted p-1">
          {tools.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={t.on ?? undefined}
              onClick={t.run}
              className={cn("grid size-9 place-items-center rounded-md hover:bg-background", t.on && "bg-background text-primary shadow-sm")}
            >
              <t.icon className="size-4" />
            </button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input
        ref={setFileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file || !editor) return;
          const alt = window.prompt("Mô tả ngắn cho ảnh (cho người dùng trình đọc màn hình):", "") ?? "";
          try {
            const { url } = await uploadFile(file, "school-media");
            editor.chain().focus().setImage({ src: url, alt }).run();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Tải ảnh không thành công.");
          }
        }}
      />
    </div>
  );
}
