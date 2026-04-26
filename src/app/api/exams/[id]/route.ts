import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exam from "@/lib/models/Exam";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!process.env.MONGODB_URI) {
      return Response.json(
        { error: "Chưa cấu hình kết nối database." },
        { status: 503 }
      );
    }

    await dbConnect();

    const exam = await Exam.findById(id).lean();

    if (!exam) {
      return Response.json(
        { error: "Không tìm thấy đề thi" },
        { status: 404 }
      );
    }

    return Response.json({ exam });
  } catch (error) {
    console.error("Get exam error:", error);
    return Response.json(
      { error: "Không thể tải đề thi" },
      { status: 500 }
    );
  }
}
