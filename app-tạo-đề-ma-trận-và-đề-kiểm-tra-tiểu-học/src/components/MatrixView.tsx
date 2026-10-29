import React from 'react';
import { ExamPaper } from '../types/exam';
import { Printer, FileDown } from 'lucide-react';
import { exportExamToWord } from '../utils/docxExporter';

interface Props {
  exam: ExamPaper;
}

export const MatrixView: React.FC<Props> = ({ exam }) => {
  const { matrix } = exam;

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
            Ma trận 2 chiều chuẩn Thông tư 27/2020/TT-BGDĐT
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
            CT GDPT 2018
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
            <span>In ma trận</span>
          </button>
        </div>
      </div>

      {/* Main Matrix Document Container */}
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-md border border-slate-200 text-black font-['Times_New_Roman',serif] text-[15px] leading-relaxed print:p-0 print:border-none print:shadow-none">
        
        {/* Header Hành chính */}
        <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 mb-6">
          <div className="text-center font-bold text-[14px]">
            <div>{exam.departmentName?.toUpperCase() || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}</div>
            <div>{exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</div>
            <div className="w-24 h-0.5 bg-black mx-auto mt-1"></div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[16px]">MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</div>
            <div className="font-bold text-[14px] text-indigo-900 print:text-black">
              Môn: {getSubjectName()} - Lớp {exam.grade}
            </div>
            <div className="italic text-[13px]">
              Năm học: {exam.schoolYear} • Bộ sách: {exam.bookSeries || 'GDPT 2018'}
            </div>
          </div>
        </div>

        {/* Bảng ma trận 2 chiều */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-center text-[14px]">
            <thead>
              <tr className="bg-slate-100 print:bg-transparent font-bold">
                <th rowSpan={2} className="border border-black p-2 w-10">STT</th>
                <th rowSpan={2} className="border border-black p-2 text-left min-w-[200px]">Mạch kiến thức, kĩ năng</th>
                <th colSpan={2} className="border border-black p-2">Mức 1 (Biết)</th>
                <th colSpan={2} className="border border-black p-2">Mức 2 (Hiểu)</th>
                <th colSpan={1} className="border border-black p-2">Mức 3 (Vận dụng)</th>
                <th colSpan={2} className="border border-black p-2">Tổng cộng</th>
              </tr>
              <tr className="bg-slate-100 print:bg-transparent font-bold text-[13px]">
                <th className="border border-black p-1.5 w-20">TN</th>
                <th className="border border-black p-1.5 w-20">TL</th>
                <th className="border border-black p-1.5 w-20">TN</th>
                <th className="border border-black p-1.5 w-20">TL</th>
                <th className="border border-black p-1.5 w-24">TL</th>
                <th className="border border-black p-1.5 w-20">Số câu</th>
                <th className="border border-black p-1.5 w-20">Số điểm</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="border border-black p-2">{idx + 1}</td>
                  <td className="border border-black p-2 text-left font-medium">{row.topic}</td>
                  <td className="border border-black p-2">
                    {row.m1_tn_count > 0 ? (
                      <span className="font-semibold">{row.m1_tn_count} <span className="text-xs font-normal text-slate-500">({row.m1_tn_score}đ)</span></span>
                    ) : '-'}
                  </td>
                  <td className="border border-black p-2">
                    {row.m1_tl_count > 0 ? (
                      <span className="font-semibold">{row.m1_tl_count} <span className="text-xs font-normal text-slate-500">({row.m1_tl_score}đ)</span></span>
                    ) : '-'}
                  </td>
                  <td className="border border-black p-2">
                    {row.m2_tn_count > 0 ? (
                      <span className="font-semibold">{row.m2_tn_count} <span className="text-xs font-normal text-slate-500">({row.m2_tn_score}đ)</span></span>
                    ) : '-'}
                  </td>
                  <td className="border border-black p-2">
                    {row.m2_tl_count > 0 ? (
                      <span className="font-semibold">{row.m2_tl_count} <span className="text-xs font-normal text-slate-500">({row.m2_tl_score}đ)</span></span>
                    ) : '-'}
                  </td>
                  <td className="border border-black p-2">
                    {row.m3_tl_count > 0 ? (
                      <span className="font-semibold">{row.m3_tl_count} <span className="text-xs font-normal text-slate-500">({row.m3_tl_score}đ)</span></span>
                    ) : '-'}
                  </td>
                  <td className="border border-black p-2 font-bold">{row.total_count}</td>
                  <td className="border border-black p-2 font-bold">{row.total_score}</td>
                </tr>
              ))}

              {/* Dòng Tổng số câu */}
              <tr className="bg-slate-50 print:bg-transparent font-bold">
                <td colSpan={2} className="border border-black p-2 text-center">
                  Tổng số câu
                </td>
                <td className="border border-black p-2">
                  {exam.questions.filter(q => q.level === 'M1' && q.type.startsWith('TN')).length}
                </td>
                <td className="border border-black p-2">
                  {exam.questions.filter(q => q.level === 'M1' && !q.type.startsWith('TN')).length}
                </td>
                <td className="border border-black p-2">
                  {exam.questions.filter(q => q.level === 'M2' && q.type.startsWith('TN')).length}
                </td>
                <td className="border border-black p-2">
                  {exam.questions.filter(q => q.level === 'M2' && !q.type.startsWith('TN')).length}
                </td>
                <td className="border border-black p-2">
                  {exam.questions.filter(q => q.level === 'M3').length}
                </td>
                <td className="border border-black p-2 bg-indigo-50/50 print:bg-transparent text-indigo-950 font-extrabold">
                  {exam.questions.length} câu
                </td>
                <td className="border border-black p-2 bg-indigo-50/50 print:bg-transparent text-indigo-950 font-extrabold">
                  {matrix.summary.total_score} điểm
                </td>
              </tr>

              {/* Dòng Tỉ lệ theo Mức độ */}
              <tr className="font-bold bg-white">
                <td colSpan={2} className="border border-black p-2 text-center">
                  Tỉ lệ điểm theo Mức độ
                </td>
                <td colSpan={2} className="border border-black p-2 bg-blue-50/40 print:bg-transparent">
                  Mức 1: {matrix.summary.m1_score}đ ({matrix.summary.m1_percent}%)
                </td>
                <td colSpan={2} className="border border-black p-2 bg-emerald-50/40 print:bg-transparent">
                  Mức 2: {matrix.summary.m2_score}đ ({matrix.summary.m2_percent}%)
                </td>
                <td className="border border-black p-2 bg-purple-50/40 print:bg-transparent">
                  Mức 3: {matrix.summary.m3_score}đ ({matrix.summary.m3_percent}%)
                </td>
                <td colSpan={2} className="border border-black p-2 text-center bg-slate-100 print:bg-transparent">
                  100% (10 điểm)
                </td>
              </tr>

              {/* Dòng Tỉ lệ theo Hình thức */}
              <tr className="font-bold bg-slate-50 print:bg-transparent">
                <td colSpan={2} className="border border-black p-2 text-center">
                  Tỉ lệ Trắc nghiệm / Tự luận
                </td>
                <td colSpan={3} className="border border-black p-2 text-center text-blue-900">
                  Trắc nghiệm: {matrix.summary.tn_score} điểm ({matrix.summary.tn_percent}%)
                </td>
                <td colSpan={4} className="border border-black p-2 text-center text-emerald-900">
                  Tự luận: {matrix.summary.tl_score} điểm ({matrix.summary.tl_percent}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual progress comparison bars (Hidden on print) */}
        <div className="print:hidden mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          
          {/* Mức độ */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Phân bố mức độ nhận thức (Chuẩn: 50% - 30% - 20%)</span>
              <span className="text-indigo-600 font-mono text-xs">M1 - M2 - M3</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-200">
              <div
                style={{ width: `${matrix.summary.m1_percent}%` }}
                className="bg-blue-500 text-[10px] text-white flex items-center justify-center font-bold"
                title={`Mức 1: ${matrix.summary.m1_percent}%`}
              >
                {matrix.summary.m1_percent}%
              </div>
              <div
                style={{ width: `${matrix.summary.m2_percent}%` }}
                className="bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold"
                title={`Mức 2: ${matrix.summary.m2_percent}%`}
              >
                {matrix.summary.m2_percent}%
              </div>
              <div
                style={{ width: `${matrix.summary.m3_percent}%` }}
                className="bg-purple-500 text-[10px] text-white flex items-center justify-center font-bold"
                title={`Mức 3: ${matrix.summary.m3_percent}%`}
              >
                {matrix.summary.m3_percent}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Mức 1 (Biết): {matrix.summary.m1_score}đ</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Mức 2 (Hiểu): {matrix.summary.m2_score}đ</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Mức 3 (Vận dụng): {matrix.summary.m3_score}đ</span>
            </div>
          </div>

          {/* Hình thức */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Phân bố hình thức câu hỏi (Chuẩn: 60% TN - 40% TL)</span>
              <span className="text-indigo-600 font-mono text-xs">TN - TL</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-200">
              <div
                style={{ width: `${matrix.summary.tn_percent}%` }}
                className="bg-sky-600 text-[10px] text-white flex items-center justify-center font-bold"
                title={`Trắc nghiệm: ${matrix.summary.tn_percent}%`}
              >
                {matrix.summary.tn_percent}%
              </div>
              <div
                style={{ width: `${matrix.summary.tl_percent}%` }}
                className="bg-teal-600 text-[10px] text-white flex items-center justify-center font-bold"
                title={`Tự luận: ${matrix.summary.tl_percent}%`}
              >
                {matrix.summary.tl_percent}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> Trắc nghiệm: {matrix.summary.tn_score}đ ({matrix.summary.tn_percent}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span> Tự luận: {matrix.summary.tl_score}đ ({matrix.summary.tl_percent}%)</span>
            </div>
          </div>

        </div>

        {/* Chữ kí duyệt ma trận */}
        <div className="grid grid-cols-2 gap-8 mt-12 text-center text-[14px]">
          <div>
            <div className="font-bold">TỔ TRƯỞNG CHUYÊN MÔN</div>
            <div className="italic text-slate-500 text-xs mt-1">(Kí và ghi rõ họ tên)</div>
            <div className="h-16"></div>
          </div>
          <div>
            <div className="italic text-xs">Ngày ..... tháng ..... năm 202...</div>
            <div className="font-bold">NGƯỜI RA MA TRẬN VÀ ĐỀ</div>
            <div className="italic text-slate-500 text-xs mt-1">(Kí và ghi rõ họ tên)</div>
            <div className="h-16"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
