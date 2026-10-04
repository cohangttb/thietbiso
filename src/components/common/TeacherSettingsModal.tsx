import React from 'react';
import { TeacherSettings, ClockDifficultyLevel } from '../../types';
import { Settings, X, BookOpen, Clock, Scale, Lightbulb, Trash2, Check } from 'lucide-react';
import { playClick } from '../../utils/audio';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeacherSettings;
  onUpdateSettings: (newSettings: TeacherSettings) => void;
  onClearHistory: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Bảng điều khiển Giáo viên & Phụ huynh
              </h3>
              <p className="text-xs text-slate-500">
                Tùy chỉnh nội dung học tập trực tiếp tại chỗ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-5 space-y-6">

          {/* Section 1: Clock difficulty level */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-extrabold text-amber-950 mb-2">
              <Clock size={18} className="text-amber-700" />
              Mức độ thực hành Đồng hồ:
            </label>
            <div className="space-y-2">
              {[
                {
                  level: 1 as ClockDifficultyLevel,
                  title: 'Mức 1: Giờ đúng',
                  desc: 'Kim phút chỉ số 12 (ví dụ: 1 giờ, 2 giờ, 8 giờ...)',
                },
                {
                  level: 2 as ClockDifficultyLevel,
                  title: 'Mức 2: Giờ đúng và giờ rưỡi (Chuẩn Toán 2)',
                  desc: 'Kim phút chỉ số 12 và số 6 (ví dụ: 3 giờ 30 phút, 8 giờ rưỡi...)',
                },
                {
                  level: 3 as ClockDifficultyLevel,
                  title: 'Mức 3: Mở rộng các mốc 5 phút',
                  desc: 'Dành cho học sinh khá giỏi hoặc mở rộng theo nhóm 5 phút',
                },
              ].map((opt) => (
                <div
                  key={opt.level}
                  onClick={() => {
                    playClick();
                    onUpdateSettings({ ...settings, clockLevel: opt.level });
                  }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    settings.clockLevel === opt.level
                      ? 'border-amber-500 bg-white shadow-xs'
                      : 'border-transparent bg-white/60 hover:bg-white'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      settings.clockLevel === opt.level
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {settings.clockLevel === opt.level && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      {opt.title}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Scale & general toggles */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-sm font-extrabold text-slate-900 block mb-1">
              Tùy chọn hiển thị & trợ giúp:
            </span>

            {/* Hint toggle */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Bật nút gợi ý cho học sinh</span>
                  <span className="text-xs text-slate-500">Giúp học sinh tư duy khi gặp câu khó</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowHints}
                onChange={(e) => {
                  playClick();
                  onUpdateSettings({ ...settings, allowHints: e.target.checked });
                }}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {/* Mass toggle */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-blue-600" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Hiện số kg trên đĩa cân</span>
                  <span className="text-xs text-slate-500">Hỗ trợ học sinh kiểm tra tổng khối lượng</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showMassValuesOnBalance}
                onChange={(e) => {
                  playClick();
                  onUpdateSettings({ ...settings, showMassValuesOnBalance: e.target.checked });
                }}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Curriculum guidelines notes */}
          <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm mb-2">
              <BookOpen size={18} className="text-blue-700" />
              Ghi chú Sư phạm (Toán 2 - CTGDPT 2018)
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Ki-lô-gam (kg):</strong> Học sinh nhận biết đơn vị đo khối lượng, thực hành ước lượng và sử dụng cân đĩa với các quả cân 1 kg, 2 kg, 5 kg.
              </li>
              <li>
                <strong>Cân đĩa:</strong> Đòn cân thăng bằng khi khối lượng hai bên bằng nhau; đĩa hạ xuống biểu thị bên nặng hơn, đĩa nâng lên biểu thị bên nhẹ hơn.
              </li>
              <li>
                <strong>Đồng hồ:</strong> Học sinh lớp 2 trọng tâm xem giờ đúng (kim phút chỉ số 12) và giờ rưỡi (kim phút chỉ số 6, kim giờ ở giữa hai số).
              </li>
            </ul>
          </div>

          {/* Section 4: Clear device history */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Em/Thầy cô có chắc muốn xóa lịch sử làm bài trên thiết bị này không?')) {
                  playClick();
                  onClearHistory();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={14} />
              Xóa lịch sử thực hành trên máy
            </button>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-xs text-sm transition-all active:scale-95"
            >
              Lưu & Đóng
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
