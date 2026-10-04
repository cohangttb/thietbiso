/**
 * Shared Type Definitions for Toán 2 - Cân đĩa & Đồng hồ
 */

export type AppTab = 'home' | 'balance' | 'clock' | 'guide';

// ======================== CÂN ĐĨA ========================

export type ScaleItemType = 'weight' | 'object';

export interface ScaleItem {
  id: string; // unique instance id on pan or in inventory
  type: ScaleItemType;
  name: string;
  weight: number; // in kg (integer 1..10)
  icon: string; // SVG icon key
  color: string; // theme color
  description?: string;
  isMystery?: boolean; // if true, weight number is hidden on card
}

export type BalanceSubMode = 'explore' | 'challenge';

export type BalanceChallengeType = 'compare' | 'balance' | 'mystery';

export interface BalanceChallenge {
  id: string;
  type: BalanceChallengeType;
  title: string;
  question: string;
  hint: string;
  initialLeftItems: ScaleItem[];
  initialRightItems: ScaleItem[];
  availableWeights: number[]; // weights allowed to add e.g. [1, 2, 5]
  targetAnswer?: 'left' | 'right' | 'equal' | number; // For compare ('left'|'right'|'equal') or mystery weight number
}

// ======================== ĐỒNG HỒ ========================

export type ClockSubMode = 'explore' | 'quiz' | 'set_time';

export type ClockDifficultyLevel = 1 | 2 | 3;
// Level 1: Giờ đúng (1:00, 2:00, ..., 12:00)
// Level 2: Giờ đúng và giờ rưỡi (X:00 & X:30) [Mặc định Toán lớp 2]
// Level 3: Các mốc 5 phút (X:00, X:05, ..., X:55) [Mở rộng giáo viên bật]

export interface ClockQuizQuestion {
  id: string;
  targetHours: number; // 1..12
  targetMinutes: number; // 0..59
  options?: string[]; // for quiz mode (3 distinct multiple choice options)
  correctOptionIndex?: number;
  prompt: string;
  hint: string;
}

// ======================== BÀI TẬP & KẾT QUẢ ========================

export interface QuizRoundState {
  currentQuestionIndex: number; // 0..4 (5 questions)
  totalQuestions: number; // 5
  firstTryCorrectCount: number;
  hintUsedCount: number;
  isCompleted: boolean;
  history: {
    questionText: string;
    attempts: number;
    usedHint: boolean;
    isCorrect: boolean;
  }[];
}

export interface PracticeHistoryRecord {
  id: string;
  date: string;
  module: 'balance' | 'clock';
  subType: string;
  firstTryCorrect: number;
  total: number;
  hintsUsed: number;
}

// ======================== CÀI ĐẶT GIÁO VIÊN ========================

export interface TeacherSettings {
  clockLevel: ClockDifficultyLevel;
  allowHints: boolean;
  showMassValuesOnBalance: boolean;
  showDigitalClockDefault: boolean;
}
