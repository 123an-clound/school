import { ImageResponse } from "next/og";
import { getSchoolInfo } from "@/lib/data";

// Default link preview for every page; articles with a cover image set their own.
export const alt = "Cổng thông tin điện tử của nhà trường";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const label = "Cổng thông tin điện tử";

// ImageResponse needs TTF/OTF, not the site's woff2. Google serves a TTF holding only the given characters.
async function beVietnamPro(weight: 400 | 700, text: string) {
  "use cache";
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error("Open Graph font not available");
  return (await fetch(url)).arrayBuffer();
}

export default async function Image() {
  const school = await getSchoolInfo();
  const regular = [label, school.slogan, school.address].filter(Boolean).join("");
  const [normal, bold] = await Promise.all([beVietnamPro(400, regular), beVietnamPro(700, school.name)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0F2C59",
          color: "#FFFFFF",
          fontFamily: "Be Vietnam Pro",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 32, color: "#FBBF24" }}>
          <div style={{ width: 64, height: 8, background: "#F59E0B" }} />
          {label}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.1 }}>{school.name}</div>
          {school.slogan && <div style={{ marginTop: 28, fontSize: 38, color: "rgba(255,255,255,0.88)" }}>{school.slogan}</div>}
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)" }}>{school.address}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Be Vietnam Pro", data: normal, weight: 400, style: "normal" },
        { name: "Be Vietnam Pro", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
