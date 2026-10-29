import {
  ExamPaper,
  Question,
  QuestionType,
  ValidationIssue,
  MatrixRow,
  MatrixSummary,
  SpecificationItem,
  GradingGuide,
  Grade,
} from '../types/exam';

// Thứ tự ưu tiên sắp xếp chuẩn sư phạm:
// Trắc nghiệm M1: NLC -> DS -> NC -> DK
// Trắc nghiệm M2: NLC -> DS -> NC -> DK
// Tự luận M1 -> Tự luận M2 -> Tự luận M3
// Thực hành (nếu có, xếp sau cùng hoặc theo phân bổ môn Tin học)
export function getQuestionSortWeight(q: Question): number {
  const isTN = q.type.startsWith('TN');
  const isTL = q.type === 'TL';
  const isTH = q.type === 'TH';

  if (isTN) {
    if (q.level === 'M1') {
      if (q.type === 'TN_NLC') return 10;
      if (q.type === 'TN_DS') return 11;
      if (q.type === 'TN_NC') return 12;
      if (q.type === 'TN_DK') return 13;
      return 14;
    }
    if (q.level === 'M2') {
      if (q.type === 'TN_NLC') return 20;
      if (q.type === 'TN_DS') return 21;
      if (q.type === 'TN_NC') return 22;
      if (q.type === 'TN_DK') return 23;
      return 24;
    }
    // TN at M3 is illegal, give it 90
    return 90;
  }

  if (isTL) {
    if (q.level === 'M1') return 30;
    if (q.level === 'M2') return 40;
    if (q.level === 'M3') return 50;
    return 55;
  }

  if (isTH) {
    return 60;
  }

  return 99;
}

