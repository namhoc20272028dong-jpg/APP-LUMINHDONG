import React from 'react';
import { ExamPaper } from '../types/exam';
import { Printer, FileDown } from 'lucide-react';
import { exportExamToWord } from '../utils/docxExporter';

interface Props {
  exam: ExamPaper;
}

export const SpecificationView: React.FC<Props> = ({ exam }) => {
  const { specifications } = exam;

  const handlePrint = () => {
    window.print();
  };

  const getSubjectName = () => {
    switch (exam.subject) {
      case 'TOAN': return 'TOÁN';
      case 'TIENG_VIET': return 'TIẾNG VIỆT';
      case 'TIN_HOC': return 'TIN HỌC';
      case 'KHOA_HOC': return 'KHOA HỌC';
      case 'LICH_SU_DIA_LY': return 'LỊCH SỬ VÀ ĐỊA LÍ';
      case 'CONG_NGHE': return 'CÔNG NGHỆ';
      default: return exam.subject;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm">
            Bản đặc tả chi tiết ma trận đề kiểm tra
          </span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
            Mỗi câu hỏi / Một đặc tả riêng
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExamToWord(exam)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Tải File Word (.doc)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In bản đặc tả</span>
          </button>
        </div>
      </div>

      {/* Main Document */}
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-md border border-slate-200 text-black font-['Times_New_Roman',serif] text-[15px] leading-relaxed print:p-0 print:border-none print:shadow-none">
        
        {/* Header Hành chính */}
        <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 mb-6">
          <div className="text-center font-bold text-[14px]">
            <div>{exam.departmentName?.toUpperCase() || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}</div>
            <div>{exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</div>
            <div className="w-24 h-0.5 bg-black mx-auto mt-1"></div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[16px]">BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</div>
            <div className="font-bold text-[14px] text-indigo-900 print:text-black">
              Môn: {getSubjectName()} - Lớp {exam.grade}
            </div>
            <div className="italic text-[13px]">
              Năm học: {exam.schoolYear} • Kì đánh giá: {exam.semester}
            </div>
          </div>
        </div>

        {/* Bảng đặc tả chi tiết */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[14px]">
            <thead>
              <tr className="bg-slate-100 print:bg-transparent font-bold text-center">
                <th className="border border-black p-2 w-12">STT</th>
                <th className="border border-black p-2 w-48 text-left">Chủ đề / Mạch kiến thức</th>
                <th className="border border-black p-2 w-24">Mức độ</th>
                <th className="border border-black p-2 text-left">Yêu cầu cần đạt (CT GDPT 2018)</th>
                <th className="border border-black p-2 w-40">Hình thức câu hỏi</th>
                <th className="border border-black p-2 w-28">Câu số (Điểm)</th>
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec) => {
                const q = exam.questions.find(item => item.number === spec.questionNumber);
                return (
                  <tr key={spec.order} className="hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="border border-black p-2.5 text-center font-medium">{spec.order}</td>
                    <td className="border border-black p-2.5 font-bold text-slate-900">{spec.topic}</td>
                    <td className="border border-black p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        spec.level === 'M1'
                          ? 'bg-blue-100 text-blue-800'
                          : spec.level === 'M2'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {spec.level}
                      </span>
                    </td>
                    <td className="border border-black p-2.5 leading-relaxed text-justify">
                      {spec.requirement}
                      {q && (
                        <div className="text-xs text-slate-500 italic mt-1 font-sans">
                          (Nội dung câu: "{q.questionText.slice(0, 60)}...")
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-2.5 text-center text-slate-700">
                      {spec.questionType}
                    </td>
                    <td className="border border-black p-2.5 text-center font-bold text-indigo-950">
                      Câu {spec.questionNumber}<br />
                      <span className="text-xs font-normal text-slate-600">({spec.score} điểm)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chú thích sư phạm */}
        <div className="mt-6 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 space-y-1 print:hidden font-sans">
          <div className="font-bold text-slate-800">Quy tắc xây dựng bản đặc tả:</div>
          <div>• <b>Mức 1 (Nhận biết):</b> Học sinh nhớ, nhận diện đúng các khái niệm, quy tắc, thuật ngữ, dấu hiệu trực quan.</div>
          <div>• <b>Mức 2 (Thông hiểu):</b> Học sinh giải thích, làm rõ ý nghĩa, thực hiện thành thạo phép tính hoặc kết nối các nội dung quen thuộc.</div>
          <div>• <b>Mức 3 (Vận dụng):</b> Học sinh vận dụng kiến thức, kĩ năng tổng hợp để giải quyết tình huống thực tế, bài toán thực tiễn linh hoạt.</div>
          <div>• <i>Tuyệt đối không ra câu hỏi trắc nghiệm khách quan ở Mức 3 (Vận dụng) theo quy chuẩn GDPT 2018.</i></div>
        </div>

        {/* Chữ kí */}
        <div className="grid grid-cols-2 gap-8 mt-12 text-center text-[14px]">
          <div>
            <div className="font-bold">BAN GIÁM HIỆU DUYỆT</div>
            <div className="italic text-slate-500 text-xs mt-1">(Kí và đóng dấu)</div>
            <div className="h-16"></div>
          </div>
          <div>
            <div className="italic text-xs">Ngày ..... tháng ..... năm 202...</div>
            <div className="font-bold">TỔ TRƯỞNG CHUYÊN MÔN</div>
            <div className="italic text-slate-500 text-xs mt-1">(Kí và ghi rõ họ tên)</div>
            <div className="h-16"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
