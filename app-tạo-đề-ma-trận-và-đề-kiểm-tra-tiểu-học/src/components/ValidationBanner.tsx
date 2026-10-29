import React from 'react';
import { ExamPaper } from '../types/exam';
import { validateExamRules, reorderAndStandardizeExam } from '../utils/matrixValidator';
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  exam: ExamPaper;
  onUpdateExam: (updated: ExamPaper) => void;
}

export const ValidationBanner: React.FC<Props> = ({ exam, onUpdateExam }) => {
  const issues = validateExamRules(exam);
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  const { matrix } = exam;
  const isAllValid = errors.length === 0 && warnings.length === 0;

  const handleAutoFix = () => {
    const fixed = reorderAndStandardizeExam(exam);
    onUpdateExam(fixed);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-5">
      {/* Top summary bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
            errors.length > 0 ? 'bg-rose-600' : warnings.length > 0 ? 'bg-amber-500' : 'bg-emerald-600'
          }`}>
            {errors.length > 0 ? <AlertCircle className="w-5 h-5" /> : warnings.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                Kiểm định quy chuẩn sư phạm GDPT 2018 & TT27
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                errors.length > 0 ? 'bg-rose-100 text-rose-700' : warnings.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {errors.length > 0 ? `${errors.length} Lỗi nghiêm trọng` : warnings.length > 0 ? `${warnings.length} Cảnh báo quy cách` : 'Chuẩn 100% quy định'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động rà soát tỉ lệ Mức 1-2-3 (50-30-20%), tỉ lệ TN-TL, thứ tự câu và cấm trắc nghiệm Mức 3.
            </p>
          </div>
        </div>

        {/* Quick action button to auto-standardize */}
        <button
          onClick={handleAutoFix}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          title="Tự động sắp xếp lại câu hỏi theo đúng thứ tự quy chuẩn, chuyển TN mức 3 sang tự luận và đồng bộ ma trận, đặc tả"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Tự động Chuẩn hóa & Sắp xếp</span>
        </button>
      </div>

      {/* Metrics breakdown pills */}
      <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white text-xs border-b border-slate-100">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Tổng điểm bài thi</div>
          <div className="text-base font-extrabold text-slate-800 flex items-center justify-between mt-1">
            <span>{matrix.summary.total_score} / 10,0 điểm</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              matrix.summary.total_score === 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
            }`}>
              {matrix.summary.total_score === 10 ? 'Chuẩn thang 10' : 'Chưa đủ 10đ'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Tỉ lệ Mức 1 - Mức 2 - Mức 3</div>
          <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center justify-between">
            <span>{matrix.summary.m1_percent}% - {matrix.summary.m2_percent}% - {matrix.summary.m3_percent}%</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
              Chuẩn 50-30-20
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Hình thức TN - TL</div>
          <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center justify-between">
            <span>TN: {matrix.summary.tn_percent}% | TL: {matrix.summary.tl_percent}%</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
              Chuẩn 60 - 40
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Quy chuẩn Trắc nghiệm M3</div>
          <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center justify-between">
            {exam.questions.some(q => q.level === 'M3' && q.type.startsWith('TN')) ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Có vi phạm!
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tuyệt đối không có
              </span>
            )}
            <span className="text-[10px] text-slate-500">Mức 3 = 100% TL</span>
          </div>
        </div>
      </div>

      {/* Warnings & Errors display */}
      {issues.length > 0 && (
        <div className="px-5 py-3 space-y-2 bg-amber-50/40">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg text-xs flex items-start gap-2.5 ${
                issue.severity === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : issue.severity === 'warning'
                  ? 'bg-amber-50 border border-amber-200 text-amber-900'
                  : 'bg-blue-50 border border-blue-200 text-blue-900'
              }`}
            >
              {issue.severity === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : issue.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{issue.message}</div>
                {issue.detail && <div className="text-slate-600 mt-0.5">{issue.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
