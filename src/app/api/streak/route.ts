import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const today = getToday();
    const yesterday = getYesterday();
    const lastActive = user.lastActiveDate || null;

    let currentStreak = user.currentStreak || 0;
    if (lastActive && lastActive !== today && lastActive !== yesterday) {
      currentStreak = 0;
    }

    return Response.json({
      currentStreak,
      longestStreak: user.longestStreak || 0,
      lastActiveDate: lastActive,
      activeToday: lastActive === today,
    });
  } catch (error) {
    console.error("Streak GET error:", error);
    return Response.json(
      { error: "Không thể lấy thông tin streak" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    await dbConnect();

    const today = getToday();
    const yesterday = getYesterday();
    const lastActive = user.lastActiveDate || null;

    if (lastActive === today) {
      return Response.json({
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        lastActiveDate: today,
        activeToday: true,
        message: "Đã cộng streak hôm nay rồi!",
      });
    }

    let newStreak: number;
    if (lastActive === yesterday) {
      newStreak = (user.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(user.longestStreak || 0, newStreak);

    await User.findByIdAndUpdate(user._id, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    });

    return Response.json({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      activeToday: true,
    });
  } catch (error) {
    console.error("Streak POST error:", error);
    return Response.json(
      { error: "Không thể cập nhật streak" },
      { status: 500 }
    );
  }
}
