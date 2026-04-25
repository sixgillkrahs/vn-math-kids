export interface GeneratedExercise {
  question: string;
  answer: string;
  options: string[];
  topic: string;
  explanation: string;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateOptions(correct: number, min: number, max: number): string[] {
  const opts = new Set<number>([correct]);
  while (opts.size < 4) {
    const delta = rand(-3, 3);
    const v = correct + delta;
    if (v >= min && v !== correct) opts.add(v);
    if (opts.size < 4) opts.add(rand(min, max));
  }
  return shuffle([...opts].slice(0, 4).map(String));
}

function grade1(): GeneratedExercise {
  const topics = ["addition", "subtraction", "comparison"];
  const topic = topics[rand(0, topics.length - 1)];

  if (topic === "addition") {
    const a = rand(1, 10);
    const b = rand(1, 10 - a);
    const answer = a + b;
    return {
      question: `${a} + ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 0, 20),
      topic: "Phép cộng trong phạm vi 10",
      explanation: `${a} + ${b} = ${answer}`,
    };
  } else if (topic === "subtraction") {
    const a = rand(2, 10);
    const b = rand(1, a);
    const answer = a - b;
    return {
      question: `${a} - ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 0, 10),
      topic: "Phép trừ trong phạm vi 10",
      explanation: `${a} - ${b} = ${answer}`,
    };
  } else {
    const a = rand(1, 20);
    const b = rand(1, 20);
    const sign = a > b ? ">" : a < b ? "<" : "=";
    return {
      question: `So sánh: ${a} ◻ ${b}. Điền dấu thích hợp (>, <, =)`,
      answer: sign,
      options: shuffle([">", "<", "="]).concat(["≥"]).slice(0, 4),
      topic: "So sánh số",
      explanation: `${a} ${sign} ${b}`,
    };
  }
}

function grade2(): GeneratedExercise {
  const topics = ["addition", "subtraction", "multiplication"];
  const topic = topics[rand(0, topics.length - 1)];

  if (topic === "addition") {
    const a = rand(10, 50);
    const b = rand(10, 50);
    const answer = a + b;
    return {
      question: `${a} + ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 20, 100),
      topic: "Phép cộng trong phạm vi 100",
      explanation: `${a} + ${b} = ${answer}`,
    };
  } else if (topic === "subtraction") {
    const a = rand(20, 100);
    const b = rand(10, a - 1);
    const answer = a - b;
    return {
      question: `${a} - ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 0, 100),
      topic: "Phép trừ trong phạm vi 100",
      explanation: `${a} - ${b} = ${answer}`,
    };
  } else {
    const a = rand(2, 5);
    const b = rand(1, 10);
    const answer = a * b;
    return {
      question: `${a} × ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 1, 50),
      topic: `Bảng nhân ${a}`,
      explanation: `${a} × ${b} = ${answer}`,
    };
  }
}

function grade3(): GeneratedExercise {
  const topics = ["multiplication", "division", "addition_large"];
  const topic = topics[rand(0, topics.length - 1)];

  if (topic === "multiplication") {
    const a = rand(2, 9);
    const b = rand(2, 9);
    const answer = a * b;
    return {
      question: `${a} × ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 1, 81),
      topic: "Phép nhân",
      explanation: `${a} × ${b} = ${answer}`,
    };
  } else if (topic === "division") {
    const b = rand(2, 9);
    const answer = rand(2, 9);
    const a = b * answer;
    return {
      question: `${a} ÷ ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 1, 20),
      topic: "Phép chia",
      explanation: `${a} ÷ ${b} = ${answer} (vì ${b} × ${answer} = ${a})`,
    };
  } else {
    const a = rand(100, 500);
    const b = rand(100, 500);
    const answer = a + b;
    return {
      question: `${a} + ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 200, 1000),
      topic: "Phép cộng trong phạm vi 1000",
      explanation: `${a} + ${b} = ${answer}`,
    };
  }
}

