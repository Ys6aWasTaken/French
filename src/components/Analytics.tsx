import { useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import type { Grade } from '../types';
import { ALL_GRADES, GRADE_SHORT } from '../types';

interface Props { selectedGrade: Grade | 'all'; }

export function Analytics({ selectedGrade }: Props) {
  const store = useStore();

  const stats = useMemo(() => {
    const cards = store.getCardsByGrade(selectedGrade);
    const reviewed = cards.filter(c => store.progress[c.id]?.totalAttempts);
    const learned = cards.filter(c => store.progress[c.id]?.learned);
    const due = store.getDueCards(selectedGrade);
    const newC = store.getNewCards(selectedGrade);

    let totalAttempts = 0, totalCorrect = 0, totalTime = 0;
    reviewed.forEach(c => {
      const p = store.progress[c.id];
      if (p) { totalAttempts += p.totalAttempts; totalCorrect += p.correctAttempts; totalTime += p.totalResponseTime; }
    });
    const avgAcc = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const avgTime = totalAttempts > 0 ? Math.round(totalTime / totalAttempts / 1000 * 10) / 10 : 0;

    const retentionBuckets = [0, 0, 0, 0, 0];
    reviewed.forEach(c => {
      const ret = store.getRetentionScore(c.id);
      const bucket = Math.min(4, Math.floor(ret / 20));
      retentionBuckets[bucket]++;
    });

    const gradeData = ALL_GRADES.map(g => {
      const s = store.getGradeStats(g);
      return { grade: g, ...s };
    });

    const typeStats: Record<string, { correct: number; total: number }> = {};
    reviewed.forEach(c => {
      const p = store.progress[c.id];
      p?.history.forEach(h => {
        if (!typeStats[h.quizType]) typeStats[h.quizType] = { correct: 0, total: 0 };
        typeStats[h.quizType].total++;
        if (h.correct) typeStats[h.quizType].correct++;
      });
    });

    const dailyActivity: { day: string; count: number; correct: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      let count = 0, correct = 0;
      reviewed.forEach(c => {
        store.progress[c.id]?.history.forEach(h => {
          if (h.timestamp >= dayStart && h.timestamp < dayEnd) {
            count++;
            if (h.correct) correct++;
          }
        });
      });
      dailyActivity.push({ day: dayStr, count, correct });
    }

    return { cards, reviewed, learned, due, newC, avgAcc, avgTime, totalAttempts, retentionBuckets, gradeData, typeStats, dailyActivity };
  }, [store, selectedGrade]);

  const maxDaily = Math.max(1, ...stats.dailyActivity.map(d => d.count));

  return (
    <div className="p-7 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div className="fade-up fade-up-1">
        <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">📈 Analytics</h2>
        <p className="text-creme-400 text-sm mt-1">
          {selectedGrade === 'all' ? 'All grades' : GRADE_SHORT[selectedGrade]} •
          Data-driven insights into your learning
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 fade-up fade-up-2">
        <MetricCard label="Total Cards" value={stats.cards.length} icon="📚" />
        <MetricCard label="Reviewed" value={stats.reviewed.length} icon="🔄" />
        <MetricCard label="Learned" value={stats.learned.length} icon="✅" />
        <MetricCard label="Accuracy" value={`${stats.avgAcc}%`} icon="🎯" />
        <MetricCard label="Avg Time" value={`${stats.avgTime}s`} icon="⏱️" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="noir-card p-7 fade-up fade-up-3">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📅 Weekly Activity</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.dailyActivity.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-creme-500">{d.count}</span>
                <div className="w-full flex flex-col gap-0.5" style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}>
                  <div className="flex-1 rounded-t min-h-0" style={{
                    height: d.count > 0 ? `${(d.correct / d.count) * 100}%` : '0%',
                    background: 'linear-gradient(to top, #3a3d5c, #4f5375)',
                  }} />
                  {d.count > d.correct && (
                    <div className="rounded-b" style={{ height: `${((d.count - d.correct) / d.count) * 100}%`, minHeight: '2px', background: 'rgba(139, 90, 66, 0.4)' }} />
                  )}
                </div>
                <span className="text-[10px] text-creme-400 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-[11px] text-creme-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-encre" /> Correct</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'rgba(139, 90, 66, 0.4)' }} /> Incorrect</span>
          </div>
        </div>

        {/* Retention Distribution */}
        <div className="noir-card p-7 fade-up fade-up-4">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">🧠 Retention Distribution</h3>
          <div className="space-y-3">
            {['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'].map((label, i) => {
              const count = stats.retentionBuckets[i];
              const pct = stats.reviewed.length > 0 ? (count / stats.reviewed.length) * 100 : 0;
              const colors = ['#8b5a42', '#a06f55', '#b8943f', '#3a3d5c', '#7a8b6d'];
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[11px] text-creme-400 w-14 shrink-0">{label}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.03)' }}>
                    <div className="h-full rounded-full transition-all duration-700 flex items-center px-2"
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%`, background: colors[i] }}>
                      {count > 0 && <span className="text-[9px] text-creme-100 font-medium">{count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {stats.reviewed.length === 0 && (
            <p className="text-[13px] text-creme-500 text-center mt-5">No data yet. Start reviewing cards!</p>
          )}
        </div>

        {/* Grade Breakdown */}
        <div className="noir-card p-7 fade-up fade-up-5">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📊 Grade Performance</h3>
          <div className="space-y-5">
            {stats.gradeData.map(g => (
              <div key={g.grade} className="space-y-2 reveal">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-creme-200 font-medium">{GRADE_SHORT[g.grade]}</span>
                  <div className="flex items-center gap-3 text-[11px] text-creme-400">
                    <span>{g.learned}/{g.total} learned</span>
                    {g.accuracy > 0 && <span style={{ color: g.accuracy >= 70 ? '#7a8b6d' : g.accuracy >= 50 ? '#b8943f' : '#8b5a42' }}>{g.accuracy}% acc</span>}
                  </div>
                </div>
                <div className="noir-progress h-2">
                  <div className="noir-progress-fill h-full"
                    style={{ width: g.total > 0 ? `${(g.learned / g.total) * 100}%` : '0%', background: '#7a8b6d' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Type Performance */}
        <div className="noir-card p-7 fade-up fade-up-6">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">🎮 Quiz Type Performance</h3>
          {Object.keys(stats.typeStats).length === 0 ? (
            <p className="text-[13px] text-creme-500 text-center py-8">No quiz data yet</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(stats.typeStats).map(([type, data]) => {
                const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const icons: Record<string, string> = { 'multiple-choice': '🔤', 'typing': '⌨️', 'fill-blank': '📝', 'listening': '🎧' };
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-lg w-7 opacity-80">{icons[type] || '📋'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] text-creme-300 capitalize">{type.replace('-', ' ')}</span>
                        <span className="text-[11px] text-creme-400">{data.correct}/{data.total} ({acc}%)</span>
                      </div>
                      <div className="noir-progress h-1.5">
                        <div className="noir-progress-fill h-full"
                          style={{ width: `${acc}%`, background: acc >= 70 ? '#7a8b6d' : acc >= 50 ? '#b8943f' : '#8b5a42' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Weak & Strong Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardList
          title="⚠️ Weakest Cards"
          subtitle="Focus your review on these"
          cards={store.getWeakCards(selectedGrade, 8)}
          store={store}
          emptyText="No weak cards identified yet"
          colorScheme="terre"
        />
        <CardList
          title="💪 Strongest Cards"
          subtitle="Your best-retained vocabulary"
          cards={store.getStrongCards(selectedGrade, 8)}
          store={store}
          emptyText="No strong cards identified yet"
          colorScheme="sauge"
        />
      </div>

      {/* Reset */}
      <div className="noir-card p-7 text-center fade-up fade-up-7" style={{ background: 'rgba(34, 31, 28, 0.5)' }}>
        <p className="text-[13px] text-creme-500 mb-3">Need a fresh start?</p>
        <button onClick={() => { if (confirm('Reset all progress? This cannot be undone.')) store.resetProgress(); }}
          className="px-5 py-2 rounded-lg text-[13px] font-medium text-terre-light transition-all duration-400 hover-float"
          style={{ background: 'rgba(139, 90, 66, 0.08)', border: '1px solid rgba(139, 90, 66, 0.15)' }}
        >Reset All Progress</button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="noir-card p-5">
      <span className="text-xl opacity-80">{icon}</span>
      <p className="text-2xl font-serif font-light text-creme-100 mt-2">{value}</p>
      <p className="text-[11px] text-creme-400">{label}</p>
    </div>
  );
}

function CardList({ title, subtitle, cards, store, emptyText, colorScheme }: {
  title: string; subtitle: string; cards: import('../types').VocabCard[];
  store: ReturnType<typeof useStore>; emptyText: string; colorScheme: string;
}) {
  const borderColor = colorScheme === 'terre' ? 'rgba(139, 90, 66, 0.1)' : 'rgba(122, 139, 109, 0.1)';
  return (
    <div className="noir-card p-7 fade-up fade-up-5" style={{ borderColor }}>
      <h3 className="font-serif text-lg text-creme-100 font-light">{title}</h3>
      <p className="text-[11px] text-creme-500 mb-4">{subtitle}</p>
      {cards.length === 0 ? (
        <p className="text-[13px] text-creme-500 text-center py-6">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {cards.map(card => {
            const acc = store.getAccuracy(card.id);
            const ret = store.getRetentionScore(card.id);
            const avgT = store.getAvgResponseTime(card.id);
            return (
              <div key={card.id}
                className="flex items-center justify-between p-3 rounded-lg reveal"
                style={{ background: 'rgba(232, 227, 216, 0.02)' }}
              >
                <div>
                  <span className="text-[13px] font-medium text-creme-100 font-serif italic">{card.french}</span>
                  <span className="text-[11px] text-creme-500 ml-2">{card.english}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span style={{ color: acc >= 70 ? '#7a8b6d' : acc >= 50 ? '#b8943f' : '#8b5a42' }}>{acc}%</span>
                  <span className="text-creme-500 opacity-20">|</span>
                  <span className="text-creme-400">{ret}% ret</span>
                  <span className="text-creme-500 opacity-20">|</span>
                  <span className="text-creme-500">{(avgT / 1000).toFixed(1)}s</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
