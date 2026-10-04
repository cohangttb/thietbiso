import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ClockDifficultyLevel } from '../../types';
import { playClick } from '../../utils/audio';
import { Eye, EyeOff, Plus, Minus, Keyboard } from 'lucide-react';

interface AnalogClockProps {
  hours: number; // 1..12
  minutes: number; // 0..59
  onChangeTime: (hours: number, minutes: number) => void;
  level?: ClockDifficultyLevel;
  interactive?: boolean;
  showDigitalDefault?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  hours,
  minutes,
  onChangeTime,
  level = 2,
  interactive = true,
  showDigitalDefault = true,
}) => {
  const [showDigital, setShowDigital] = useState(showDigitalDefault);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingMinute, setIsDraggingMinute] = useState(false);
  const lastMinuteAngleRef = useRef<number>(minutes * 6);

  // Input states for hour and minute boxes
  const [hourInput, setHourInput] = useState<string>(hours.toString());
  const [minuteInput, setMinuteInput] = useState<string>(minutes.toString().padStart(2, '0'));

  // Minute step based on level
  const minuteStep = level === 1 ? 60 : level === 2 ? 30 : 5;

  const minuteAngle = minutes * 6;
  const hourAngle = ((hours % 12) * 30) + (minutes * 0.5);

  useEffect(() => {
    lastMinuteAngleRef.current = minutes * 6;
    setMinuteInput(minutes.toString().padStart(2, '0'));
  }, [minutes]);

  useEffect(() => {
    setHourInput(hours.toString());
  }, [hours]);

  const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHourInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      onChangeTime(num, minutes);
      playClick();
    }
  };

  const handleHourInputBlur = () => {
    const num = parseInt(hourInput, 10);
    if (isNaN(num) || num < 1) {
      onChangeTime(1, minutes);
      setHourInput('1');
    } else if (num > 12) {
      onChangeTime(12, minutes);
      setHourInput('12');
    } else {
      onChangeTime(num, minutes);
      setHourInput(num.toString());
    }
  };

  const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMinuteInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 59) {
      onChangeTime(hours, num);
      playClick();
    }
  };

  const handleMinuteInputBlur = () => {
    const num = parseInt(minuteInput, 10);
    if (isNaN(num) || num < 0) {
      onChangeTime(hours, 0);
      setMinuteInput('00');
    } else if (num > 59) {
      onChangeTime(hours, 59);
      setMinuteInput('59');
    } else {
      onChangeTime(hours, num);
      setMinuteInput(num.toString().padStart(2, '0'));
    }
  };

  const updateTimeFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    const rawMinute = Math.round(deg / 6);
    let snappedMinute = Math.round(rawMinute / (minuteStep === 60 ? 30 : minuteStep)) * (minuteStep === 60 ? 0 : minuteStep);
    if (snappedMinute >= 60) snappedMinute = 0;

    const prevAngle = lastMinuteAngleRef.current;
    let newHours = hours;

    if (prevAngle >= 270 && deg < 90) {
      newHours = hours === 12 ? 1 : hours + 1;
    } else if (prevAngle <= 90 && deg > 270) {
      newHours = hours === 1 ? 12 : hours - 1;
    }

    lastMinuteAngleRef.current = deg;
    onChangeTime(newHours, snappedMinute);
    playClick();
  }, [hours, minuteStep, onChangeTime]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    setIsDraggingMinute(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateTimeFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingMinute) return;
    updateTimeFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    setIsDraggingMinute(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const handleAddHour = (delta: number) => {
    let next = hours + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    onChangeTime(next, minutes);
    playClick();
  };

  const handleAddMinutes = (delta: number) => {
    let totalMins = hours * 60 + minutes + delta;
    let newH = Math.floor(totalMins / 60);
    let newM = totalMins % 60;
    if (newM < 0) {
      newM += 60;
      newH -= 1;
    }
    let normH = ((newH - 1) % 12 + 12) % 12 + 1;
    onChangeTime(normH, newM);
    playClick();
  };

  const formatTimeVietnamese = (h: number, m: number): string => {
    if (m === 0) {
      return `${h} giờ đúng`;
    } else if (m === 30) {
      return `${h} giờ 30 phút (hoặc ${h} giờ rưỡi)`;
    } else {
      return `${h} giờ ${m} phút`;
    }
  };

  const digitalTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-5 select-none">
      
      {/* 1. LEFT CARD: ANALOG CLOCK FACE */}
      <div className="relative w-full max-w-[240px] sm:max-w-[270px] aspect-square bg-gradient-to-b from-amber-50/60 to-orange-50/40 rounded-3xl border-2 border-amber-300 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
        <svg
          ref={svgRef}
          viewBox="0 0 360 360"
          className={`w-full h-full max-w-[240px] max-h-[240px] ${
            interactive ? 'cursor-grab active:cursor-grabbing touch-none' : ''
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            <linearGradient id="clock-rim-c" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <radialGradient id="clock-face-c" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="85%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </radialGradient>

            <filter id="hand-shadow-c" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Outer Casing */}
          <circle cx="180" cy="180" r="172" fill="url(#clock-rim-c)" stroke="#B45309" strokeWidth="4" />
          <circle cx="180" cy="180" r="160" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="180" cy="180" r="154" fill="url(#clock-face-c)" stroke="#E2E8F0" strokeWidth="1" />

          {/* 60 Minute Ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHourTick = i % 5 === 0;
            const tickAngle = i * 6;
            const tickLength = isHourTick ? 14 : 7;
            const strokeW = isHourTick ? 3 : 1.2;
            const strokeColor = isHourTick ? '#78350F' : '#94A3B8';

            return (
              <line
                key={`tick-${i}`}
                x1="180"
                y1={180 - 148}
                x2="180"
                y2={180 - 148 + tickLength}
                stroke={strokeColor}
                strokeWidth={strokeW}
                strokeLinecap="round"
                transform={`rotate(${tickAngle} 180 180)`}
              />
            );
          })}

          {/* Numbers 1 to 12 */}
          {Array.from({ length: 12 }).map((_, i) => {
            const num = i + 1;
            const angleRad = ((num * 30 - 90) * Math.PI) / 180;
            const radius = 120;
            const nx = 180 + radius * Math.cos(angleRad);
            const ny = 180 + radius * Math.sin(angleRad) + 7;

            const isCurrentHour = num === hours;

            return (
              <text
                key={`num-${num}`}
                x={nx}
                y={ny}
                textAnchor="middle"
                fontSize={num === 12 || num === 6 || num === 3 || num === 9 ? '24' : '21'}
                fontWeight={num === 12 || num === 6 || isCurrentHour ? '900' : '700'}
                fill={isCurrentHour ? '#1D4ED8' : '#1E293B'}
                fontFamily="Nunito, sans-serif"
                className="select-none pointer-events-none"
              >
                {num}
              </text>
            );
          })}

          {/* KIM GIỜ (Hour Hand) */}
          <g transform={`rotate(${hourAngle} 180 180)`} filter="url(#hand-shadow-c)">
            <path d="M 175 195 L 185 195 L 183 180 L 177 180 Z" fill="#1D4ED8" />
            <circle cx="180" cy="195" r="5" fill="#1E40AF" />
            <path
              d="M 174 180 L 177 100 L 180 92 L 183 100 L 186 180 Z"
              fill="#2563EB"
              stroke="#1E40AF"
              strokeWidth="1.5"
            />
            <line x1="180" y1="170" x2="180" y2="105" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* KIM PHÚT (Minute Hand) */}
          <g transform={`rotate(${minuteAngle} 180 180)`} filter="url(#hand-shadow-c)">
            <path d="M 176 200 L 184 200 L 182 180 L 178 180 Z" fill="#BE123C" />
            <circle cx="180" cy="200" r="4.5" fill="#9F1239" />
            <path
              d="M 176 180 L 178 55 L 180 44 L 182 55 L 184 180 Z"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="1.5"
            />
            <polygon points="180,38 175,54 185,54" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
            <line x1="180" y1="170" x2="180" y2="60" stroke="#FECDD3" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Central Nut */}
          <circle cx="180" cy="180" r="10" fill="#FBBF24" stroke="#78350F" strokeWidth="2" />
          <circle cx="180" cy="180" r="4.5" fill="#B45309" />
        </svg>

        {/* Compact Legend */}
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1 text-blue-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Kim giờ (ngắn)
          </div>
          <div className="flex items-center gap-1 text-rose-800">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            Kim phút (dài)
          </div>
        </div>
      </div>

      {/* 2. RIGHT CARD: DIGITAL TIME + INPUT BOXES + QUICK STEPPERS */}
      <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-2">
        
        {/* Digital Clock Display */}
        {showDigital ? (
          <div className="w-full bg-white border-2 border-amber-300 rounded-2xl p-2.5 text-center shadow-2xs flex items-center justify-between px-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-wider">
              {digitalTimeStr}
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-amber-900 text-right">
              {formatTimeVietnamese(hours, minutes)}
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-center text-xs text-slate-500 italic">
            (Đồng hồ số đang ẩn để em tự quan sát kim)
          </div>
        )}

        {/* Ô nhập giờ và phút */}
        {interactive && (
          <div className="w-full bg-white border-2 border-amber-300 rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-amber-100">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                <Keyboard size={14} className="text-amber-600" />
                Ô nhập giờ và phút:
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                Tự quay kim
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              {/* Ô Giờ */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-blue-800">Giờ:</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={hourInput}
                  onChange={handleHourInputChange}
                  onBlur={handleHourInputBlur}
                  className="w-14 h-10 text-center text-lg font-black text-blue-900 bg-blue-50 border-2 border-blue-300 focus:border-blue-600 rounded-xl outline-none font-mono"
                  placeholder="Giờ"
                />
              </div>

              <span className="text-xl font-black text-slate-400">:</span>

              {/* Ô Phút */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-rose-800">Phút:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minuteInput}
                  onChange={handleMinuteInputChange}
                  onBlur={handleMinuteInputBlur}
                  className="w-14 h-10 text-center text-lg font-black text-rose-900 bg-rose-50 border-2 border-rose-300 focus:border-rose-600 rounded-xl outline-none font-mono"
                  placeholder="Phút"
                />
              </div>

              {/* Quick minute buttons */}
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => {
                    onChangeTime(hours, 0);
                    playClick();
                  }}
                  className={`px-2 py-1 text-[11px] font-extrabold rounded-lg border transition-all ${
                    minutes === 0
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  :00
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeTime(hours, 30);
                    playClick();
                  }}
                  className={`px-2 py-1 text-[11px] font-extrabold rounded-lg border transition-all ${
                    minutes === 30
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

        {/* Stepper Buttons & Toggle View */}
        {interactive && (
          <div className="w-full flex items-center justify-between gap-2">
            {/* Stepper Giờ */}
            <div className="flex-1 flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl p-1">
              <button
                onClick={() => handleAddHour(-1)}
                className="w-7 h-7 flex items-center justify-center bg-white text-blue-700 rounded-lg shadow-2xs font-bold"
                title="Giảm 1 giờ"
              >
                <Minus size={14} />
              </button>
              <span className="text-[11px] font-extrabold text-blue-900">Giờ</span>
              <button
                onClick={() => handleAddHour(1)}
                className="w-7 h-7 flex items-center justify-center bg-white text-blue-700 rounded-lg shadow-2xs font-bold"
                title="Tăng 1 giờ"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Stepper Phút */}
            <div className="flex-1 flex items-center justify-between bg-rose-50/80 border border-rose-200 rounded-xl p-1">
              <button
                onClick={() => handleAddMinutes(-minuteStep)}
                className="w-7 h-7 flex items-center justify-center bg-white text-rose-700 rounded-lg shadow-2xs font-bold"
                title={`Giảm ${minuteStep} phút`}
              >
                <Minus size={14} />
              </button>
              <span className="text-[11px] font-extrabold text-rose-900">{minuteStep}p</span>
              <button
                onClick={() => handleAddMinutes(minuteStep)}
                className="w-7 h-7 flex items-center justify-center bg-white text-rose-700 rounded-lg shadow-2xs font-bold"
                title={`Tăng ${minuteStep} phút`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Toggle Digital Display */}
            <button
              onClick={() => setShowDigital(!showDigital)}
              className="h-9 px-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-[11px] font-bold shadow-2xs flex items-center gap-1 shrink-0"
            >
              {showDigital ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showDigital ? 'Ẩn số' : 'Hiện số'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
