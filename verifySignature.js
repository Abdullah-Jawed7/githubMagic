import crypto from "crypto";

export function verifySignature(secret, sigHeader, body) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = `sha256=${hmac.digest("hex")}`;

  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(sigHeader, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
