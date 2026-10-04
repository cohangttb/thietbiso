import React, { useState } from 'react';
import { ScaleItem, BalanceSubMode, BalanceChallenge, TeacherSettings } from '../../types';
import { BalanceScale } from './BalanceScale';
import { STANDARD_WEIGHTS, AVAILABLE_OBJECTS, createScaleItem, generateBalanceRound } from '../../utils/balanceData';
import { renderItemIcon } from './ItemIcons';
import { playSuccess, playTryAgain, playPop, playClick } from '../../utils/audio';
import { RoundSummaryModal } from '../common/RoundSummaryModal';
import {
  Compass,
  Award,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Hand,
} from 'lucide-react';

interface BalanceModuleProps {
  settings: TeacherSettings;
  onRecordHistory: (record: { subType: string; firstTryCorrect: number; total: number; hintsUsed: number }) => void;
}

export const BalanceModule: React.FC<BalanceModuleProps> = ({ settings, onRecordHistory }) => {
  const [subMode, setSubMode] = useState<BalanceSubMode>('explore');
  
  // ================= EXPLORE MODE STATE =================
  const [exploreLeftItems, setExploreLeftItems] = useState<ScaleItem[]>([
    createScaleItem({ name: 'Quả dưa hấu', weight: 4, icon: 'watermelon', color: '#15803D' }),
  ]);
  const [exploreRightItems, setExploreRightItems] = useState<ScaleItem[]>([
    createScaleItem({ name: 'Quả cân 2 kg', weight: 2, icon: 'weight', color: '#CA8A04' }),
    createScaleItem({ name: 'Quả cân 2 kg', weight: 2, icon: 'weight', color: '#CA8A04' }),
  ]);
  const [selectedItemToPlace, setSelectedItemToPlace] = useState<ScaleItem | null>(null);
  const [showMassExplore, setShowMassExplore] = useState<boolean>(settings.showMassValuesOnBalance);

  // ================= CHALLENGE MODE STATE =================
  const [challenges, setChallenges] = useState<BalanceChallenge[]>(() => generateBalanceRound());
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [activeLeftItems, setActiveLeftItems] = useState<ScaleItem[]>(challenges[0]?.initialLeftItems || []);
  const [activeRightItems, setActiveRightItems] = useState<ScaleItem[]>(challenges[0]?.initialRightItems || []);
  const [selectedCompareAnswer, setSelectedCompareAnswer] = useState<'left' | 'right' | 'equal' | null>(null);
  const [mysteryAnswerInput, setMysteryAnswerInput] = useState<string>('');

  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | null;
    message: string;
  }>({ type: null, message: '' });

  const [showHint, setShowHint] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  const currentChallenge = challenges[currentIdx];

  const loadChallenge = (idx: number, challengeList: BalanceChallenge[]) => {
    const c = challengeList[idx];
    if (c) {
      setCurrentIdx(idx);
      setActiveLeftItems(c.initialLeftItems.map((it) => ({ ...it })));
      setActiveRightItems(c.initialRightItems.map((it) => ({ ...it })));
      setSelectedCompareAnswer(null);
      setMysteryAnswerInput('');
      setFeedback({ type: null, message: '' });
      setShowHint(false);
      setAttemptCount(0);
      setSelectedItemToPlace(null);
    }
  };

  const handleRestartChallengeRound = () => {
    const newChallenges = generateBalanceRound();
    setChallenges(newChallenges);
    setFirstTryCorrectCount(0);
    setHintsUsedCount(0);
    setShowSummaryModal(false);
    loadChallenge(0, newChallenges);
  };

  // Place item handler
  const handlePlaceItem = (side: 'left' | 'right', item: ScaleItem) => {
    const newItem = createScaleItem({
      name: item.name,
      weight: item.weight,
      icon: item.icon,
      color: item.color,
      isMystery: item.isMystery,
    });

    if (subMode === 'explore') {
      if (side === 'left') {
        setExploreLeftItems((prev) => [...prev, newItem]);
      } else {
        setExploreRightItems((prev) => [...prev, newItem]);
      }
    } else {
      if (side === 'left') {
        setActiveLeftItems((prev) => [...prev, newItem]);
      } else {
        setActiveRightItems((prev) => [...prev, newItem]);
      }
      setFeedback({ type: null, message: '' });
    }
    setSelectedItemToPlace(null);
  };

  const handlePanClick = (side: 'left' | 'right') => {
    if (selectedItemToPlace) {
      handlePlaceItem(side, selectedItemToPlace);
      playPop();
    }
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (!currentChallenge) return;
    setAttemptCount((prev) => prev + 1);

    const leftTotal = activeLeftItems.reduce((acc, it) => acc + it.weight, 0);
    const rightTotal = activeRightItems.reduce((acc, it) => acc + it.weight, 0);

    let isCorrect = false;

    if (currentChallenge.type === 'compare') {
      if (!selectedCompareAnswer) {
        setFeedback({
          type: 'incorrect',
          message: 'Em hãy chọn đĩa bên trái hoặc đĩa bên phải trên kệ nhé!',
        });
        playTryAgain();
        return;
      }
      if (currentChallenge.targetAnswer === selectedCompareAnswer) {
        isCorrect = true;
      }
    } else if (currentChallenge.type === 'balance') {
      if (leftTotal === rightTotal && rightTotal > 0) {
        isCorrect = true;
      }
    } else if (currentChallenge.type === 'mystery') {
      const parsedAns = parseInt(mysteryAnswerInput, 10);
      const mysteryWeight = currentChallenge.initialLeftItems.find((it) => it.isMystery)?.weight;
      if (leftTotal === rightTotal && parsedAns === mysteryWeight) {
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
      if (currentChallenge.type === 'balance') {
        if (rightTotal < leftTotal) {
          setFeedback({
            type: 'incorrect',
            message: 'Đĩa phải đang nhẹ hơn đĩa trái. Em thử đặt thêm quả cân vào đĩa phải nhé!',
          });
        } else {
          setFeedback({
            type: 'incorrect',
            message: 'Đĩa phải nặng hơn rồi. Hãy chạm vào quả cân trên đĩa phải để bớt ra nhé!',
          });
        }
      } else if (currentChallenge.type === 'mystery') {
        if (leftTotal !== rightTotal) {
          setFeedback({
            type: 'incorrect',
            message: 'Cân chưa thăng bằng! Hãy đặt thêm quả cân vào đĩa phải cho thăng bằng trước nhé.',
          });
        } else {
          setFeedback({
            type: 'incorrect',
            message: 'Cân đã thăng bằng rồi, nhưng số kg em chọn chưa đúng. Đếm lại tổng kg ở đĩa phải nhé!',
          });
        }
      } else {
        setFeedback({
          type: 'incorrect',
          message: 'Chưa đúng rồi. Em quan sát xem đĩa nào đang hạ thấp hơn nhé!',
        });
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < challenges.length) {
      loadChallenge(currentIdx + 1, challenges);
    } else {
      onRecordHistory({
        subType: 'Cân đĩa thử thách',
        firstTryCorrect: firstTryCorrectCount,
        total: challenges.length,
        hintsUsed: hintsUsedCount,
      });
      setShowSummaryModal(true);
    }
  };

  // ========================================================
  //     SHELF CONTENT FOR EXPLORE MODE (IN SAME BOX)
  // ========================================================
  const renderExploreShelf = ({
    startTouchDrag,
  }: {
    startTouchDrag: (e: React.PointerEvent, item: ScaleItem) => void;
    isDragging: boolean;
  }) => (
    <div className="w-full flex flex-col gap-1.5 select-none">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
          <Hand size={14} className="text-amber-700" />
          Kệ đồ vật (Kéo thả bằng ngón tay/chuột hoặc chạm chọn):
        </span>
        {selectedItemToPlace && (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 animate-pulse">
            Đang chọn: <strong>{selectedItemToPlace.name} ({selectedItemToPlace.weight}kg)</strong> 👉 Chạm đĩa trái hoặc phải!
          </span>
        )}
      </div>

      {/* ALL WEIGHTS & OBJECTS ALIGNED TOGETHER ON 1 UNIFIED SHELF */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        
        {/* Brass Weights */}
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-amber-300">
          {STANDARD_WEIGHTS.map((w) => {
            const item = createScaleItem({ ...w, type: 'weight' });
            const isSelected = selectedItemToPlace?.name === item.name;

            return (
              <button
                key={w.weight}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                }}
                onPointerDown={(e) => startTouchDrag(e, item)}
                className={`h-14 px-2.5 rounded-xl border-2 flex items-center gap-1.5 transition-all touch-none select-none cursor-grab active:cursor-grabbing active:scale-95 shrink-0 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-100/90 shadow-md ring-2 ring-emerald-400'
                    : 'border-amber-300 bg-amber-100/60 hover:bg-amber-200/70'
                }`}
                title={`Quả cân ${w.weight} kg`}
              >
                {renderItemIcon('weight', w.weight, 30)}
                <div className="text-left pointer-events-none">
                  <span className="text-xs font-black text-amber-950 block leading-tight">
                    {w.weight} kg
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold block">
                    Quả cân
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Everyday Objects */}
        <div className="flex items-center gap-1.5 shrink-0">
          {AVAILABLE_OBJECTS.map((obj, i) => {
            const item = createScaleItem({ ...obj, type: 'object' });
            const isSelected = selectedItemToPlace?.name === item.name;

            return (
              <button
                key={`${obj.name}-${i}`}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                }}
                onPointerDown={(e) => startTouchDrag(e, item)}
                className={`h-14 px-2 rounded-xl border-2 flex items-center gap-1.5 transition-all touch-none select-none cursor-grab active:cursor-grabbing active:scale-95 shrink-0 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-100/90 shadow-md ring-2 ring-emerald-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-amber-100/60 hover:border-amber-300'
                }`}
                title={`${obj.name} (${obj.weight} kg)`}
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100 pointer-events-none">
                  {renderItemIcon(obj.icon, obj.weight, 24)}
                </div>
                <div className="text-left pointer-events-none">
                  <span className="text-[11px] font-bold text-slate-800 block leading-tight truncate max-w-[70px]">
                    {obj.name}
                  </span>
                  <span className="text-xs font-black text-blue-700 block leading-tight">
                    {obj.weight} kg
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );

  // ========================================================
  //     SHELF CONTENT FOR CHALLENGE MODE (IN SAME BOX)
  // ========================================================
  const renderChallengeShelf = ({
    startTouchDrag,
  }: {
    startTouchDrag: (e: React.PointerEvent, item: ScaleItem) => void;
    isDragging: boolean;
  }) => {
    if (!currentChallenge) return null;

    return (
      <div className="w-full flex flex-col gap-2 select-none">
        {/* 1. Compare buttons directly on shelf */}
        {currentChallenge.type === 'compare' && (
          <div className="w-full flex items-center justify-center gap-3 py-1">
            <button
              type="button"
              onClick={() => {
                playClick();
                setSelectedCompareAnswer('left');
                setFeedback({ type: null, message: '' });
              }}
              className={`flex-1 max-w-xs py-3 px-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
                selectedCompareAnswer === 'left'
                  ? 'border-blue-600 bg-blue-100 text-blue-950 shadow-md ring-2 ring-blue-300'
                  : 'border-amber-300 bg-white hover:bg-amber-50 text-slate-800'
              }`}
            >
              👈 Đĩa bên Trái
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                setSelectedCompareAnswer('right');
                setFeedback({ type: null, message: '' });
              }}
              className={`flex-1 max-w-xs py-3 px-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
                selectedCompareAnswer === 'right'
                  ? 'border-blue-600 bg-blue-100 text-blue-950 shadow-md ring-2 ring-blue-300'
                  : 'border-amber-300 bg-white hover:bg-amber-50 text-slate-800'
              }`}
            >
              👉 Đĩa bên Phải
            </button>
          </div>
        )}

        {/* 2. Add weights to right pan on shelf */}
        {(currentChallenge.type === 'balance' || currentChallenge.type === 'mystery') && (
          <div className="flex flex-wrap items-center justify-between gap-2 py-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-amber-950">
                Quả cân đặt vào đĩa phải (Kéo thả hoặc chạm):
              </span>
              <div className="flex items-center gap-1.5">
                {currentChallenge.availableWeights.map((w) => {
                  const item = createScaleItem({
                    name: `Quả cân ${w} kg`,
                    weight: w,
                    icon: 'weight',
                    color: '#CA8A04',
                    type: 'weight',
                  });
                  const isSelected = selectedItemToPlace?.name === item.name;

                  return (
                    <button
                      key={w}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(item));
                      }}
                      onPointerDown={(e) => startTouchDrag(e, item)}
                      className={`h-12 px-3 rounded-xl border-2 flex items-center gap-1.5 transition-all touch-none select-none cursor-grab active:cursor-grabbing active:scale-95 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-100 shadow-md ring-2 ring-emerald-300'
                          : 'border-amber-300 bg-amber-100/70 hover:bg-amber-200'
                      }`}
                    >
                      {renderItemIcon('weight', w, 28)}
                      <span className="text-xs font-black text-amber-950 pointer-events-none">
                        {w} kg
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mystery answer buttons */}
            {currentChallenge.type === 'mystery' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-indigo-900">
                  Hộp quà là:
                </span>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      playClick();
                      setMysteryAnswerInput(num.toString());
                      setFeedback({ type: null, message: '' });
                    }}
                    className={`w-8 h-8 rounded-lg font-black text-xs border-2 transition-all active:scale-95 ${
                      mysteryAnswerInput === num.toString()
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {num}k
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* 1. TOP SUB-MODE SELECTOR TABS (COMPACT) */}
      <div className="flex items-center gap-1 p-1 bg-amber-100/80 rounded-2xl border border-amber-200 mb-2 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            playClick();
            setSubMode('explore');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all active:scale-95 ${
            subMode === 'explore'
              ? 'bg-white text-amber-950 shadow-2xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <Compass size={15} />
          Khám phá tự do
        </button>

        <button
          type="button"
          onClick={() => {
            playClick();
            setSubMode('challenge');
            loadChallenge(0, challenges);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all active:scale-95 ${
            subMode === 'challenge'
              ? 'bg-white text-amber-950 shadow-2xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <Award size={15} />
          Thử thách (5 câu)
        </button>
      </div>

      {/* ======================================================== */}
      {/*                     A. KHÁM PHÁ TỰ DO                    */}
      {/* ======================================================== */}
      {subMode === 'explore' && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          
          {/* THE UNIFIED BOX: SCALE ON TOP, SHELF WITH ALL ITEMS AT BOTTOM (SUPPORTS TOUCH DRAG) */}
          <BalanceScale
            leftItems={exploreLeftItems}
            rightItems={exploreRightItems}
            onRemoveLeftItem={(idx) => {
              setExploreLeftItems((prev) => prev.filter((_, i) => i !== idx));
            }}
            onRemoveRightItem={(idx) => {
              setExploreRightItems((prev) => prev.filter((_, i) => i !== idx));
            }}
            onClearLeft={() => setExploreLeftItems([])}
            onClearRight={() => setExploreRightItems([])}
            onPlaceOnLeft={(item) => handlePlaceItem('left', item)}
            onPlaceOnRight={(item) => handlePlaceItem('right', item)}
            selectedItemToPlace={selectedItemToPlace}
            onPanClick={handlePanClick}
            showMassValues={showMassExplore}
            isInteractive={true}
            onTapItem={(item) => {
              setSelectedItemToPlace(selectedItemToPlace?.name === item.name ? null : item);
            }}
            renderShelf={renderExploreShelf}
            headerAction={
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowMassExplore(!showMassExplore);
                }}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg hover:bg-amber-50 shadow-2xs"
              >
                {showMassExplore ? <EyeOff size={12} /> : <Eye size={12} />}
                {showMassExplore ? 'Ẩn kg' : 'Hiện kg'}
              </button>
            }
          />

        </div>
      )}

      {/* ======================================================== */}
      {/*                     B. THỬ THÁCH (QUIZ)                  */}
      {/* ======================================================== */}
      {subMode === 'challenge' && currentChallenge && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          
          {/* Question Prompt Bar (Compact) */}
          <div className="w-full flex items-center justify-between bg-amber-100/90 border-2 border-amber-300 rounded-2xl px-3 py-1.5 mb-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-xs rounded-lg">
                Câu {currentIdx + 1}/5
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-950">
                {currentChallenge.question}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRestartChallengeRound}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              title="Làm lại lượt này"
            >
              <RotateCcw size={12} />
              Làm lại
            </button>
          </div>

          {/* THE UNIFIED BOX: SCALE ON TOP, CHALLENGE ITEMS ON INTEGRATED SHELF */}
          <BalanceScale
            leftItems={activeLeftItems}
            rightItems={activeRightItems}
            onRemoveLeftItem={(idx) => {
              setActiveLeftItems((prev) => prev.filter((_, i) => i !== idx));
              setFeedback({ type: null, message: '' });
            }}
            onRemoveRightItem={(idx) => {
              setActiveRightItems((prev) => prev.filter((_, i) => i !== idx));
              setFeedback({ type: null, message: '' });
            }}
            onClearLeft={() => {}}
            onClearRight={() => {
              setActiveRightItems([]);
              setFeedback({ type: null, message: '' });
            }}
            onPlaceOnLeft={(item) => handlePlaceItem('left', item)}
            onPlaceOnRight={(item) => handlePlaceItem('right', item)}
            selectedItemToPlace={selectedItemToPlace}
            onPanClick={handlePanClick}
            showMassValues={settings.showMassValuesOnBalance}
            isInteractive={currentChallenge.type !== 'compare'}
            onTapItem={(item) => {
              setSelectedItemToPlace(selectedItemToPlace?.name === item.name ? null : item);
            }}
            renderShelf={renderChallengeShelf}
          />

          {/* Feedback & Bottom Action Bar (Fits right below scale without scrolling) */}
          <div className="w-full mt-2 flex flex-wrap items-center justify-between gap-2">
            
            {/* Feedback message banner */}
            <div className="flex-1 min-w-[240px]">
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
                    <span>{currentChallenge.hint}</span>
                  </div>
                )
              )}
            </div>

            {/* Actions: Gợi ý & Kiểm tra */}
            <div className="flex items-center gap-2 shrink-0">
              {settings.allowHints && (
                <button
                  type="button"
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
                  type="button"
                  onClick={() => {
                    playClick();
                    handleNextQuestion();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5 animate-bounce"
                >
                  {currentIdx + 1 < challenges.length ? 'Câu tiếp theo' : 'Xem kết quả'}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
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
        onRestart={handleRestartChallengeRound}
        firstTryCorrectCount={firstTryCorrectCount}
        hintUsedCount={hintsUsedCount}
        totalQuestions={challenges.length}
        moduleTitle="Thực hành Cân đĩa"
      />
    </div>
  );
};
