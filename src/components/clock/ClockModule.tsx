import React, { useState } from 'react';
import { ClockSubMode, ClockDifficultyLevel, ClockQuizQuestion, TeacherSettings } from '../../types';
import { AnalogClock } from './AnalogClock';
import { generateClockQuizQuestions, generateClockSetQuestions, formatClockTimeVietnamese } from '../../utils/clockData';
import { playSuccess, playTryAgain, playClick } from '../../utils/audio';
import { RoundSummaryModal } from '../common/RoundSummaryModal';
import {
  Compass,
  CheckSquare,
  Sliders,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Keyboard,
  ListFilter,
} from 'lucide-react';

interface ClockModuleProps {
  settings: TeacherSettings;
  onRecordHistory: (record: { subType: string; firstTryCorrect: number; total: number; hintsUsed: number }) => void;
}

export const ClockModule: React.FC<ClockModuleProps> = ({ settings, onRecordHistory }) => {
  const [subMode, setSubMode] = useState<ClockSubMode>('explore');

  // ================= EXPLORE MODE STATE =================
  const [exploreHours, setExploreHours] = useState<number>(8);
  const [exploreMinutes, setExploreMinutes] = useState<number>(30);

  // ================= QUIZ & SET MODES STATE =================
  const [quizQuestions, setQuizQuestions] = useState<ClockQuizQuestion[]>(() =>
    generateClockQuizQuestions(settings.clockLevel)
  );
  const [setQuestions, setSetQuestions] = useState<ClockQuizQuestion[]>(() =>
    generateClockSetQuestions(settings.clockLevel)
  );
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // Clock state during "Đặt giờ" mode (starts at random 12:00 or distant time)
  const [userHours, setUserHours] = useState<number>(12);
  const [userMinutes, setUserMinutes] = useState<number>(0);

  // Quiz answer mode: multiple choice vs manual input boxes
  const [quizInputMethod, setQuizInputMethod] = useState<'multiple_choice' | 'manual_input'>('multiple_choice');
  const [manualHourInput, setManualHourInput] = useState<string>('');
  const [manualMinuteInput, setManualMinuteInput] = useState<string>('');

  // Selected option in Quiz mode
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | null;
    message: string;
  }>({ type: null, message: '' });

  const [showHint, setShowHint] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  const activeQuestions = subMode === 'quiz' ? quizQuestions : setQuestions;
  const currentQuestion = activeQuestions[currentIdx];

  const handleStartRound = (mode: ClockSubMode) => {
    setSubMode(mode);
    setCurrentIdx(0);
    setFirstTryCorrectCount(0);
    setHintsUsedCount(0);
    setAttemptCount(0);
    setShowHint(false);
    setFeedback({ type: null, message: '' });
    setSelectedOption(null);
    setManualHourInput('');
    setManualMinuteInput('');
    setUserHours(12);
    setUserMinutes(0);

    if (mode === 'quiz') {
      const q = generateClockQuizQuestions(settings.clockLevel);
      setQuizQuestions(q);
    } else if (mode === 'set_time') {
      const s = generateClockSetQuestions(settings.clockLevel);
      setSetQuestions(s);
    }
  };

  const loadQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setSelectedOption(null);
    setManualHourInput('');
    setManualMinuteInput('');
    setUserHours(12);
    setUserMinutes(0);
    setFeedback({ type: null, message: '' });
    setShowHint(false);
    setAttemptCount(0);
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    setAttemptCount((prev) => prev + 1);

    let isCorrect = false;

    if (subMode === 'quiz') {
      if (quizInputMethod === 'manual_input') {
        const parsedH = parseInt(manualHourInput, 10);
        const parsedM = parseInt(manualMinuteInput === '' ? '0' : manualMinuteInput, 10);

        if (isNaN(parsedH) || parsedH < 1 || parsedH > 12) {
          setFeedback({
            type: 'incorrect',
            message: 'Em hãy nhập số giờ từ 1 đến 12 vào ô nhé!',
          });
          playTryAgain();
          return;
        }

        if (isNaN(parsedM) || parsedM < 0 || parsedM > 59) {
          setFeedback({
            type: 'incorrect',
            message: 'Em hãy nhập số phút từ 0 đến 59 vào ô nhé!',
          });
          playTryAgain();
          return;
        }

        if (
          parsedH === currentQuestion.targetHours &&
          parsedM === currentQuestion.targetMinutes
        ) {
          isCorrect = true;
        }
      } else {
        if (!selectedOption) {
          setFeedback({
            type: 'incorrect',
            message: 'Em hãy chọn một trong ba đáp án nhé!',
          });
          playTryAgain();
          return;
        }
        const correctStr = formatClockTimeVietnamese(
          currentQuestion.targetHours,
          currentQuestion.targetMinutes
        );
        if (selectedOption === correctStr) {
          isCorrect = true;
        }
      }
    } else if (subMode === 'set_time') {
      if (
        userHours === currentQuestion.targetHours &&
        userMinutes === currentQuestion.targetMinutes
      ) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      playSuccess();
      setFeedback({
        type: 'correct',
        message: 'Chính xác! Em làm tốt lắm! 🎉',
      });
      if (attemptCount === 0) {
        setFirstTryCorrectCount((prev) => prev + 1);
      }
    } else {
      playTryAgain();
      if (subMode === 'quiz') {
        if (quizInputMethod === 'manual_input') {
          const parsedH = parseInt(manualHourInput, 10);
          const parsedM = parseInt(manualMinuteInput === '' ? '0' : manualMinuteInput, 10);
          setFeedback({
            type: 'incorrect',
            message: `Em vừa nhập là ${parsedH} giờ ${parsedM > 0 ? `${parsedM} phút` : 'đúng'}. Em nhìn lại kim giờ và kim phút trên đồng hồ nhé!`,
          });
        } else {
          setFeedback({
            type: 'incorrect',
            message: 'Chưa đúng rồi. Em quan sát lại kim giờ (xanh) và kim phút (đỏ) nhé!',
          });
        }
      } else {
        setFeedback({
          type: 'incorrect',
          message: `Đồng hồ em đang đặt là ${formatClockTimeVietnamese(
            userHours,
            userMinutes
          )}. Em hãy điều chỉnh lại cho đúng yêu cầu nhé!`,
        });
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < activeQuestions.length) {
      loadQuestion(currentIdx + 1);
    } else {
      onRecordHistory({
        subType: subMode === 'quiz' ? 'Đọc giờ trắc nghiệm' : 'Đặt giờ theo yêu cầu',
        firstTryCorrect: firstTryCorrectCount,
        total: activeQuestions.length,
        hintsUsed: hintsUsedCount,
      });
      setShowSummaryModal(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* Sub-mode selector tabs (Compact) */}
      <div className="flex items-center justify-center gap-1 p-1 bg-amber-100/80 rounded-2xl border border-amber-200 mb-2 shadow-2xs">
        <button
          onClick={() => {
            playClick();
            setSubMode('explore');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all active:scale-95 ${
            subMode === 'explore'
              ? 'bg-white text-amber-950 shadow-2xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <Compass size={15} />
          Khám phá
        </button>

        <button
          onClick={() => {
            playClick();
            handleStartRound('quiz');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all active:scale-95 ${
            subMode === 'quiz'
              ? 'bg-white text-amber-950 shadow-2xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <CheckSquare size={15} />
          Đọc giờ (5 câu)
        </button>

        <button
          onClick={() => {
            playClick();
            handleStartRound('set_time');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all active:scale-95 ${
            subMode === 'set_time'
              ? 'bg-white text-amber-950 shadow-2xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <Sliders size={15} />
          Đặt giờ (5 câu)
        </button>
      </div>

      {/* ======================================================== */}
      {/*                     A. KHÁM PHÁ (EXPLORE)                */}
      {/* ======================================================== */}
      {subMode === 'explore' && (
        <div className="w-full max-w-3xl flex flex-col items-center">
          <AnalogClock
            hours={exploreHours}
            minutes={exploreMinutes}
            onChangeTime={(h, m) => {
              setExploreHours(h);
              setExploreMinutes(m);
            }}
            level={settings.clockLevel}
            interactive={true}
            showDigitalDefault={settings.showDigitalClockDefault}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/*                     B. ĐỌC GIỜ (QUIZ)                    */}
      {/* ======================================================== */}
      {subMode === 'quiz' && currentQuestion && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          
          {/* Progress Header (Compact) */}
          <div className="w-full flex items-center justify-between bg-white border border-amber-200 rounded-2xl px-3 py-1.5 mb-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-xs rounded-lg">
                Câu {currentIdx + 1}/5
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-950">
                {currentQuestion.prompt}
              </span>
            </div>

            <button
              onClick={() => handleStartRound('quiz')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Làm lại
            </button>
          </div>

          {/* TWO-COLUMN SPLIT: CLOCK ON LEFT, ANSWERS ON RIGHT */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 bg-gradient-to-b from-amber-50/40 to-orange-50/30 p-3 sm:p-4 rounded-3xl border-2 border-amber-300 shadow-xs">
            
            {/* Clock Face (Compact, Non-interactive) */}
            <div className="shrink-0 flex flex-col items-center">
              <AnalogClock
                hours={currentQuestion.targetHours}
                minutes={currentQuestion.targetMinutes}
                onChangeTime={() => {}}
                level={settings.clockLevel}
                interactive={false}
                showDigitalDefault={false}
              />
            </div>

            {/* Answer Options & Inputs */}
            <div className="w-full max-w-md flex flex-col justify-center">
              
              {/* Answer Mode Switcher */}
              <div className="w-full flex items-center p-1 bg-white rounded-xl border border-amber-200 mb-2">
                <button
                  onClick={() => {
                    playClick();
                    setQuizInputMethod('multiple_choice');
                    setFeedback({ type: null, message: '' });
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                    quizInputMethod === 'multiple_choice'
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListFilter size={13} />
                  Chọn 3 đáp án
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setQuizInputMethod('manual_input');
                    setFeedback({ type: null, message: '' });
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                    quizInputMethod === 'manual_input'
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Keyboard size={13} />
                  Ô nhập giờ & phút
                </button>
              </div>

              {/* Option A: Multiple Choice */}
              {quizInputMethod === 'multiple_choice' && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        playClick();
                        setSelectedOption(opt);
                        setFeedback({ type: null, message: '' });
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base transition-all active:scale-98 flex items-center justify-between ${
                        selectedOption === opt
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs ring-2 ring-blue-300'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                            selectedOption === opt
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </span>
                      {selectedOption === opt && (
                        <CheckCircle2 size={18} className="text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Option B: Manual Input Boxes */}
              {quizInputMethod === 'manual_input' && (
                <div className="bg-white border border-amber-200 rounded-2xl p-3 shadow-2xs">
                  <span className="text-xs font-extrabold text-amber-950 block text-center mb-2">
                    Nhập giờ và phút em quan sát được:
                  </span>

                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-blue-800">Giờ:</span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={manualHourInput}
                        onChange={(e) => {
                          setManualHourInput(e.target.value);
                          setFeedback({ type: null, message: '' });
                        }}
                        className="w-14 h-10 text-center text-lg font-black text-blue-900 bg-blue-50 border-2 border-blue-300 focus:border-blue-600 rounded-xl outline-none font-mono"
                        placeholder="?"
                      />
                    </div>

                    <span className="text-xl font-black text-slate-300">:</span>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-rose-800">Phút:</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={manualMinuteInput}
                        onChange={(e) => {
                          setManualMinuteInput(e.target.value);
                          setFeedback({ type: null, message: '' });
                        }}
                        className="w-14 h-10 text-center text-lg font-black text-rose-900 bg-rose-50 border-2 border-rose-300 focus:border-rose-600 rounded-xl outline-none font-mono"
                        placeholder="00"
                      />
                    </div>

                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setManualMinuteInput('0');
                          setFeedback({ type: null, message: '' });
                        }}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
                          manualMinuteInput === '0' || manualMinuteInput === '00'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        :00
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setManualMinuteInput('30');
                          setFeedback({ type: null, message: '' });
                        }}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
                          manualMinuteInput === '30'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        :30
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Feedback & Actions (Compact bottom row) */}
          <div className="w-full mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex-1 min-w-[200px]">
              {feedback.message ? (
                <div
                  className={`p-2 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center gap-2 ${
                    feedback.type === 'correct'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  {feedback.type === 'correct' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              ) : (
                showHint && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                    <Lightbulb size={16} className="text-amber-600 shrink-0" />
                    <span>{currentQuestion.hint}</span>
                  </div>
                )
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {settings.allowHints && (
                <button
                  onClick={() => {
                    playClick();
                    if (!showHint) {
                      setShowHint(true);
                      setHintsUsedCount((prev) => prev + 1);
                    } else {
                      setShowHint(false);
                    }
                  }}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <Lightbulb size={14} className="text-amber-700" />
                  {showHint ? 'Ẩn gợi ý' : 'Gợi ý'}
                </button>
              )}

              {feedback.type === 'correct' ? (
                <button
                  onClick={() => {
                    playClick();
                    handleNextQuestion();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5 animate-bounce"
                >
                  {currentIdx + 1 < quizQuestions.length ? 'Câu tiếp theo' : 'Xem kết quả'}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleCheckAnswer}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-xs text-xs sm:text-sm transition-all active:scale-95"
                >
                  Kiểm tra
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/*                     C. ĐẶT GIỜ (SET TIME)                */}
      {/* ======================================================== */}
      {subMode === 'set_time' && currentQuestion && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          
          {/* Prompt banner (Compact) */}
          <div className="w-full flex items-center justify-between bg-amber-100/90 border border-amber-300 rounded-2xl px-3 py-1.5 mb-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-xs rounded-lg">
                Câu {currentIdx + 1}/5
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-950">
                {currentQuestion.prompt}
              </span>
            </div>

            <button
              onClick={() => handleStartRound('set_time')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Làm lại
            </button>
          </div>

          {/* Interactive Clock (Split into Clock + Inputs + Steppers) */}
          <AnalogClock
            hours={userHours}
            minutes={userMinutes}
            onChangeTime={(h, m) => {
              setUserHours(h);
              setUserMinutes(m);
              setFeedback({ type: null, message: '' });
            }}
            level={settings.clockLevel}
            interactive={true}
            showDigitalDefault={false}
          />

          {/* Feedback & Actions */}
          <div className="w-full mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex-1 min-w-[200px]">
              {feedback.message ? (
                <div
                  className={`p-2 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center gap-2 ${
                    feedback.type === 'correct'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  {feedback.type === 'correct' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              ) : (
                showHint && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                    <Lightbulb size={16} className="text-amber-600 shrink-0" />
                    <span>{currentQuestion.hint}</span>
                  </div>
                )
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {settings.allowHints && (
                <button
                  onClick={() => {
                    playClick();
                    if (!showHint) {
                      setShowHint(true);
                      setHintsUsedCount((prev) => prev + 1);
                    } else {
                      setShowHint(false);
                    }
                  }}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <Lightbulb size={14} className="text-amber-700" />
                  {showHint ? 'Ẩn gợi ý' : 'Gợi ý'}
                </button>
              )}

              {feedback.type === 'correct' ? (
                <button
                  onClick={() => {
                    playClick();
                    handleNextQuestion();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5 animate-bounce"
                >
                  {currentIdx + 1 < setQuestions.length ? 'Câu tiếp theo' : 'Xem kết quả'}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleCheckAnswer}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-xs text-xs sm:text-sm transition-all active:scale-95"
                >
                  Kiểm tra
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Summary completion modal */}
      <RoundSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onRestart={() => handleStartRound(subMode)}
        firstTryCorrectCount={firstTryCorrectCount}
        hintUsedCount={hintsUsedCount}
        totalQuestions={activeQuestions.length}
        moduleTitle={subMode === 'quiz' ? 'Đọc giờ Đồng hồ' : 'Đặt giờ Đồng hồ'}
      />
    </div>
  );
};
