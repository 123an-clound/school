import Image from "next/image";

// Initial of the given name (last word): "ThS. Trần Thị Mai Lan" -> "L"
const initial = (name: string) => name.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() ?? "?";

export function PersonAvatar({ name, src, size = 96 }: { name: string; src?: string | null; size?: number }) {
  return src ? (
    <Image src={src} alt={`Ảnh ${name}`} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-secondary font-heading font-bold text-primary"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initial(name)}
    </span>
  );
}
