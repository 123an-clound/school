import "server-only";

// Tokens are single-use and expire after 300s. Fails closed when Cloudflare is unreachable.
export async function verifyTurnstile(token: FormDataEntryValue | null): Promise<boolean> {
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token }),
    });
    if (!res.ok) return false;
    const data: { success?: boolean } = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
