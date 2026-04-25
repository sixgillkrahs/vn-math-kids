import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth";

const AVATARS = ["🐱", "🐶", "🐰", "🦊", "🦁", "🐼", "🐨", "🐸", "🦋", "🐝"];

export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName, grade, avatar } =
      await request.json();

    if (!username || !password || !displayName || !grade) {
      return Response.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return Response.json(
        { error: "Tên đăng nhập phải từ 3-20 ký tự" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return Response.json(
        { error: "Mật khẩu phải có ít nhất 4 ký tự" },
        { status: 400 }
      );
    }

    if (grade < 1 || grade > 5) {
      return Response.json(
        { error: "Lớp phải từ 1 đến 5" },
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

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return Response.json(
        { error: "Tên đăng nhập đã tồn tại" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      displayName,
      grade,
      avatar: avatar && AVATARS.includes(avatar) ? avatar : "🐱",
    });

    const token = generateToken(user._id.toString());

    return Response.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        grade: user.grade,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json(
      { error: "Không thể đăng ký. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
