import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return Response.json(
        { error: "Chưa cấu hình kết nối database" },
        { status: 503 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return Response.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const token = generateToken(user._id.toString());

    return Response.json({
      token,
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
    console.error("Login error:", error);
    return Response.json(
      { error: "Không thể đăng nhập. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
