import { useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { ALL_GRADES, GRADE_SHORT } from '../types';

// Simulated students for the teacher dashboard
const simulatedStudents = [
  { name: 'Alice Martin', id: 's1', accuracy: 87, streak: 12, learned: 34, total: 40, retention: 82, weakAreas: ['irregular-verbs', 'connectors'] },
  { name: 'Baptiste Dupont', id: 's2', accuracy: 72, streak: 5, learned: 28, total: 40, retention: 65, weakAreas: ['adjectives', 'food'] },
  { name: 'Camille Bernard', id: 's3', accuracy: 94, streak: 21, learned: 38, total: 40, retention: 91, weakAreas: ['listening'] },
  { name: 'David Petit', id: 's4', accuracy: 58, streak: 2, learned: 18, total: 40, retention: 45, weakAreas: ['verbs', 'weather', 'irregular-verbs'] },
  { name: 'Emma Leroy', id: 's5', accuracy: 81, streak: 8, learned: 31, total: 40, retention: 74, weakAreas: ['connectors', 'society'] },
  { name: 'Fabien Moreau', id: 's6', accuracy: 65, streak: 0, learned: 22, total: 40, retention: 52, weakAreas: ['verbs', 'adjectives', 'food'] },
  { name: 'Gabrielle Simon', id: 's7', accuracy: 91, streak: 15, learned: 36, total: 40, retention: 88, weakAreas: ['advanced'] },
  { name: 'Hugo Laurent', id: 's8', accuracy: 77, streak: 3, learned: 26, total: 40, retention: 68, weakAreas: ['fill-blank', 'connectors'] },
];

export function TeacherDashboard() {
  const store = useStore();

  const classStats = useMemo(() => {
    const avgAccuracy = Math.round(simulatedStudents.reduce((s, st) => s + st.accuracy, 0) / simulatedStudents.length);
    const avgRetention = Math.round(simulatedStudents.reduce((s, st) => s + st.retention, 0) / simulatedStudents.length);
    const avgLearned = Math.round(simulatedStudents.reduce((s, st) => s + st.learned, 0) / simulatedStudents.length);
    const activeStudents = simulatedStudents.filter(s => s.streak > 0).length;

    const weakMap: Record<string, number> = {};
    simulatedStudents.forEach(s => s.weakAreas.forEach(w => { weakMap[w] = (weakMap[w] || 0) + 1; }));
    const commonWeak = Object.entries(weakMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const distrib = { excellent: 0, good: 0, average: 0, struggling: 0 };
    simulatedStudents.forEach(s => {
      if (s.accuracy >= 85) distrib.excellent++;
      else if (s.accuracy >= 70) distrib.good++;
      else if (s.accuracy >= 55) distrib.average++;
      else distrib.struggling++;
    });

    return { avgAccuracy, avgRetention, avgLearned, activeStudents, commonWeak, distrib };
  }, []);

  const myStats = useMemo(() => {
    const gradeData = ALL_GRADES.map(g => ({
      grade: g,
      ...store.getGradeStats(g),
    }));
    return { gradeData, overallAcc: store.getOverallAccuracy(), overallRet: store.getOverallRetention() };
  }, [store]);

  return (
    <div className="p-7 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div className="fade-up fade-up-1">
        <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">👩‍🏫 Teacher Dashboard</h2>
        <p className="text-creme-400 text-sm mt-1">
          Class performance overview • {simulatedStudents.length} students
        </p>
      </div>

      {/* Class Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up fade-up-2">
        <OverviewCard icon="👥" label="Active Students" value={`${classStats.activeStudents}/${simulatedStudents.length}`} accent="encre" />
        <OverviewCard icon="🎯" label="Class Accuracy" value={`${classStats.avgAccuracy}%`} accent="sauge" />
        <OverviewCard icon="🧠" label="Avg Retention" value={`${classStats.avgRetention}%`} accent="lilas" />
        <OverviewCard icon="📚" label="Avg Learned" value={`${classStats.avgLearned}/40`} accent="miel" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Distribution */}
        <div className="noir-card p-7 fade-up fade-up-3">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📊 Performance Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Excellent (85%+)', count: classStats.distrib.excellent, color: '#7a8b6d' },
              { label: 'Good (70-84%)', count: classStats.distrib.good, color: '#3a3d5c' },
              { label: 'Average (55-69%)', count: classStats.distrib.average, color: '#b8943f' },
              { label: 'Struggling (<55%)', count: classStats.distrib.struggling, color: '#8b5a42' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[11px] text-creme-400 w-32 shrink-0">{item.label}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.03)' }}>
                  <div className="h-full rounded-full transition-all duration-700 flex items-center px-2"
                    style={{ width: `${(item.count / simulatedStudents.length) * 100}%`, minWidth: item.count > 0 ? '24px' : '0', background: item.color }}>
                    <span className="text-[9px] text-creme-100 font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Weak Areas */}
        <div className="noir-card p-7 fade-up fade-up-4">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">⚠️ Common Weak Areas</h3>
          <div className="space-y-3">
            {classStats.commonWeak.map(([area, count]) => (
              <div key={area}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(139, 90, 66, 0.04)', border: '1px solid rgba(139, 90, 66, 0.08)' }}
              >
                <span className="text-[13px] text-creme-100 font-medium capitalize">{area.replace('-', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: count }).map((_, i) => (
                      <span key={i} className="text-[10px]">👤</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-terre-light">{count} students</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-creme-500 mt-4">
            Consider dedicating class time to these topics.
          </p>
        </div>

        {/* Content Coverage */}
        <div className="noir-card p-7 fade-up fade-up-5">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📈 Content Coverage</h3>
          <div className="space-y-4">
            {myStats.gradeData.map(g => (
              <div key={g.grade} className="reveal">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-creme-300 font-medium">{GRADE_SHORT[g.grade]}</span>
                  <span className="text-[11px] text-creme-500">{g.learned}/{g.total}</span>
                </div>
                <div className="noir-progress h-2">
                  <div className="noir-progress-fill h-full"
                    style={{ width: g.total > 0 ? `${(g.learned / g.total) * 100}%` : '0%', background: 'linear-gradient(90deg, #3a3d5c, #7a6b8a)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="noir-card p-7 fade-up fade-up-6">
        <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">👥 Student Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.06)' }}>
                <th className="text-left py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Student</th>
                <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Accuracy</th>
                <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Retention</th>
                <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Progress</th>
                <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Streak</th>
                <th className="text-left py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Weak Areas</th>
                <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {simulatedStudents.sort((a, b) => b.accuracy - a.accuracy).map(student => (
                <tr key={student.id}
                  className="transition-colors duration-300"
                  style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.03)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232, 227, 216, 0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td className="py-3 px-3">
                    <span className="text-creme-100 font-medium">{student.name}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-medium" style={{
                      color: student.accuracy >= 80 ? '#7a8b6d' : student.accuracy >= 60 ? '#b8943f' : '#8b5a42'
                    }}>{student.accuracy}%</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-creme-300">{student.retention}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(student.learned / student.total) * 100}%`, background: '#3a3d5c' }} />
                      </div>
                      <span className="text-[11px] text-creme-500">{student.learned}/{student.total}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-creme-300">
                      {student.streak > 0 ? `🔥 ${student.streak}` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {student.weakAreas.slice(0, 2).map(area => (
                        <span key={area}
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-terre-light"
                          style={{ background: 'rgba(139, 90, 66, 0.08)' }}
                        >{area}</span>
                      ))}
                      {student.weakAreas.length > 2 && (
                        <span className="text-[10px] text-creme-500">+{student.weakAreas.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                      style={
                        student.accuracy >= 80 && student.streak >= 5
                          ? { background: 'rgba(122, 139, 109, 0.1)', color: '#8fa080' }
                          : student.accuracy >= 60
                          ? { background: 'rgba(184, 148, 63, 0.08)', color: '#c9a855' }
                          : { background: 'rgba(139, 90, 66, 0.08)', color: '#a06f55' }
                      }
                    >
                      {student.accuracy >= 80 && student.streak >= 5 ? 'On Track' :
                       student.accuracy >= 60 ? 'Needs Focus' : 'At Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="noir-card p-7 fade-up fade-up-7" style={{ background: 'rgba(58, 61, 92, 0.06)', borderColor: 'rgba(58, 61, 92, 0.1)' }}>
        <h3 className="font-serif text-lg text-creme-100 mb-4 font-light">💡 AI Recommendations</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg p-4" style={{ background: 'rgba(232, 227, 216, 0.02)' }}>
            <p className="text-[13px] text-creme-100 font-medium mb-1">Focus Area: Irregular Verbs</p>
            <p className="text-[12px] text-creme-400 leading-relaxed">3 students struggling. Consider a dedicated practice session with verb conjugation drills.</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(232, 227, 216, 0.02)' }}>
            <p className="text-[13px] text-creme-100 font-medium mb-1">Re-engage: Fabien Moreau</p>
            <p className="text-[12px] text-creme-400 leading-relaxed">Streak broken, accuracy declining. Consider a check-in or simplified review assignment.</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(232, 227, 216, 0.02)' }}>
            <p className="text-[13px] text-creme-100 font-medium mb-1">Challenge: Camille Bernard</p>
            <p className="text-[12px] text-creme-400 leading-relaxed">Top performer with 94% accuracy. Ready for advanced content or peer tutoring role.</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(232, 227, 216, 0.02)' }}>
            <p className="text-[13px] text-creme-100 font-medium mb-1">Essay Writing Connectors</p>
            <p className="text-[12px] text-creme-400 leading-relaxed">Multiple students weak on connectors. Assign timed writing exercises using cependant, néanmoins, en revanche.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  const accents: Record<string, { bg: string; border: string }> = {
    encre: { bg: 'rgba(58, 61, 92, 0.08)', border: 'rgba(58, 61, 92, 0.12)' },
    sauge: { bg: 'rgba(122, 139, 109, 0.06)', border: 'rgba(122, 139, 109, 0.1)' },
    lilas: { bg: 'rgba(122, 107, 138, 0.06)', border: 'rgba(122, 107, 138, 0.1)' },
    miel: { bg: 'rgba(184, 148, 63, 0.05)', border: 'rgba(184, 148, 63, 0.1)' },
  };
  const a = accents[accent] || accents.encre;
  return (
    <div className="rounded-[10px] p-5" style={{ background: a.bg, border: `1px solid ${a.border}` }}>
      <span className="text-xl opacity-80">{icon}</span>
      <p className="text-2xl font-serif font-light text-creme-100 mt-2">{value}</p>
      <p className="text-[11px] text-creme-400">{label}</p>
    </div>
  );
}
