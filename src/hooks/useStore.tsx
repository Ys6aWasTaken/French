import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { VocabCard, CardProgress, UserProfile, Grade, QuizType, QuizAttempt } from '../types';
import { ALL_GRADES } from '../types';
import { sampleCards } from '../data';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function calculateNextReview(
  progress: CardProgress,
  quality: number,
  responseTime: number
): CardProgress {
  const now = Date.now();
  let { easeFactor, interval, repetitions } = progress;
  const timeBonus = responseTime < 3000 ? 0.5 : responseTime < 6000 ? 0 : -0.5;
  const adjustedQuality = Math.max(0, Math.min(5, quality + timeBonus));

  if (adjustedQuality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else if (repetitions === 2) interval = 7;
    else interval = Math.min(Math.round(interval * easeFactor), 21);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - adjustedQuality) * (0.08 + (5 - adjustedQuality) * 0.02)));
  return {
    ...progress,
    easeFactor,
    interval,
    repetitions,
    nextReview: now + interval * 86400000,
    lastReview: now,
    totalAttempts: progress.totalAttempts + 1,
    correctAttempts: progress.correctAttempts + (quality >= 3 ? 1 : 0),
    totalResponseTime: progress.totalResponseTime + responseTime,
    learned: repetitions >= 2,
  };
}

