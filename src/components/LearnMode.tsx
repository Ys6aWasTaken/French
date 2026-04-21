import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import type { Grade } from '../types';
import { GRADE_SHORT } from '../types';

interface Props {
  selectedGrade: Grade | 'all';
  onGradeSelect: (grade: Grade | 'all') => void;
}

export function LearnMode({ selectedGrade, onGradeSelect }: Props) {
  const store = useStore();
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState<'new' | 'review' | 'all'>('new');

  const cards = useMemo(() => {
    if (mode === 'new') return store.getNewCards(selectedGrade);
    if (mode === 'review') return store.getDueCards(selectedGrade);
    return store.getCardsByGrade(selectedGrade);
  }, [mode, selectedGrade, store]);

  const card = cards[cardIndex];
  const progress = card ? store.progress[card.id] : undefined;

  useEffect(() => {
    setCardIndex((prev) => {
      if (cards.length === 0) return 0;
      return Math.min(prev, cards.length - 1);
    });
    setShowAnswer(false);
  }, [cards.length, selectedGrade, mode]);

  const handleNext = () => {
    setShowAnswer(false);
    setCardIndex(i => Math.min(i + 1, cards.length - 1));
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCardIndex(i => Math.max(i - 1, 0));
  };

  const handleMarkLearned = (quality: number) => {
    if (!card) return;
    store.reviewCard(card.id, quality >= 3, quality >= 3 ? 2000 : 5000, 'multiple-choice', '');
    handleNext();
  };

  if (cards.length === 0) {
    return (
      <div className="p-7 lg:p-10 max-w-4xl mx-auto">
        <div className="text-center py-24 fade-up fade-up-1">
          <span className="text-5xl opacity-80">🎉</span>
          <h2 className="font-serif text-2xl font-light text-creme-100 mt-5">
            {mode === 'new' ? 'No new cards!' : mode === 'review' ? 'No cards due!' : 'No cards found'}
          </h2>
          <p className="text-creme-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {mode === 'new'
              ? 'You\'ve seen all available cards. Try importing more or switching grades.'
              : mode === 'review'
              ? 'All caught up! Come back later for reviews.'
              : 'No cards match this filter.'}
          </p>
          <div className="flex gap-3 justify-center mt-8">
            {(['new', 'review', 'all'] as const).filter(m => m !== mode).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setCardIndex(0); setShowAnswer(false); }}
                className="noir-btn px-5 py-2.5 text-[13px]"
              >
                Show {m === 'new' ? 'New' : m === 'review' ? 'Due' : 'All'} Cards
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 lg:p-10 max-w-4xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up fade-up-1">
        <div>
          <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">Learn Vocabulary</h2>
          <p className="text-creme-400 text-sm mt-1">
            {selectedGrade === 'all' ? 'All grades' : GRADE_SHORT[selectedGrade]} •{' '}
            Card {cardIndex + 1} of {cards.length}
          </p>
        </div>
        <div className="flex gap-2">
          {(['new', 'review', 'all'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setCardIndex(0); setShowAnswer(false); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-400 ${
                mode === m
                  ? 'text-creme-100'
                  : 'text-creme-400 hover:text-creme-200'
              }`}
              style={mode === m ? { background: 'rgba(58, 61, 92, 0.3)', border: '1px solid rgba(58, 61, 92, 0.2)' } : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)' }}
            >
              {m === 'new' ? `New (${store.getNewCards(selectedGrade).length})` :
               m === 'review' ? `Review (${store.getDueCards(selectedGrade).length})` :
               `All (${store.getCardsByGrade(selectedGrade).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 fade-up fade-up-2">
        {(['G10S1', 'G10S2', 'G11S1', 'G11S2', 'G12', 'all'] as const).map((grade) => (
          <button
            key={grade}
            onClick={() => {
              onGradeSelect(grade);
              setCardIndex(0);
              setShowAnswer(false);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 ${
              selectedGrade === grade ? 'text-creme-100' : 'text-creme-400 hover:text-creme-200'
            }`}
            style={
              selectedGrade === grade
                ? { background: 'rgba(122, 139, 109, 0.2)', border: '1px solid rgba(122, 139, 109, 0.3)' }
                : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.05)' }
            }
          >
            {grade === 'all' ? 'Study All Cards' : GRADE_SHORT[grade]}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="noir-progress h-1 fade-up fade-up-3">
        <div
          className="noir-progress-fill h-full"
          style={{ width: `${((cardIndex + 1) / cards.length) * 100}%`, background: 'linear-gradient(90deg, #3a3d5c, #b8943f)' }}
        />
      </div>

      {/* Card */}
      {card && (
        <div className="noir-card overflow-hidden fade-up fade-up-3">
          {/* French Word */}
          <div className="p-8 lg:p-10 text-center" style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.04)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              {card.gender && card.gender !== 'n/a' && (
                <span
                  className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                  style={{
                    background: card.gender === 'masculine' ? 'rgba(58, 61, 92, 0.15)' : 'rgba(139, 90, 66, 0.12)',
                    color: card.gender === 'masculine' ? '#7a7fb0' : '#b8856a',
                  }}
                >
                  {card.gender === 'masculine' ? '♂ masc' : '♀ fem'}
                </span>
              )}
              <span
                className="text-[10px] font-medium px-2.5 py-0.5 rounded-full text-creme-400"
                style={{ background: 'rgba(232, 227, 216, 0.04)' }}
              >
                {card.partOfSpeech}
              </span>
              <span
                className="text-[10px] font-medium px-2.5 py-0.5 rounded-full text-encre-light"
                style={{ background: 'rgba(58, 61, 92, 0.12)' }}
              >
                {GRADE_SHORT[card.grade]} • Unit {card.unit}
              </span>
            </div>
            <h3 className="font-serif text-4xl lg:text-5xl font-light text-creme-100 mt-4 italic">{card.french}</h3>

            {/* Progress info */}
            {progress && (
              <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-creme-500">
                <span>Accuracy: {store.getAccuracy(card.id)}%</span>
                <span className="opacity-30">•</span>
                <span>Retention: {store.getRetentionScore(card.id)}%</span>
                <span className="opacity-30">•</span>
                <span>Reviews: {progress.totalAttempts}</span>
              </div>
            )}
          </div>

          {/* Answer / Details */}
          {!showAnswer ? (
            <div className="p-8 lg:p-10 text-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="px-8 py-3 rounded-lg text-[14px] font-medium text-creme-100 hover-float"
                style={{ background: 'linear-gradient(135deg, #3a3d5c, #4f5375)', border: '1px solid rgba(79, 83, 117, 0.3)' }}
              >
                Show Answer
              </button>
            </div>
          ) : (
            <div className="p-8 lg:p-10 space-y-7" style={{ animation: 'crossfadeIn 350ms ease both' }}>
              {/* Translation */}
              <div className="text-center">
                <p className="text-[11px] text-creme-500 uppercase tracking-widest mb-2">Translation</p>
                <p className="font-serif text-2xl font-light text-sauge-light italic">{card.english}</p>
              </div>

              {/* Example Sentences */}
              {card.exampleSentences.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium text-creme-400 mb-3">📝 Example Sentences</p>
                  <div className="space-y-3">
                    {card.exampleSentences.map((ex, i) => (
                      <div
                        key={i}
                        className="rounded-lg p-4"
                        style={{ background: 'rgba(232, 227, 216, 0.02)', border: '1px solid rgba(232, 227, 216, 0.04)' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-creme-100 font-medium text-[14px] leading-relaxed">{ex.french}</p>
                        </div>
                        <p className="text-[13px] text-creme-400 mt-1.5">{ex.english}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Usage */}
              {card.examUsage && (
                <div
                  className="rounded-lg p-4"
                  style={{ background: 'rgba(184, 148, 63, 0.04)', border: '1px solid rgba(184, 148, 63, 0.1)' }}
                >
                  <p className="text-[12px] font-medium text-miel mb-1">🎓 Exam Tip</p>
                  <p className="text-[13px] text-creme-300 leading-relaxed">{card.examUsage}</p>
                </div>
              )}

              {/* Tags */}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {card.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-1 rounded-full text-creme-500"
                      style={{ background: 'rgba(232, 227, 216, 0.03)' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating Buttons */}
              <div className="pt-6" style={{ borderTop: '1px solid rgba(232, 227, 216, 0.04)' }}>
                <p className="text-[12px] text-creme-500 text-center mb-4">How well did you know this?</p>
                <div className="grid grid-cols-4 gap-2">
                  <RateButton label="Again" sublabel="Forgot" accent="terre" onClick={() => handleMarkLearned(1)} />
                  <RateButton label="Hard" sublabel="Struggled" accent="miel" onClick={() => handleMarkLearned(2)} />
                  <RateButton label="Good" sublabel="Remembered" accent="encre" onClick={() => handleMarkLearned(4)} />
                  <RateButton label="Easy" sublabel="Instant" accent="sauge" onClick={() => handleMarkLearned(5)} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between fade-up fade-up-4">
        <button
          onClick={handlePrev}
          disabled={cardIndex === 0}
          className="noir-btn px-5 py-2.5 text-[13px]"
        >
          ← Previous
        </button>
        <span className="text-[12px] text-creme-500">{cardIndex + 1} / {cards.length}</span>
        <button
          onClick={handleNext}
          disabled={cardIndex === cards.length - 1}
          className="noir-btn px-5 py-2.5 text-[13px]"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function RateButton({ label, sublabel, accent, onClick }: { label: string; sublabel: string; accent: string; onClick: () => void }) {
  const accents: Record<string, { bg: string; border: string; text: string }> = {
    terre: { bg: 'rgba(139, 90, 66, 0.08)', border: 'rgba(139, 90, 66, 0.15)', text: '#a06f55' },
    miel: { bg: 'rgba(184, 148, 63, 0.06)', border: 'rgba(184, 148, 63, 0.12)', text: '#c9a855' },
    encre: { bg: 'rgba(58, 61, 92, 0.1)', border: 'rgba(58, 61, 92, 0.15)', text: '#8388b8' },
    sauge: { bg: 'rgba(122, 139, 109, 0.08)', border: 'rgba(122, 139, 109, 0.15)', text: '#8fa080' },
  };
  const a = accents[accent] || accents.encre;
  return (
    <button
      onClick={onClick}
      className="rounded-lg py-3 text-center transition-all duration-400 hover-float"
      style={{ background: a.bg, border: `1px solid ${a.border}` }}
    >
      <p className="font-medium text-[13px]" style={{ color: a.text }}>{label}</p>
      <p className="text-[10px] text-creme-500 mt-0.5">{sublabel}</p>
    </button>
  );
}
