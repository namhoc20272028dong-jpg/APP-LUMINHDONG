import React, { useState } from 'react';
import { ExamPaper, Question, CognitiveLevel, QuestionType } from '../types/exam';
import { X, Plus, Trash2, Save, Sparkles, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { reorderAndStandardizeExam, generateMatrixFromQuestions, generateGradingGuideFromQuestions } from '../utils/matrixValidator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper;
  onSave: (updated: ExamPaper) => void;
}

export const ExamEditorModal: React.FC<Props> = ({ isOpen, onClose, exam, onSave }) => {
  const [formData, setFormData] = useState<ExamPaper>(() => JSON.parse(JSON.stringify(exam)));
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'passage'>('questions');
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentQ = formData.questions[selectedQuestionIdx];

  const handleUpdateCurrentQuestion = (partial: Partial<Question>) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[selectedQuestionIdx] = {
      ...updatedQuestions[selectedQuestionIdx],
      ...partial,
      scoreText: partial.score !== undefined ? `${partial.score.toString().replace('.', ',')} điểm` : updatedQuestions[selectedQuestionIdx].scoreText,
    };

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleAddQuestion = () => {
    const newNum = formData.questions.length + 1;
    const isPrimaryLow = formData.grade <= 3;
    const defaultOptions = isPrimaryLow 
      ? ['A. Phương án 1', 'B. Phương án 2', 'C. Phương án 3'] 
      : ['A. Phương án 1', 'B. Phương án 2', 'C. Phương án 3', 'D. Phương án 4'];

    const newQ: Question = {
      id: `q_custom_${Date.now()}`,
      number: newNum,
      score: 0.5,
      scoreText: '0,5 điểm',
      level: 'M1',
      type: 'TN_NLC',
      topic: formData.questions[0]?.topic || 'Kiến thức cốt lõi',
      questionText: 'Khoanh vào chữ cái đặt trước câu trả lời đúng:...',
      options: defaultOptions,
      correctAnswer: 'A',
      gradingGuide: 'Khoanh đúng đáp án A cho 0,5 điểm.',
    };

    const updatedQuestions = [...formData.questions, newQ];
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
    setSelectedQuestionIdx(updatedQuestions.length - 1);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (formData.questions.length <= 1) {
      alert('Đề kiểm tra cần có ít nhất 1 câu hỏi.');
      return;
    }
    const updated = formData.questions.filter((_, i) => i !== idx);
    // Renumber
    updated.forEach((q, i) => { q.number = i + 1; });
    setFormData({ ...formData, questions: updated });
    setSelectedQuestionIdx(Math.max(0, idx - 1));
  };

  const handleAutoStandardize = () => {
    const standardized = reorderAndStandardizeExam(formData);
    setFormData(standardized);
    setSelectedQuestionIdx(0);
  };

  const handleSave = () => {
    // Recompute matrix & specs & answers
    const recomputedMatrix = generateMatrixFromQuestions(formData.questions);
    const recomputedGrading = generateGradingGuideFromQuestions(formData.questions);
    const recomputedSpecs = formData.questions.map((q, idx) => ({
      order: idx + 1,
      topic: q.topic,
      level: q.level,
      requirement: `Đánh giá năng lực học sinh về ${q.topic.toLowerCase()}`,
      questionType: q.type.startsWith('TN') ? 'Trắc nghiệm' : 'Tự luận',
      questionNumber: q.number,
      score: q.score,
    }));

    const finalExam: ExamPaper = {
      ...formData,
      matrix: recomputedMatrix,
      specifications: recomputedSpecs,
      gradingGuide: recomputedGrading,
    };

    onSave(finalExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Chỉnh Sửa & Biên Soạn Đề Kiểm Tra</h3>
            <p className="text-xs text-slate-400">
              Chỉnh sửa nội dung câu hỏi, biểu điểm, mạch kiến thức và đồng bộ ma trận tự động
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'questions' ? 'border-indigo-600 text-indigo-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Nội dung câu hỏi ({formData.questions.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info' ? 'border-indigo-600 text-indigo-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Thông tin hành chính & Đề thi
          </button>
          {formData.readingPassage && (
            <button
              onClick={() => setActiveTab('passage')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'passage' ? 'border-indigo-600 text-indigo-700' : 'border-transparent hover:text-slate-900'
              }`}
            >
              Văn bản đọc hiểu
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài kiểm tra</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Năm học</label>
                  <input
                    type="text"
                    value={formData.schoolYear}
                    onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trường Tiểu học</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phòng Giáo dục & Đào tạo</label>
                  <input
                    type="text"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bộ sách giáo khoa</label>
                  <input
                    type="text"
                    value={formData.bookSeries}
                    onChange={(e) => setFormData({ ...formData, bookSeries: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian làm bài (phút)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 40 })}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passage' && formData.readingPassage && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài đọc</label>
                <input
                  type="text"
                  value={formData.readingPassage.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    readingPassage: { ...formData.readingPassage!, title: e.target.value }
                  })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung bài đọc (ngoài SGK)</label>
                <textarea
                  rows={8}
                  value={formData.readingPassage.content}
                  onChange={(e) => {
                    const text = e.target.value;
                    const words = text.trim().split(/\s+/).filter(Boolean).length;
                    setFormData({
                      ...formData,
                      readingPassage: { ...formData.readingPassage!, content: text, wordCount: words }
                    });
                  }}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 leading-relaxed font-serif"
                />
                <div className="text-xs text-slate-500 mt-1">
                  Số từ hiện tại: <b>{formData.readingPassage.wordCount}</b> từ.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tác giả / Nguồn trích</label>
                <input
                  type="text"
                  value={formData.readingPassage.author || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    readingPassage: { ...formData.readingPassage!, author: e.target.value }
                  })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2 italic"
                />
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left sidebar: Question numbers list */}
              <div className="md:col-span-4 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-[500px] overflow-y-auto space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">Danh sách câu</span>
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm câu
                  </button>
                </div>

                <div className="space-y-1">
                  {formData.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      onClick={() => setSelectedQuestionIdx(idx)}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        selectedQuestionIdx === idx
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span>Câu {q.number}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          selectedQuestionIdx === idx
                            ? 'bg-white/20 text-white'
                            : q.level === 'M1' ? 'bg-blue-100 text-blue-800' : q.level === 'M2' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {q.level}
                        </span>
                        <span className="truncate max-w-[100px] opacity-80">{q.type}</span>
                      </div>
                      <span className="text-[11px] font-mono shrink-0 ml-1">
                        {q.score}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={handleAutoStandardize}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tự động sắp xếp chuẩn quy định</span>
                  </button>
                </div>
              </div>

              {/* Right panel: Edit active question */}
              <div className="md:col-span-8 border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                {currentQ ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">Câu {currentQ.number}</span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs text-slate-600">{currentQ.topic}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(selectedQuestionIdx)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 p-1 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Xóa câu này
                      </button>
                    </div>

                    {/* Metadata line: Mức độ, Loại câu, Điểm số, Mạch kiến thức */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Mức độ</label>
                        <select
                          value={currentQ.level}
                          onChange={(e) => handleUpdateCurrentQuestion({ level: e.target.value as CognitiveLevel })}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 font-semibold"
                        >
                          <option value="M1">Mức 1 (Biết)</option>
                          <option value="M2">Mức 2 (Hiểu)</option>
                          <option value="M3">Mức 3 (Vận dụng - Chỉ TL)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Hình thức</label>
                        <select
                          value={currentQ.type}
                          onChange={(e) => handleUpdateCurrentQuestion({ type: e.target.value as QuestionType })}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 font-semibold"
                        >
                          <option value="TN_NLC">TN Nhiều lựa chọn</option>
                          <option value="TN_DS">TN Đúng - Sai</option>
                          <option value="TN_NC">TN Nối cột</option>
                          <option value="TN_DK">TN Điền khuyết</option>
                          <option value="TL">Tự luận</option>
                          <option value="TH">Thực hành</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Điểm số (đ)</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          max="5"
                          value={currentQ.score}
                          onChange={(e) => handleUpdateCurrentQuestion({ score: parseFloat(e.target.value) || 0.5 })}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Mạch kiến thức</label>
                        <input
                          type="text"
                          value={currentQ.topic}
                          onChange={(e) => handleUpdateCurrentQuestion({ topic: e.target.value })}
                          className="w-full text-xs rounded border border-slate-300 p-1.5"
                        />
                      </div>
                    </div>

                    {/* Question text */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nội dung câu hỏi (Câu số và điểm sẽ tự động gắn phía trước)
                      </label>
                      <textarea
                        rows={3}
                        value={currentQ.questionText}
                        onChange={(e) => handleUpdateCurrentQuestion({ questionText: e.target.value })}
                        className="w-full text-sm rounded-lg border border-slate-300 p-2 leading-relaxed"
                      />
                    </div>

                    {/* Options if TN_NLC */}
                    {currentQ.type === 'TN_NLC' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Các phương án lựa chọn (Lớp {formData.grade} khuyến nghị {formData.grade <= 3 ? '3 phương án A, B, C' : '4 phương án A, B, C, D'}):
                        </label>
                        {currentQ.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(currentQ.options || [])];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateCurrentQuestion({ options: newOpts });
                              }}
                              className="flex-1 text-xs rounded border border-slate-300 p-1.5 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const letter = opt.trim().charAt(0);
                                handleUpdateCurrentQuestion({ correctAnswer: letter });
                              }}
                              className={`text-xs px-2 py-1 rounded border font-semibold cursor-pointer ${
                                currentQ.correctAnswer === opt.trim().charAt(0)
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {currentQ.correctAnswer === opt.trim().charAt(0) ? '✓ Đáp án đúng' : 'Chọn làm đúng'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grading guide */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hướng dẫn chấm & Đáp án
                      </label>
                      <textarea
                        rows={2}
                        value={currentQ.gradingGuide}
                        onChange={(e) => handleUpdateCurrentQuestion({ gradingGuide: e.target.value })}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Chọn một câu hỏi bên trái để chỉnh sửa
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs md:text-sm font-bold shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu & Cập Nhật Toàn Bộ</span>
          </button>
        </div>

      </div>
    </div>
  );
};
