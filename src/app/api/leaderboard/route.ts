import { NextRequest } from "next/server";
import { createHash } from "crypto";
import dbConnect from "@/lib/mongodb";
import Result from "@/lib/models/Result";
import User from "@/lib/models/User";
import { getUserFromRequest } from "@/lib/auth";

function hashId(id: string): string {
  return createHash("sha256").update(id).digest("base64url").slice(0, 12);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = Number(searchParams.get("grade"));

    if (!grade || grade < 1 || grade > 5) {
      return Response.json(
        { error: "Lớp phải từ 1 đến 5" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return Response.json({ leaderboard: [] });
    }

    await dbConnect();

    const pipeline = [
      { $match: { grade, userId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          totalCorrect: { $sum: "$correctAnswers" },
          totalQuestions: { $sum: "$totalQuestions" },
          gamesPlayed: { $sum: 1 },
          avgScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
        },
      },
      { $sort: { totalScore: -1 as const } },
      { $limit: 20 },
    ];

    const stats = await Result.aggregate(pipeline);

    const userIds = stats.map((s: { _id: string }) => s._id);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "displayName avatar grade"
    );
    const userMap = new Map(
      users.map((u) => [u._id.toString(), u])
    );

    const leaderboard = stats.map(
      (
        s: {
          _id: string;
          totalScore: number;
          totalCorrect: number;
          totalQuestions: number;
          gamesPlayed: number;
          avgScore: number;
          bestScore: number;
        },
        index: number
      ) => {
        const u = userMap.get(s._id);
        return {
          rank: index + 1,
          userId: hashId(s._id),
          displayName: u?.displayName || "Học sinh",
          avatar: u?.avatar || "🐱",
          totalScore: s.totalScore,
          totalCorrect: s.totalCorrect,
          totalQuestions: s.totalQuestions,
          gamesPlayed: s.gamesPlayed,
          avgScore: Math.round(s.avgScore),
          bestScore: s.bestScore,
        };
      }
    );

    const me = await getUserFromRequest(request);
    const myUserId = me ? hashId(me._id.toString()) : null;

    return Response.json({ leaderboard, grade, myUserId });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return Response.json(
      { error: "Không thể tải bảng xếp hạng" },
      { status: 500 }
    );
  }
}
