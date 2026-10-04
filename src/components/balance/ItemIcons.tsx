import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const WeightIcon: React.FC<IconProps & { kg: number }> = ({ kg, size = 36, className = '' }) => {
  // Traditional brass weight with top handle
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={`brass-grad-${kg}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <radialGradient id={`brass-highlight-${kg}`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
      </defs>
      {/* Knob handle */}
      <circle cx="24" cy="11" r="5" fill={`url(#brass-highlight-${kg})`} stroke="#854D0E" strokeWidth="1.5" />
      <rect x="21.5" y="14" width="5" height="4" rx="1.5" fill="#CA8A04" stroke="#854D0E" strokeWidth="1" />
      {/* Main body (tapered bell/cylinder) */}
      <path
        d="M17 18 C17 17 31 17 31 18 L36 38 C36 41 12 41 12 38 Z"
        fill={`url(#brass-grad-${kg})`}
        stroke="#854D0E"
        strokeWidth="1.8"
      />
      {/* Base rim */}
      <ellipse cx="24" cy="38" rx="12" ry="3" fill="#A16207" />
      {/* Weight text */}
      <rect x="18" y="24" width="12" height="10" rx="2" fill="#713F12" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fill="#FEF08A"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Nunito, sans-serif"
      >
        {kg}k
      </text>
    </svg>
  );
};

export const RiceBagIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Tied burlap bag */}
    <path
      d="M14 18 C14 14 34 14 34 18 C33 22 37 38 34 42 C30 44 18 44 14 42 C11 38 15 22 14 18 Z"
      fill="#F5D0A9"
      stroke="#B45309"
      strokeWidth="2"
    />
    {/* Tied neck and knot */}
    <rect x="20" y="13" width="8" height="4" rx="2" fill="#D97706" />
    <path d="M19 13 C18 10 22 8 24 10 C26 8 30 10 29 13" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
    {/* Grain stalk design */}
    <circle cx="24" cy="27" r="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
    <text x="24" y="30" textAnchor="middle" fill="#B45309" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
      GẠO
    </text>
  </svg>
);

export const ToyBoxIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Box body */}
    <rect x="10" y="18" width="28" height="23" rx="4" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2" />
    {/* Lid */}
    <rect x="8" y="14" width="32" height="7" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
    {/* Ribbon */}
    <rect x="22" y="18" width="4" height="23" fill="#F43F5E" />
    <rect x="22" y="14" width="4" height="7" fill="#F43F5E" />
    {/* Bow */}
    <circle cx="21" cy="12" r="3" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
    <circle cx="27" cy="12" r="3" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
    <circle cx="24" cy="13" r="2" fill="#BE123C" />
  </svg>
);

export const FruitBasketIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Fruits protruding */}
    <circle cx="19" cy="20" r="7" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
    <circle cx="29" cy="19" r="6.5" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
    <circle cx="24" cy="16" r="6" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.5" />
    {/* Basket */}
    <path
      d="M10 22 C12 39 36 39 38 22 Z"
      fill="#D97706"
      stroke="#78350F"
      strokeWidth="2"
    />
    {/* Basket handle */}
    <path d="M12 22 C12 9 36 9 36 22" fill="none" stroke="#92400E" strokeWidth="2.5" />
    {/* Weave pattern */}
    <line x1="16" y1="23" x2="22" y2="36" stroke="#92400E" strokeWidth="1.5" />
    <line x1="26" y1="23" x2="32" y2="36" stroke="#92400E" strokeWidth="1.5" />
    <line x1="32" y1="23" x2="26" y2="36" stroke="#92400E" strokeWidth="1.5" />
    <line x1="22" y1="23" x2="16" y2="36" stroke="#92400E" strokeWidth="1.5" />
  </svg>
);

