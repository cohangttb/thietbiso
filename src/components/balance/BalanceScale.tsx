import React, { useRef, useState } from 'react';
import { ScaleItem } from '../../types';
import { renderItemIcon } from './ItemIcons';
import { playPop, playClick } from '../../utils/audio';
import { Trash2, Plus, CheckCircle2 } from 'lucide-react';

interface BalanceScaleProps {
  leftItems: ScaleItem[];
  rightItems: ScaleItem[];
  onRemoveLeftItem: (index: number) => void;
  onRemoveRightItem: (index: number) => void;
  onClearLeft: () => void;
  onClearRight: () => void;
  onPlaceOnLeft: (item: ScaleItem) => void;
  onPlaceOnRight: (item: ScaleItem) => void;
  selectedItemToPlace: ScaleItem | null;
  onPanClick: (side: 'left' | 'right') => void;
  showMassValues: boolean;
  isInteractive?: boolean;
  headerAction?: React.ReactNode;
  onTapItem?: (item: ScaleItem) => void;
  renderShelf?: (props: {
    startTouchDrag: (e: React.PointerEvent, item: ScaleItem) => void;
    isDragging: boolean;
  }) => React.ReactNode;
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({
  leftItems,
  rightItems,
  onRemoveLeftItem,
  onRemoveRightItem,
  onClearLeft,
  onClearRight,
  onPlaceOnLeft,
  onPlaceOnRight,
  selectedItemToPlace,
  onPanClick,
  showMassValues,
  isInteractive = true,
  headerAction,
  onTapItem,
  renderShelf,
}) => {
  const leftPanRef = useRef<HTMLDivElement | null>(null);
  const rightPanRef = useRef<HTMLDivElement | null>(null);

  // Touch and pointer dragging state for mobile & desktop
  const [touchDragState, setTouchDragState] = useState<{
    isDragging: boolean;
    item: ScaleItem | null;
    x: number;
    y: number;
    hoveredPan: 'left' | 'right' | null;
  }>({
    isDragging: false,
    item: null,
    x: 0,
    y: 0,
    hoveredPan: null,
  });

  const leftTotalWeight = leftItems.reduce((acc, it) => acc + it.weight, 0);
  const rightTotalWeight = rightItems.reduce((acc, it) => acc + it.weight, 0);
  const diff = rightTotalWeight - leftTotalWeight;

  // Maximum tilt angle is 11 degrees
  const maxAngle = 11;
  let targetAngle = 0;
  if (diff > 0) {
    targetAngle = Math.min(maxAngle, 3 + diff * 1.4);
  } else if (diff < 0) {
    targetAngle = Math.max(-maxAngle, -3 + diff * 1.4);
  }

  // Pointer drag handler for items (Supports Touch on mobile + Mouse on desktop)
  const handleStartTouchDrag = (e: React.PointerEvent, item: ScaleItem) => {
    if (!isInteractive) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (!hasMoved && dist > 5) {
        hasMoved = true;
      }

      if (hasMoved) {
        let hovered: 'left' | 'right' | null = null;
        if (leftPanRef.current) {
          const rect = leftPanRef.current.getBoundingClientRect();
          if (
            moveEvent.clientX >= rect.left - 15 &&
            moveEvent.clientX <= rect.right + 15 &&
            moveEvent.clientY >= rect.top - 20 &&
            moveEvent.clientY <= rect.bottom + 25
          ) {
            hovered = 'left';
          }
        }
        if (!hovered && rightPanRef.current) {
          const rect = rightPanRef.current.getBoundingClientRect();
          if (
            moveEvent.clientX >= rect.left - 15 &&
            moveEvent.clientX <= rect.right + 15 &&
            moveEvent.clientY >= rect.top - 20 &&
            moveEvent.clientY <= rect.bottom + 25
          ) {
            hovered = 'right';
          }
        }

        setTouchDragState({
          isDragging: true,
          item,
          x: moveEvent.clientX,
          y: moveEvent.clientY,
          hoveredPan: hovered,
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      if (hasMoved) {
        let droppedPan: 'left' | 'right' | null = null;
        if (leftPanRef.current) {
          const rect = leftPanRef.current.getBoundingClientRect();
          if (
            upEvent.clientX >= rect.left - 15 &&
            upEvent.clientX <= rect.right + 15 &&
            upEvent.clientY >= rect.top - 20 &&
            upEvent.clientY <= rect.bottom + 25
          ) {
            droppedPan = 'left';
          }
        }
        if (!droppedPan && rightPanRef.current) {
          const rect = rightPanRef.current.getBoundingClientRect();
          if (
            upEvent.clientX >= rect.left - 15 &&
            upEvent.clientX <= rect.right + 15 &&
            upEvent.clientY >= rect.top - 20 &&
            upEvent.clientY <= rect.bottom + 25
          ) {
            droppedPan = 'right';
          }
        }

        if (droppedPan === 'left') {
          onPlaceOnLeft(item);
          playPop();
        } else if (droppedPan === 'right') {
          onPlaceOnRight(item);
          playPop();
        }
      } else {
        // Tap without moving -> select item for tap-to-place
        playClick();
        if (onTapItem) {
          onTapItem(item);
        }
      }

      setTouchDragState({
        isDragging: false,
        item: null,
        x: 0,
        y: 0,
        hoveredPan: null,
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Standard HTML5 drop fallback for desktop browsers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const item: ScaleItem = JSON.parse(dataStr);
        if (side === 'left') {
          onPlaceOnLeft(item);
        } else {
          onPlaceOnRight(item);
        }
        playPop();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* FLOATING DRAG GHOST (Follows finger smoothly on mobile & desktop) */}
      {touchDragState.isDragging && touchDragState.item && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-2 rounded-2xl bg-white border-2 border-emerald-500 shadow-2xl scale-110 animate-pulse"
          style={{ left: touchDragState.x, top: touchDragState.y }}
        >
          {renderItemIcon(touchDragState.item.icon, touchDragState.item.weight, 34)}
          <span className="text-[11px] font-black text-amber-950 mt-0.5">
            {touchDragState.item.weight} kg
          </span>
        </div>
      )}

      {/* UNIFIED CONTAINER: SCALE + STATUS + ALL WEIGHTS/ITEMS IN 1 BOX */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-sky-50/70 via-amber-50/30 to-amber-100/40 rounded-3xl border-2 sm:border-3 border-amber-300 shadow-md overflow-hidden flex flex-col">
        
        {/* 1. TOP HEADER STRIP: Status & Quick Controls */}
        <div className="px-3 sm:px-4 py-2 bg-white/90 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                diff === 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : diff > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {diff === 0 ? (
                <CheckCircle2 size={18} />
              ) : (
                <span className="font-bold text-xs">{diff > 0 ? '👉' : '👈'}</span>
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                {diff === 0 ? (
                  <span className="text-emerald-700">Hai bên thăng bằng</span>
                ) : diff > 0 ? (
                  <span className="text-blue-700">Bên phải nặng hơn (đĩa phải hạ)</span>
                ) : (
                  <span className="text-rose-700">Bên trái nặng hơn (đĩa trái hạ)</span>
                )}
              </span>
            </div>
          </div>

          {/* Mass Badges & Clear buttons */}
          <div className="flex items-center gap-2">
            {showMassValues && (
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                  Trái: <strong>{leftTotalWeight} kg</strong>
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded-md border border-amber-200">
                  Phải: <strong>{rightTotalWeight} kg</strong>
                </span>
              </div>
            )}

            {headerAction}

            {isInteractive && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onClearLeft();
                    playClick();
                  }}
                  disabled={leftItems.length === 0}
                  className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all shadow-2xs active:scale-95 flex items-center gap-1"
                  title="Xóa đĩa trái"
                >
                  <Trash2 size={12} />
                  Xóa trái
                </button>
                <button
                  onClick={() => {
                    onClearRight();
                    playClick();
                  }}
                  disabled={rightItems.length === 0}
                  className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all shadow-2xs active:scale-95 flex items-center gap-1"
                  title="Xóa đĩa phải"
                >
                  <Trash2 size={12} />
                  Xóa phải
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. SCALE SVG STAGE */}
        <div className="relative w-full aspect-[700/320] max-h-[250px] sm:max-h-[280px] p-1 flex items-center justify-center">
          
          {/* Subtle background ground line */}
          <div className="absolute inset-x-0 bottom-6 h-0.5 bg-amber-200/50" />

          <svg
            viewBox="0 0 700 320"
            className="w-full h-full max-h-[270px]"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="base-wood-m" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#92400E" />
                <stop offset="50%" stopColor="#78350F" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>

              <linearGradient id="pillar-brass-m" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CA8A04" />
                <stop offset="35%" stopColor="#FEF08A" />
                <stop offset="70%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>

              <linearGradient id="beam-grad-m" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FACC15" />
                <stop offset="40%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>

              <linearGradient id="pan-dish-m" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="40%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              <filter id="shadow-soft-m" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Central Support Base */}
            <path
              d="M 240 280 L 460 280 C 465 280 470 285 465 295 L 455 305 C 450 310 250 310 245 305 L 235 295 C 230 285 235 280 240 280 Z"
              fill="url(#base-wood-m)"
              filter="url(#shadow-soft-m)"
            />
            <ellipse cx="350" cy="280" rx="80" ry="6" fill="#B45309" opacity="0.6" />

            {/* Vertical Pillar Shaft */}
            <path
              d="M 338 100 L 334 280 L 366 280 L 362 100 Z"
              fill="url(#pillar-brass-m)"
              filter="url(#shadow-soft-m)"
            />
            <rect x="330" y="265" width="40" height="12" rx="3" fill="#CA8A04" stroke="#854D0E" strokeWidth="1" />
            <rect x="333" y="175" width="34" height="8" rx="2" fill="#CA8A04" stroke="#854D0E" strokeWidth="1" />

            {/* Scale Dial Background (Behind Beam Pivot) */}
            <g transform="translate(350, 100)">
              <path
                d="M -42 12 A 45 45 0 0 0 42 12 L 32 26 A 35 35 0 0 1 -32 26 Z"
                fill="#FEF3C7"
                stroke="#B45309"
                strokeWidth="1.5"
              />
              <line x1="0" y1="12" x2="0" y2="24" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-18" y1="15" x2="-16" y2="22" stroke="#B45309" strokeWidth="1.2" />
              <line x1="-30" y1="18" x2="-26" y2="24" stroke="#B45309" strokeWidth="1.2" />
              <line x1="18" y1="15" x2="16" y2="22" stroke="#B45309" strokeWidth="1.2" />
              <line x1="30" y1="18" x2="26" y2="24" stroke="#B45309" strokeWidth="1.2" />
            </g>

            {/* ROTATING BEAM & SUSPENDED PANS GROUP */}
            <g
              transform={`translate(350, 100) rotate(${targetAngle})`}
              style={{
                transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {/* Main Beam bar */}
              <rect
                x="-210"
                y="-6"
                width="420"
                height="12"
                rx="5"
                fill="url(#beam-grad-m)"
                stroke="#854D0E"
                strokeWidth="1.5"
                filter="url(#shadow-soft-m)"
              />

              {/* Decorative dotted line */}
              <line x1="-180" y1="0" x2="-25" y2="0" stroke="#78350F" strokeWidth="1.5" strokeDasharray="5 5" />
              <line x1="25" y1="0" x2="180" y2="0" stroke="#78350F" strokeWidth="1.5" strokeDasharray="5 5" />

              {/* Left Beam Hook Pivot */}
              <circle cx="-195" cy="0" r="6" fill="#FEF08A" stroke="#854D0E" strokeWidth="1.5" />
              <circle cx="-195" cy="0" r="2.5" fill="#78350F" />

              {/* Right Beam Hook Pivot */}
              <circle cx="195" cy="0" r="6" fill="#FEF08A" stroke="#854D0E" strokeWidth="1.5" />
              <circle cx="195" cy="0" r="2.5" fill="#78350F" />

              {/* Needle pointing down to dial */}
              <path d="M -2.5 0 L 0 30 L 2.5 0 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
              <circle cx="0" cy="29" r="2" fill="#EF4444" />

              {/* Central Pivot Nut */}
              <circle cx="0" cy="0" r="12" fill="#FEF08A" stroke="#854D0E" strokeWidth="2" />
              <circle cx="0" cy="0" r="5" fill="#CA8A04" />

              {/* ================= LEFT SUSPENDED PAN ================= */}
              <g
                transform={`translate(-195, 0) rotate(${-targetAngle})`}
                style={{
                  transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                {/* Chains */}
                <line x1="0" y1="0" x2="-60" y2="105" stroke="#64748B" strokeWidth="1.6" strokeDasharray="4 2" />
                <line x1="0" y1="0" x2="60" y2="105" stroke="#64748B" strokeWidth="1.6" strokeDasharray="4 2" />
                <line x1="0" y1="0" x2="0" y2="108" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />

                {/* Pan Ring Hooks */}
                <circle cx="-60" cy="105" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
                <circle cx="60" cy="105" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />

                {/* Pan Dish */}
                <path
                  d="M -70 105 Q 0 130 70 105 L 63 115 Q 0 138 -63 115 Z"
                  fill="url(#pan-dish-m)"
                  stroke="#475569"
                  strokeWidth="1.5"
                  filter="url(#shadow-soft-m)"
                />
                <ellipse cx="0" cy="105" rx="70" ry="7" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />

                {/* Items placed on Left Pan */}
                <g transform="translate(0, 100)">
                  {leftItems.slice(0, 8).map((item, idx) => {
                    const total = leftItems.length;
                    const spacing = total > 1 ? Math.min(24, 80 / total) : 0;
                    const xOffset = (idx - (total - 1) / 2) * spacing;
                    const yOffset = -2 - (idx % 2 === 0 ? 0 : 3);

                    return (
                      <g
                        key={item.id}
                        transform={`translate(${xOffset}, ${yOffset})`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInteractive) {
                            onRemoveLeftItem(idx);
                            playPop();
                          }
                        }}
                      >
                        <circle cx="0" cy="-12" r="14" fill="white" stroke="#E2E8F0" strokeWidth="1" opacity="0.9" />
                        <g transform="translate(-14, -26)">
                          {renderItemIcon(item.icon, item.weight, 28)}
                        </g>
                        {!item.isMystery && (
                          <text
                            x="0"
                            y="-1"
                            textAnchor="middle"
                            fill="#0F172A"
                            fontSize="8.5"
                            fontWeight="bold"
                            fontFamily="Nunito, sans-serif"
                          >
                            {item.weight}k
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </g>

              {/* ================= RIGHT SUSPENDED PAN ================= */}
              <g
                transform={`translate(195, 0) rotate(${-targetAngle})`}
                style={{
                  transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                {/* Chains */}
                <line x1="0" y1="0" x2="-60" y2="105" stroke="#64748B" strokeWidth="1.6" strokeDasharray="4 2" />
                <line x1="0" y1="0" x2="60" y2="105" stroke="#64748B" strokeWidth="1.6" strokeDasharray="4 2" />
                <line x1="0" y1="0" x2="0" y2="108" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />

                {/* Pan Ring Hooks */}
                <circle cx="-60" cy="105" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
                <circle cx="60" cy="105" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />

                {/* Pan Dish */}
                <path
                  d="M -70 105 Q 0 130 70 105 L 63 115 Q 0 138 -63 115 Z"
                  fill="url(#pan-dish-m)"
                  stroke="#475569"
                  strokeWidth="1.5"
                  filter="url(#shadow-soft-m)"
                />
                <ellipse cx="0" cy="105" rx="70" ry="7" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />

                {/* Items placed on Right Pan */}
                <g transform="translate(0, 100)">
                  {rightItems.slice(0, 8).map((item, idx) => {
                    const total = rightItems.length;
                    const spacing = total > 1 ? Math.min(24, 80 / total) : 0;
                    const xOffset = (idx - (total - 1) / 2) * spacing;
                    const yOffset = -2 - (idx % 2 === 0 ? 0 : 3);

                    return (
                      <g
                        key={item.id}
                        transform={`translate(${xOffset}, ${yOffset})`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInteractive) {
                            onRemoveRightItem(idx);
                            playPop();
                          }
                        }}
                      >
                        <circle cx="0" cy="-12" r="14" fill="white" stroke="#E2E8F0" strokeWidth="1" opacity="0.9" />
                        <g transform="translate(-14, -26)">
                          {renderItemIcon(item.icon, item.weight, 28)}
                        </g>
                        {!item.isMystery && (
                          <text
                            x="0"
                            y="-1"
                            textAnchor="middle"
                            fill="#0F172A"
                            fontSize="8.5"
                            fontWeight="bold"
                            fontFamily="Nunito, sans-serif"
                          >
                            {item.weight}k
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </g>
            </g>

            {/* Central Base Plate Label */}
            <g transform="translate(350, 295)">
              <rect x="-35" y="-8" width="70" height="16" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="1" />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#78350F"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="Nunito, sans-serif"
              >
                CÂN ĐĨA
              </text>
            </g>
          </svg>

          {/* OVERLAY INTERACTION TARGETS FOR PANS (WORKS WITH TOUCH & DRAG) */}
          <div className="absolute inset-0 pointer-events-none flex justify-between px-2 sm:px-6 pt-10 pb-2">
            
            {/* Left Pan Target */}
            <div
              ref={leftPanRef}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'left')}
              onClick={() => {
                if (isInteractive) onPanClick('left');
              }}
              className={`pointer-events-auto w-36 sm:w-48 h-36 rounded-2xl flex flex-col items-center justify-end pb-1 transition-all cursor-pointer ${
                touchDragState.hoveredPan === 'left'
                  ? 'border-3 border-emerald-500 bg-emerald-500/25 shadow-xl scale-105 ring-4 ring-emerald-300'
                  : touchDragState.isDragging || selectedItemToPlace
                  ? 'border-2 border-dashed border-emerald-500 bg-emerald-500/10 shadow-md animate-pulse'
                  : 'hover:bg-amber-400/5'
              }`}
              title="Đĩa cân bên trái"
            >
              {touchDragState.hoveredPan === 'left' ? (
                <span className="mb-1 px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-black rounded-full shadow flex items-center gap-1 animate-bounce">
                  ✓ Thả vào đĩa trái!
                </span>
              ) : (touchDragState.isDragging || selectedItemToPlace) ? (
                <span className="mb-1 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded-full shadow flex items-center gap-1">
                  <Plus size={12} /> {touchDragState.isDragging ? 'Kéo vào đây' : 'Chạm để đặt'}
                </span>
              ) : null}

              <div className="text-center bg-white/90 px-2 py-0.5 rounded-lg shadow-2xs border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 block">Đĩa Trái</span>
                {showMassValues && (
                  <span className="text-xs font-black text-blue-700">
                    {leftTotalWeight} kg
                  </span>
                )}
              </div>
            </div>

            {/* Right Pan Target */}
            <div
              ref={rightPanRef}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'right')}
              onClick={() => {
                if (isInteractive) onPanClick('right');
              }}
              className={`pointer-events-auto w-36 sm:w-48 h-36 rounded-2xl flex flex-col items-center justify-end pb-1 transition-all cursor-pointer ${
                touchDragState.hoveredPan === 'right'
                  ? 'border-3 border-emerald-500 bg-emerald-500/25 shadow-xl scale-105 ring-4 ring-emerald-300'
                  : touchDragState.isDragging || selectedItemToPlace
                  ? 'border-2 border-dashed border-emerald-500 bg-emerald-500/10 shadow-md animate-pulse'
                  : 'hover:bg-amber-400/5'
              }`}
              title="Đĩa cân bên phải"
            >
              {touchDragState.hoveredPan === 'right' ? (
                <span className="mb-1 px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-black rounded-full shadow flex items-center gap-1 animate-bounce">
                  ✓ Thả vào đĩa phải!
                </span>
              ) : (touchDragState.isDragging || selectedItemToPlace) ? (
                <span className="mb-1 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded-full shadow flex items-center gap-1">
                  <Plus size={12} /> {touchDragState.isDragging ? 'Kéo vào đây' : 'Chạm để đặt'}
                </span>
              ) : null}

              <div className="text-center bg-white/90 px-2 py-0.5 rounded-lg shadow-2xs border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 block">Đĩa Phải</span>
                {showMassValues && (
                  <span className="text-xs font-black text-blue-700">
                    {rightTotalWeight} kg
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 3. INTEGRATED BOTTOM SHELF INSIDE THE EXACT SAME BOX */}
        {renderShelf && (
          <div className="bg-white/95 border-t-2 border-amber-300 p-2 sm:p-3 shadow-inner">
            {renderShelf({
              startTouchDrag: handleStartTouchDrag,
              isDragging: touchDragState.isDragging,
            })}
          </div>
        )}

      </div>

      <p className="mt-1 text-[11px] text-slate-400 text-center italic">
        * Kéo thả trực tiếp bằng ngón tay/chuột hoặc chạm chọn vật rồi chạm đĩa cân để đặt.
      </p>
    </div>
  );
};
