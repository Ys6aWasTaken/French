import type { Grade, VocabCard } from '../types';
import { ALL_GRADES } from '../types';

const VALID_PARTS_OF_SPEECH: VocabCard['partOfSpeech'][] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'phrase',
  'other',
];

const VALID_GENDERS: Array<NonNullable<VocabCard['gender']>> = ['masculine', 'feminine', 'n/a'];

function isGrade(value: string): value is Grade {
  return (ALL_GRADES as string[]).includes(value);
}

function parseExamples(raw: string): Array<{ french: string; english: string }> {
  if (!raw.trim()) return [];
  return raw
    .split('||')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [french = '', english = ''] = entry.split('=>');
      return { french: french.trim(), english: english.trim() };
    })
    .filter((example) => example.french.length > 0 || example.english.length > 0);
}

export function parseCardsText(text: string): { cards: VocabCard[]; errors: string[] } {
  const lines = text.split(/\r?\n/);
  const cards: VocabCard[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const parts = line.split('\t');
    if (parts.length < 10) {
      errors.push(`Line ${index + 1}: expected 10 tab-separated columns, got ${parts.length}`);
      return;
    }

    const [id, french, english, partOfSpeechRaw, gradeRaw, unitRaw, genderRaw, examUsageRaw, tagsRaw, examplesRaw] =
      parts.map((p) => p.trim());

    if (!id || !french || !english) {
      errors.push(`Line ${index + 1}: id, french, and english are required`);
      return;
    }

    if (!isGrade(gradeRaw)) {
      errors.push(`Line ${index + 1}: invalid grade "${gradeRaw}"`);
      return;
    }

    const unit = Number(unitRaw);
    if (!Number.isFinite(unit) || unit < 1) {
      errors.push(`Line ${index + 1}: invalid unit "${unitRaw}"`);
      return;
    }

    const partOfSpeech = VALID_PARTS_OF_SPEECH.includes(partOfSpeechRaw as VocabCard['partOfSpeech'])
      ? (partOfSpeechRaw as VocabCard['partOfSpeech'])
      : 'other';

    const gender = VALID_GENDERS.includes(genderRaw as NonNullable<VocabCard['gender']>)
      ? (genderRaw as NonNullable<VocabCard['gender']>)
      : undefined;

    const tags = tagsRaw ? tagsRaw.split('|').map((t) => t.trim()).filter(Boolean) : [];

    cards.push({
      id,
      french,
      english,
      partOfSpeech,
      grade: gradeRaw,
      unit,
      ...(gender ? { gender } : {}),
      ...(examUsageRaw ? { examUsage: examUsageRaw } : {}),
      tags,
      exampleSentences: parseExamples(examplesRaw ?? ''),
    });
  });

  return { cards, errors };
}
