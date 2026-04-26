import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exam from "@/lib/models/Exam";

export async function POST(request: NextRequest) {
  try {
    const { title, grade, timeLimit, exercises, difficulty } =
      await request.json();

    if (!title || !grade || !timeLimit || !exercises?.length) {
      return Response.json(
        { error: "Thiếu thông tin đề thi" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return Response.json(
        { error: "Chưa cấu hình kết nối database." },
        { status: 503 }
      );
    }

    await dbConnect();

    const exam = await Exam.create({
      title,
      grade,
      timeLimit,
      exercises,
      difficulty,
    });

    return Response.json({
      message: `Đã tạo đề thi "${title}" thành công`,
      examId: exam._id,
    });
  } catch (error) {
    console.error("Create exam error:", error);
    return Response.json(
      { error: "Không thể tạo đề thi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");

    if (!process.env.MONGODB_URI) {
      return Response.json({ exams: [], total: 0 });
    }

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (grade) filter.grade = Number(grade);

    const exams = await Exam.find(filter)
      .select("title grade timeLimit difficulty exercises createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = await Exam.countDocuments(filter);

    return Response.json({
      exams: exams.map((e) => ({
        _id: e._id,
        title: e.title,
        grade: e.grade,
        timeLimit: e.timeLimit,
        difficulty: e.difficulty,
        questionCount: e.exercises?.length ?? 0,
        createdAt: e.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("List exams error:", error);
    return Response.json(
      { error: "Không thể tải danh sách đề thi" },
      { status: 500 }
    );
  }
}
