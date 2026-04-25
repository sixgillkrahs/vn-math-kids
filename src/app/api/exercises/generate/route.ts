import { NextRequest } from "next/server";
import { generateExercises } from "@/lib/mathGenerator";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/lib/models/Exercise";

export async function POST(request: NextRequest) {
  try {
    const { grade, count = 10 } = await request.json();

    if (!grade || grade < 1 || grade > 5) {
      return Response.json(
        { error: "Grade must be between 1 and 5" },
        { status: 400 }
      );
    }

    const exercises = generateExercises(grade, count);

    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        await Exercise.insertMany(
          exercises.map((ex) => ({
            grade,
            topic: ex.topic,
            question: ex.question,
            options: ex.options,
            answer: ex.answer,
            explanation: ex.explanation,
            difficulty: "easy",
            source: "generated",
          }))
        );
      } catch (dbError) {
        console.warn("Could not save exercises to DB:", dbError);
      }
    }

    return Response.json({ exercises });
  } catch (error) {
    console.error("Generate exercises error:", error);
    return Response.json(
      { error: "Failed to generate exercises" },
      { status: 500 }
    );
  }
}
