import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();

    if (!Array.isArray(answers)) {
      return Response.json(
        { error: "Answers must be an array" },
        { status: 400 }
      );
    }

    const results = answers.map(
      (a: { question: string; correctAnswer: string; userAnswer: string }) => ({
        question: a.question,
        correct: a.userAnswer.trim() === a.correctAnswer.trim(),
        correctAnswer: a.correctAnswer,
        userAnswer: a.userAnswer,
      })
    );

    const correctCount = results.filter(
      (r: { correct: boolean }) => r.correct
    ).length;
    const score = Math.round((correctCount / results.length) * 100);

    return Response.json({
      results,
      correctCount,
      totalQuestions: results.length,
      score,
    });
  } catch (error) {
    console.error("Check answers error:", error);
    return Response.json(
      { error: "Failed to check answers" },
      { status: 500 }
    );
  }
}
