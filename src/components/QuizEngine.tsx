import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import type { Grade, QuizType, VocabCard } from '../types';
import { GRADE_SHORT } from '../types';

interface Props {
  selectedGrade: Grade | 'all';
}

interface QuizQuestion {
  card: VocabCard;
  type: QuizType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  sentenceBlank?: string;
}

export function QuizEngine({ selectedGrade }: Props) {
  const store = useStore();
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedType, setSelectedType] = useState<QuizType | 'adaptive'>('adaptive');
  const [questionCount, setQuestionCount] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCards = useMemo(() => {
    const due = store.getDueCards(selectedGrade);
    const allGrade = store.getCardsByGrade(selectedGrade);
    const prioritized = [...due];
    const remaining = allGrade.filter(c => !due.find(d => d.id === c.id));
    return [...prioritized, ...remaining];
  }, [store, selectedGrade]);

  const generateQuestions = useCallback(() => {
    if (allCards.length < 2) return;
    const count = Math.min(questionCount, allCards.length);
    const selected = shuffleArray(allCards).slice(0, count);
    const qs: QuizQuestion[] = selected.map(card => {
      const type = selectedType === 'adaptive' ? store.getAdaptiveDifficulty(card.id) : selectedType;
      return buildQuestion(card, type, allCards);
    });
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setUserAnswer('');
    setShowResult(false);
    setQuizComplete(false);
    setQuizActive(true);
    setStartTime(Date.now());
  }, [allCards, questionCount, selectedType, store]);

  useEffect(() => {
    if (quizActive && !showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQ, quizActive, showResult]);

  const handleCheck = useCallback((answer: string, question: QuizQuestion) => {
    const responseTime = Date.now() - startTime;
    const normalized = answer.trim().toLowerCase().replace(/['']/g, "'");
    const correct = normalized === question.correctAnswer.toLowerCase().replace(/['']/g, "'");
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(s => s + 1);
    store.reviewCard(question.card.id, correct, responseTime, question.type, answer);
  }, [startTime, store]);

  const checkAnswer = () => {
    const q = questions[currentQ];
    if (!q || !userAnswer.trim()) return;
    handleCheck(userAnswer, q);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentQ(c => c + 1);
      setUserAnswer('');
      setShowResult(false);
      setStartTime(Date.now());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showResult) nextQuestion();
      else if (userAnswer.trim()) checkAnswer();
    }
  };

  const speakFrench = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = 0.85;
    speechSynthesis.speak(u);
  };

  // Start screen
  if (!quizActive) {
    return (
      <div className="p-7 lg:p-10 max-w-3xl mx-auto space-y-7">
        <div className="fade-up fade-up-1">
          <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">Quiz Mode</h2>
          <p className="text-creme-400 text-sm mt-1">
            {selectedGrade === 'all' ? 'All grades' : GRADE_SHORT[selectedGrade]} •{' '}
            {allCards.length} cards available
          </p>
        </div>

        {allCards.length < 2 ? (
          <div className="text-center py-20 noir-card fade-up fade-up-2">
            <span className="text-4xl opacity-80">📭</span>
            <p className="font-serif text-lg text-creme-100 mt-4">Not enough cards</p>
            <p className="text-creme-400 text-sm mt-1">You need at least 2 cards to start a quiz. Learn some words first!</p>
          </div>
        ) : (
          <div className="noir-card p-7 space-y-7 fade-up fade-up-2">
            <div>
              <label className="text-[12px] font-medium text-creme-300 block mb-3 uppercase tracking-widest">Quiz Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { id: 'adaptive', label: 'Adaptive', icon: '🤖', desc: 'AI-selected difficulty' },
                  { id: 'multiple-choice', label: 'Multiple Choice', icon: '🔤', desc: 'Pick the answer' },
                  { id: 'typing', label: 'Typing', icon: '⌨️', desc: 'Type the translation' },
                  { id: 'fill-blank', label: 'Fill in Blank', icon: '📝', desc: 'Complete the sentence' },
                  { id: 'listening', label: 'Listening', icon: '🎧', desc: 'Listen and type' },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className="p-4 rounded-lg text-left transition-all duration-400"
                    style={
                      selectedType === t.id
                        ? { background: 'rgba(58, 61, 92, 0.15)', border: '1px solid rgba(58, 61, 92, 0.25)' }
                        : { background: 'rgba(232, 227, 216, 0.02)', border: '1px solid rgba(232, 227, 216, 0.04)' }
                    }
                  >
                    <span className="text-lg opacity-80">{t.icon}</span>
                    <p className="text-[13px] font-medium text-creme-100 mt-1">{t.label}</p>
                    <p className="text-[10px] text-creme-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-creme-300 block mb-2 uppercase tracking-widest">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-400"
                    style={
                      questionCount === n
                        ? { background: 'rgba(58, 61, 92, 0.3)', border: '1px solid rgba(58, 61, 92, 0.2)', color: '#e8e3d8' }
                        : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              className="w-full py-3.5 rounded-lg font-medium text-[14px] text-creme-100 hover-float"
              style={{ background: 'linear-gradient(135deg, #3a3d5c, #4f5375)', border: '1px solid rgba(79, 83, 117, 0.3)' }}
            >
              Start Quiz 🚀
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quiz complete
  if (quizComplete) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="p-7 lg:p-10 max-w-3xl mx-auto">
        <div className="noir-card p-8 lg:p-10 text-center space-y-7 fade-up fade-up-1">
          <span className="text-5xl opacity-80">{pct >= 80 ? '🏆' : pct >= 60 ? '👏' : pct >= 40 ? '💪' : '📚'}</span>
          <div>
            <h2 className="font-serif text-3xl font-light text-creme-100">Quiz Complete!</h2>
            <p className="text-creme-400 text-sm mt-1">
              You scored {score} out of {questions.length}
            </p>
          </div>
          <div className="font-serif text-5xl font-light text-miel-light">{pct}%</div>
          <div className="grid grid-cols-3 gap-4">
            <ResultBox label="Correct" value={`${score}`} color="#7a8b6d" />
            <ResultBox label="Incorrect" value={`${questions.length - score}`} color="#8b5a42" />
            <ResultBox label="XP Earned" value={`+${score * 10 + (questions.length - score) * 3}`} color="#3a3d5c" />
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={generateQuestions} className="noir-btn px-6 py-3 text-[13px]">
              Quiz Again
            </button>
            <button
              onClick={() => setQuizActive(false)}
              className="px-6 py-3 rounded-lg text-[13px] font-medium text-creme-300 transition-all duration-400"
              style={{ background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="p-7 lg:p-10 max-w-3xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setQuizActive(false); setQuizComplete(false); }}
          className="text-[13px] text-creme-400 hover:text-creme-100 link-underline transition-colors duration-300"
        >
          ← Exit Quiz
        </button>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-sauge font-medium">✓ {score}</span>
          <span className="text-creme-500 opacity-30">|</span>
          <span className="text-creme-400">{currentQ + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="noir-progress h-1">
        <div
          className="noir-progress-fill h-full"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #3a3d5c, #b8943f)' }}
        />
      </div>

      {/* Question Card */}
      <div className="noir-card p-7 lg:p-8" style={{ animation: 'crossfadeIn 350ms ease both' }}>
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-5">
          <span
            className="text-[10px] font-medium px-2.5 py-1 rounded-full text-creme-400"
            style={{ background: 'rgba(232, 227, 216, 0.04)' }}
          >
            {q.type === 'multiple-choice' ? '🔤 Multiple Choice' :
             q.type === 'typing' ? '⌨️ Typing' :
             q.type === 'fill-blank' ? '📝 Fill in the Blank' : '🎧 Listening'}
          </span>
        </div>

        {/* Prompt */}
        <div className="text-center mb-8">
          {q.type === 'listening' ? (
            <div>
              <p className="text-creme-400 text-sm mb-5">Listen and type the French word:</p>
              <button
                onClick={() => speakFrench(q.card.french)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-encre-light font-medium transition-all duration-400 hover-float"
                style={{ background: 'rgba(58, 61, 92, 0.1)', border: '1px solid rgba(58, 61, 92, 0.2)' }}
              >
                🔊 Play Audio
              </button>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-creme-500 mb-3 uppercase tracking-widest">{q.type === 'fill-blank' ? 'Complete the sentence:' : 'Translate:'}</p>
              <p className="font-serif text-2xl sm:text-3xl font-light text-creme-100 italic">{q.prompt}</p>
            </>
          )}
        </div>

        {/* Answer Input */}
        {!showResult ? (
          q.type === 'multiple-choice' && q.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleCheck(opt, q)}
                  className="p-4 rounded-lg text-creme-100 text-left font-medium transition-all duration-400 hover-float"
                  style={{ background: 'rgba(232, 227, 216, 0.02)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
                >
                  <span className="text-[12px] text-creme-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder={q.type === 'fill-blank' ? 'Type the missing word...' : 'Type your answer...'}
                className="noir-input w-full px-5 py-3.5 text-base rounded-lg"
                autoFocus
              />
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="noir-btn w-full py-3 text-[14px]"
              >
                Check Answer
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4" style={{ animation: 'crossfadeIn 300ms ease both' }}>
            <div
              className="p-5 rounded-lg"
              style={{
                background: isCorrect ? 'rgba(122, 139, 109, 0.06)' : 'rgba(139, 90, 66, 0.06)',
                border: `1px solid ${isCorrect ? 'rgba(122, 139, 109, 0.15)' : 'rgba(139, 90, 66, 0.15)'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
                <span className={`font-medium text-[14px] ${isCorrect ? 'text-sauge-light' : 'text-terre-light'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-[13px] text-creme-300">
                  The correct answer was: <span className="font-semibold text-sauge-light italic">{q.correctAnswer}</span>
                </p>
              )}
              <p className="text-[12px] text-creme-500 mt-1">
                {q.card.french} = {q.card.english}
              </p>
            </div>
            <button
              onClick={nextQuestion}
              className="noir-btn w-full py-3 text-[14px]"
            >
              {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-4" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <p className="text-lg font-serif font-light" style={{ color }}>{value}</p>
      <p className="text-[10px] text-creme-500">{label}</p>
    </div>
  );
}

function buildQuestion(card: VocabCard, type: QuizType, allCards: VocabCard[]): QuizQuestion {
  switch (type) {
    case 'multiple-choice': {
      const isFrToEn = Math.random() > 0.5;
      const others = shuffleArray(allCards.filter(c => c.id !== card.id)).slice(0, 3);
      const options = shuffleArray([
        isFrToEn ? card.english : card.french,
        ...others.map(c => isFrToEn ? c.english : c.french),
      ]);
      return {
        card, type,
        prompt: isFrToEn ? card.french : card.english,
        correctAnswer: isFrToEn ? card.english : card.french,
        options,
      };
    }
    case 'typing': {
      const isFrToEn = Math.random() > 0.5;
      return {
        card, type,
        prompt: isFrToEn ? card.french : card.english,
        correctAnswer: isFrToEn ? card.english : card.french,
      };
    }
    case 'fill-blank': {
      if (card.exampleSentences.length > 0) {
        const ex = card.exampleSentences[0];
        const words = card.french.split(' ');
        const mainWord = words[words.length - 1];
        const blanked = ex.french.replace(new RegExp(mainWord, 'i'), '_____');
        if (blanked !== ex.french) {
          return {
            card, type,
            prompt: blanked,
            correctAnswer: mainWord,
            sentenceBlank: ex.french,
          };
        }
      }
      return {
        card, type: 'typing',
        prompt: card.english,
        correctAnswer: card.french,
      };
    }
    case 'listening': {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(card.french);
        u.lang = 'fr-FR';
        u.rate = 0.85;
        speechSynthesis.speak(u);
      }, 500);
      return {
        card, type,
        prompt: '🔊',
        correctAnswer: card.french,
      };
    }
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
