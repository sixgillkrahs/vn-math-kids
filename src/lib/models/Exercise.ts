import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExercise extends Document {
  grade: number;
  topic: string;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  source: "generated" | "scanned";
  createdAt: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  grade: { type: Number, required: true, min: 1, max: 5 },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  explanation: { type: String },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },
  source: {
    type: String,
    enum: ["generated", "scanned"],
    default: "generated",
  },
  createdAt: { type: Date, default: Date.now },
});

const Exercise: Model<IExercise> =
  mongoose.models.Exercise ||
  mongoose.model<IExercise>("Exercise", ExerciseSchema);

export default Exercise;
