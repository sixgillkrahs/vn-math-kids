import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

const TOKEN_PREFIX = "tvk_";

function getSecret(): string {
  return process.env.AUTH_SECRET || process.env.MONGODB_URI || "tvk-default-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function generateToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, ts: Date.now() })
  ).toString("base64url");
  const signature = sign(payload);
  return TOKEN_PREFIX + payload + "." + signature;
}

export function parseToken(token: string): { userId: string } | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  try {
    const rest = token.slice(TOKEN_PREFIX.length);
    const dotIdx = rest.lastIndexOf(".");
    if (dotIdx === -1) return null;

    const payload = rest.slice(0, dotIdx);
    const sig = rest.slice(dotIdx + 1);

    const expected = sign(payload);
    const sigBuf = Buffer.from(sig, "base64url");
    const expectedBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );
    if (data.userId) return { userId: data.userId };
    return null;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const parsed = parseToken(token);
  if (!parsed) return null;

  try {
    await dbConnect();
    const user = await User.findById(parsed.userId).select("-password");
    return user;
  } catch {
    return null;
  }
}
