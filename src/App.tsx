import React, { useState, useEffect } from 'react';
import { AppTab, TeacherSettings, PracticeHistoryRecord } from './types';
import { BalanceModule } from './components/balance/BalanceModule';
import { ClockModule } from './components/clock/ClockModule';
import { TeacherSettingsModal } from './components/common/TeacherSettingsModal';
import { AppGuideModal } from './components/common/AppGuideModal';
import { isSoundOn, setSoundOn, playClick } from './utils/audio';
import {
  Scale,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  BookOpen,
  Home,
  Sparkles,
  Trophy,
  ArrowRight,
  Smile,
  ShieldCheck,
} from 'lucide-react';

const DEFAULT_SETTINGS: TeacherSettings = {
  clockLevel: 2, // Standard Grade 2: Exact hours & half hours
  allowHints: true,
  showMassValuesOnBalance: true,
  showDigitalClockDefault: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Teacher settings loaded from localStorage
  const [settings, setSettings] = useState<TeacherSettings>(() => {
    try {
      const saved = localStorage.getItem('toan2_teacher_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Practice history loaded from localStorage
  const [historyRecords, setHistoryRecords] = useState<PracticeHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('toan2_practice_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    setSoundActive(isSoundOn());
  }, []);

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundOn(next);
    playClick();
  };

  const handleUpdateSettings = (newSettings: TeacherSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('toan2_teacher_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const handleRecordHistory = (rec: {
    subType: string;
    firstTryCorrect: number;
    total: number;
    hintsUsed: number;
  }) => {
    const newRecord: PracticeHistoryRecord = {
      id: `rec-${Date.now()}`,
      date: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      module: rec.subType.includes('Cân') ? 'balance' : 'clock',
      subType: rec.subType,
      firstTryCorrect: rec.firstTryCorrect,
      total: rec.total,
      hintsUsed: rec.hintsUsed,
    };

    setHistoryRecords((prev) => {
      const updated = [newRecord, ...prev.slice(0, 9)];
      try {
        localStorage.setItem('toan2_practice_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    try {
      localStorage.removeItem('toan2_practice_history');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col font-sans selection:bg-amber-200">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 px-2 sm:px-5 py-1.5 sm:py-2 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <button
            onClick={() => {
              playClick();
              setActiveTab('home');
            }}
            className="flex items-center gap-2 text-left group focus:outline-hidden"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 border border-amber-500/60 shadow-2xs flex items-center justify-center text-amber-950 group-hover:scale-105 transition-transform">
              <span className="text-base sm:text-lg font-black">📐</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-amber-950 tracking-tight flex items-center gap-1 font-display">
                Toán 2: Cân đĩa & Đồng hồ
              </h1>
              <p className="text-[10px] text-amber-800/80 font-bold hidden xs:block">
                Học liệu tương tác mô phỏng trực quan
              </p>
            </div>
          </button>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Home button (when inside a module) */}
            {activeTab !== 'home' && (
              <button
                onClick={() => {
                  playClick();
                  setActiveTab('home');
                }}
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95"
                title="Về trang chủ"
              >
                <Home size={15} />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-2xs active:scale-95 border ${
                soundActive
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
              }`}
              title={soundActive ? 'Đang bật âm thanh (Bấm để tắt)' : 'Đang tắt âm thanh (Bấm để bật)'}
            >
              {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Guide & Deploy instructions */}
            <button
              onClick={() => {
                playClick();
                setIsGuideModalOpen(true);
              }}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              title="Hướng dẫn & Xuất bản"
            >
              <BookOpen size={15} className="text-blue-600" />
              <span className="hidden md:inline">Hướng dẫn</span>
            </button>

            {/* Teacher Mode Button */}
            <button
              onClick={() => {
                playClick();
                setIsTeacherModalOpen(true);
              }}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              title="Chế độ giáo viên & phụ huynh"
            >
              <Settings size={15} />
              <span className="hidden sm:inline">Giáo viên</span>
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-3 flex flex-col justify-start">
        
        {/* ======================================================== */}
        {/*                         HOME SCREEN                      */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-8">
            
            {/* Friendly Greeting Card */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100/90 text-amber-900 border border-amber-300 rounded-full text-xs sm:text-sm font-extrabold mb-4 shadow-2xs">
                <Sparkles size={16} className="text-amber-600" />
                Toán học diệu kỳ – Học vui mỗi ngày
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-amber-950 font-display tracking-tight leading-tight">
                Cùng khám phá Toán học!
              </h2>

              <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium">
                Em hãy bấm chọn một phòng thực hành bên dưới để bắt đầu nhé:
              </p>
            </div>

            {/* TWO LARGE ACTION CARDS (Min 48x48px touch targets, big & inviting) */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              
              {/* Card 1: Thực hành Cân đĩa */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab('balance');
                }}
                className="group relative cursor-pointer bg-gradient-to-br from-amber-500/10 via-white to-amber-100/40 rounded-3xl p-6 sm:p-8 border-3 border-amber-300 hover:border-amber-500 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Scale size={42} strokeWidth={2.2} />
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full border border-amber-200">
                    Khối lượng (kg)
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-950 font-display">
                    Thực hành Cân đĩa
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                    Khám phá đòn cân thăng bằng, so sánh nặng – nhẹ, và dùng các quả cân 1 kg, 2 kg, 5 kg để tìm khối lượng đồ vật.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-200/60 flex items-center justify-between text-amber-900 font-extrabold text-base sm:text-lg group-hover:text-amber-600 transition-colors">
                  <span>Bắt đầu cân đĩa</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-200/80 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>

              {/* Card 2: Thực hành Đồng hồ */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab('clock');
                }}
                className="group relative cursor-pointer bg-gradient-to-br from-blue-500/10 via-white to-blue-100/40 rounded-3xl p-6 sm:p-8 border-3 border-blue-300 hover:border-blue-500 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                    <Clock size={42} strokeWidth={2.2} />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 font-black text-xs rounded-full border border-blue-200">
                    Thời gian
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-blue-950 font-display">
                    Thực hành Đồng hồ
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                    Tập xem giờ đúng và giờ rưỡi, phân biệt kim giờ và kim phút, tự tay quay kim đồng hồ thật vui và chính xác.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-200/60 flex items-center justify-between text-blue-900 font-extrabold text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                  <span>Bắt đầu xem đồng hồ</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-200/80 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>

            </div>

            {/* Device Practice History Card */}
            {historyRecords.length > 0 && (
              <div className="w-full max-w-4xl mt-10 bg-white border-2 border-amber-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    <span className="text-sm font-extrabold text-slate-900">
                      Kết quả luyện tập gần đây trên thiết bị:
                    </span>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-slate-400 hover:text-rose-600 font-bold transition-colors"
                  >
                    Xóa lịch sử
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {historyRecords.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {rec.subType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Lúc {rec.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 block">
                          Đúng {rec.firstTryCorrect}/{rec.total} câu
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400 italic text-right">
                  * Kết quả chỉ lưu trên thiết bị đang sử dụng
                </p>
              </div>
            )}

            {/* Quick Curriculum Highlight Footer Notice */}
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-amber-800/70">
              <ShieldCheck size={16} className="text-amber-600" />
              <span>Thiết kế bám sát chương trình GDPT môn Toán lớp 2 – An toàn & Hoàn toàn miễn phí</span>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/*                      BALANCE SCALE MODULE                */}
        {/* ======================================================== */}
        {activeTab === 'balance' && (
          <div className="w-full">
            <BalanceModule
              settings={settings}
              onRecordHistory={handleRecordHistory}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/*                          CLOCK MODULE                    */}
        {/* ======================================================== */}
        {activeTab === 'clock' && (
          <div className="w-full">
            <ClockModule
              settings={settings}
              onRecordHistory={handleRecordHistory}
            />
          </div>
        )}

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-auto border-t border-amber-200/60 bg-white/70 py-4 px-4 text-center text-xs text-slate-500 font-medium">
        <p>
          Phòng thực hành Toán 2 – Cân đĩa và Đồng hồ · Học liệu tương tác trực quan cho học sinh tiểu học
        </p>
      </footer>

      {/* ================= MODALS ================= */}
      <TeacherSettingsModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearHistory={handleClearHistory}
      />

      <AppGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
