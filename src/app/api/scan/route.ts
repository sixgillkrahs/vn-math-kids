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
          error: "Chưa cấu hình Gemini API Key. Vui lòng thêm GEMINI_API_KEY vào environment variables.",
        },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = (file.type || "image/png") as
      | "image/png"
      | "image/jpeg"
      | "image/webp"
      | "application/pdf";

    const prompt = `You are a math exercise extractor for Vietnamese elementary school students (grades 1-5).
Extract all math problems from this image and return them as a JSON array.
Each exercise MUST have: question, answer, options (array of exactly 4 strings), topic, explanation, difficulty.

CRITICAL RULES for "difficulty":
- "difficulty" must be one of: "easy", "medium", "hard"
- "easy": basic operations, simple recognition, single-step problems
- "medium": multi-step problems, word problems with 2 steps, intermediate concepts
- "hard": complex word problems, advanced concepts, multi-step reasoning, olympiad-style

CRITICAL RULES for "options":
- "options" must be an array of exactly 4 answer choices including the correct answer.
- ALL options MUST have the EXACT same format and unit as the correct answer.
  For example if the answer is "66 cm", then ALL 4 options must end with " cm" (e.g. ["66 cm", "56 cm", "76 cm", "60 cm"]).
  If the answer is "3/4", all options must be fractions (e.g. ["3/4", "2/4", "1/4", "4/4"]).
  If the answer is "62", all options must be plain numbers (e.g. ["62", "52", "72", "58"]).
- Wrong options must be plausible (close in value) but clearly incorrect.
- The correct answer must appear in the options array at a random position.
- Do NOT mix formats (e.g. "66 cm" with "56" without unit is WRONG).

Return ONLY valid JSON array, no markdown, no code fences.
Example: [{"question": "70 cm - 30 cm + 26 cm = ?", "answer": "66 cm", "options": ["66 cm", "56 cm", "76 cm", "60 cm"], "topic": "Phép tính độ dài", "explanation": "70 - 30 + 26 = 66 cm", "difficulty": "easy"}]

Extract math exercises from this image for grade ${grade || "1-5"} students in Vietnam.`;

    let lastError: unknown;
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
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
          if (Array.isArray(exercises)) {
            exercises = exercises.map(normalizeExercise);
          }
        } catch {
          return Response.json(
            { error: "Không thể phân tích kết quả từ AI. Vui lòng thử lại." },
            { status: 200 }
          );
        }

        return Response.json({ exercises });
      } catch (err) {
        lastError = err;
        const isRetryable =
          err instanceof Error &&
          (err.message.includes("429") ||
            err.message.includes("404") ||
            err.message.includes("503") ||
            err.message.includes("500") ||
            err.message.includes("overloaded") ||
            err.message.includes("high demand"));
        if (isRetryable) {
          continue;
        }
        break;
      }
    }

    console.error("Scan error after retries:", lastError);
    const errorMessage =
      lastError instanceof Error &&
      (lastError.message.includes("429") ||
        lastError.message.includes("503") ||
        lastError.message.includes("high demand"))
        ? "API đang bận, vui lòng thử lại sau ít phút."
        : "Không thể quét file. Vui lòng thử lại.";
    return Response.json(
      {
        error: errorMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Scan error:", error);
    return Response.json(
      {
        error: "Đã xảy ra lỗi khi quét file.",
      },
      { status: 200 }
    );
  }
}

function generateConsistentOptions(answer: string): string[] {
  const unitMatch = answer.match(/^([\d.,/]+)\s*([a-zA-Z%°²³µ].*)$/);
  const unit = unitMatch ? unitMatch[2] : "";
  const numStr = unitMatch ? unitMatch[1] : answer;

  if (numStr.includes("/")) {
    const [num, den] = numStr.split("/").map(Number);
    if (!isNaN(num) && !isNaN(den) && den > 0) {
      const opts = new Set<string>([answer]);
      while (opts.size < 4) {
        const delta = Math.floor(Math.random() * 3) + 1;
        const sign = Math.random() > 0.5 ? 1 : -1;
        const newNum = Math.max(0, num + delta * sign);
        const val = `${newNum}/${den}`;
        opts.add(unit ? `${val} ${unit}` : val);
      }
      return [...opts].sort(() => Math.random() - 0.5);
    }
  }

  const num = parseFloat(numStr.replace(",", "."));
  if (!isNaN(num)) {
    const opts = new Set<string>([answer]);
    const magnitude = Math.max(1, Math.floor(Math.abs(num) * 0.15) || 1);
    while (opts.size < 4) {
      const delta = Math.floor(Math.random() * magnitude * 2) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const newNum = num + delta * sign;
      const formatted = Number.isInteger(num)
        ? String(Math.round(newNum))
        : newNum.toFixed(numStr.includes(".") ? (numStr.split(".")[1]?.length || 1) : 1);
      opts.add(unit ? `${formatted} ${unit}` : formatted);
    }
    return [...opts].sort(() => Math.random() - 0.5);
  }

  return [answer, "Không xác định", "Đáp án khác", "Không có đáp án"].sort(
    () => Math.random() - 0.5
  );
}

