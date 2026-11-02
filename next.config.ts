import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

// No nonces: they force dynamic rendering, which would defeat Cache Components.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${supabase?.origin ?? ""}`,
  "font-src 'self'",
  `connect-src 'self' ${supabase?.origin ?? ""}`,
  "frame-src https://www.google.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// On Vercel without an explicit NEXT_PUBLIC_SITE_URL: production uses the project domain, previews their own URL
const vercelHost = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL;

const nextConfig: NextConfig = {
  ...(!process.env.NEXT_PUBLIC_SITE_URL && vercelHost ? { env: { NEXT_PUBLIC_SITE_URL: `https://${vercelHost}` } } : {}),
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Object form, not new URL(): a URL carries an empty `search`, which rejects any query string
    remotePatterns: [
      ...(supabase ? [{ protocol: "https" as const, hostname: supabase.hostname, pathname: "/storage/v1/object/public/**" }] : []),
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
