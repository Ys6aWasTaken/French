import { useStore } from '../hooks/useStore';
import { ALL_GRADES, GRADE_SHORT } from '../types';
import type { Grade, PageId } from '../types';

interface Props {
  selectedGrade: Grade | 'all';
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ selectedGrade, onNavigate }: Props) {
  const store = useStore();
  const dueCards = store.getDueCards(selectedGrade);
  const newCards = store.getNewCards(selectedGrade);
  const learnedCards = store.getLearnedCards(selectedGrade);
  const allCards = store.getCardsByGrade(selectedGrade);
  const overallAcc = store.getOverallAccuracy(selectedGrade);
  const overallRet = store.getOverallRetention(selectedGrade);
  const weakCards = store.getWeakCards(selectedGrade, 5);

  return (
    <div className="p-7 lg:p-10 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="fade-up fade-up-1">
        <h2 className="font-serif text-3xl lg:text-4xl font-light text-creme-100 tracking-wide">
          Bienvenue ! <span className="text-miel italic">Welcome back</span>
        </h2>
        <p className="text-creme-400 text-sm mt-2 tracking-wide">
          {selectedGrade === 'all' ? 'All grades' : GRADE_SHORT[selectedGrade]} •{' '}
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up fade-up-2">
        <StatCard
          icon="📬" label="Due for Review" value={dueCards.length}
          accent="miel" onClick={() => onNavigate('quiz')}
          subtitle={dueCards.length > 0 ? 'Start reviewing →' : 'All caught up!'}
        />
        <StatCard
          icon="🆕" label="New Cards" value={newCards.length}
          accent="encre" onClick={() => onNavigate('learn')}
          subtitle="Start learning →"
        />
        <StatCard
          icon="✅" label="Learned" value={learnedCards.length}
          accent="sauge"
          subtitle={`of ${allCards.length} total`}
        />
        <StatCard
          icon="🎯" label="Accuracy" value={`${overallAcc}%`}
          accent="terre"
          subtitle={`${overallRet}% retention`}
        />
      </div>

      {/* Grade Progress & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grade Progress */}
        <div className="lg:col-span-2 noir-card p-7 fade-up fade-up-3">
          <h3 className="font-serif text-xl text-creme-100 mb-6 font-light">Grade Progress</h3>
          <div className="space-y-5">
            {ALL_GRADES.map(grade => {
              const stats = store.getGradeStats(grade);
              const pct = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;
              return (
                <div key={grade} className="reveal">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-creme-200">{GRADE_SHORT[grade]}</span>
                    <div className="flex items-center gap-4 text-[11px] text-creme-400">
                      <span>{stats.learned}/{stats.total} learned</span>
                      {stats.due > 0 && <span className="text-miel">{stats.due} due</span>}
                      {stats.accuracy > 0 && <span>{stats.accuracy}% acc</span>}
                    </div>
                  </div>
                  <div className="noir-progress h-2">
                    <div
                      className="noir-progress-fill h-full"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3a3d5c, #7a8b6d)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5 fade-up fade-up-4">
          <div className="noir-card p-6">
            <h3 className="font-serif text-lg text-creme-100 mb-4 font-light">Quick Actions</h3>
            <div className="space-y-2">
              <ActionBtn icon="📖" label="Learn New Words" onClick={() => onNavigate('learn')} />
              <ActionBtn icon="🧠" label="Start Quiz" onClick={() => onNavigate('quiz')} />
              <ActionBtn icon="⏱️" label="Exam Practice" onClick={() => onNavigate('exam')} />
              <ActionBtn icon="📁" label="Import Cards" onClick={() => onNavigate('import-export')} />
            </div>
          </div>

          {/* Streak Info */}
          <div
            className="rounded-[10px] p-6"
            style={{ background: 'rgba(139, 90, 66, 0.06)', border: '1px solid rgba(139, 90, 66, 0.12)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="text-2xl font-serif font-light text-terre-light">{store.profile.streakDays}</p>
                <p className="text-[10px] text-creme-500 uppercase tracking-widest">Day Streak</p>
              </div>
            </div>
            <p className="text-[11px] text-creme-500">
              Best: {store.profile.longestStreak} days • Total XP: {store.profile.totalXP}
            </p>
          </div>
        </div>
      </div>

      {/* Weak Cards Alert */}
      {weakCards.length > 0 && (
        <div className="noir-card p-7 fade-up fade-up-5">
          <h3 className="font-serif text-xl text-creme-100 mb-5 font-light">
            ⚠️ Words Needing Attention
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakCards.map(card => {
              const acc = store.getAccuracy(card.id);
              const ret = store.getRetentionScore(card.id);
              return (
                <div
                  key={card.id}
                  className="rounded-lg p-4 reveal"
                  style={{ background: 'rgba(232, 227, 216, 0.02)', border: '1px solid rgba(232, 227, 216, 0.04)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-base font-medium text-creme-100 italic">{card.french}</span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: acc < 40 ? 'rgba(139, 90, 66, 0.15)' : 'rgba(184, 148, 63, 0.12)',
                        color: acc < 40 ? '#a06f55' : '#c9a855',
                      }}
                    >{acc}%</span>
                  </div>
                  <p className="text-[13px] text-creme-400">{card.english}</p>
                  <p className="text-[11px] text-creme-500 mt-1">Retention: {ret}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent, subtitle, onClick }: {
  icon: string; label: string; value: string | number; accent: string; subtitle?: string; onClick?: () => void;
}) {
  const accents: Record<string, { bg: string; border: string }> = {
    miel: { bg: 'rgba(184, 148, 63, 0.05)', border: 'rgba(184, 148, 63, 0.1)' },
    encre: { bg: 'rgba(58, 61, 92, 0.08)', border: 'rgba(58, 61, 92, 0.12)' },
    sauge: { bg: 'rgba(122, 139, 109, 0.06)', border: 'rgba(122, 139, 109, 0.1)' },
    terre: { bg: 'rgba(139, 90, 66, 0.06)', border: 'rgba(139, 90, 66, 0.1)' },
  };
  const a = accents[accent] || accents.encre;
  return (
    <button
      onClick={onClick}
      className="rounded-[10px] p-5 text-left hover-float"
      style={{ background: a.bg, border: `1px solid ${a.border}` }}
    >
      <span className="text-xl opacity-80">{icon}</span>
      <p className="text-2xl font-serif font-light text-creme-100 mt-3">{value}</p>
      <p className="text-[11px] text-creme-400 mt-0.5">{label}</p>
      {subtitle && <p className="text-[10px] text-creme-500 mt-1">{subtitle}</p>}
    </button>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-creme-300 text-[13px] font-medium transition-all duration-400 hover:text-creme-100"
      style={{ border: '1px solid rgba(232, 227, 216, 0.04)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232, 227, 216, 0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(232, 227, 216, 0.02)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232, 227, 216, 0.04)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span className="opacity-80">{icon}</span> {label}
    </button>
  );
}
