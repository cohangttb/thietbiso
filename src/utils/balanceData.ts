import { ScaleItem, BalanceChallenge } from '../types';

export const STANDARD_WEIGHTS = [
  { weight: 1, name: 'Quả cân 1 kg', icon: 'weight', color: '#EAB308' },
  { weight: 2, name: 'Quả cân 2 kg', icon: 'weight', color: '#CA8A04' },
  { weight: 5, name: 'Quả cân 5 kg', icon: 'weight', color: '#A16207' },
];

export const AVAILABLE_OBJECTS = [
  { name: 'Túi gạo', weight: 3, icon: 'rice', color: '#F59E0B' },
  { name: 'Túi gạo lớn', weight: 5, icon: 'rice', color: '#D97706' },
  { name: 'Hộp đồ chơi', weight: 2, icon: 'toybox', color: '#3B82F6' },
  { name: 'Hộp xếp hình', weight: 4, icon: 'toybox', color: '#2563EB' },
  { name: 'Giỏ trái cây', weight: 2, icon: 'fruit', color: '#EA580C' },
  { name: 'Giỏ cam táo', weight: 3, icon: 'fruit', color: '#C2410C' },
  { name: 'Quả dưa hấu', weight: 3, icon: 'watermelon', color: '#16A34A' },
  { name: 'Dưa hấu to', weight: 4, icon: 'watermelon', color: '#15803D' },
  { name: 'Bình nước', weight: 5, icon: 'jug', color: '#0284C7' },
  { name: 'Bình nước lớn', weight: 6, icon: 'jug', color: '#0369A1' },
  { name: 'Gấu bông nhỏ', weight: 1, icon: 'bear', color: '#F59E0B' },
  { name: 'Ba lô học sinh', weight: 2, icon: 'backpack', color: '#8B5CF6' },
  { name: 'Ba lô sách vở', weight: 3, icon: 'backpack', color: '#7C3AED' },
];

let itemUidCounter = 1;
export function createScaleItem(base: { name: string; weight: number; icon: string; color: string; type?: 'weight' | 'object'; isMystery?: boolean }): ScaleItem {
  return {
    id: `item-${Date.now()}-${itemUidCounter++}`,
    name: base.name,
    weight: base.weight,
    icon: base.icon,
    color: base.color,
    type: base.type || (base.icon === 'weight' ? 'weight' : 'object'),
    isMystery: base.isMystery || false,
  };
}

/**
 * Generate a set of 5 deterministic, diverse balance challenges for a practice round.
 */
export function generateBalanceRound(): BalanceChallenge[] {
  const challenges: BalanceChallenge[] = [
    // Câu 1: So sánh bên nặng hơn (Dễ - trực quan)
    {
      id: 'bal-1',
      type: 'compare',
      title: 'So sánh khối lượng',
      question: 'Quan sát cân đĩa và cho biết: Bên nào nặng hơn?',
      hint: 'Hãy nhìn đòn cân: Đĩa cân bên nào hạ xuống thấp hơn thì bên đó nặng hơn đấy!',
      initialLeftItems: [
        createScaleItem({ name: 'Quả dưa hấu', weight: 4, icon: 'watermelon', color: '#15803D' }),
      ],
      initialRightItems: [
        createScaleItem({ name: 'Quả cân 2 kg', weight: 2, icon: 'weight', color: '#CA8A04' }),
      ],
      availableWeights: [1, 2, 5],
      targetAnswer: 'left',
    },

    // Câu 2: Thêm quả cân để làm thăng bằng (4 kg = ? + ?)
    {
      id: 'bal-2',
      type: 'balance',
      title: 'Làm cân thăng bằng',
      question: 'Đĩa trái có hộp xếp hình nặng 4 kg. Em hãy đặt thêm quả cân vào đĩa phải để cân thăng bằng.',
      hint: 'Đĩa trái đang có 4 kg. Em cần đặt các quả cân vào đĩa phải sao cho tổng khối lượng cũng bằng 4 kg (ví dụ hai quả 2 kg, hoặc 1 kg và 2 kg,...).',
      initialLeftItems: [
        createScaleItem({ name: 'Hộp xếp hình', weight: 4, icon: 'toybox', color: '#2563EB' }),
      ],
      initialRightItems: [],
      availableWeights: [1, 2, 5],
      targetAnswer: 'equal',
    },

    // Câu 3: So sánh bên nhẹ hơn
    {
      id: 'bal-3',
      type: 'compare',
      title: 'Tìm bên nhẹ hơn',
      question: 'Quan sát cân đĩa: Bên nào nhẹ hơn?',
      hint: 'Bên nhẹ hơn sẽ bị đòn cân đẩy nâng lên cao hơn.',
      initialLeftItems: [
        createScaleItem({ name: 'Gấu bông', weight: 1, icon: 'bear', color: '#F59E0B' }),
        createScaleItem({ name: 'Quả cân 1 kg', weight: 1, icon: 'weight', color: '#EAB308' }),
      ],
      initialRightItems: [
        createScaleItem({ name: 'Bình nước', weight: 5, icon: 'jug', color: '#0284C7' }),
      ],
      availableWeights: [1, 2, 5],
      targetAnswer: 'left',
    },

    // Câu 4: Thăng bằng với tổng khối lượng lớn hơn (5 kg = quả cân ?)
    {
      id: 'bal-4',
      type: 'balance',
      title: 'Làm cân thăng bằng',
      question: 'Đĩa trái có túi gạo 5 kg và hộp đồ chơi 2 kg (tổng 7 kg). Hãy đặt các quả cân vào đĩa phải để cân thăng bằng.',
      hint: 'Hãy tính tổng khối lượng đĩa trái: 5 kg + 2 kg = 7 kg. Vậy đĩa phải cũng cần tổng là 7 kg. Em có thể dùng 1 quả 5 kg và 1 quả 2 kg!',
      initialLeftItems: [
        createScaleItem({ name: 'Túi gạo', weight: 5, icon: 'rice', color: '#D97706' }),
        createScaleItem({ name: 'Hộp đồ chơi', weight: 2, icon: 'toybox', color: '#3B82F6' }),
      ],
      initialRightItems: [],
      availableWeights: [1, 2, 5],
      targetAnswer: 'equal',
    },

    // Câu 5: Tìm khối lượng vật bí ẩn
    {
      id: 'bal-5',
      type: 'mystery',
      title: 'Tìm khối lượng vật bí ẩn',
      question: 'Hộp quà bí ẩn ở đĩa trái nặng bao nhiêu kg? Em hãy đặt các quả cân vào đĩa phải đến khi cân thăng bằng để tìm đáp án!',
      hint: 'Khi hai đĩa cân thăng bằng, khối lượng hộp quà sẽ đúng bằng tổng khối lượng các quả cân em đã đặt ở đĩa phải!',
      initialLeftItems: [
        createScaleItem({
          name: 'Hộp quà bí ẩn',
          weight: 3,
          icon: 'mystery',
          color: '#4F46E5',
          isMystery: true,
        }),
      ],
      initialRightItems: [],
      availableWeights: [1, 2, 5],
      targetAnswer: 3,
    },
  ];

  return challenges;
}
