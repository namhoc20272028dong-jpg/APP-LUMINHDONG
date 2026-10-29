export type Subject = 
  | 'TOAN' 
  | 'TIENG_VIET' 
  | 'TIN_HOC' 
  | 'KHOA_HOC' 
  | 'LICH_SU_DIA_LY' 
  | 'CONG_NGHE';

export type Grade = 1 | 2 | 3 | 4 | 5;

export type Semester = 'GKI' | 'CKI' | 'GKII' | 'CN';

export type CognitiveLevel = 'M1' | 'M2' | 'M3'; // M1: Biết, M2: Hiểu, M3: Vận dụng

export type QuestionCategory = 'TN' | 'TL' | 'TH'; // Trắc nghiệm, Tự luận, Thực hành

export type QuestionType = 
  | 'TN_NLC'  // Trắc nghiệm nhiều lựa chọn
  | 'TN_DS'   // Trắc nghiệm đúng/sai
  | 'TN_NC'   // Trắc nghiệm nối cột
  | 'TN_DK'   // Trắc nghiệm điền khuyết
  | 'TL'      // Tự luận
  | 'TH';     // Thực hành (môn Tin học)

export interface QuestionSubItem {
  id: string;
  label: string; // "a)", "b)", ...
  text: string;
  isCorrect?: boolean;
  score?: number;
}

export interface MatchingPair {
  id: string;
  left: string;   // Cột A: 1, 2, 3
  right: string;  // Cột B: a, b, c
}

export interface BlankItem {
  id: string;
  prefixText: string;
  expectedAnswer: string;
  suffixText: string;
}

export interface GridSquareData {
  type: 'grid';
  cols: number;
  rows: number;
  shapeType?: 'rectangle' | 'square' | 'triangle' | 'parallelogram' | 'custom';
  highlightCells?: { r: number; c: number }[];
  caption?: string;
}

export interface Question {
  id: string;
  number: number;
  score: number;
  scoreText: string; // e.g. "0,5 điểm", "1,0 điểm"
  level: CognitiveLevel;
  type: QuestionType;
  topic: string; // Mạch kiến thức / Chủ đề
  questionText: string;
  options?: string[]; // A, B, C for Grades 1-3; A, B, C, D for Grades 4-5
  correctAnswer?: string;
  subItems?: QuestionSubItem[];
  matchingPairs?: MatchingPair[];
  blanks?: BlankItem[];
  gridData?: GridSquareData;
  gradingGuide: string;
  essaySteps?: { content: string; score: number }[];
}

export interface MatrixRow {
  topic: string;
  m1_tn_count: number;
  m1_tn_score: number;
  m1_tl_count: number;
  m1_tl_score: number;
  m2_tn_count: number;
  m2_tn_score: number;
  m2_tl_count: number;
  m2_tl_score: number;
  m3_tl_count: number;
  m3_tl_score: number;
  total_count: number;
  total_score: number;
}

export interface MatrixSummary {
  m1_score: number;
  m1_percent: number;
  m2_score: number;
  m2_percent: number;
  m3_score: number;
  m3_percent: number;
  tn_score: number;
  tn_percent: number;
  tl_score: number;
  tl_percent: number;
  total_score: number;
}

export interface SpecificationItem {
  order: number;
  topic: string;
  level: CognitiveLevel;
  requirement: string; // Yêu cầu cần đạt chuẩn CT GDPT 2018
  questionType: string; // Tên hiển thị loại câu
  questionNumber: number;
  score: number;
}

export interface ReadingPassage {
  title: string;
  content: string;
  author?: string;
  genre: 'truyen' | 'mieu_ta' | 'tho' | 'thong_tin';
  wordCount: number;
  note?: string;
}

export interface WritingSection {
  dictationTitle?: string;
  dictationContent?: string;
  dictationScore?: number;
  compositionPrompt?: string;
  compositionScore?: number;
  languageExercisesScore?: number;
}

export interface MCQAnswerItem {
  questionNumber: number;
  answer: string;
  score: string;
}

export interface EssayAnswerStep {
  content: string;
  stepScore: string;
}

export interface EssayAnswerItem {
  questionNumber: number;
  score: string;
  steps: EssayAnswerStep[];
  note?: string;
}

export interface GradingGuide {
  mcqAnswers: MCQAnswerItem[];
  essayAnswers: EssayAnswerItem[];
  generalNote?: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  subTitle?: string;
  subject: Subject;
  grade: Grade;
  semester: Semester;
  schoolName: string;
  departmentName: string; // Phòng GD&ĐT ...
  schoolYear: string;
  durationMinutes: number;
  bookSeries: string;
  readingPassage?: ReadingPassage;
  writingSection?: WritingSection;
  questions: Question[];
  matrix: {
    rows: MatrixRow[];
    summary: MatrixSummary;
  };
  specifications: SpecificationItem[];
  gradingGuide: GradingGuide;
  practicalSection?: {
    tasks: {
      number: number;
      taskText: string;
      score: number;
      guide: string;
    }[];
  };
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  detail?: string;
}
