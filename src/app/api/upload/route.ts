import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return Response.json(
        { error: "Chưa cấu hình Cloudinary." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "Chưa chọn file." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "vn-math-kids",
              resource_type: "image",
            },
            (error, result) => {
              if (error || !result) reject(error || new Error("Upload failed"));
              else resolve(result);
            }
          )
          .end(buffer);
      }
    );

    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Không thể upload ảnh. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
