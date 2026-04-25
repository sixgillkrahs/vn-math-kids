import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/lib/models/Exercise";

export async function POST(request: NextRequest) {
  try {
    const { exercises, grade } = await request.json();

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return Response.json(
        { error: "Danh sách bài tập không hợp lệ" },
        { status: 400 }
      );
    }

    if (!grade || grade < 1 || grade > 5) {
      return Response.json(
        { error: "Lớp phải từ 1 đến 5" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return Response.json(
        { error: "Chưa cấu hình kết nối database. Vui lòng thêm MONGODB_URI vào environment variables." },
        { status: 503 }
      );
    }

    await dbConnect();

    const docs = exercises.map(
      (ex: {
        question: string;
        answer: string;
        topic?: string;
        explanation?: string;
        options?: string[];
      }) => ({
        grade,
        question: ex.question,
        answer: ex.answer,
        topic: ex.topic || "Bài tập quét",
        explanation: ex.explanation || "",
        options: ex.options || [],
        difficulty: "easy" as const,
        source: "scanned" as const,
      })
    );

    const saved = await Exercise.insertMany(docs);

    return Response.json({
      message: `Đã lưu ${saved.length} bài tập vào ngân hàng đề`,
      count: saved.length,
    });
  } catch (error) {
    console.error("Save exercises error:", error);
    const message =
      error instanceof Error && error.message.includes("MONGODB_URI")
        ? "Chưa cấu hình kết nối database. Vui lòng thêm MONGODB_URI vào environment variables."
        : "Không thể lưu bài tập. Vui lòng thử lại.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = Number(searchParams.get("grade"));
    const count = Number(searchParams.get("count")) || 10;

    if (!grade || grade < 1 || grade > 5) {
      return Response.json(
        { error: "Lớp phải từ 1 đến 5" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return Response.json(
        {
          exercises: [],
          total: 0,
          message: "Chưa cấu hình kết nối database.",
        }
      );
    }

    await dbConnect();

    const total = await Exercise.countDocuments({ grade });

    if (total === 0) {
      return Response.json({
        exercises: [],
        total: 0,
        message: "Chưa có bài tập nào trong ngân hàng đề cho lớp này",
      });
    }

    const exercises = await Exercise.aggregate([
      { $match: { grade } },
      { $sample: { size: Math.min(count, total) } },
      {
        $project: {
          _id: 0,
          question: 1,
          answer: 1,
          options: 1,
          topic: 1,
          explanation: 1,
        },
      },
    ]);

    return Response.json({ exercises, total });
  } catch (error) {
    console.error("Fetch bank exercises error:", error);
    const message =
      error instanceof Error && error.message.includes("MONGODB_URI")
        ? "Chưa cấu hình kết nối database."
        : "Không thể tải bài tập từ ngân hàng đề";
    return Response.json({ error: message }, { status: 500 });
  }
}
