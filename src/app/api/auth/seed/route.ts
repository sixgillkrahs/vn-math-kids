import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST() {
  try {
    if (!process.env.MONGODB_URI) {
      return Response.json(
        { error: "Chưa cấu hình kết nối database" },
        { status: 503 }
      );
    }

    await dbConnect();

    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        return Response.json({ message: "Đã cập nhật role admin" });
      }
      return Response.json({ message: "Tài khoản admin đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash("admin", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      displayName: "Admin",
      grade: 1,
      avatar: "🦁",
      role: "admin",
    });

    return Response.json({ message: "Đã tạo tài khoản admin thành công" });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json(
      { error: "Không thể tạo tài khoản admin" },
      { status: 500 }
    );
  }
}