// Kiểm tra toàn diện đề kiểm tra theo quy định
export function validateExamRules(exam: ExamPaper): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { questions, grade, subject } = exam;

  // 1. Kiểm tra cấm trắc nghiệm ở Mức 3 (QUY TẮC BẮT BUỘC)
  questions.forEach((q) => {
    if (q.level === 'M3' && q.type.startsWith('TN')) {
      issues.push({
        severity: 'error',
        code: 'ERR_M3_MCQ',
        message: `Câu ${q.number} vi phạm: TUYỆT ĐỐI KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG (Mức 3).`,
        detail: 'Theo quy chế GDPT 2018, mức Vận dụng chỉ được ra dưới dạng Tự luận (hoặc Thực hành).',
      });
    }
  });

  // 2. Kiểm tra thứ tự sắp xếp câu hỏi
  let hasOrderViolation = false;
  for (let i = 0; i < questions.length - 1; i++) {
    const w1 = getQuestionSortWeight(questions[i]);
    const w2 = getQuestionSortWeight(questions[i + 1]);
    if (w1 > w2) {
      hasOrderViolation = true;
      break;
    }
  }
  if (hasOrderViolation) {
    issues.push({
      severity: 'warning',
      code: 'WARN_ORDER',
      message: 'Thứ tự câu hỏi chưa chuẩn quy định GDPT 2018.',
      detail: 'Quy chuẩn: Trắc nghiệm (M1: NLC -> ĐS -> NC -> ĐK -> M2: NLC -> ĐS -> NC -> ĐK) trước, sau đó đến Tự luận (M1 -> M2 -> M3).',
    });
  }

  // 3. Kiểm tra số lượng phương án theo khối lớp
  // Lớp 1, 2, 3: 3 phương án (A, B, C)
  // Lớp 4, 5: 4 phương án (A, B, C, D)
  const expectedOptionCount = grade <= 3 ? 3 : 4;
  questions.forEach((q) => {
    if (q.type === 'TN_NLC' && q.options) {
      if (q.options.length !== expectedOptionCount) {
        issues.push({
          severity: 'warning',
          code: 'WARN_OPTION_COUNT',
          message: `Câu ${q.number} có ${q.options.length} phương án (Quy chuẩn Lớp ${grade} cần ${expectedOptionCount} phương án).`,
          detail: grade <= 3 ? 'Lớp 1, 2, 3: gồm 3 phương án (A, B, C).' : 'Lớp 4, 5: gồm 4 phương án (A, B, C, D).',
        });
      }
    }
  });

  // 4. Kiểm tra tổng điểm
  const totalScore = questions.reduce((acc, q) => acc + (q.score || 0), 0);
  const roundedTotal = Math.round(totalScore * 10) / 10;
  // Với Tiếng Việt phần đọc hiểu là 4đ, 6đ hoặc 7đ
  if (subject === 'TOAN' || subject === 'KHOA_HOC' || subject === 'LICH_SU_DIA_LY' || subject === 'CONG_NGHE') {
    if (roundedTotal !== 10) {
      issues.push({
        severity: 'error',
        code: 'ERR_TOTAL_SCORE',
        message: `Tổng điểm hiện tại là ${roundedTotal} điểm (Cần đạt đúng 10,0 điểm).`,
      });
    }
  }

  // 5. Kiểm tra tỉ lệ Mức 1 - Mức 2 - Mức 3 (chuẩn 50% - 30% - 20%)
  const m1Score = questions.filter(q => q.level === 'M1').reduce((a, b) => a + b.score, 0);
  const m2Score = questions.filter(q => q.level === 'M2').reduce((a, b) => a + b.score, 0);
  const m3Score = questions.filter(q => q.level === 'M3').reduce((a, b) => a + b.score, 0);

  if (totalScore > 0) {
    const p1 = Math.round((m1Score / totalScore) * 100);
    const p2 = Math.round((m2Score / totalScore) * 100);
    const p3 = Math.round((m3Score / totalScore) * 100);

    if (subject === 'TOAN' || subject === 'KHOA_HOC' || subject === 'LICH_SU_DIA_LY' || subject === 'CONG_NGHE') {
      if (Math.abs(p1 - 50) > 10 || Math.abs(p2 - 30) > 10 || Math.abs(p3 - 20) > 10) {
        issues.push({
          severity: 'info',
          code: 'INFO_LEVEL_RATIO',
          message: `Tỉ lệ Mức 1 - 2 - 3 đang là ${p1}% - ${p2}% - ${p3}% (Tỉ lệ chuẩn khuyến nghị là 50% - 30% - 20%).`,
        });
      }
    }
  }

  // 6. Kiểm tra quy cách điểm
  questions.forEach((q) => {
    if (q.type === 'TN_NLC' && q.score !== 0.5) {
      issues.push({
        severity: 'info',
        code: 'INFO_SCORE_NLC',
        message: `Câu ${q.number} (TN nhiều lựa chọn) có điểm ${q.score}đ (Quy chuẩn khuyến nghị: 0,5 điểm).`,
      });
    }
  });

  return issues;
}

