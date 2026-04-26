import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    return Response.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        grade: user.grade,
        avatar: user.avatar,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json(
      { error: "Không thể lấy thông tin người dùng" },
      { status: 500 }
    );
  }
}
