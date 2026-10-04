import { ClockQuizQuestion, ClockDifficultyLevel } from '../types';

export function formatClockTimeVietnamese(h: number, m: number): string {
  if (m === 0) {
    return `${h} giờ`;
  } else if (m === 30) {
    return `${h} giờ 30 phút`;
  } else {
    return `${h} giờ ${m} phút`;
  }
}

/**
 * Generate 5 questions for Quiz mode (Đọc giờ - 3 lựa chọn trắc nghiệm)
 */
export function generateClockQuizQuestions(level: ClockDifficultyLevel): ClockQuizQuestion[] {
  // Candidate pool based on difficulty level
  const pool: { h: number; m: number }[] = [];

  if (level === 1) {
    // Only exact hours
    const hoursList = [2, 5, 8, 10, 12, 3, 7, 9, 4, 11, 1, 6];
    hoursList.forEach((h) => pool.push({ h, m: 0 }));
  } else if (level === 2) {
    // Standard Grade 2: exact hours & half hours
    pool.push(
      { h: 3, m: 30 },
      { h: 7, m: 0 },
      { h: 8, m: 30 },
      { h: 11, m: 0 },
      { h: 5, m: 30 },
      { h: 12, m: 0 },
      { h: 9, m: 30 },
      { h: 2, m: 0 }
    );
  } else {
    // Extended 5-minute intervals
    pool.push(
      { h: 4, m: 15 },
      { h: 8, m: 30 },
      { h: 10, m: 45 },
      { h: 2, m: 20 },
      { h: 6, m: 50 },
      { h: 9, m: 0 },
      { h: 1, m: 35 }
    );
  }

  // Shuffle pool and take 5 questions
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  return selected.map((item, index) => {
    const correctLabel = formatClockTimeVietnamese(item.h, item.m);

    // Create 2 distractors ensuring no duplicates
    const distractors: string[] = [];

    // Distractor 1: Same hour, different minute (or neighbor hour)
    if (item.m === 0) {
      distractors.push(formatClockTimeVietnamese(item.h, 30));
    } else if (item.m === 30) {
      distractors.push(formatClockTimeVietnamese(item.h, 0));
    } else {
      distractors.push(formatClockTimeVietnamese(item.h, (item.m + 15) % 60));
    }

    // Distractor 2: Different hour, same minute
    const altHour = item.h === 12 ? 1 : item.h + 1;
    distractors.push(formatClockTimeVietnamese(altHour, item.m));

    // Ensure all 3 options are unique
    const uniqueDistractors = distractors.filter((d) => d !== correctLabel);
    if (uniqueDistractors.length < 2) {
      const backupHour = item.h === 1 ? 12 : item.h - 1;
      uniqueDistractors.push(formatClockTimeVietnamese(backupHour, item.m === 0 ? 30 : 0));
    }

    const allOptions = [correctLabel, uniqueDistractors[0], uniqueDistractors[1]];
    // Shuffle options
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOptions.indexOf(correctLabel);

    let hint = '';
    if (item.m === 0) {
      hint = `Em hãy nhìn: Kim dài màu đỏ đang chỉ số 12 (nghĩa là đúng giờ), kim ngắn màu xanh chỉ số ${item.h}.`;
    } else if (item.m === 30) {
      hint = `Em hãy quan sát: Kim dài màu đỏ đang chỉ số 6 (nghĩa là 30 phút), kim ngắn màu xanh nằm ở khoảng giữa số ${item.h} và ${item.h === 12 ? 1 : item.h + 1}.`;
    } else {
      hint = `Kim ngắn màu xanh chỉ giờ, kim dài màu đỏ chỉ số phút (mỗi số cách nhau 5 phút).`;
    }

    return {
      id: `clock-quiz-${index + 1}`,
      targetHours: item.h,
      targetMinutes: item.m,
      prompt: 'Đồng hồ đang chỉ mấy giờ?',
      hint,
      options: shuffledOptions,
      correctOptionIndex: correctIndex,
    };
  });
}

/**
 * Generate 5 questions for Set Time mode (Đặt giờ)
 */
export function generateClockSetQuestions(level: ClockDifficultyLevel): ClockQuizQuestion[] {
  const pool: { h: number; m: number }[] = [];

  if (level === 1) {
    pool.push(
      { h: 4, m: 0 },
      { h: 7, m: 0 },
      { h: 9, m: 0 },
      { h: 1, m: 0 },
      { h: 10, m: 0 }
    );
  } else if (level === 2) {
    pool.push(
      { h: 8, m: 30 },
      { h: 2, m: 0 },
      { h: 10, m: 30 },
      { h: 5, m: 0 },
      { h: 6, m: 30 }
    );
  } else {
    pool.push(
      { h: 3, m: 15 },
      { h: 7, m: 30 },
      { h: 9, m: 45 },
      { h: 11, m: 20 },
      { h: 4, m: 50 }
    );
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  return selected.map((item, index) => {
    const timeText = formatClockTimeVietnamese(item.h, item.m);
    let hint = '';
    if (item.m === 0) {
      hint = `Để đặt ${item.h} giờ đúng: Chỉnh kim dài màu đỏ chỉ thẳng vào số 12, và kim ngắn màu xanh chỉ đúng số ${item.h}.`;
    } else if (item.m === 30) {
      hint = `Để đặt ${item.h} giờ 30 phút: Chỉnh kim dài màu đỏ chỉ thẳng vào số 6 (30 phút), kim ngắn màu xanh sẽ nằm giữa số ${item.h} và số ${item.h === 12 ? 1 : item.h + 1}.`;
    } else {
      hint = `Chỉnh kim ngắn về khoảng ${item.h} giờ và kim dài đến vạch ${item.m} phút.`;
    }

    return {
      id: `clock-set-${index + 1}`,
      targetHours: item.h,
      targetMinutes: item.m,
      prompt: `Em hãy đặt đồng hồ chỉ ${timeText}`,
      hint,
    };
  });
}