// Chuẩn hóa và tự động sắp xếp toàn bộ đề kiểm tra, ma trận, đặc tả, hướng dẫn chấm
export function reorderAndStandardizeExam(exam: ExamPaper): ExamPaper {
  // 1. Sao chép sâu
  const updatedExam: ExamPaper = JSON.parse(JSON.stringify(exam));

  // 2. Chuyển bất kỳ câu TN nào ở Mức 3 sang Tự luận
  updatedExam.questions.forEach((q) => {
    if (q.level === 'M3' && q.type.startsWith('TN')) {
      q.type = 'TL';
      q.options = undefined;
      q.gradingGuide = 'Chấm theo các bước lập luận, tính toán hoặc trả lời của học sinh.';
    }
  });

  // 3. Sắp xếp các câu hỏi theo đúng trọng số quy chuẩn
  updatedExam.questions.sort((a, b) => {
    const wa = getQuestionSortWeight(a);
    const wb = getQuestionSortWeight(b);
    if (wa !== wb) return wa - wb;
    return a.number - b.number;
  });

  // 4. Đánh số lại từ 1 đến N và cập nhật scoreText
  updatedExam.questions.forEach((q, idx) => {
    q.number = idx + 1;
    q.scoreText = `${q.score.toString().replace('.', ',')} điểm`;
  });

  // 5. Cập nhật lại bản đặc tả ma trận (mỗi câu 1 dòng đặc tả)
  updatedExam.specifications = updatedExam.questions.map((q, idx) => {
    const existingSpec = exam.specifications?.find(s => s.questionNumber === q.number);
    let typeName = 'Tự luận';
    if (q.type === 'TN_NLC') typeName = 'Trắc nghiệm nhiều lựa chọn';
    else if (q.type === 'TN_DS') typeName = 'Trắc nghiệm đúng - sai';
    else if (q.type === 'TN_NC') typeName = 'Trắc nghiệm nối cột';
    else if (q.type === 'TN_DK') typeName = 'Trắc nghiệm điền khuyết';
    else if (q.type === 'TH') typeName = 'Thực hành trên máy tính';

    return {
      order: idx + 1,
      topic: q.topic || 'Kiến thức cốt lõi',
      level: q.level,
      requirement: existingSpec?.requirement || getDefaultRequirement(q),
      questionType: typeName,
      questionNumber: q.number,
      score: q.score,
    };
  });

  // 6. Tính toán lại bảng ma trận 2 chiều
  const computedMatrix = generateMatrixFromQuestions(updatedExam.questions);
  updatedExam.matrix = computedMatrix;

  // 7. Cập nhật Hướng dẫn chấm
  updatedExam.gradingGuide = generateGradingGuideFromQuestions(updatedExam.questions);

  return updatedExam;
}

// Sinh ma trận 2 chiều từ danh sách câu hỏi
export function generateMatrixFromQuestions(questions: Question[]): { rows: MatrixRow[]; summary: MatrixSummary } {
  // Lấy các chủ đề duy nhất giữ nguyên thứ tự xuất hiện
  const topicMap = new Map<string, Question[]>();
  questions.forEach(q => {
    const t = q.topic || 'Tổng hợp';
    if (!topicMap.has(t)) topicMap.set(t, []);
    topicMap.get(t)!.push(q);
  });

  const rows: MatrixRow[] = [];
  let m1_total_score = 0;
  let m2_total_score = 0;
  let m3_total_score = 0;
  let tn_total_score = 0;
  let tl_total_score = 0;

  topicMap.forEach((qs, topic) => {
    const m1_tn = qs.filter(q => q.level === 'M1' && q.type.startsWith('TN'));
    const m1_tl = qs.filter(q => q.level === 'M1' && !q.type.startsWith('TN'));
    const m2_tn = qs.filter(q => q.level === 'M2' && q.type.startsWith('TN'));
    const m2_tl = qs.filter(q => q.level === 'M2' && !q.type.startsWith('TN'));
    const m3_tl = qs.filter(q => q.level === 'M3');

    const m1_tn_score = m1_tn.reduce((s, q) => s + q.score, 0);
    const m1_tl_score = m1_tl.reduce((s, q) => s + q.score, 0);
    const m2_tn_score = m2_tn.reduce((s, q) => s + q.score, 0);
    const m2_tl_score = m2_tl.reduce((s, q) => s + q.score, 0);
    const m3_tl_score = m3_tl.reduce((s, q) => s + q.score, 0);

    const total_count = qs.length;
    const total_score = m1_tn_score + m1_tl_score + m2_tn_score + m2_tl_score + m3_tl_score;

    m1_total_score += (m1_tn_score + m1_tl_score);
    m2_total_score += (m2_tn_score + m2_tl_score);
    m3_total_score += m3_tl_score;
    tn_total_score += (m1_tn_score + m2_tn_score);
    tl_total_score += (m1_tl_score + m2_tl_score + m3_tl_score);

    rows.push({
      topic,
      m1_tn_count: m1_tn.length,
      m1_tn_score: Math.round(m1_tn_score * 100) / 100,
      m1_tl_count: m1_tl.length,
      m1_tl_score: Math.round(m1_tl_score * 100) / 100,
      m2_tn_count: m2_tn.length,
      m2_tn_score: Math.round(m2_tn_score * 100) / 100,
      m2_tl_count: m2_tl.length,
      m2_tl_score: Math.round(m2_tl_score * 100) / 100,
      m3_tl_count: m3_tl.length,
      m3_tl_score: Math.round(m3_tl_score * 100) / 100,
      total_count,
      total_score: Math.round(total_score * 100) / 100,
    });
  });

  const totalScore = m1_total_score + m2_total_score + m3_total_score;
  const safeTotal = totalScore || 10;

  const summary: MatrixSummary = {
    m1_score: Math.round(m1_total_score * 10) / 10,
    m1_percent: Math.round((m1_total_score / safeTotal) * 100),
    m2_score: Math.round(m2_total_score * 10) / 10,
    m2_percent: Math.round((m2_total_score / safeTotal) * 100),
    m3_score: Math.round(m3_total_score * 10) / 10,
    m3_percent: Math.round((m3_total_score / safeTotal) * 100),
    tn_score: Math.round(tn_total_score * 10) / 10,
    tn_percent: Math.round((tn_total_score / safeTotal) * 100),
    tl_score: Math.round(tl_total_score * 10) / 10,
    tl_percent: Math.round((tl_total_score / safeTotal) * 100),
    total_score: Math.round(totalScore * 10) / 10,
  };

  return { rows, summary };
}

