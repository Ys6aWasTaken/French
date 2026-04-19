export type Grade = 'G10S1' | 'G10S2' | 'G11S1' | 'G11S2' | 'G12';
export type QuizType = 'multiple-choice' | 'typing' | 'fill-blank' | 'listening';
export type PageId = 'dashboard' | 'learn' | 'quiz' | 'exam' | 'analytics' | 'import-export' | 'teacher';

export interface VocabCard {
  id: string;
  french: string;
  english: string;
  gender?: 'masculine' | 'feminine' | 'n/a';
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';
  exampleSentences: { french: string; english: string }[];
  examUsage?: string;
  grade: Grade;
  unit: number;
  tags: string[];
}

export interface CardProgress {
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
  totalAttempts: number;
  correctAttempts: number;
  totalResponseTime: number;
  history: QuizAttempt[];
  learned: boolean;
}

export interface QuizAttempt {
  timestamp: number;
  correct: boolean;
  responseTime: number;
  quizType: QuizType;
  userAnswer: string;
}

export interface UserProfile {
  streakDays: number;
  lastActiveDate: string;
  longestStreak: number;
  totalXP: number;
  dailyGoal: number;
  todayXP: number;
  todayDate: string;
}

export const GRADE_LABELS: Record<Grade, string> = {
  G10S1: 'Grade 10 — Semester 1',
  G10S2: 'Grade 10 — Semester 2',
  G11S1: 'Grade 11 — Semester 1',
  G11S2: 'Grade 11 — Semester 2',
  G12: 'Grade 12',
};

export const GRADE_SHORT: Record<Grade, string> = {
  G10S1: 'G10 S1',
  G10S2: 'G10 S2',
  G11S1: 'G11 S1',
  G11S2: 'G11 S2',
  G12: 'G12',
};

export const ALL_GRADES: Grade[] = ['G10S1', 'G10S2', 'G11S1', 'G11S2', 'G12'];
