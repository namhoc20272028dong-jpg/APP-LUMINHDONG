import { ExamPaper } from '../types/exam';

export function exportExamToWord(exam: ExamPaper, options: { includeAnswers?: boolean } = {}) {
  const { includeAnswers = false } = options;

  // Xây dựng nội dung HTML có gắn thẻ XML của MS Word
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${exam.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 56.7pt 56.7pt 56.7pt 70.85pt; /* Top 2cm, Bottom 2cm, Right 2cm, Left 2.5cm */
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #000;
    }
    h1, h2, h3, h4 {
      font-family: 'Times New Roman', serif;
      text-align: center;
      margin: 4pt 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12pt;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      font-size: 12pt;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
    }
    .data-table th, .data-table td {
      border: 1pt solid #000;
      padding: 5pt 6pt;
      font-size: 11.5pt;
      text-align: center;
    }
    .data-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .question-block {
      margin-bottom: 9pt;
      text-align: justify;
    }
    .question-options {
      margin-left: 28pt; /* lùi vào 1 tab (1cm) */
      margin-top: 3pt;
      margin-bottom: 3pt;
    }
    .option-item {
      display: inline-block;
      width: 45%;
      margin-bottom: 2pt;
    }
    .page-break {
      page-break-before: always;
      mso-break-type: page-break;
    }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .passage-box {
      border: 1pt solid #999;
      padding: 8pt 12pt;
      margin: 8pt 0 12pt 0;
      background-color: #fafafa;
    }
    .score-box {
      border: 1pt solid #000;
      margin: 8pt 0 12pt 0;
      width: 100%;
      border-collapse: collapse;
    }
    .score-box td {
      border: 1pt solid #000;
      padding: 6pt;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="Section1">

  <!-- ==================== PHẦN 1: ĐỀ KIỂM TRA ==================== -->
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <b>${exam.departmentName?.toUpperCase() || 'PHÒNG GD&ĐT'}</b><br>
        <b>${exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</b>
      </td>
      <td style="width: 55%; text-align: center;">
        <b>${exam.title?.toUpperCase()}</b><br>
        <b>NĂM HỌC: ${exam.schoolYear}</b><br>
        <i>Môn: ${getSubjectDisplayName(exam.subject)} - Lớp ${exam.grade}</i><br>
        <i>Thời gian làm bài: ${exam.durationMinutes} phút (không kể thời gian giao đề)</i>
      </td>
    </tr>
  </table>

  <p style="margin: 4pt 0;">
    Họ và tên học sinh: ............................................................................ Lớp: ................
  </p>

  <table class="score-box">
    <tr>
      <td style="width: 40%; font-weight: bold; background-color: #f8f8f8;">Điểm bài kiểm tra</td>
      <td style="width: 60%; font-weight: bold; background-color: #f8f8f8;">Lời nhận xét của giáo viên</td>
    </tr>
    <tr>
      <td style="height: 55pt; vertical-align: top; text-align: left;">
        <i>Bằng số:</i> ....................<br>
        <i>Bằng chữ:</i> ....................
      </td>
      <td style="height: 55pt; vertical-align: top; text-align: left;">
        ....................................................................................................<br>
        ....................................................................................................
      </td>
    </tr>
  </table>

  <!-- NẾU CÓ BÀI ĐỌC TIẾNG VIỆT -->
  ${exam.readingPassage ? `
    <div class="passage-box">
      <h3 style="text-align: center; margin-bottom: 4pt;">${exam.readingPassage.title}</h3>
      <p style="text-align: justify; white-space: pre-line; margin-bottom: 4pt;">${exam.readingPassage.content}</p>
      ${exam.readingPassage.author ? `<p style="text-align: right; font-style: italic; margin-top: 2pt;">(${exam.readingPassage.author})</p>` : ''}
    </div>
    <p><b>Dựa vào nội dung bài đọc trên, em hãy hoàn thành các câu hỏi dưới đây:</b></p>
  ` : ''}

  <!-- DANH SÁCH CÂU HỎI (TUYỆT ĐỐI KHÔNG GHI PHẦN TRẮC NGHIỆM / TỰ LUẬN) -->
  ${exam.questions.map((q) => {
    return `
      <div class="question-block">
        <p style="margin: 0;">
          <span class="bold">Câu ${q.number}</span><span class="italic">(${q.scoreText})</span>: ${q.questionText}
        </p>

        ${q.subItems && q.subItems.length > 0 ? `
          <div style="margin-left: 0; margin-top: 3pt;">
            ${q.subItems.map(si => `
              <div style="margin-bottom: 2pt;">
                ${si.label} ${si.text} ....................
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${q.matchingPairs && q.matchingPairs.length > 0 ? `
          <table style="width: 80%; margin: 4pt 0; border: none;">
            ${q.matchingPairs.map(mp => `
              <tr>
                <td style="border: none; padding: 2pt 8pt; width: 50%;">${mp.left}</td>
                <td style="border: none; padding: 2pt 8pt; width: 50%;">${mp.right}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}

        ${q.blanks && q.blanks.length > 0 ? `
          <div style="margin-top: 3pt;">
            ${q.blanks.map(b => `
              <div style="margin-bottom: 2pt;">
                ${b.prefixText} ................................ ${b.suffixText}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${q.options && q.options.length > 0 ? `
          <div class="question-options">
            ${q.options.map(opt => `
              <div class="option-item">${opt}</div>
            `).join('')}
          </div>
        ` : ''}

        ${includeAnswers && q.correctAnswer ? `
          <p style="color: #0b57d0; font-size: 11pt; margin-left: 14pt; margin-top: 2pt;">
            <i>[Đáp án: ${q.correctAnswer}]</i>
          </p>
        ` : ''}
      </div>
    `;
  }).join('')}

  ${exam.writingSection ? `
    <div style="margin-top: 14pt; border-top: 1pt dashed #999; padding-top: 8pt;">
      <p class="bold">II. KIỂM TRA VIẾT:</p>
      ${exam.writingSection.dictationTitle ? `
        <p><b>1. Nghe - viết (${exam.writingSection.dictationScore || 4} điểm):</b></p>
        <p>Bài viết: <i>${exam.writingSection.dictationTitle}</i></p>
      ` : ''}
      ${exam.writingSection.compositionPrompt ? `
        <p><b>2. Tập làm văn (${exam.writingSection.compositionScore || 6} điểm):</b></p>
        <p><b>Đề bài:</b> ${exam.writingSection.compositionPrompt}</p>
      ` : ''}
    </div>
  ` : ''}

  <!-- ==================== PHẦN 2: MA TRẬN ĐỀ KIỂM TRA ==================== -->
  <div class="page-break"></div>
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <b>${exam.departmentName?.toUpperCase() || 'PHÒNG GD&ĐT'}</b><br>
        <b>${exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</b>
      </td>
      <td style="width: 55%; text-align: center;">
        <b>MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</b><br>
        <b>Môn: ${getSubjectDisplayName(exam.subject)} - Lớp ${exam.grade}</b><br>
        <i>Theo Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT)</i>
      </td>
    </tr>
  </table>

  <table class="data-table">
    <thead>
      <tr>
        <th rowspan="2" style="width: 5%;">STT</th>
        <th rowspan="2" style="width: 28%;">Mạch kiến thức / Kĩ năng</th>
        <th colspan="2">Mức 1 (Biết)</th>
        <th colspan="2">Mức 2 (Hiểu)</th>
        <th colspan="1">Mức 3 (Vận dụng)</th>
        <th colspan="2">Tổng cộng</th>
      </tr>
      <tr>
        <th style="width: 9%;">T.Nghiệm</th>
        <th style="width: 9%;">Tự luận</th>
        <th style="width: 9%;">T.Nghiệm</th>
        <th style="width: 9%;">Tự luận</th>
        <th style="width: 9%;">Tự luận</th>
        <th style="width: 11%;">Số câu</th>
        <th style="width: 11%;">Số điểm</th>
      </tr>
    </thead>
    <tbody>
      ${exam.matrix.rows.map((row, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td class="text-left">${row.topic}</td>
          <td>${row.m1_tn_count > 0 ? `${row.m1_tn_count} câu (${row.m1_tn_score}đ)` : '-'}</td>
          <td>${row.m1_tl_count > 0 ? `${row.m1_tl_count} câu (${row.m1_tl_score}đ)` : '-'}</td>
          <td>${row.m2_tn_count > 0 ? `${row.m2_tn_count} câu (${row.m2_tn_score}đ)` : '-'}</td>
          <td>${row.m2_tl_count > 0 ? `${row.m2_tl_count} câu (${row.m2_tl_score}đ)` : '-'}</td>
          <td>${row.m3_tl_count > 0 ? `${row.m3_tl_count} câu (${row.m3_tl_score}đ)` : '-'}</td>
          <td class="bold">${row.total_count}</td>
          <td class="bold">${row.total_score}</td>
        </tr>
      `).join('')}
      <tr style="background-color: #f2f2f2; font-weight: bold;">
        <td colspan="2">Tổng cộng</td>
        <td>${exam.questions.filter(q => q.level === 'M1' && q.type.startsWith('TN')).length} câu</td>
        <td>${exam.questions.filter(q => q.level === 'M1' && !q.type.startsWith('TN')).length} câu</td>
        <td>${exam.questions.filter(q => q.level === 'M2' && q.type.startsWith('TN')).length} câu</td>
        <td>${exam.questions.filter(q => q.level === 'M2' && !q.type.startsWith('TN')).length} câu</td>
        <td>${exam.questions.filter(q => q.level === 'M3').length} câu</td>
        <td>${exam.questions.length} câu</td>
        <td>${exam.matrix.summary.total_score} điểm</td>
      </tr>
      <tr style="background-color: #fff; font-weight: bold;">
        <td colspan="2">Tỉ lệ điểm theo Mức độ</td>
        <td colspan="2">Mức 1: ${exam.matrix.summary.m1_score}đ (${exam.matrix.summary.m1_percent}%)</td>
        <td colspan="2">Mức 2: ${exam.matrix.summary.m2_score}đ (${exam.matrix.summary.m2_percent}%)</td>
        <td>Mức 3: ${exam.matrix.summary.m3_score}đ (${exam.matrix.summary.m3_percent}%)</td>
        <td colspan="2">100%</td>
      </tr>
      <tr style="background-color: #f9f9f9; font-weight: bold;">
        <td colspan="2">Tỉ lệ Trắc nghiệm - Tự luận</td>
        <td colspan="3">Trắc nghiệm: ${exam.matrix.summary.tn_score}đ (${exam.matrix.summary.tn_percent}%)</td>
        <td colspan="4">Tự luận: ${exam.matrix.summary.tl_score}đ (${exam.matrix.summary.tl_percent}%)</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== PHẦN 3: BẢN ĐẶC TẢ MA TRẬN ==================== -->
  <div class="page-break"></div>
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <b>${exam.departmentName?.toUpperCase() || 'PHÒNG GD&ĐT'}</b><br>
        <b>${exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</b>
      </td>
      <td style="width: 55%; text-align: center;">
        <b>BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</b><br>
        <b>Môn: ${getSubjectDisplayName(exam.subject)} - Lớp ${exam.grade}</b>
      </td>
    </tr>
  </table>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 20%;">Chủ đề / Mạch kiến thức</th>
        <th style="width: 10%;">Mức độ</th>
        <th style="width: 35%;">Yêu cầu cần đạt</th>
        <th style="width: 18%;">Hình thức câu hỏi</th>
        <th style="width: 12%;">Câu số (Điểm)</th>
      </tr>
    </thead>
    <tbody>
      ${exam.specifications.map((spec) => `
        <tr>
          <td>${spec.order}</td>
          <td class="text-left bold">${spec.topic}</td>
          <td>${spec.level}</td>
          <td class="text-left">${spec.requirement}</td>
          <td>${spec.questionType}</td>
          <td class="bold">Câu ${spec.questionNumber} (${spec.score}đ)</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- ==================== PHẦN 4: HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM ==================== -->
  <div class="page-break"></div>
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <b>${exam.departmentName?.toUpperCase() || 'PHÒNG GD&ĐT'}</b><br>
        <b>${exam.schoolName?.toUpperCase() || 'TRƯỜNG TIỂU HỌC'}</b>
      </td>
      <td style="width: 55%; text-align: center;">
        <b>HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM ĐỀ KIỂM TRA</b><br>
        <b>Môn: ${getSubjectDisplayName(exam.subject)} - Lớp ${exam.grade}</b>
      </td>
    </tr>
  </table>

  <h3 style="text-align: left; margin-top: 10pt;">A. ĐÁP ÁN TRẮC NGHIỆM</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Câu số</th>
        ${exam.gradingGuide.mcqAnswers.map(ans => `<th>Câu ${ans.questionNumber}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="bold">Đáp án đúng</td>
        ${exam.gradingGuide.mcqAnswers.map(ans => `<td class="bold">${ans.answer}</td>`).join('')}
      </tr>
      <tr>
        <td class="bold">Điểm số</td>
        ${exam.gradingGuide.mcqAnswers.map(ans => `<td>${ans.score}</td>`).join('')}
      </tr>
    </tbody>
  </table>

  <h3 style="text-align: left; margin-top: 14pt;">B. HƯỚNG DẪN CHẤM TỰ LUẬN VÀ BIỂU ĐIỂM CHI TIẾT</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 12%;">Câu số</th>
        <th style="width: 70%;">Nội dung đáp án / Các bước giải</th>
        <th style="width: 18%;">Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${exam.gradingGuide.essayAnswers.map(ans => `
        <tr>
          <td class="bold" style="vertical-align: top;">Câu ${ans.questionNumber}<br><i>(${ans.score})</i></td>
          <td class="text-left">
            ${ans.steps.map(step => `
              <div style="margin-bottom: 3pt;">
                • ${step.content} <i>(${step.stepScore})</i>
              </div>
            `).join('')}
            ${ans.note ? `<div style="margin-top: 4pt; font-style: italic; color: #555;">Ghi chú: ${ans.note}</div>` : ''}
          </td>
          <td class="bold" style="vertical-align: top;">${ans.score}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${exam.gradingGuide.generalNote ? `
    <p style="margin-top: 12pt; font-style: italic;">
      <b>Lưu ý chung:</b> ${exam.gradingGuide.generalNote}
    </p>
  ` : ''}

</div>
</body>
</html>
`;

  // Tạo blob và trigger download file Word .doc
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileNameSafe = `${exam.subject}_Lop${exam.grade}_${exam.semester}_DeKiemTra_GDPT2018.doc`.replace(/\s+/g, '_');
  a.download = fileNameSafe;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getSubjectDisplayName(s: string): string {
  switch (s) {
    case 'TOAN': return 'Toán';
    case 'TIENG_VIET': return 'Tiếng Việt';
    case 'TIN_HOC': return 'Tin học';
    case 'KHOA_HOC': return 'Khoa học';
    case 'LICH_SU_DIA_LY': return 'Lịch sử và Địa lí';
    case 'CONG_NGHE': return 'Công nghệ';
    default: return s;
  }
}
