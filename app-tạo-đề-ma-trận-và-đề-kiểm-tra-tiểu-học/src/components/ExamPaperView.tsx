import React, { useState } from 'react';
import { ExamPaper } from '../types/exam';
import { GridSquareRenderer } from './GridSquareRenderer';
import { Eye, EyeOff, Printer, FileDown } from 'lucide-react';
import { exportExamToWord } from '../utils/docxExporter';

interface Props {
  exam: ExamPaper;
}

export const ExamPaperView: React.FC<Props> = ({ exam }) => {
  const [showAnswers, setShowAnswers] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top action bar - Hidden when printing */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showAnswers
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {showAnswers ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showAnswers ? 'Ẩn đáp án (Chế độ Học sinh)' : 'Hiện đáp án (Chế độ Giáo viên)'}</span>
          </button>

          <span className="text-xs text-slate-400">|</span>

          <span className="text-xs text-slate-500">
            {exam.questions.length} câu • {exam.durationMinutes} phút làm bài
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExamToWord(exam, { includeAnswers: showAnswers })}
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
            <span>In đề kiểm tra</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-slate-200 max-w-4xl mx-auto text-black font-['Times_New_Roman',serif] text-[16px] leading-relaxed print:p-0 print:border-none print:shadow-none print:max-w-none">
        
        {/* Header Hành chính */}
        <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 mb-4">
          <div className="text-center font-bold text-[14px]">
            <div>{exam.departmentName?.toUpperCase() || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}</div>
            <div>{exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</div>
            <div className="w-24 h-0.5 bg-black mx-auto mt-1 mb-2"></div>
            <div className="font-normal text-[14px] text-left mt-3">
              Họ và tên: ...........................................................
            </div>
            <div className="font-normal text-[14px] text-left mt-2">
              Lớp: ................... Số báo danh: ........................
            </div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[15px]">{exam.title?.toUpperCase() || 'BÀI KIỂM TRA ĐỊNH KÌ'}</div>
            <div className="font-bold text-[14px]">{exam.subTitle?.toUpperCase() || `NĂM HỌC ${exam.schoolYear}`}</div>
            <div className="font-bold text-[14px] mt-1 text-indigo-900 print:text-black">
              Môn: {getSubjectName()} - Lớp {exam.grade}
            </div>
            <div className="italic text-[13px] mt-0.5">
              Thời gian làm bài: {exam.durationMinutes} phút (không kể thời gian phát đề)
            </div>
          </div>
        </div>

        {/* Khung điểm và nhận xét của giáo viên */}
        <div className="grid grid-cols-5 border border-black mb-6">
          <div className="col-span-2 border-r border-black p-2 text-center bg-slate-50/50 print:bg-transparent">
            <div className="font-bold text-[14px] mb-1">ĐIỂM</div>
            <div className="h-16 text-left text-[13px] flex flex-col justify-between pt-1">
              <div>Bằng số: .................................</div>
              <div>Bằng chữ: ................................</div>
            </div>
          </div>
          <div className="col-span-3 p-2 bg-slate-50/50 print:bg-transparent">
            <div className="font-bold text-[14px] text-center mb-1">NHẬN XÉT CỦA GIÁO VIÊN</div>
            <div className="h-16 text-[13px] text-slate-400 print:text-transparent pt-1 leading-relaxed">
              .......................................................................................................................<br />
              .......................................................................................................................
            </div>
          </div>
        </div>

        {/* VĂN BẢN ĐỌC HIỂU NẾU LÀ MÔN TIẾNG VIỆT */}
        {exam.readingPassage && (
          <div className="mb-6 p-4 rounded border border-slate-300 bg-slate-50/30 print:border-black print:bg-transparent">
            <h3 className="font-bold text-center text-[16px] mb-2 uppercase">
              {exam.readingPassage.title}
            </h3>
            <p className="text-justify whitespace-pre-line text-[15px] leading-relaxed indent-6">
              {exam.readingPassage.content}
            </p>
            {exam.readingPassage.author && (
              <div className="text-right italic text-[14px] mt-2">
                ({exam.readingPassage.author})
              </div>
            )}
            <div className="text-xs text-slate-500 italic mt-1 print:hidden">
              (Độ dài văn bản: {exam.readingPassage.wordCount || 280} chữ - Phù hợp chuẩn CT GDPT 2018 Lớp {exam.grade})
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 print:border-black font-bold text-[15px]">
              Dựa vào nội dung bài đọc trên, em hãy thực hiện các câu hỏi và bài tập dưới đây:
            </div>
          </div>
        )}

        {/* DANH SÁCH CÂU HỎI (QUY CHUẨN: TUYỆT ĐỐI KHÔNG GHI PHẦN TRẮC NGHIỆM / TỰ LUẬN) */}
        <div className="space-y-4">
          {exam.questions.map((q) => (
            <div key={q.id || q.number} className="text-justify leading-relaxed">
              
              {/* QUY CÁCH TRÌNH BÀY: Câu số (chữ đậm), điểm (chữ nghiêng và không đậm) liền câu số, câu hỏi (chữ không đậm) */}
              <div>
                <span className="font-bold">Câu {q.number}</span>
                <span className="italic font-normal">({q.scoreText})</span>: {q.questionText}
              </div>

              {/* Các ý phụ a, b, c, d bằng lề - không tab */}
              {q.subItems && q.subItems.length > 0 && (
                <div className="mt-1 space-y-1">
                  {q.subItems.map((si) => (
                    <div key={si.id} className="flex items-start justify-between">
                      <div>
                        <span className="font-medium">{si.label}</span> {si.text}
                      </div>
                      <div className="text-slate-400 font-mono text-sm print:text-black">
                        ....................
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nối cột nếu có */}
              {q.matchingPairs && q.matchingPairs.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-4 max-w-xl mx-auto py-1">
                  <div className="space-y-2">
                    <div className="font-bold text-center text-sm underline">Cột A</div>
                    {q.matchingPairs.map((mp) => (
                      <div key={mp.id} className="p-1.5 border border-slate-300 rounded bg-white text-sm print:border-black">
                        {mp.left}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="font-bold text-center text-sm underline">Cột B</div>
                    {q.matchingPairs.map((mp) => (
                      <div key={mp.id} className="p-1.5 border border-slate-300 rounded bg-white text-sm print:border-black">
                        {mp.right}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Điền khuyết nếu có */}
              {q.blanks && q.blanks.length > 0 && (
                <div className="mt-1 space-y-1">
                  {q.blanks.map((b) => (
                    <div key={b.id} className="leading-relaxed">
                      {b.prefixText}
                      <span className="inline-block border-b border-black w-32 mx-1 text-center font-medium text-blue-700">
                        {showAnswers ? b.expectedAnswer : ''}
                      </span>
                      {b.suffixText}
                    </div>
                  ))}
                </div>
              )}

              {/* Lưới ô vuông nếu có (môn Toán) */}
              {q.gridData && (
                <div className="text-center my-2">
                  <GridSquareRenderer data={q.gridData} />
                </div>
              )}

              {/* Phương án A, B, C, D lùi vào 1 tab (1cm / ~28px) */}
              {q.options && q.options.length > 0 && (
                <div className="ml-7 mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {q.options.map((opt, optIdx) => {
                    const optLetter = opt.trim().charAt(0);
                    const isCorrectOpt = q.correctAnswer?.includes(optLetter);
                    return (
                      <div
                        key={optIdx}
                        className={`text-[15px] flex items-center gap-1.5 ${
                          showAnswers && isCorrectOpt
                            ? 'text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200'
                            : ''
                        }`}
                      >
                        <span>{opt}</span>
                        {showAnswers && isCorrectOpt && (
                          <span className="text-xs bg-blue-600 text-white px-1 rounded print:hidden">
                            ✓ Đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tự luận chừa dòng kẻ làm bài cho học sinh */}
              {q.type === 'TL' && !showAnswers && (
                <div className="mt-2 space-y-3 pt-1">
                  <div className="text-xs italic text-slate-500 font-sans print:hidden">
                    (Phần bài làm của học sinh):
                  </div>
                  <div className="border-b border-dotted border-slate-400 h-5 w-full"></div>
                  <div className="border-b border-dotted border-slate-400 h-5 w-full"></div>
                  <div className="border-b border-dotted border-slate-400 h-5 w-full"></div>
                  {q.score >= 1.5 && (
                    <>
                      <div className="border-b border-dotted border-slate-400 h-5 w-full"></div>
                      <div className="border-b border-dotted border-slate-400 h-5 w-full"></div>
                    </>
                  )}
                </div>
              )}

              {/* Hiển thị đáp án / hướng dẫn chấm khi ở chế độ Giáo viên */}
              {showAnswers && (
                <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded text-[14px] text-blue-900 print:hidden">
                  <div className="font-bold flex items-center justify-between">
                    <span>Hướng dẫn chấm & Đáp án:</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                      {q.level} • {q.scoreText}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-800 whitespace-pre-line">
                    {q.gradingGuide}
                  </div>
                  {q.essaySteps && q.essaySteps.length > 0 && (
                    <div className="mt-2 pt-1 border-t border-blue-200/60 space-y-1 text-xs">
                      <div className="font-semibold text-slate-600">Thang điểm từng bước:</div>
                      {q.essaySteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex justify-between text-slate-700">
                          <span>• {step.content}</span>
                          <span className="font-bold">+{step.score}đ</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>

        {/* PHẦN KIỂM TRA VIẾT (MÔN TIẾNG VIỆT) */}
        {exam.writingSection && (
          <div className="mt-8 pt-4 border-t border-black space-y-3">
            <div className="font-bold text-[16px] uppercase">
              B. KIỂM TRA VIẾT (10 điểm)
            </div>

            {exam.writingSection.dictationTitle && (
              <div>
                <div className="font-bold">
                  1. Chính tả (Nghe - viết) ({exam.writingSection.dictationScore || 4} điểm):
                </div>
                <div className="italic text-[15px] ml-4 mt-0.5">
                  Bài viết: "{exam.writingSection.dictationTitle}"
                </div>
              </div>
            )}

            {exam.writingSection.compositionPrompt && (
              <div>
                <div className="font-bold">
                  2. Tập làm văn / Viết đoạn văn ({exam.writingSection.compositionScore || 6} điểm):
                </div>
                <div className="text-[15px] ml-4 mt-0.5 leading-relaxed">
                  <b>Đề bài:</b> {exam.writingSection.compositionPrompt}
                </div>
              </div>
            )}

            <div className="border-b border-dotted border-slate-400 h-6 w-full mt-4"></div>
            <div className="border-b border-dotted border-slate-400 h-6 w-full"></div>
            <div className="border-b border-dotted border-slate-400 h-6 w-full"></div>
            <div className="border-b border-dotted border-slate-400 h-6 w-full"></div>
            <div className="border-b border-dotted border-slate-400 h-6 w-full"></div>
          </div>
        )}

        {/* Chân trang in ấn */}
        <div className="mt-8 pt-3 border-t border-slate-300 text-center text-xs text-slate-500 italic print:text-black">
          --- HẾT ---<br />
          <i>(Cán bộ coi kiểm tra không giải thích gì thêm)</i>
        </div>

      </div>
    </div>
  );
};