// Sinh hướng dẫn chấm tự động
export function generateGradingGuideFromQuestions(questions: Question[]): GradingGuide {
  const mcqAnswers: GradingGuide['mcqAnswers'] = [];
  const essayAnswers: GradingGuide['essayAnswers'] = [];

  questions.forEach((q) => {
    if (q.type.startsWith('TN')) {
      mcqAnswers.push({
        questionNumber: q.number,
        answer: q.correctAnswer || (q.options ? q.options[0]?.charAt(0) : 'Đúng'),
        score: `${q.score.toString().replace('.', ',')} điểm`,
      });
    } else {
      const steps = q.essaySteps && q.essaySteps.length > 0
        ? q.essaySteps.map(s => ({
            content: s.content,
            stepScore: `${s.score.toString().replace('.', ',')} điểm`,
          }))
        : [
            {
              content: q.gradingGuide || 'Thực hiện đúng yêu cầu bài toán/câu hỏi.',
              stepScore: `${q.score.toString().replace('.', ',')} điểm`,
            },
          ];

      essayAnswers.push({
        questionNumber: q.number,
        score: `${q.score.toString().replace('.', ',')} điểm`,
        steps,
        note: 'Học sinh giải cách khác đúng và lập luận chặt chẽ vẫn cho điểm tối đa.',
      });
    }
  });

  return {
    mcqAnswers,
    essayAnswers,
    generalNote: 'Giáo viên chấm điểm linh hoạt, tôn trọng sự sáng tạo và cách giải độc lập của học sinh tiểu học theo tinh thần Thông tư 27/2020/TT-BGDĐT.',
  };
}

function getDefaultRequirement(q: Question): string {
  if (q.level === 'M1') {
    return `Nhận biết được kiến thức cơ bản về ${q.topic.toLowerCase()}; thực hiện được các thao tác tư duy đơn giản.`;
  }
  if (q.level === 'M2') {
    return `Hiểu và giải thích được nội dung, tính chất; vận dụng trực tiếp kiến thức đã học vào tình huống quen thuộc.`;
  }
  return `Vận dụng kiến thức, kĩ năng đã học để giải quyết vấn đề mới, tình huống thực tiễn linh hoạt và sáng tạo.`;
}
