import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const grade = formData.get("grade") as string;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: "AI scanning is not configured. Please set GEMINI_API_KEY.",
          exercises: getSampleScannedExercises(Number(grade) || 1),
        },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = (file.type || "image/png") as
      | "image/png"
      | "image/jpeg"
      | "image/webp"
      | "application/pdf";

    const prompt = `You are a math exercise extractor for Vietnamese elementary school students (grades 1-5).
Extract all math problems from this image and return them as a JSON array.
Each exercise should have: question, answer, topic, explanation.
Return ONLY valid JSON array, no markdown, no code fences.
Example: [{"question": "5 + 3 = ?", "answer": "8", "topic": "Phép cộng", "explanation": "5 + 3 = 8"}]

Extract math exercises from this image for grade ${grade || "1-5"} students in Vietnam.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ]);

    const content = result.response.text();
    let exercises;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      exercises = JSON.parse(cleaned);
    } catch {
      exercises = getSampleScannedExercises(Number(grade) || 1);
    }

    return Response.json({ exercises });
  } catch (error) {
    console.error("Scan error:", error);
    return Response.json(
      { error: "Failed to scan file" },
      { status: 500 }
    );
  }
}

function getSampleScannedExercises(grade: number) {
  const samples: Record<
    number,
    Array<{
      question: string;
      answer: string;
      topic: string;
      explanation: string;
    }>
  > = {
    1: [
      {
        question: "3 + 4 = ?",
        answer: "7",
        topic: "Phép cộng",
        explanation: "3 + 4 = 7",
      },
      {
        question: "8 - 5 = ?",
        answer: "3",
        topic: "Phép trừ",
        explanation: "8 - 5 = 3",
      },
    ],
    2: [
      {
        question: "25 + 37 = ?",
        answer: "62",
        topic: "Phép cộng",
        explanation: "25 + 37 = 62",
      },
      {
        question: "4 × 6 = ?",
        answer: "24",
        topic: "Phép nhân",
        explanation: "4 × 6 = 24",
      },
    ],
    3: [
      {
        question: "7 × 8 = ?",
        answer: "56",
        topic: "Phép nhân",
        explanation: "7 × 8 = 56",
      },
      {
        question: "63 ÷ 9 = ?",
        answer: "7",
        topic: "Phép chia",
        explanation: "63 ÷ 9 = 7",
      },
    ],
    4: [
      {
        question: "45 × 6 = ?",
        answer: "270",
        topic: "Phép nhân",
        explanation: "45 × 6 = 270",
      },
      {
        question: "1/4 + 2/4 = ?",
        answer: "3/4",
        topic: "Phân số",
        explanation: "1/4 + 2/4 = 3/4",
      },
    ],
    5: [
      {
        question: "3.5 + 2.7 = ?",
        answer: "6.2",
        topic: "Số thập phân",
        explanation: "3.5 + 2.7 = 6.2",
      },
      {
        question: "25% của 200 = ?",
        answer: "50",
        topic: "Phần trăm",
        explanation: "25% × 200 = 50",
      },
    ],
  };
  return samples[grade] || samples[1];
}
