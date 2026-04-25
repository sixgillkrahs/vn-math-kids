# 🧮 Toán Vui Cấp 1

Ứng dụng web học toán vui nhộn dành cho học sinh cấp 1 Việt Nam (Lớp 1 - Lớp 5).

## ✨ Tính năng

- **📚 Bài tập theo lớp**: Bài tập toán phù hợp với chương trình học từ lớp 1 đến lớp 5
  - Lớp 1: Phép cộng, trừ trong phạm vi 10, so sánh số
  - Lớp 2: Phép cộng, trừ trong phạm vi 100, bảng nhân 2-5
  - Lớp 3: Phép nhân, chia, cộng trừ trong phạm vi 1000
  - Lớp 4: Nhân nhiều chữ số, chia số lớn, phân số
  - Lớp 5: Số thập phân, phần trăm, hình học

- **🤖 AI Quét Bài Tập**: Tải ảnh hoặc file PDF bài tập toán, AI sẽ tự động nhận dạng và tạo bài tập trắc nghiệm

- **🎨 Giao diện thân thiện**: Thiết kế ngộ nghĩnh, đáng yêu với màu sắc tươi sáng, animation vui nhộn phù hợp với trẻ em

- **📊 Theo dõi tiến bộ**: Xem kết quả bài làm với số sao, điểm số và giải thích chi tiết

## 🛠 Công nghệ

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose)
- **AI**: OpenAI GPT-4o Vision (quét bài tập)
- **Deploy**: Vercel

## 🚀 Cài đặt

### Yêu cầu

- Node.js >= 18
- MongoDB (local hoặc MongoDB Atlas)
- OpenAI API Key (tùy chọn, cho tính năng quét bài tập)

### Cài đặt

```bash
# Clone repo
git clone https://github.com/sixgillkrahs/vn-math-kids.git
cd vn-math-kids

# Cài dependencies
npm install

# Copy file cấu hình
cp .env.example .env.local

# Chỉnh sửa .env.local với thông tin của bạn
# MONGODB_URI=mongodb+srv://...
# OPENAI_API_KEY=sk-...

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── api/
│   │   ├── exercises/
│   │   │   ├── generate/route.ts  # Tạo bài tập theo lớp
│   │   │   └── check/route.ts     # Kiểm tra đáp án
│   │   ├── scan/route.ts          # AI quét bài tập từ ảnh
│   │   └── results/route.ts       # Lưu/xem kết quả
│   ├── grade/[grade]/page.tsx     # Trang làm bài theo lớp
│   ├── scan/page.tsx              # Trang quét bài tập
│   ├── layout.tsx                 # Layout chính
│   └── page.tsx                   # Trang chủ
├── components/
│   ├── Header.tsx                 # Header navigation
│   ├── GradeCard.tsx              # Card chọn lớp
│   ├── ExerciseView.tsx           # Giao diện làm bài
│   ├── FileUploader.tsx           # Upload file
│   └── Confetti.tsx               # Hiệu ứng pháo giấy
└── lib/
    ├── mongodb.ts                 # Kết nối MongoDB
    ├── mathGenerator.ts           # Tạo bài tập toán
    └── models/
        ├── Exercise.ts            # Model bài tập
        └── Result.ts              # Model kết quả
```

## 🎮 Sử dụng

1. Chọn lớp học (1-5) trên trang chủ
2. Chọn số câu hỏi (5, 10, 15, 20)
3. Bấm "Bắt đầu làm bài"
4. Chọn đáp án cho mỗi câu hỏi
5. Xem kết quả và giải thích sau khi hoàn thành

### Quét bài tập bằng AI

1. Vào trang "Quét bài"
2. Chọn lớp phù hợp
3. Tải ảnh/PDF bài tập lên
4. AI sẽ nhận dạng và tạo bài tập trắc nghiệm
5. Làm bài như bình thường

## 📝 License

MIT
