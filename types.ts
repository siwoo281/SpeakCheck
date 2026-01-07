export type Tab = 'warmup' | 'checklist' | 'notes';

export type UserCondition = 'very-nervous' | 'nervous' | 'normal' | 'calm' | 'confident';

export interface Exercise {
  id: string;
  title: string;
  subtitle: string;
  category: 'muscle' | 'diction' | 'breathing' | 'mental'; // 운동 종류 구분: 근육 이완 vs 발음 훈련 vs 호흡/이완 vs 멘탈 케어
  duration: number; // 초 단위
  timeLeft: number;
  isActive: boolean;
  isLocked: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: 'Tech Setup' | 'Personal' | 'Mindset';
  completed: boolean;
  meta?: string; // 예: "거울 보고 2분"
}

export interface NoteSection {
  id: string;
  step: number;
  title: string;
  points: string[];
  isExpanded: boolean;
}
