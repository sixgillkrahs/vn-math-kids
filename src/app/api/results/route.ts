import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Result from "@/lib/models/Result";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        const result = await Result.create(body);
        return Response.json({ result });
      } catch (dbError) {
        console.warn("Could not save result to DB:", dbError);
      }
    }

    return Response.json({ result: body, saved: false });
  } catch (error) {
    console.error("Save result error:", error);
    return Response.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentName = searchParams.get("studentName");
    const grade = searchParams.get("grade");

    if (!process.env.MONGODB_URI) {
      return Response.json({ results: [] });
    }

    try {
      await dbConnect();

      const query: Record<string, unknown> = {};
      if (studentName) query.studentName = studentName;
      if (grade) query.grade = Number(grade);

      const results = await Result.find(query)
        .sort({ completedAt: -1 })
        .limit(20);

      return Response.json({ results });
    } catch (dbError) {
      console.warn("Could not fetch results from DB:", dbError);
      return Response.json({ results: [] });
    }
  } catch (error) {
    console.error("Get results error:", error);
    return Response.json(
      { error: "Failed to get results" },
      { status: 500 }
    );
  }
}