function normalizeExercise(ex: {
  question: string;
  answer: string;
  options?: string[];
  topic?: string;
  explanation?: string;
  difficulty?: string;
}) {
  let options = ex.options;

  if (!Array.isArray(options) || options.length < 2) {
    options = generateConsistentOptions(ex.answer);
  } else {
    if (!options.includes(ex.answer)) {
      options[Math.floor(Math.random() * options.length)] = ex.answer;
    }

    const unitMatch = ex.answer.match(/^[\d.,/]+\s*([a-zA-Z%°²³µ].*)$/);
    if (unitMatch) {
      const unit = unitMatch[1];
      options = options.map((opt) => {
        if (opt === ex.answer) return opt;
        const optUnit = opt.match(/^[\d.,/]+\s*([a-zA-Z%°²³µ].*)$/);
        if (!optUnit || optUnit[1] !== unit) {
          const numPart = opt.replace(/[^\d.,/\-]/g, "").trim();
          return numPart ? `${numPart} ${unit}` : opt;
        }
        return opt;
      });
    }

    while (options.length < 4) {
      const extra = generateConsistentOptions(ex.answer);
      for (const e of extra) {
        if (!options.includes(e) && options.length < 4) options.push(e);
      }
    }
    if (options.length > 4) options = options.slice(0, 4);
  }

  const validDifficulties = ["easy", "medium", "hard"];
  const difficulty = validDifficulties.includes(ex.difficulty || "")
    ? ex.difficulty
    : "easy";

  return { ...ex, options, difficulty };
}

function getSampleScannedExercises(grade: number) {
  const samples: Record<
    number,
    Array<{
      question: string;
      answer: string;
      options: string[];
      topic: string;
      explanation: string;
    }>
  > = {
    1: [
      {
        question: "3 + 4 = ?",
        answer: "7",
        options: ["5", "7", "6", "8"],
        topic: "Phép cộng",
        explanation: "3 + 4 = 7",
      },
      {
        question: "8 - 5 = ?",
        answer: "3",
        options: ["3", "4", "2", "5"],
        topic: "Phép trừ",
        explanation: "8 - 5 = 3",
      },
    ],
    2: [
      {
        question: "25 + 37 = ?",
        answer: "62",
        options: ["52", "62", "72", "58"],
        topic: "Phép cộng",
        explanation: "25 + 37 = 62",
      },
      {
        question: "4 × 6 = ?",
        answer: "24",
        options: ["20", "28", "24", "22"],
        topic: "Phép nhân",
        explanation: "4 × 6 = 24",
      },
    ],
    3: [
      {
        question: "7 × 8 = ?",
        answer: "56",
        options: ["48", "56", "64", "54"],
        topic: "Phép nhân",
        explanation: "7 × 8 = 56",
      },
      {
        question: "63 ÷ 9 = ?",
        answer: "7",
        options: ["6", "8", "7", "9"],
        topic: "Phép chia",
        explanation: "63 ÷ 9 = 7",
      },
    ],
    4: [
      {
        question: "45 × 6 = ?",
        answer: "270",
        options: ["260", "280", "270", "250"],
        topic: "Phép nhân",
        explanation: "45 × 6 = 270",
      },
      {
        question: "1/4 + 2/4 = ?",
        answer: "3/4",
        options: ["2/4", "3/4", "1/4", "4/4"],
        topic: "Phân số",
        explanation: "1/4 + 2/4 = 3/4",
      },
    ],
    5: [
      {
        question: "3.5 + 2.7 = ?",
        answer: "6.2",
        options: ["5.2", "6.2", "7.2", "6.0"],
        topic: "Số thập phân",
        explanation: "3.5 + 2.7 = 6.2",
      },
      {
        question: "25% của 200 = ?",
        answer: "50",
        options: ["40", "50", "60", "45"],
        topic: "Phần trăm",
        explanation: "25% × 200 = 50",
      },
    ],
  };
  return samples[grade] || samples[1];
}
