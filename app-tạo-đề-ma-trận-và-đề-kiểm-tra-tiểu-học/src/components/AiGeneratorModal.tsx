import React, { useState } from 'react';
import { Subject, Grade, Semester, ExamPaper } from '../types/exam';
import { Sparkles, X, BookOpen, Clock, School, Check, AlertCircle, Loader2 } from 'lucide-react';
import { reorderAndStandardizeExam } from '../utils/matrixValidator';
import { STANDARD_EXAM_PRESETS } from '../data/standardPresets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExamGenerated: (exam: ExamPaper) => void;
  currentExam: ExamPaper;
}

export const AiGeneratorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onExamGenerated,
  currentExam,
}) => {
  const [subject, setSubject] = useState<Subject>(currentExam.subject);
  const [grade, setGrade] = useState<Grade>(currentExam.grade);
  const [semester, setSemester] = useState<Semester>(currentExam.semester);
  const [bookSeries, setBookSeries] = useState(currentExam.bookSeries || 'Kết nối tri thức với cuộc sống');
  const [schoolName, setSchoolName] = useState(currentExam.schoolName || 'Trường Tiểu học Chu Văn An');
  const [departmentName, setDepartmentName] = useState(currentExam.departmentName || 'Phòng GD&ĐT Ba Đình');
  const [schoolYear, setSchoolYear] = useState(currentExam.schoolYear || '2024 - 2025');
  const [duration, setDuration] = useState(currentExam.durationMinutes.toString());
  const [customTopics, setCustomTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts: { [key in Subject]?: string[] } = {
    TOAN: [
      'Đề cuối kì 1 Lớp 4 chuẩn 10 câu: Có bài toán tìm hai số khi biết tổng và hiệu, hình vẽ lưới ô vuông 1cm.',
      'Đề Lớp 1 kì 1: Số và phép tính trong phạm vi 10, đếm hình vuông, hình tam giác trực quan.',
      'Đề Lớp 5 cuối kì 1: Phân số, số thập phân, hình tam giác và hình thang.',
    ],
    TIENG_VIET: [
      'Văn bản truyện ngoài SGK 280-330 chữ về tình bạn và lòng nhân ái, có câu hỏi nhân hóa, danh từ.',
      'Bài thơ về mùa thu quê hương, đọc hiểu 4đ, kiến thức tiếng Việt 3đ, viết đoạn văn miêu tả.',
      'Bài đọc thông tin về bảo vệ môi trường biển đảo Việt Nam.',
    ],
    TIN_HOC: [
      'Đề Lớp 4 cuối kì 1: Lý thuyết 6đ (phần cứng, Internet, bản quyền) - Thực hành 4đ (tạo thư mục, gõ Word).',
      'Đề Lớp 3: Lý thuyết 7đ - Thực hành 3đ (gõ bàn phím hàng cơ sở).',
    ],
    KHOA_HOC: [
      'Đề Lớp 4: Tính chất của nước, không khí, vai trò của ánh sáng và nhiệt độ, bảo vệ nguồn nước sạch.',
      'Đề Lớp 5: Sự biến đổi của chất, năng lượng mặt trời, sự sinh sản của thực vật.',
    ],
    LICH_SU_DIA_LY: [
      'Đề Lớp 4: Thiên nhiên và con người vùng Đồng bằng Bắc Bộ, văn minh sông Hồng.',
      'Đề Lớp 5: Khởi nghĩa Hai Bà Trưng, chiến thắng Điện Biên Phủ, địa hình biển đảo.',
    ],
    CONG_NGHE: [
      'Đề Lớp 4: Lắp ghép mô hình kĩ thuật, an toàn sử dụng thiết bị điện trong gia đình.',
      'Đề Lớp 3: Sử dụng quạt điện, máy thu thanh, đồ chơi dân gian.',
    ],
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          semester: semester === 'GKI' ? 'Giữa học kì 1' : semester === 'CKI' ? 'Cuối học kì 1' : semester === 'GKII' ? 'Giữa học kì 2' : 'Cuối năm',
          bookSeries,
          schoolName,
          duration,
          customTopics,
          notes: `Áp dụng chuẩn quy định: Thứ tự câu từ 1 đến N; KHÔNG ghi tiêu đề phần trắc nghiệm, tự luận trong đề; Trắc nghiệm xếp M1 trước rồi đến M2; Tự luận từ M1 đến M3; TUYỆT ĐỐI KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG; Lớp ${grade} dùng ${grade <= 3 ? '3 phương án A, B, C' : '4 phương án A, B, C, D'}.`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo đề từ AI. Vui lòng thử lại.');
      }

      // Format received exam
      const rawExam = data.exam;
      const formattedExam: ExamPaper = {
        id: `exam_${Date.now()}`,
        title: rawExam.title || 'BÀI KIỂM TRA ĐỊNH KÌ',
        subTitle: `NĂM HỌC ${schoolYear}`,
        subject,
        grade,
        semester,
        schoolName,
        departmentName,
        schoolYear,
        durationMinutes: parseInt(duration) || 40,
        bookSeries,
        readingPassage: rawExam.readingPassage,
        writingSection: rawExam.writingSection,
        questions: rawExam.questions || [],
        matrix: rawExam.matrix || { rows: [], summary: { m1_score: 5, m1_percent: 50, m2_score: 3, m2_percent: 30, m3_score: 2, m3_percent: 20, tn_score: 6, tn_percent: 60, tl_score: 4, tl_percent: 40, total_score: 10 } },
        specifications: rawExam.specifications || [],
        gradingGuide: rawExam.gradingGuide || { mcqAnswers: [], essayAnswers: [] },
      };

      // Tự động kiểm tra và chuẩn hóa quy tắc
      const standardized = reorderAndStandardizeExam(formattedExam);
      onExamGenerated(standardized);
      onClose();
    } catch (err: any) {
      console.warn('API generation error, suggesting offline preset fallback:', err);
      setError(`${err.message || 'Lỗi kết nối AI.'} Bạn có thể chọn dùng ngay Đề mẫu chuẩn có sẵn bên dưới.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePresetFallback = () => {
    // Find matching or closest preset
    const matching = STANDARD_EXAM_PRESETS.find(p => p.subject === subject && p.grade === grade) 
      || STANDARD_EXAM_PRESETS.find(p => p.subject === subject)
      || STANDARD_EXAM_PRESETS[0];

    const copy = JSON.parse(JSON.stringify(matching));
    copy.schoolName = schoolName;
    copy.departmentName = departmentName;
    copy.schoolYear = schoolYear;
    onExamGenerated(copy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                Trợ lý AI Ra Đề & Lập Ma Trận GDPT 2018
              </h3>
              <p className="text-xs text-indigo-100">
                Tự động tạo trọn bộ 4 tài liệu: Ma trận, Đặc tả, Đề thi chuẩn và Hướng dẫn chấm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body form */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">{error}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleUsePresetFallback}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 cursor-pointer text-xs"
                  >
                    Dùng ngay Đề mẫu chuẩn có sẵn (Không cần API)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Môn & Lớp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Môn học *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TOAN">Môn Toán</option>
                <option value="TIENG_VIET">Môn Tiếng Việt</option>
                <option value="TIN_HOC">Môn Tin học</option>
                <option value="KHOA_HOC">Môn Khoa học (Lớp 4, 5)</option>
                <option value="LICH_SU_DIA_LY">Môn Lịch sử & Địa lí (Lớp 4, 5)</option>
                <option value="CONG_NGHE">Môn Công nghệ (Lớp 3, 4, 5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khối lớp *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value) as Grade)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">Lớp 1 (3 phương án A, B, C)</option>
                <option value="2">Lớp 2 (3 phương án A, B, C)</option>
                <option value="3">Lớp 3 (3 phương án A, B, C)</option>
                <option value="4">Lớp 4 (4 phương án A, B, C, D)</option>
                <option value="5">Lớp 5 (4 phương án A, B, C, D)</option>
              </select>
            </div>
          </div>

          {/* Kì & Bộ sách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kì đánh giá *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as Semester)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="GKI">Giữa học kì I</option>
                <option value="CKI">Cuối học kì I</option>
                <option value="GKII">Giữa học kì II</option>
                <option value="CN">Cuối năm học</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bộ sách giáo khoa
              </label>
              <select
                value={bookSeries}
                onChange={(e) => setBookSeries(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                <option value="Cánh Diều">Cánh Diều</option>
                <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                <option value="Chương trình GDPT 2018 chung">Bộ sách chung</option>
              </select>
            </div>
          </div>

          {/* Thông tin trường & năm học */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trường Tiểu học
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phòng GD&ĐT
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Custom Topics / Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Yêu cầu nội dung hoặc chủ đề trọng tâm (Tùy chọn)
            </label>
            <textarea
              value={customTopics}
              onChange={(e) => setCustomTopics(e.target.value)}
              placeholder="Ví dụ: Tập trung vào phần tính diện tích hình học, bài toán thực tế có lưới ô vuông; hoặc bài đọc hiểu về tình cảm gia đình..."
              rows={2}
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Gợi ý nhanh */}
          {quickPrompts[subject] && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5">
                Gợi ý chủ đề nhanh:
              </div>
              <div className="space-y-1">
                {quickPrompts[subject]?.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomTopics(p)}
                    className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 transition-colors cursor-pointer"
                  >
                    💡 {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quy chuẩn tự động áp dụng */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-800">
              <Check className="w-3.5 h-3.5 text-indigo-600" />
              Cam kết tự động chuẩn hóa 100% theo quy chuẩn sư phạm:
            </div>
            <div>• Sắp xếp câu hỏi từ Trắc nghiệm đến Tự luận; M1 xếp trước M2; không trắc nghiệm ở Mức 3.</div>
            <div>• Tỉ lệ chuẩn 50% - 30% - 20% và 60% TN - 40% TL; tổng cộng 10 câu thang điểm 10.</div>
            <div>• Trình bày câu chuẩn: <b>Câu 1</b><i>(0,5 điểm)</i>: Câu hỏi...; các phương án lùi 1 tab.</div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleUsePresetFallback}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            >
              Chọn đề mẫu có sẵn
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2 text-xs md:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI Đang Soạn Đề & Ma Trận...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tạo Trọn Bộ Đề Thi Bằng AI</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
