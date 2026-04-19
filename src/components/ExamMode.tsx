import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import type { Grade, VocabCard, QuizType } from '../types';
import { GRADE_SHORT } from '../types';

interface ExamQuestion {
  card: VocabCard;
  type: QuizType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
  correct?: boolean;
  responseTime?: number;
}

interface Props { selectedGrade: Grade | 'all'; }

export function ExamMode({ selectedGrade }: Props) {
  const store = useStore();
  const [examActive, setExamActive] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(600);
  const [examComplete, setExamComplete] = useState(false);
  const [qStartTime, setQStartTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [questionCount, setQuestionCount] = useState(20);
  const inputRef = useRef<HTMLInputElement>(null);
  const examCompleteRef = useRef(false);

  const allCards = useMemo(() => store.getCardsByGrade(selectedGrade), [store, selectedGrade]);

  const finishExam = () => {
    if (examCompleteRef.current) return;
    examCompleteRef.current = true;
    setExamComplete(true);
    setQuestions(prev => prev.map(q => q.userAnswer !== undefined ? q : { ...q, userAnswer: '', correct: false, responseTime: 0 }));
  };

  // Timer
  useEffect(() => {
    if (!examActive || examComplete) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [examActive, examComplete]);

  useEffect(() => {
    if (examActive && !examComplete && inputRef.current) inputRef.current.focus();
  }, [currentQ, examActive, examComplete]);

  const startExam = () => {
    if (allCards.length < 4) return;
    const count = Math.min(questionCount, allCards.length);
    const shuffled = shuffleArr(allCards).slice(0, count);
    const types: QuizType[] = ['multiple-choice', 'typing', 'fill-blank', 'multiple-choice'];
    const qs: ExamQuestion[] = shuffled.map((card, i) => {
      const type = types[i % types.length];
      return buildExamQ(card, type, allCards);
    });
    setQuestions(qs);
    setCurrentQ(0);
    setUserAnswer('');
    setTotalTime(selectedDuration * 60);
    setTimeLeft(selectedDuration * 60);
    setExamComplete(false);
    examCompleteRef.current = false;
    setExamActive(true);
    setQStartTime(Date.now());
  };

  const submitAnswer = (answer?: string) => {
    const ans = answer ?? userAnswer;
    const responseTime = Date.now() - qStartTime;
    const q = questions[currentQ];
    if (!q) return;
    const norm = ans.trim().toLowerCase().replace(/['']/g, "'");
    const correct = norm === q.correctAnswer.toLowerCase().replace(/['']/g, "'");
    const updated = [...questions];
    updated[currentQ] = { ...q, userAnswer: ans, correct, responseTime };
    setQuestions(updated);
    store.reviewCard(q.card.id, correct, responseTime, q.type, ans);
    if (currentQ + 1 >= questions.length) {
      examCompleteRef.current = true;
      setExamComplete(true);
    } else {
      setCurrentQ(c => c + 1);
      setUserAnswer('');
      setQStartTime(Date.now());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim()) submitAnswer();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Start screen
  if (!examActive) {
    return (
      <div className="p-7 lg:p-10 max-w-3xl mx-auto space-y-7">
        <div className="fade-up fade-up-1">
          <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">⏱️ Exam Mode</h2>
          <p className="text-creme-400 text-sm mt-1">
            Timed test simulation • {selectedGrade === 'all' ? 'All grades' : GRADE_SHORT[selectedGrade]}
          </p>
        </div>

        {allCards.length < 4 ? (
          <div className="text-center py-20 noir-card fade-up fade-up-2">
            <span className="text-4xl opacity-80">📭</span>
            <p className="font-serif text-lg text-creme-100 mt-4">Not enough cards</p>
            <p className="text-creme-400 text-sm mt-1">Need at least 4 cards for exam mode.</p>
          </div>
        ) : (
          <div className="noir-card p-7 space-y-7 fade-up fade-up-2">
            <div
              className="rounded-lg p-4"
              style={{ background: 'rgba(184, 148, 63, 0.04)', border: '1px solid rgba(184, 148, 63, 0.1)' }}
            >
              <p className="text-[13px] text-miel font-medium">🎓 Exam Simulation</p>
              <p className="text-[12px] text-creme-400 mt-1 leading-relaxed">
                Mixed question types under time pressure. No going back to previous questions.
                Tests your real exam readiness with adaptive scoring.
              </p>
            </div>

            <div>
              <label className="text-[12px] font-medium text-creme-300 block mb-2 uppercase tracking-widest">Duration</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(d => (
                  <button key={d} onClick={() => setSelectedDuration(d)}
                    className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-400"
                    style={
                      selectedDuration === d
                        ? { background: 'rgba(139, 90, 66, 0.2)', border: '1px solid rgba(139, 90, 66, 0.2)', color: '#e8e3d8' }
                        : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
                    }
                  >{d} min</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-creme-300 block mb-2 uppercase tracking-widest">Questions</label>
              <div className="flex gap-2">
                {[10, 20, 30, 40].map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-400"
                    style={
                      questionCount === n
                        ? { background: 'rgba(139, 90, 66, 0.2)', border: '1px solid rgba(139, 90, 66, 0.2)', color: '#e8e3d8' }
                        : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
                    }
                  >{n}</button>
                ))}
              </div>
            </div>

            <button onClick={startExam}
              className="w-full py-3.5 rounded-lg font-medium text-[14px] text-creme-100 hover-float"
              style={{ background: 'linear-gradient(135deg, #8b5a42, #a06f55)', border: '1px solid rgba(160, 111, 85, 0.3)' }}
            >
              Begin Exam 🚀
            </button>
          </div>
        )}
      </div>
    );
  }

  // Results screen
  if (examComplete) {
    const answered = questions.filter(q => q.userAnswer !== undefined);
    const correct = answered.filter(q => q.correct).length;
    const pct = answered.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const avgTime = answered.length > 0 ? Math.round(answered.reduce((s, q) => s + (q.responseTime || 0), 0) / answered.length / 1000) : 0;
    const timeUsed = totalTime - timeLeft;

    return (
      <div className="p-7 lg:p-10 max-w-4xl mx-auto space-y-6">
        <div className="noir-card p-8 lg:p-10 text-center space-y-7 fade-up fade-up-1">
          <span className="text-5xl opacity-80">{pct >= 80 ? '🏆' : pct >= 60 ? '📜' : '📝'}</span>
          <h2 className="font-serif text-3xl font-light text-creme-100">Exam Complete</h2>
          <div className="font-serif text-5xl font-light text-terre-light">{pct}%</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ExamStat label="Correct" value={`${correct}`} color="#7a8b6d" />
            <ExamStat label="Incorrect" value={`${questions.length - correct}`} color="#8b5a42" />
            <ExamStat label="Time Used" value={formatTime(timeUsed)} color="#3a3d5c" />
            <ExamStat label="Avg/Question" value={`${avgTime}s`} color="#7a6b8a" />
          </div>
        </div>

        {/* Detailed Results */}
        <div className="noir-card p-7 fade-up fade-up-2">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">Detailed Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {questions.map((q, i) => (
              <div key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: q.correct ? 'rgba(122, 139, 109, 0.04)' : 'rgba(139, 90, 66, 0.04)',
                  border: `1px solid ${q.correct ? 'rgba(122, 139, 109, 0.1)' : 'rgba(139, 90, 66, 0.1)'}`,
                }}
              >
                <span className="text-base">{q.correct ? '✅' : '❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-creme-100 font-medium">{q.card.french} = {q.card.english}</p>
                  {!q.correct && q.userAnswer && (
                    <p className="text-[11px] text-terre-light truncate">Your answer: {q.userAnswer}</p>
                  )}
                </div>
                <span className="text-[11px] text-creme-500">{q.responseTime ? `${(q.responseTime / 1000).toFixed(1)}s` : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={startExam} className="noir-btn px-6 py-3 text-[13px]" style={{ background: 'linear-gradient(135deg, #8b5a42, #a06f55)' }}>
            Retake Exam
          </button>
          <button onClick={() => { setExamActive(false); setExamComplete(false); }}
            className="px-6 py-3 rounded-lg text-[13px] font-medium text-creme-300"
            style={{ background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
          >Back to Settings</button>
        </div>
      </div>
    );
  }

  // Active exam
  const q = questions[currentQ];
  if (!q) return null;
  const timePct = (timeLeft / totalTime) * 100;

  return (
    <div className="p-7 lg:p-10 max-w-3xl mx-auto space-y-6">
      {/* Timer bar */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-creme-400">Q{currentQ + 1}/{questions.length}</span>
        <div className={`flex items-center gap-2 text-[13px] font-mono font-medium ${timeLeft < 60 ? 'text-terre-light' : 'text-creme-300'}`}
          style={timeLeft < 60 ? { animation: 'gentleFloat 2s ease-in-out infinite' } : {}}
        >
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>
      <div className="noir-progress h-1">
        <div className="noir-progress-fill h-full" style={{
          width: `${timePct}%`,
          background: timePct > 50 ? '#3a3d5c' : timePct > 20 ? '#b8943f' : '#8b5a42',
          transition: 'width 1s linear, background 0.5s ease',
        }} />
      </div>

      {/* Question */}
      <div className="noir-card p-7 lg:p-8" style={{ animation: 'crossfadeIn 350ms ease both' }}>
        <span
          className="text-[10px] font-medium px-2.5 py-1 rounded-full text-creme-400"
          style={{ background: 'rgba(232, 227, 216, 0.04)' }}
        >
          {q.type === 'multiple-choice' ? '🔤 Choose' : q.type === 'typing' ? '⌨️ Type' : '📝 Fill'}
        </span>
        <div className="text-center my-8">
          <p className="text-[12px] text-creme-500 mb-3 uppercase tracking-widest">{q.type === 'fill-blank' ? 'Complete:' : 'Translate:'}</p>
          <p className="font-serif text-2xl sm:text-3xl font-light text-creme-100 italic">{q.prompt}</p>
        </div>

        {q.type === 'multiple-choice' && q.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => submitAnswer(opt)}
                className="p-4 rounded-lg text-creme-100 text-left font-medium transition-all duration-400 hover-float"
                style={{ background: 'rgba(232, 227, 216, 0.02)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
              >
                <span className="text-[12px] text-creme-500 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <input ref={inputRef} type="text" value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
              placeholder="Type your answer..." autoFocus
              className="noir-input w-full px-5 py-3.5 text-base rounded-lg"
            />
            <button onClick={() => submitAnswer()} disabled={!userAnswer.trim()}
              className="w-full py-3 rounded-lg font-medium text-[14px] text-creme-100 transition-all duration-400"
              style={{ background: 'linear-gradient(135deg, #8b5a42, #a06f55)', border: '1px solid rgba(160, 111, 85, 0.3)' }}
            >Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExamStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-4" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <p className="text-lg font-serif font-light" style={{ color }}>{value}</p>
      <p className="text-[10px] text-creme-500">{label}</p>
    </div>
  );
}

function buildExamQ(card: VocabCard, type: QuizType, allCards: VocabCard[]): ExamQuestion {
  if (type === 'multiple-choice') {
    const isFrToEn = Math.random() > 0.5;
    const others = shuffleArr(allCards.filter(c => c.id !== card.id)).slice(0, 3);
    const options = shuffleArr([
      isFrToEn ? card.english : card.french,
      ...others.map(c => isFrToEn ? c.english : c.french),
    ]);
    return { card, type, prompt: isFrToEn ? card.french : card.english, correctAnswer: isFrToEn ? card.english : card.french, options };
  }
  if (type === 'fill-blank' && card.exampleSentences.length > 0) {
    const ex = card.exampleSentences[0];
    const words = card.french.split(' ');
    const mainWord = words[words.length - 1];
    const blanked = ex.french.replace(new RegExp(mainWord, 'i'), '_____');
    if (blanked !== ex.french) {
      return { card, type, prompt: blanked, correctAnswer: mainWord };
    }
  }
  return { card, type: 'typing', prompt: card.english, correctAnswer: card.french };
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
