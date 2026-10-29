import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate or enhance exam according to GDPT 2018 rules
app.post('/api/gemini/generate-exam', async (req: Request, res: Response) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra cài đặt Secrets.',
      });
    }

    const {
      subject,
      grade,
      semester,
      bookSeries,
      schoolName,
      customTopics,
      duration,
      notes,
    } = req.body;

    const systemPrompt = `Bạn là Chuyên gia ra đề kiểm tra tiểu học hàng đầu Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 và quy định đánh giá học sinh tiểu học (Thông tư 27/2020/TT-BGDĐT).
Nhiệm vụ của bạn là tạo ra một bộ đề kiểm tra hoàn chỉnh gồm 4 phần:
1. MA TRẬN ĐỀ KIỂM TRA (chuẩn bảng ma trận 2 chiều số câu, số điểm, tỉ lệ %)
2. BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA (chi tiết từng câu hỏi, Yêu cầu cần đạt, mạch kiến thức, mức độ)
3. ĐỀ KIỂM TRA (định dạng trình bày chuẩn sư phạm)
4. HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT

QUY TẮC CỐT LÕI BẮT BUỘC TUÂN THỦ:
1. Cấu trúc đề:
- Thứ tự câu: Đánh số liên tục từ Câu 1 đến câu cuối (Tổng cộng đúng 10 câu cho Toán, Lịch sử & Địa lý, Khoa học, Công nghệ; Tiếng Việt theo cấu trúc đọc hiểu + viết; Tin học theo phân bổ LT + TH).
- TUYỆT ĐỐI KHÔNG GHI phần trắc nghiệm, tự luận trong đề kiểm tra học sinh (không có chữ "Phần I. Trắc nghiệm", "Phần II. Tự luận").
- Sắp xếp câu hỏi từ Trắc nghiệm đến Tự luận.
  * Trắc nghiệm: Mức 1 (Biết) xếp trước -> Mức 2 (Hiểu) xếp sau, cụ thể đúng trật tự:
    1. Biết nhiều lựa chọn (NLC)
    2. Biết đúng sai (ĐS)
    3. Biết nối cột (NC)
    4. Biết điền khuyết (ĐK)
    5. Hiểu nhiều lựa chọn (NLC)
    6. Hiểu đúng sai (ĐS)
    7. Hiểu nối cột (NC)
    8. Hiểu điền khuyết (ĐK)
  * Tự luận: Lần lượt từ Biết (M1) -> Hiểu (M2) -> Vận dụng (M3) (tư duy từ dễ đến khó).
- KHÔNG ghép câu thuộc 2 chủ đề/bài học/mạch kiến thức với nhau.
- TUYỆT ĐỐI KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG (Mức 3 100% là tự luận).

2. Trình bày đề kiểm tra:
- Câu số (chữ đậm), điểm (chữ nghiêng và không đậm) liền câu số, câu hỏi (chữ không đậm).
  Ví dụ: Câu 1(0,5 điểm): ...
- Câu số và các ý a, b, c, d bằng lề - không tab.
- Phương án A, B, C (Lớp 1, 2, 3) hoặc A, B, C, D (Lớp 4, 5) lùi vào 1 tab (1cm).
- Điểm trắc nghiệm: TN nhiều lựa chọn: 0,5đ/câu hoặc ý. TN đúng sai, nối cột, điền khuyết: 0,25đ/ý.
- Điểm tự luận: Mức 1 (Biết): 0,5đ/câu/ý. Mức 2 (Hiểu): 1,0đ/câu/ý. Mức 3 (Vận dụng): 1,0 - 2,0đ/câu/ý.
- Mỗi câu hỏi trong đề ứng với đúng một dòng đặc tả riêng biệt trong bản đặc tả.

3. Quy định theo từng môn học:
- Môn Toán: Thang điểm 10. Tỉ lệ Mức 1 (50%) - Mức 2 (30%) - Mức 3 (20%). Trắc nghiệm = 60% (6đ), Tự luận = 40% (4đ). Tổng số câu: 10 câu.
  + Lớp 1: Số & PT 80%, Hình học & đo lường 20%.
  + Lớp 2, 3: Kì I: Số & PT 70%, HH&ĐL 30%. Kì II: Số & PT 70%, HH&ĐL 20%, Thống kê & XS 10%.
  + Lớp 4: GKI: Số 70%, HH 30%; CKI: Số 50%, HH 50%; GKII: Số 70%, HH 30%; CN: Số 70%, HH 20%, TK&XS 10%.
  + Lớp 5: GKI: Số 80%, HH 20%; CKI: Số 60%, HH 40%; GKII: Số 50%, HH 50%; CN: Số 50%, HH 40%, TK&XS 10%.
- Môn Tiếng Việt:
  + Văn bản đọc hiểu ngoài SGK phù hợp số lượng từ theo khối lớp (Lớp 1: 90-130 từ; Lớp 2: 180-200 từ; Lớp 3: 200-250 từ; Lớp 4: 280-330 từ; Lớp 5: 300-350 từ).
  + Lớp 1: Đọc TT 6đ, Đọc hiểu 4đ (TN 6 câu = 3đ; TL 1 câu = 1đ). Viết: Nghe viết 6đ, BT 4đ.
  + Lớp 2, 3: Đọc hiểu 9 câu = 6đ (Đọc hiểu 4đ: 4 TN = 2đ, 2 TL = 2đ; KTTV 2đ: 2 TN = 1đ, 1 TL = 1đ). Viết nghe viết 4đ, viết đoạn 6đ.
  + Lớp 4, 5: Đọc hiểu 11 câu = 7đ (Đọc hiểu 4đ: 4 TN = 2đ, 2 TL = 2đ; KTTV 3đ: 4 TN = 2đ, 1 TL = 1đ). Viết đoạn văn 10đ.
- Môn Tin học:
  + Lớp 3: LT 7đ - TH 3đ. TN 6 câu (3đ) - TL 4 câu.
  + Lớp 4: LT 6đ - TH 4đ. TN 6 câu (3đ) - TL 4 câu.
  + Lớp 5: LT 5đ - TH 5đ. TN 5 câu (2.5đ) - TL 5 câu.
  + Không tạo trắc nghiệm mức 3.
- Môn Khoa học, Lịch sử & Địa lý, Công nghệ: Mức 1-2-3 tỉ lệ 50-30-20%. Trắc nghiệm 60% (6đ), Tự luận 40% (4đ). Tổng 10 câu.

Đầu ra phải là một JSON hợp lệ tuân thủ schema quy định.`;

    const userPrompt = `Hãy tạo một bộ tài liệu kiểm tra hoàn chỉnh cho:
- Môn học: ${subject || 'Toán'}
- Khối lớp: Lớp ${grade || 4}
- Kì đánh giá: ${semester || 'Cuối học kì 1'}
- Bộ sách giáo khoa: ${bookSeries || 'Kết nối tri thức với cuộc sống'}
- Tên trường: ${schoolName || 'Trường Tiểu học Chu Văn An'}
- Thời gian làm bài: ${duration || '40'} phút
- Trọng tâm / Yêu cầu riêng: ${customTopics || 'Chuẩn kiến thức kĩ năng theo phân phối chương trình'}
${notes ? `- Ghi chú bổ sung: ${notes}` : ''}

Trả về định dạng JSON thuần túy (không bọc trong \`\`\`json markdown block nếu có thể, hoặc đảm bảo JSON parse được).
Cấu trúc JSON cần có:
{
  "title": "ĐỀ KIỂM TRA ĐỊNH KÌ...",
  "subject": "${subject}",
  "grade": ${grade},
  "semester": "${semester}",
  "bookSeries": "${bookSeries}",
  "schoolName": "${schoolName}",
  "duration": "${duration} phút",
  "year": "2024 - 2025",
  "readingPassage": {
    "title": "...",
    "content": "...",
    "author": "...",
    "wordCount": 240
  },
  "matrix": {
    "rows": [
      {
        "topic": "Số và phép tính",
        "m1_tn_count": 2, "m1_tn_score": 1.0,
        "m1_tl_count": 0, "m1_tl_score": 0.0,
        "m2_tn_count": 2, "m2_tn_score": 1.0,
        "m2_tl_count": 1, "m2_tl_score": 1.0,
        "m3_tl_count": 1, "m3_tl_score": 1.5,
        "total_count": 6, "total_score": 4.5
      }
    ],
    "summary": {
      "m1_score": 5.0, "m1_percent": 50,
      "m2_score": 3.0, "m2_percent": 30,
      "m3_score": 2.0, "m3_percent": 20,
      "tn_score": 6.0, "tn_percent": 60,
      "tl_score": 4.0, "tl_percent": 40,
      "total_score": 10.0
    }
  },
  "specifications": [
    {
      "order": 1,
      "topic": "Số và phép tính",
      "level": "Mức 1",
      "requirement": "Nhận biết được...",
      "questionType": "Trắc nghiệm nhiều lựa chọn",
      "questionNumber": 1,
      "score": 0.5
    }
  ],
  "questions": [
    {
      "number": 1,
      "score": 0.5,
      "scoreText": "0,5 điểm",
      "type": "tn_multiple_choice",
      "level": "Mức 1",
      "topic": "Số và phép tính",
      "questionText": "Khoanh vào chữ cái trước câu trả lời đúng: Số gồm 5 chục nghìn, 3 trăm và 2 đơn vị viết là:",
      "options": ["A. 50 302", "B. 53 002", "C. 50 032", "D. 53 200"],
      "correctAnswer": "A",
      "gradingGuide": "Khoanh đúng đáp án A cho 0,5 điểm."
    }
  ],
  "gradingGuide": {
    "mcqAnswers": [
      { "questionNumber": 1, "answer": "A", "score": "0,5 điểm" }
    ],
    "essayAnswers": [
      {
        "questionNumber": 8,
        "score": "1,0 điểm",
        "steps": [
          { "content": "Đặt tính và tính đúng phép tính thứ nhất", "stepScore": "0,5 điểm" },
          { "content": "Đặt tính và tính đúng phép tính thứ hai", "stepScore": "0,5 điểm" }
        ],
        "note": "Học sinh làm cách khác đúng vẫn cho điểm tối đa."
      }
    ]
  },
  "writingSection": {
    "dictation": "Nghe - viết bài: ... (nếu môn Tiếng Việt)",
    "composition": "Đề bài Tập làm văn / Viết đoạn văn: ... (nếu môn Tiếng Việt)"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Clean up markdown block if present
      const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      data = JSON.parse(cleanJson);
    }

    return res.json({ success: true, exam: data });
  } catch (err: any) {
    console.error('Gemini generate error:', err);
    return res.status(500).json({
      error: err.message || 'Lỗi khi khởi tạo bộ đề từ mô hình AI.',
    });
  }
});

// Start Vite in dev or serve dist in prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
