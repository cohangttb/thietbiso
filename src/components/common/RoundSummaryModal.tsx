import React from 'react';
import { Trophy, RotateCcw, CheckCircle2, HelpCircle, Star, Sparkles } from 'lucide-react';
import { playClick } from '../../utils/audio';

interface RoundSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  firstTryCorrectCount: number;
  hintUsedCount: number;
  totalQuestions: number;
  moduleTitle: string;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  firstTryCorrectCount,
  hintUsedCount,
  totalQuestions,
  moduleTitle,
}) => {
  if (!isOpen) return null;

  // Encouraging feedback tailored to Grade 2
  let title = 'Chúc mừng em!';
  let message = 'Em đã hoàn thành xuất sắc bài thực hành!';
  let starCount = 3;

  if (firstTryCorrectCount === 5) {
    title = 'Tuyệt đỉnh thông thái! 🌟';
    message = 'Em trả lời đúng tất cả các câu ngay lần đầu tiên. Em giỏi lắm!';
    starCount = 3;
  } else if (firstTryCorrectCount >= 3) {
    title = 'Làm tốt lắm em ơi! 👏';
    message = 'Em đã rất cố gắng và nắm vững bài học!';
    starCount = 2;
  } else {
    title = 'Cố gắng lên nhé! 💪';
    message = 'Mỗi lần luyện tập là một lần em tiến bộ hơn. Hãy thử lại một lượt nữa nào!';
    starCount = 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center transform transition-all scale-100">
        
        {/* Animated celebration stars */}
        <div className="flex justify-center gap-2 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-2xl ${
                i < starCount
                  ? 'bg-amber-100 text-amber-500 scale-110'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Star size={32} fill={i < starCount ? '#F59E0B' : 'none'} />
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-extrabold text-amber-950 font-display">
          {title}
        </h3>
        
        <p className="mt-2 text-sm text-slate-600 font-medium">
          {message}
        </p>

        {/* Stats card */}
        <div className="mt-5 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Đúng ngay lần đầu:
            </span>
            <span className="font-extrabold text-emerald-700 text-base">
              {firstTryCorrectCount} / {totalQuestions} câu
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-bold text-slate-700">
              <HelpCircle size={18} className="text-amber-600" />
              Số câu đã xem gợi ý:
            </span>
            <span className="font-extrabold text-amber-700 text-base">
              {hintUsedCount} câu
            </span>
          </div>
        </div>

        {/* Storage notice as required by prompt */}
        <p className="mt-3 text-xs text-slate-400 italic">
          * Kết quả này chỉ được lưu trên thiết bị của em, chưa gửi về cho thầy cô giáo.
        </p>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              playClick();
              onRestart();
            }}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            <RotateCcw size={18} />
            Luyện tập lượt mới
          </button>
          
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 text-sm"
          >
            Xem lại bài vừa làm
          </button>
        </div>

      </div>
    </div>
  );
};
