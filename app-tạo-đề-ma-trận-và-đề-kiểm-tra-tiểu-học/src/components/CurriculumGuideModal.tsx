import React from 'react';
import { X, BookCheck, ShieldCheck, Scale, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-bold text-base md:text-lg">
                Cẩm Nang Quy Chuẩn Ra Đề Kiểm Tra Tiểu Học (GDPT 2018)
              </h3>
              <p className="text-xs text-indigo-200">
                Căn cứ Thông tư 27/2020/TT-BGDĐT và Quy định đánh giá định kì cấp Tiểu học
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* Mục 1: Cấu trúc đề kiểm tra */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2 text-base">
              <Scale className="w-5 h-5 text-indigo-600" />
              1. Cấu trúc và thứ tự câu hỏi
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm">
              <li><b>Thứ tự câu:</b> Đánh số liên tục từ Câu 1 đến câu cuối cùng của đề.</li>
              <li><b className="text-rose-600 uppercase">Tuyệt đối không ghi phần Trắc nghiệm, Tự luận</b> trong đề kiểm tra của học sinh.</li>
              <li><b>Trật tự sắp xếp:</b> Sắp xếp từ Trắc nghiệm đến Tự luận.
                <div className="ml-4 mt-1 space-y-0.5 text-xs text-slate-600">
                  • <i>Trắc nghiệm:</i> Mức 1 xếp trước, Mức 2 xếp sau (Nhiều lựa chọn → Đúng sai → Nối cột → Điền khuyết).<br />
                  • <i>Tự luận:</i> Lần lượt từ Mức 1 (Biết) → Mức 2 (Hiểu) → Mức 3 (Vận dụng) theo tư duy từ dễ đến khó.
                </div>
              </li>
              <li><b>Không ghép câu</b> thuộc 2 chủ đề/bài học/mạch kiến thức với nhau.</li>
              <li><b className="text-rose-700 font-bold">KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG</b> (Mức 3 hoàn toàn là tự luận).</li>
            </ul>
          </div>

          {/* Mục 2: Cách trình bày */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2 text-base">
              <FileText className="w-5 h-5 text-indigo-600" />
              2. Quy cách trình bày văn bản đề thi
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm">
              <li><b>Quy cách câu:</b> Câu số (<i>chữ đậm</i>), điểm (<i>chữ nghiêng và không đậm</i>) liền câu số, câu hỏi (<i>chữ không đậm</i>):<br />
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 ml-4 inline-block text-xs mt-1">
                  <b>Câu 1</b><i>(0,5 điểm)</i>: Câu hỏi bắt đầu từ đây...
                </span>
              </li>
              <li><b>Căn lề:</b> Câu số và các ý (a, b, …) bằng lề, không lùi tab.</li>
              <li><b>Phương án:</b> Các phương án (A, B, C, D) lùi vào 1 tab (~1cm).</li>
              <li><b>Số phương án trắc nghiệm:</b>
                <span className="ml-1 font-semibold text-indigo-800">Lớp 1, 2, 3: gồm 3 phương án (A, B, C)</span>; 
                <span className="ml-1 font-semibold text-indigo-800">Lớp 4, 5: gồm 4 phương án (A, B, C, D)</span>.
              </li>
              <li><b>Điểm trắc nghiệm:</b> Nhiều lựa chọn: 0,5đ/câu; Đúng sai, nối cột, điền khuyết: 0,25đ/ý.</li>
              <li><b>Điểm tự luận:</b> Mức 1: 0,5đ; Mức 2: 1,0đ; Mức 3: 1,0 – 2,0đ.</li>
              <li><b>Bản đặc tả:</b> Một chủ đề/bài có nhiều câu hỏi thì mỗi câu hỏi là một dòng đặc tả riêng.</li>
            </ul>
          </div>

          {/* Mục 3: Môn Tin học */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2 text-base">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              3. Định mức Môn Tin học
            </h4>
            <div className="text-xs md:text-sm space-y-1.5">
              <div>• <b>Lớp 3:</b> Lí thuyết 7 điểm – Thực hành 3 điểm (Trắc nghiệm 6 - Tự luận 4; CKI: TL 4; CN: TL 2, TH 1).</div>
              <div>• <b>Lớp 4:</b> Lí thuyết 6 điểm – Thực hành 4 điểm (Trắc nghiệm 6 - Tự luận 4 gồm TL 2, TH 2).</div>
              <div>• <b>Lớp 5:</b> Lí thuyết 5 điểm – Thực hành 5 điểm (Trắc nghiệm 5 - Tự luận 5; CKI: TL 3, TH 2; CN: TL 2, TH 3).</div>
              <div>• Không tạo câu trắc nghiệm ở mức vận dụng.</div>
            </div>
          </div>

          {/* Mục 4: Môn Toán & Môn Tiếng Việt */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2 text-base">
              <BookCheck className="w-5 h-5 text-indigo-600" />
              4. Môn Toán và Tiếng Việt
            </h4>
            <div className="text-xs md:text-sm space-y-2">
              <div>
                <b>Môn Toán:</b> Tỉ lệ Mức 1 - 2 - 3 là 50% - 30% - 20%. Trắc nghiệm = 60%; Tự luận = 40%. Tổng 10 câu. Vẽ hình trên lưới ô vuông (Lớp 1-5).
              </div>
              <div>
                <b>Môn Tiếng Việt:</b> Độ dài văn bản đọc ngoài SGK chuẩn:
                <ul className="list-disc list-inside ml-2 mt-1 text-xs text-slate-600 space-y-0.5">
                  <li>Lớp 1: truyện/miêu tả 90-130 chữ, thơ 50-70 chữ (Đọc hiểu 4đ: 6 TN = 3đ, 1 TL = 1đ).</li>
                  <li>Lớp 2: truyện 180-200 chữ, miêu tả 150-180 chữ, thơ 70-90 chữ (Đọc hiểu 6đ gồm 9 câu).</li>
                  <li>Lớp 3: truyện 200-250 chữ, miêu tả 180-200 chữ, thơ 80-100 chữ (Đọc hiểu 6đ gồm 9 câu).</li>
                  <li>Lớp 4: truyện 280-330 chữ, miêu tả 200-250 chữ (Đọc hiểu 7đ gồm 11 câu).</li>
                  <li>Lớp 5: truyện 300-350 chữ, miêu tả 200-250 chữ (Đọc hiểu 7đ gồm 11 câu).</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm rounded-lg cursor-pointer"
          >
            Đã nắm rõ quy chuẩn
          </button>
        </div>

      </div>
    </div>
  );
};
