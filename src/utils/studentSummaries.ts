import type { CardProgress, UserProfile, VocabCard } from '../types';

const ACCOUNTS_REGISTRY_KEY = 'fm_accounts_registry';

interface AccountRecord {
  password: string;
  role: 'teacher' | 'student';
}

function loadAccounts(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AccountRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function retentionScore(p: CardProgress): number {
  if (!p || p.totalAttempts === 0) return 0;
  const accuracy = p.correctAttempts / p.totalAttempts;
  const recency = Math.max(0, 1 - (Date.now() - p.lastReview) / (7 * 86400000));
  return Math.round((accuracy * 0.7 + recency * 0.3) * 100);
}

function accuracyPercent(p: CardProgress): number {
  if (!p || p.totalAttempts === 0) return 0;
  return Math.round((p.correctAttempts / p.totalAttempts) * 100);
}

export interface StudentSummary {
  id: string;
  username: string;
  accuracy: number;
  retention: number;
  learned: number;
  total: number;
  streak: number;
  weakAreas: string[];
  totalXP: number;
}

function readScoped<T>(username: string, suffix: string): T | null {
  const id = encodeURIComponent(username);
  const raw = localStorage.getItem(`fm_u_${id}_${suffix}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Aggregates every registered student account from localStorage (same device). */
export function getRegisteredStudentSummaries(): StudentSummary[] {
  const accounts = loadAccounts();
  const rows: StudentSummary[] = [];

  for (const [username, rec] of Object.entries(accounts)) {
    if (rec.role !== 'student') continue;

    const progress = readScoped<Record<string, CardProgress>>(username, 'progress') ?? {};
    const cards = readScoped<VocabCard[]>(username, 'cards') ?? [];
    const profile = readScoped<UserProfile>(username, 'profile');

    const cardById = new Map(cards.map(c => [c.id, c]));
    const entries = Object.values(progress).filter(p => p.totalAttempts > 0);
    let overallAccuracy = 0;
    if (entries.length > 0) {
      const tc = entries.reduce((s, p) => s + p.correctAttempts, 0);
      const ta = entries.reduce((s, p) => s + p.totalAttempts, 0);
      overallAccuracy = ta > 0 ? Math.round((tc / ta) * 100) : 0;
    }

    let overallRetention = 0;
    if (entries.length > 0) {
      const scores = entries.map(p => retentionScore(p));
      overallRetention = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    }

    const learned = Object.values(progress).filter(p => p.learned).length;
    const total = cards.length;

    const byAccuracy = [...entries].sort((a, b) => accuracyPercent(a) - accuracyPercent(b));
    const weakAreas: string[] = [];
    const seen = new Set<string>();
    for (const pr of byAccuracy.slice(0, 4)) {
      const card = cardById.get(pr.cardId);
      if (!card?.tags?.length) continue;
      for (const t of card.tags) {
        if (!seen.has(t)) {
          seen.add(t);
          weakAreas.push(t);
          if (weakAreas.length >= 4) break;
        }
      }
      if (weakAreas.length >= 4) break;
    }

    rows.push({
      id: username,
      username,
      accuracy: overallAccuracy,
      retention: overallRetention,
      learned,
      total,
      streak: profile?.streakDays ?? 0,
      weakAreas,
      totalXP: profile?.totalXP ?? 0,
    });
  }

  return rows.sort((a, b) => b.accuracy - a.accuracy);
}

export function subscribeStudentRoster(callback: () => void): () => void {
  const run = () => callback();
  window.addEventListener('fm-accounts-changed', run);
  window.addEventListener('fm-user-data-changed', run);
  window.addEventListener('storage', run);
  return () => {
    window.removeEventListener('fm-accounts-changed', run);
    window.removeEventListener('fm-user-data-changed', run);
    window.removeEventListener('storage', run);
  };
}