function grade4(): GeneratedExercise {
  const topics = ["multi_digit_mult", "division_large", "fractions"];
  const topic = topics[rand(0, topics.length - 1)];

  if (topic === "multi_digit_mult") {
    const a = rand(12, 99);
    const b = rand(2, 9);
    const answer = a * b;
    return {
      question: `${a} × ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 20, 900),
      topic: "Nhân số có hai chữ số",
      explanation: `${a} × ${b} = ${answer}`,
    };
  } else if (topic === "division_large") {
    const b = rand(2, 9);
    const answer = rand(10, 99);
    const a = b * answer;
    return {
      question: `${a} ÷ ${b} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 10, 99),
      topic: "Chia số có nhiều chữ số",
      explanation: `${a} ÷ ${b} = ${answer}`,
    };
  } else {
    const denom = [2, 3, 4, 5, 6, 8, 10][rand(0, 6)];
    const num1 = rand(1, denom - 1);
    const num2 = rand(1, denom - 1);
    const sum = num1 + num2;
    const wholepart = Math.floor(sum / denom);
    const remainder = sum % denom;
    const answerStr =
      wholepart > 0 && remainder > 0
        ? `${wholepart} và ${remainder}/${denom}`
        : wholepart > 0
          ? `${wholepart}`
          : `${sum}/${denom}`;
    return {
      question: `${num1}/${denom} + ${num2}/${denom} = ?`,
      answer: answerStr,
      options: shuffle([
        answerStr,
        `${sum + 1}/${denom}`,
        `${num1}/${denom + 1}`,
        `${num2 + num1 + 2}/${denom}`,
      ]),
      topic: "Phân số cùng mẫu",
      explanation: `${num1}/${denom} + ${num2}/${denom} = ${sum}/${denom} = ${answerStr}`,
    };
  }
}

function grade5(): GeneratedExercise {
  const topics = ["decimals", "percentage", "geometry"];
  const topic = topics[rand(0, topics.length - 1)];

  if (topic === "decimals") {
    const a = (rand(10, 99) / 10).toFixed(1);
    const b = (rand(10, 99) / 10).toFixed(1);
    const answer = (parseFloat(a) + parseFloat(b)).toFixed(1);
    return {
      question: `${a} + ${b} = ?`,
      answer,
      options: shuffle([
        answer,
        (parseFloat(answer) + 0.1).toFixed(1),
        (parseFloat(answer) - 0.1).toFixed(1),
        (parseFloat(answer) + 1).toFixed(1),
      ]),
      topic: "Cộng số thập phân",
      explanation: `${a} + ${b} = ${answer}`,
    };
  } else if (topic === "percentage") {
    const whole = rand(1, 5) * 100;
    const pct = [10, 20, 25, 50, 75][rand(0, 4)];
    const answer = (whole * pct) / 100;
    return {
      question: `${pct}% của ${whole} = ?`,
      answer: String(answer),
      options: generateOptions(answer, 0, whole),
      topic: "Tính phần trăm",
      explanation: `${pct}% của ${whole} = ${whole} × ${pct}/100 = ${answer}`,
    };
  } else {
    const l = rand(3, 15);
    const w = rand(2, l);
    const area = l * w;
    const perimeter = 2 * (l + w);
    const askArea = rand(0, 1) === 0;
    return {
      question: askArea
        ? `Hình chữ nhật có chiều dài ${l}cm, chiều rộng ${w}cm. Tính diện tích?`
        : `Hình chữ nhật có chiều dài ${l}cm, chiều rộng ${w}cm. Tính chu vi?`,
      answer: askArea ? `${area} cm²` : `${perimeter} cm`,
      options: shuffle([
        askArea ? `${area} cm²` : `${perimeter} cm`,
        askArea ? `${area + l} cm²` : `${perimeter + 2} cm`,
        askArea ? `${perimeter} cm²` : `${area} cm`,
        askArea ? `${area - w} cm²` : `${perimeter - 2} cm`,
      ]),
      topic: askArea ? "Diện tích hình chữ nhật" : "Chu vi hình chữ nhật",
      explanation: askArea
        ? `Diện tích = dài × rộng = ${l} × ${w} = ${area} cm²`
        : `Chu vi = 2 × (dài + rộng) = 2 × (${l} + ${w}) = ${perimeter} cm`,
    };
  }
}

const generators: Record<number, () => GeneratedExercise> = {
  1: grade1,
  2: grade2,
  3: grade3,
  4: grade4,
  5: grade5,
};

export function generateExercises(
  grade: number,
  count: number = 10
): GeneratedExercise[] {
  const gen = generators[grade];
  if (!gen) throw new Error(`Invalid grade: ${grade}`);
  return Array.from({ length: count }, () => gen());
}

export const gradeTopics: Record<number, string[]> = {
  1: [
    "Phép cộng trong phạm vi 10",
    "Phép trừ trong phạm vi 10",
    "So sánh số",
  ],
  2: [
    "Phép cộng trong phạm vi 100",
    "Phép trừ trong phạm vi 100",
    "Bảng nhân 2-5",
  ],
  3: ["Phép nhân", "Phép chia", "Phép cộng trong phạm vi 1000"],
  4: ["Nhân số có hai chữ số", "Chia số có nhiều chữ số", "Phân số cùng mẫu"],
  5: ["Cộng số thập phân", "Tính phần trăm", "Hình học cơ bản"],
};