interface StoreContextType {
  cards: VocabCard[];
  progress: Record<string, CardProgress>;
  profile: UserProfile;
  getCardsByGrade: (grade: Grade | 'all') => VocabCard[];
  getDueCards: (grade?: Grade | 'all') => VocabCard[];
  getNewCards: (grade?: Grade | 'all') => VocabCard[];
  getLearnedCards: (grade?: Grade | 'all') => VocabCard[];
  reviewCard: (cardId: string, correct: boolean, responseTime: number, quizType: QuizType, userAnswer: string) => void;
  importCards: (text: string) => { imported: number; errors: string[] };
  exportCards: (grade?: Grade | 'all') => string;
  addXP: (amount: number) => void;
  getRetentionScore: (cardId: string) => number;
  getAccuracy: (cardId: string) => number;
  getAvgResponseTime: (cardId: string) => number;
  getGradeStats: (grade: Grade) => { total: number; learned: number; accuracy: number; due: number };
  resetProgress: () => void;
  deleteCard: (cardId: string) => void;
  getAdaptiveDifficulty: (cardId: string) => QuizType;
  getWeakCards: (grade?: Grade | 'all', limit?: number) => VocabCard[];
  getStrongCards: (grade?: Grade | 'all', limit?: number) => VocabCard[];
  getOverallAccuracy: (grade?: Grade | 'all') => number;
  getOverallRetention: (grade?: Grade | 'all') => number;
  getTotalDue: () => number;
  getTotalLearned: () => number;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useLocalStorage<VocabCard[]>('fm_cards', sampleCards);
  const [progress, setProgress] = useLocalStorage<Record<string, CardProgress>>('fm_progress', {});
  const [profile, setProfile] = useLocalStorage<UserProfile>('fm_profile', {
    streakDays: 0, lastActiveDate: '', longestStreak: 0,
    totalXP: 0, dailyGoal: 50, todayXP: 0,
    todayDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setProfile(prev => {
      if (prev.todayDate !== today) {
        const streak = prev.lastActiveDate === yesterday ? prev.streakDays : 0;
        return { ...prev, todayDate: today, todayXP: 0, streakDays: streak };
      }
      return prev;
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => {
      const isNewDay = prev.lastActiveDate !== today;
      const newStreak = isNewDay ? prev.streakDays + 1 : prev.streakDays;
      return {
        ...prev, totalXP: prev.totalXP + amount,
        todayXP: (prev.todayDate === today ? prev.todayXP : 0) + amount,
        todayDate: today, lastActiveDate: today, streakDays: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
      };
    });
  }, [setProfile]);

  const getCardsByGrade = useCallback((grade: Grade | 'all') => {
    if (grade === 'all') return cards;
    return cards.filter(c => c.grade === grade);
  }, [cards]);

  const getDueCards = useCallback((grade: Grade | 'all' = 'all') => {
    const now = Date.now();
    return getCardsByGrade(grade).filter(card => {
      const p = progress[card.id];
      return p && p.nextReview <= now;
    });
  }, [getCardsByGrade, progress]);

  const getNewCards = useCallback((grade: Grade | 'all' = 'all') => {
    return getCardsByGrade(grade).filter(card => !progress[card.id]);
  }, [getCardsByGrade, progress]);

  const getLearnedCards = useCallback((grade: Grade | 'all' = 'all') => {
    return getCardsByGrade(grade).filter(card => progress[card.id]?.learned);
  }, [getCardsByGrade, progress]);

  const reviewCard = useCallback((
    cardId: string, correct: boolean, responseTime: number, quizType: QuizType, userAnswer: string
  ) => {
    const quality = correct ? (responseTime < 3000 ? 5 : responseTime < 6000 ? 4 : 3) : (responseTime < 3000 ? 2 : 1);
    const attempt: QuizAttempt = { timestamp: Date.now(), correct, responseTime, quizType, userAnswer };
    setProgress(prev => {
      const existing = prev[cardId] || {
        cardId, easeFactor: 2.5, interval: 0, repetitions: 0,
        nextReview: 0, lastReview: 0, totalAttempts: 0,
        correctAttempts: 0, totalResponseTime: 0, history: [], learned: false,
      };
      const updated = calculateNextReview(existing, quality, responseTime);
      updated.history = [...existing.history, attempt].slice(-50);
      return { ...prev, [cardId]: updated };
    });
    addXP(correct ? 10 : 3);
  }, [setProgress, addXP]);

  const importCards = useCallback((text: string) => {
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const errors: string[] = [];
    const newCards: VocabCard[] = [];
    const validGrades: Grade[] = ALL_GRADES;

    lines.forEach((line, i) => {
      const parts = line.split('\t');
      if (parts.length < 2) {
        errors.push(`Line ${i + 1}: Need at least 2 tab-separated fields (french, english)`);
        return;
      }
      const [french, english, example, grade, tags] = parts;
      const cardGrade = validGrades.includes(grade?.trim() as Grade) ? grade.trim() as Grade : 'G10S1';
      newCards.push({
        id: `imp_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        french: french.trim(), english: english.trim(),
        partOfSpeech: 'other', grade: cardGrade, unit: 1,
        exampleSentences: example?.trim() ? [{ french: example.trim(), english: '' }] : [],
        tags: tags?.trim() ? tags.trim().split(' ').filter(Boolean) : ['imported'],
      });
    });
    if (newCards.length > 0) setCards(prev => [...prev, ...newCards]);
    return { imported: newCards.length, errors };
  }, [setCards]);

  const exportCards = useCallback((grade: Grade | 'all' = 'all') => {
    const exportable = getCardsByGrade(grade);
    const header = '#separator:tab\n#columns:french\tenglish\texample\tgrade\ttags\n';
    const lines = exportable.map(c => {
      const ex = c.exampleSentences[0]?.french || '';
      return `${c.french}\t${c.english}\t${ex}\t${c.grade}\t${c.tags.join(' ')}`;
    });
    return header + lines.join('\n');
  }, [getCardsByGrade]);

  const getRetentionScore = useCallback((cardId: string) => {
    const p = progress[cardId];
    if (!p || p.totalAttempts === 0) return 0;
    const accuracy = p.correctAttempts / p.totalAttempts;
    const recency = Math.max(0, 1 - (Date.now() - p.lastReview) / (7 * 86400000));
    return Math.round((accuracy * 0.7 + recency * 0.3) * 100);
  }, [progress]);

  const getAccuracy = useCallback((cardId: string) => {
    const p = progress[cardId];
    if (!p || p.totalAttempts === 0) return 0;
    return Math.round((p.correctAttempts / p.totalAttempts) * 100);
  }, [progress]);

  const getAvgResponseTime = useCallback((cardId: string) => {
    const p = progress[cardId];
    if (!p || p.totalAttempts === 0) return 0;
    return Math.round(p.totalResponseTime / p.totalAttempts);
  }, [progress]);

  const getGradeStats = useCallback((grade: Grade) => {
    const gradeCards = cards.filter(c => c.grade === grade);
    const total = gradeCards.length;
    const learned = gradeCards.filter(c => progress[c.id]?.learned).length;
    const reviewed = gradeCards.filter(c => progress[c.id]?.totalAttempts);
    const due = gradeCards.filter(c => { const p = progress[c.id]; return p && p.nextReview <= Date.now(); }).length;
    let accuracy = 0;
    if (reviewed.length > 0) {
      const totalCorrect = reviewed.reduce((s, c) => s + (progress[c.id]?.correctAttempts || 0), 0);
      const totalAttempts = reviewed.reduce((s, c) => s + (progress[c.id]?.totalAttempts || 0), 0);
      accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    }
    return { total, learned, accuracy, due };
  }, [cards, progress]);

  const getAdaptiveDifficulty = useCallback((cardId: string): QuizType => {
    const p = progress[cardId];
    if (!p || p.totalAttempts < 2) return 'multiple-choice';
    const acc = p.correctAttempts / p.totalAttempts;
    if (acc >= 0.9) return 'listening';
    if (acc >= 0.7) return 'typing';
    if (acc >= 0.5) return 'fill-blank';
    return 'multiple-choice';
  }, [progress]);

  const getWeakCards = useCallback((grade: Grade | 'all' = 'all', limit = 10) => {
    const gradeCards = getCardsByGrade(grade).filter(c => progress[c.id]?.totalAttempts);
    return gradeCards
      .sort((a, b) => getAccuracy(a.id) - getAccuracy(b.id))
      .slice(0, limit);
  }, [getCardsByGrade, progress, getAccuracy]);

  const getStrongCards = useCallback((grade: Grade | 'all' = 'all', limit = 10) => {
    const gradeCards = getCardsByGrade(grade).filter(c => progress[c.id]?.totalAttempts);
    return gradeCards
      .sort((a, b) => getAccuracy(b.id) - getAccuracy(a.id))
      .slice(0, limit);
  }, [getCardsByGrade, progress, getAccuracy]);

  const getOverallAccuracy = useCallback((grade: Grade | 'all' = 'all') => {
    const gradeCards = getCardsByGrade(grade).filter(c => progress[c.id]?.totalAttempts);
    if (gradeCards.length === 0) return 0;
    const tc = gradeCards.reduce((s, c) => s + (progress[c.id]?.correctAttempts || 0), 0);
    const ta = gradeCards.reduce((s, c) => s + (progress[c.id]?.totalAttempts || 0), 0);
    return ta > 0 ? Math.round((tc / ta) * 100) : 0;
  }, [getCardsByGrade, progress]);

  const getOverallRetention = useCallback((grade: Grade | 'all' = 'all') => {
    const gradeCards = getCardsByGrade(grade).filter(c => progress[c.id]?.totalAttempts);
    if (gradeCards.length === 0) return 0;
    const scores = gradeCards.map(c => getRetentionScore(c.id));
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }, [getCardsByGrade, progress, getRetentionScore]);

  const getTotalDue = useCallback(() => getDueCards('all').length, [getDueCards]);
  const getTotalLearned = useCallback(() => getLearnedCards('all').length, [getLearnedCards]);

  const resetProgress = useCallback(() => {
    setProgress({});
    setProfile({
      streakDays: 0, lastActiveDate: '', longestStreak: 0,
      totalXP: 0, dailyGoal: 50, todayXP: 0,
      todayDate: new Date().toISOString().split('T')[0],
    });
  }, [setProgress, setProfile]);

  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    setProgress(prev => { const copy = { ...prev }; delete copy[cardId]; return copy; });
  }, [setCards, setProgress]);

  return (
    <StoreContext.Provider value={{
      cards, progress, profile,
      getCardsByGrade, getDueCards, getNewCards, getLearnedCards,
      reviewCard, importCards, exportCards, addXP,
      getRetentionScore, getAccuracy, getAvgResponseTime,
      getGradeStats, resetProgress, deleteCard,
      getAdaptiveDifficulty, getWeakCards, getStrongCards,
      getOverallAccuracy, getOverallRetention,
      getTotalDue, getTotalLearned,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
