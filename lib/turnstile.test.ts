import { afterEach, describe, expect, it } from "vitest";
import { verifyTurnstile } from "./turnstile";

// Cloudflare's documented test secrets: 1x… always passes, 2x… always fails. Needs network.
const PASS = "1x0000000000000000000000000000000AA";
const FAIL = "2x0000000000000000000000000000000AA";
const original = process.env.TURNSTILE_SECRET_KEY;

afterEach(() => {
  process.env.TURNSTILE_SECRET_KEY = original;
});

describe("verifyTurnstile", () => {
  it("rejects a missing token without calling Cloudflare", async () => {
    expect(await verifyTurnstile(null)).toBe(false);
    expect(await verifyTurnstile("")).toBe(false);
  });

  it("follows the siteverify verdict", async () => {
    process.env.TURNSTILE_SECRET_KEY = PASS;
    expect(await verifyTurnstile("XXXX.DUMMY.TOKEN.XXXX")).toBe(true);
    process.env.TURNSTILE_SECRET_KEY = FAIL;
    expect(await verifyTurnstile("XXXX.DUMMY.TOKEN.XXXX")).toBe(false);
  });
});
