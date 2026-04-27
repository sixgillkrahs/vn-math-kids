import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamQuestion {
  question: string;
  answer: string;
  options: string[];
  topic: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  imageUrl?: string;
}

export interface IExam extends Document {
  title: string;
  grade: number;
  timeLimit: number;
  exercises: IExamQuestion[];
  difficulty?: "easy" | "medium" | "hard";
  createdBy?: string;
  createdAt: Date;
}

const ExamQuestionSchema = new Schema<IExamQuestion>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    options: [{ type: String }],
    topic: { type: String, required: true },
    explanation: { type: String },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    imageUrl: { type: String },
  },
  { _id: false }
);

const ExamSchema = new Schema<IExam>({
  title: { type: String, required: true },
  grade: { type: Number, required: true, min: 1, max: 5 },
  timeLimit: { type: Number, required: true, min: 1 },
  exercises: [ExamQuestionSchema],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;
