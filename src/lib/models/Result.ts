import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResult extends Document {
  studentName: string;
  userId?: string;
  grade: number;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: { questionId: string; userAnswer: string; correct: boolean }[];
  completedAt: Date;
}

const ResultSchema = new Schema<IResult>({
  studentName: { type: String, required: true },
  userId: { type: String, index: true },
  grade: { type: Number, required: true, index: true },
  topic: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  score: { type: Number, required: true },
  answers: [
    {
      questionId: { type: String },
      userAnswer: { type: String },
      correct: { type: Boolean },
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

const Result: Model<IResult> =
  mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);

export default Result;
