import crypto from "crypto";

const CALLBACK_SECRET = process.env.CALLBACK_SECRET || "";

export function isValidSlug(slug: string): boolean {
  const validSlugPattern = /^[a-zA-Z0-9_/-]+$/;
  if (!validSlugPattern.test(slug)) return false;
  if (slug.includes("..") || slug.includes("\\")) return false;
  return true;
}

export function isCallbackHashValid(input: string, hash: string): boolean {
  if (!CALLBACK_SECRET) return false;
  const localHash = crypto.createHash("sha256").update(`${CALLBACK_SECRET}:${input}`).digest("hex");
  return localHash === hash;
}
