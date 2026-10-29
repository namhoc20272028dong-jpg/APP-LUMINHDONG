import React, { useState } from 'react';
import { ExamPaper, Subject, Grade, Semester } from './types/exam';
import { STANDARD_EXAM_PRESETS } from './data/standardPresets';
import { ValidationBanner } from './components/ValidationBanner';
import { ExamPaperView } from './components/ExamPaperView';
import { MatrixView } from './components/MatrixView';
import { SpecificationView } from './components/SpecificationView';
import { GradingGuideView } from './components/GradingGuideView';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { ExamEditorModal } from './components/ExamEditorModal';
import { CurriculumGuideModal } from './components/CurriculumGuideModal';
import { reorderAndStandardizeExam } from './utils/matrixValidator';
import { exportExamToWord } from './utils/docxExporter';
import {
  FileText,
  TableProperties,
  ListOrdered,
  CheckSquare,
  Sparkles,
  Edit3,
  BookOpen,
  Printer,
  FileDown,
  ChevronDown,
  Layers,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  // Current active exam (default to Toán Lớp 4 Cuối kì 1)
  const [currentExam, setCurrentExam] = useState<ExamPaper>(STANDARD_EXAM_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'exam' | 'matrix' | 'spec' | 'guide'>('exam');

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  // Switch subject / preset
  const handleSelectPreset = (preset: ExamPaper) => {
    setCurrentExam(preset);
    setIsPresetDropdownOpen(false);
  };

  const handleUpdateExam = (updated: ExamPaper) => {
    setCurrentExam(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-500 text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  APP TẠO ĐỀ MA TRẬN VÀ ĐỀ KIỂM TRA TIỂU HỌC
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                    GDPT 2018
                  </span>
                  <span>•</span>
                  <span>Thông tư 27/2020/TT-BGDĐT</span>
                </div>
              </div>
            </div>

            {/* Top action buttons */}
            <div className="flex items-center gap-2">
              
              {/* Presets dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Mẫu đề chuẩn</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isPresetDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Chọn đề mẫu thẩm định GDPT 2018:
                    </div>
                    {STANDARD_EXAM_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between cursor-pointer ${
                          currentExam.id === p.id ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div>{p.subject === 'TOAN' ? 'Toán' : p.subject === 'TIENG_VIET' ? 'Tiếng Việt' : p.subject === 'TIN_HOC' ? 'Tin học' : 'Khoa học'} Lớp {p.grade}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{p.semester} • {p.durationMinutes} phút • {p.questions.length} câu</div>
                        </div>
                        {currentExam.id === p.id && (
                          <span className="text-indigo-600 text-xs">✓ Đang mở</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Guide modal button */}
              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Xem cẩm nang quy chuẩn Thông tư 27 và GDPT 2018"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Sổ tay quy chuẩn</span>
              </button>

              {/* Edit Exam button */}
              <button
                onClick={() => setIsEditorModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Chỉnh sửa đề</span>
              </button>

              {/* AI Generator button */}
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs md:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Tạo Đề Bằng AI</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Subheader / Context filter pills */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Quick metadata chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-600">Đang xem:</span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 font-bold text-indigo-900">
              Môn {currentExam.subject === 'TOAN' ? 'Toán' : currentExam.subject === 'TIENG_VIET' ? 'Tiếng Việt' : currentExam.subject === 'TIN_HOC' ? 'Tin học' : currentExam.subject === 'KHOA_HOC' ? 'Khoa học' : currentExam.subject}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-800">
              Lớp {currentExam.grade}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-800">
              {currentExam.semester}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 hidden sm:inline">
              {currentExam.schoolName}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 hidden md:inline">
              Bộ sách: {currentExam.bookSeries}
            </span>
          </div>

          {/* Quick export actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExamToWord(currentExam, { includeAnswers: false })}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất Word (.doc)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>In ấn (A4)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Pedagogical Compliance & Rule Inspector Banner */}
        <div className="print:hidden">
          <ValidationBanner exam={currentExam} onUpdateExam={handleUpdateExam} />
        </div>

        {/* 4 Core Primary Tabs (Tab Bar) */}
        <div className="print:hidden flex items-center gap-2 border-b border-slate-200 mb-5 overflow-x-auto pb-1 text-sm font-bold">
          
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-white text-indigo-700 border-t-2 border-l border-r border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>1. Đề Kiểm Tra (Học sinh)</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white text-indigo-700 border-t-2 border-l border-r border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <TableProperties className="w-4 h-4 text-blue-600" />
            <span>2. Ma Trận Đề (2 Chiều)</span>
          </button>

          <button
            onClick={() => setActiveTab('spec')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'spec'
                ? 'bg-white text-indigo-700 border-t-2 border-l border-r border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            <span>3. Bản Đặc Tả Ma Trận</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-indigo-700 border-t-2 border-l border-r border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>4. Hướng Dẫn Chấm & Biểu Điểm</span>
          </button>

        </div>

        {/* Tab View Render */}
        <div className="pb-12">
          {activeTab === 'exam' && <ExamPaperView exam={currentExam} />}
          {activeTab === 'matrix' && <MatrixView exam={currentExam} />}
          {activeTab === 'spec' && <SpecificationView exam={currentExam} />}
          {activeTab === 'guide' && <GradingGuideView exam={currentExam} />}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <b>App Tạo Đề Ma Trận Và Đề Kiểm Tra Tiểu Học</b> • Xây dựng theo Chuẩn Chương trình GDPT 2018 & Thông tư 27/2020/TT-BGDĐT.
          </div>
          <div className="text-slate-400">
            Hỗ trợ đầy đủ các môn Toán, Tiếng Việt, Tin học, Khoa học, Lịch sử & Địa lí, Công nghệ (Lớp 1 - 5).
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onExamGenerated={handleUpdateExam}
        currentExam={currentExam}
      />

      <ExamEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        exam={currentExam}
        onSave={handleUpdateExam}
      />

      <CurriculumGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