export const WatermelonIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="24" cy="24" rx="16" ry="14" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
    {/* Dark green stripes */}
    <path d="M14 13 C19 19 19 29 14 35" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 10 C27 18 27 30 24 38" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M34 13 C29 19 29 29 34 35" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
    {/* Stem */}
    <path d="M24 10 C24 7 27 6 28 5" fill="none" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const WaterJugIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Cap */}
    <rect x="21" y="9" width="6" height="4" rx="1.5" fill="#1E40AF" />
    {/* Jug Body */}
    <rect x="13" y="16" width="22" height="24" rx="4" fill="#67E8F9" stroke="#0284C7" strokeWidth="2" />
    {/* Water level wave */}
    <path d="M14 27 Q19 24 24 27 T34 27 L34 38 C34 39 33 40 32 40 L16 40 C15 40 14 39 14 38 Z" fill="#38BDF8" />
    {/* Handle */}
    <path d="M13 20 C8 20 8 32 13 32" fill="none" stroke="#0284C7" strokeWidth="2.5" />
    {/* Rib lines */}
    <line x1="16" y1="22" x2="32" y2="22" stroke="#BAE6FD" strokeWidth="1.5" />
    <line x1="16" y1="33" x2="32" y2="33" stroke="#BAE6FD" strokeWidth="1.5" />
  </svg>
);

export const BearIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ears */}
    <circle cx="15" cy="14" r="5" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="15" cy="14" r="2.5" fill="#FDE68A" />
    <circle cx="33" cy="14" r="5" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="33" cy="14" r="2.5" fill="#FDE68A" />
    {/* Head */}
    <circle cx="24" cy="22" r="11" fill="#F59E0B" stroke="#92400E" strokeWidth="1.8" />
    {/* Snout */}
    <ellipse cx="24" cy="25" rx="5" ry="3.8" fill="#FEF3C7" />
    <ellipse cx="24" cy="23.5" rx="2" ry="1.3" fill="#78350F" />
    {/* Eyes */}
    <circle cx="20" cy="20" r="1.5" fill="#451A03" />
    <circle cx="28" cy="20" r="1.5" fill="#451A03" />
    {/* Body */}
    <ellipse cx="24" cy="35" rx="10" ry="8" fill="#F59E0B" stroke="#92400E" strokeWidth="1.8" />
    <ellipse cx="24" cy="35" rx="6" ry="5" fill="#FEF3C7" />
  </svg>
);

export const BackpackIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Handle */}
    <path d="M20 13 C20 9 28 9 28 13" fill="none" stroke="#4C1D95" strokeWidth="2.5" />
    {/* Main backpack */}
    <rect x="12" y="13" width="24" height="28" rx="6" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="2" />
    {/* Front pocket */}
    <rect x="15" y="25" width="18" height="13" rx="3" fill="#A78BFA" stroke="#5B21B6" strokeWidth="1.5" />
    {/* Zipper details */}
    <line x1="16" y1="18" x2="32" y2="18" stroke="#FDE047" strokeWidth="1.5" />
    <line x1="18" y1="28" x2="30" y2="28" stroke="#FDE047" strokeWidth="1.5" />
  </svg>
);

export const MysteryBoxIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="mystery-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <rect x="10" y="14" width="28" height="26" rx="4" fill="url(#mystery-grad)" stroke="#3730A3" strokeWidth="2" />
    {/* Gold question mark */}
    <text
      x="24"
      y="32"
      textAnchor="middle"
      fill="#FDE047"
      fontSize="20"
      fontWeight="900"
      fontFamily="Nunito, sans-serif"
    >
      ?
    </text>
  </svg>
);

export const renderItemIcon = (icon: string, kg: number, size = 36, className = '') => {
  switch (icon) {
    case 'weight':
      return <WeightIcon kg={kg} size={size} className={className} />;
    case 'rice':
      return <RiceBagIcon size={size} className={className} />;
    case 'toybox':
      return <ToyBoxIcon size={size} className={className} />;
    case 'fruit':
      return <FruitBasketIcon size={size} className={className} />;
    case 'watermelon':
      return <WatermelonIcon size={size} className={className} />;
    case 'jug':
      return <WaterJugIcon size={size} className={className} />;
    case 'bear':
      return <BearIcon size={size} className={className} />;
    case 'backpack':
      return <BackpackIcon size={size} className={className} />;
    case 'mystery':
      return <MysteryBoxIcon size={size} className={className} />;
    default:
      return <WeightIcon kg={kg} size={size} className={className} />;
  }
};
