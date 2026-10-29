import React from 'react';
import { ExamPaper } from '../types/exam';
import { Printer, FileDown } from 'lucide-react';
import { exportExamToWord } from '../utils/docxExporter';

interface Props {
  exam: ExamPaper;
}

export const GradingGuideView: React.FC<Props> = ({ exam }) => {
  const { gradingGuide } = exam;

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
      {/* Action Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm">
            Hướng dẫn chấm & Biểu điểm chi tiết
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
            Thang điểm sư phạm
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExamToWord(exam, { includeAnswers: true })}
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
            <span>In hướng dẫn chấm</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-md border border-slate-200 text-black font-['Times_New_Roman',serif] text-[15px] leading-relaxed print:p-0 print:border-none print:shadow-none">
        
        {/* Header Hành chính */}
        <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 mb-6">
          <div className="text-center font-bold text-[14px]">
            <div>{exam.departmentName?.toUpperCase() || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}</div>
            <div>{exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</div>
            <div className="w-24 h-0.5 bg-black mx-auto mt-1"></div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[16px]">HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM</div>
            <div className="font-bold text-[14px] text-indigo-900 print:text-black">
              Môn: {getSubjectName()} - Lớp {exam.grade}
            </div>
            <div className="italic text-[13px]">
              Kì kiểm tra: {exam.semester} • Năm học: {exam.schoolYear}
            </div>
          </div>
        </div>

        {/* PHẦN A: ĐÁP ÁN TRẮC NGHIỆM */}
        <div className="mb-8">
          <h3 className="font-bold text-[15px] uppercase mb-3 text-slate-900">
            A. ĐÁP ÁN PHẦN CÂU HỎI TRẮC NGHIỆM
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-center text-[14px]">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent font-bold">
                  <th className="border border-black p-2 w-28">Câu số</th>
                  {gradingGuide.mcqAnswers.map((item) => (
                    <th key={item.questionNumber} className="border border-black p-2">
                      Câu {item.questionNumber}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2.5 font-bold bg-slate-50 print:bg-transparent">
                    Đáp án đúng
                  </td>
                  {gradingGuide.mcqAnswers.map((item) => (
                    <td key={item.questionNumber} className="border border-black p-2.5 font-bold text-blue-900 text-[15px]">
                      {item.answer}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-black p-2 bg-slate-50 print:bg-transparent font-medium">
                    Điểm số
                  </td>
                  {gradingGuide.mcqAnswers.map((item) => (
                    <td key={item.questionNumber} className="border border-black p-2 text-slate-700">
                      {item.score}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-2 text-xs text-slate-500 italic">
            * Điểm trắc nghiệm nhiều lựa chọn: 0,5 điểm/câu. Điểm câu đúng/sai, nối cột, điền khuyết: 0,25 điểm/ý.
          </div>
        </div>

        {/* PHẦN B: HƯỚNG DẪN CHẤM TỰ LUẬN CHI TIẾT */}
        <div className="mb-8">
          <h3 className="font-bold text-[15px] uppercase mb-3 text-slate-900">
            B. HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM TỰ LUẬN
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-[14px]">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent font-bold text-center">
                  <th className="border border-black p-2.5 w-20">Câu</th>
                  <th className="border border-black p-2.5 text-left">Nội dung đáp án / Yêu cầu cần đạt</th>
                  <th className="border border-black p-2.5 w-24">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {gradingGuide.essayAnswers.map((item) => (
                  <tr key={item.questionNumber} className="hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="border border-black p-3 text-center font-bold align-top bg-slate-50/50 print:bg-transparent">
                      Câu {item.questionNumber}<br />
                      <span className="text-xs font-normal text-slate-600">({item.score})</span>
                    </td>
                    <td className="border border-black p-3 leading-relaxed">
                      <div className="space-y-1.5">
                        {item.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-4">
                            <span className="text-slate-900">• {step.content}</span>
                            <span className="font-bold text-slate-800 whitespace-nowrap text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 print:border-none print:bg-transparent">
                              {step.stepScore}
                            </span>
                          </div>
                        ))}
                      </div>

                      {item.note && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs italic text-slate-600">
                          Ghi chú: {item.note}
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-3 text-center font-bold align-top text-indigo-950">
                      {item.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HƯỚNG DẪN CHẤM BÀI VIẾT (NẾU CÓ) */}
        {exam.writingSection && (
          <div className="mb-8 p-4 rounded border border-black">
            <h4 className="font-bold text-[15px] uppercase mb-2">
              C. HƯỚNG DẪN CHẤM BÀI KIỂM TRA VIẾT (10 điểm)
            </h4>
            <div className="space-y-2 text-[14px]">
              <div>
                <b>1. Chính tả (Nghe - viết) (4,0 điểm):</b>
                <div className="ml-4 text-slate-800 mt-1">
                  • Bài viết không mắc lỗi chính tả, chữ viết rõ ràng, sạch đẹp: 4,0 điểm.<br />
                  • Mỗi lỗi chính tả trong bài (sai - lẫn phụ âm đầu hoặc vần, thanh, không viết hoa đúng quy định): trừ 0,5 điểm.<br />
                  • Chữ viết không đều nét, bẩn, tẩy xóa nhiều: trừ 0,5 điểm toàn bài.
                </div>
              </div>
              <div className="mt-3">
                <b>2. Tập làm văn / Viết đoạn văn (6,0 điểm):</b>
                <div className="ml-4 text-slate-800 mt-1">
                  • Mở đoạn/bài: Giới thiệu được đối tượng miêu tả tự nhiên (1,0 điểm).<br />
                  • Thân đoạn/bài: Miêu tả đặc điểm nổi bật, hình ảnh sinh động, có sử dụng biện pháp nghệ thuật (so sánh, nhân hóa) (3,0 điểm).<br />
                  • Kết đoạn/bài: Nêu được cảm nghĩ, tình cảm gắn bó với đối tượng (1,0 điểm).<br />
                  • Kĩ năng: Diễn đạt mạch lạc, dùng từ gợi cảm, không sai ngữ pháp, chính tả (1,0 điểm).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GHI CHÚ CHUNG */}
        <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 italic space-y-1">
          <b>* Lưu ý chung đối với giám khảo chấm bài:</b>
          <div>1. Cho điểm chi tiết từng phần, từng bước tính theo đúng biểu điểm của hướng dẫn chấm.</div>
          <div>2. Đối với các bài tập tự luận Toán: Nếu học sinh có lời giải, cách tính khác với đáp án nhưng hợp lý và cho kết quả đúng thì vẫn cho điểm tối đa của phần đó.</div>
          <div>3. Đánh giá học sinh tiểu học chú trọng sự tiến bộ, động viên tính chủ động sáng tạo theo định hướng Thông tư 27/2020/TT-BGDĐT.</div>
        </div>

        {/* Chữ kí */}
        <div className="grid grid-cols-2 gap-8 mt-12 text-center text-[14px]">
          <div>
            <div className="font-bold">BAN CHẤM KIỂM TRA</div>
            <div className="italic text-slate-500 text-xs mt-1">(Kí và ghi rõ họ tên)</div>
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
