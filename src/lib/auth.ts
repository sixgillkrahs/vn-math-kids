import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

const TOKEN_PREFIX = "tvk_";

export function generateToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, ts: Date.now() })
  ).toString("base64url");
  return TOKEN_PREFIX + payload;
}

export function parseToken(token: string): { userId: string } | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  try {
    const payload = token.slice(TOKEN_PREFIX.length);
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
