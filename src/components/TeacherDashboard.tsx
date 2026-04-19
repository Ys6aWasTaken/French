import { useMemo, useSyncExternalStore } from 'react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import {
  getRegisteredStudentSummaries,
  subscribeStudentRoster,
  type StudentSummary,
} from '../utils/studentSummaries';
import { ALL_GRADES, GRADE_SHORT } from '../types';

export function TeacherDashboard() {
  const { isTeacher } = useAuth();
  const store = useStore();

  const studentsKey = useSyncExternalStore(
    subscribeStudentRoster,
    () => JSON.stringify(getRegisteredStudentSummaries()),
    () => '[]'
  );
  const students = useMemo(() => JSON.parse(studentsKey) as StudentSummary[], [studentsKey]);

  const classStats = useMemo(() => {
    const n = students.length;
    if (n === 0) {
      return {
        avgAccuracy: 0,
        avgRetention: 0,
        avgLearned: 0,
        avgTotal: 0,
        activeStudents: 0,
        commonWeak: [] as [string, number][],
        distrib: { excellent: 0, good: 0, average: 0, struggling: 0 },
      };
    }
    const avgAccuracy = Math.round(students.reduce((s, st) => s + st.accuracy, 0) / n);
    const avgRetention = Math.round(students.reduce((s, st) => s + st.retention, 0) / n);
    const avgLearned = Math.round(students.reduce((s, st) => s + st.learned, 0) / n);
    const avgTotal = Math.round(students.reduce((s, st) => s + st.total, 0) / n);
    const activeStudents = students.filter(s => s.streak > 0).length;

    const weakMap: Record<string, number> = {};
    students.forEach(s => s.weakAreas.forEach(w => { weakMap[w] = (weakMap[w] || 0) + 1; }));
    const commonWeak = Object.entries(weakMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const distrib = { excellent: 0, good: 0, average: 0, struggling: 0 };
    students.forEach(s => {
      if (s.accuracy >= 85) distrib.excellent++;
      else if (s.accuracy >= 70) distrib.good++;
      else if (s.accuracy >= 55) distrib.average++;
      else distrib.struggling++;
    });

    return { avgAccuracy, avgRetention, avgLearned, avgTotal, activeStudents, commonWeak, distrib };
  }, [students]);

  const myStats = useMemo(() => {
    const gradeData = ALL_GRADES.map(g => ({
      grade: g,
      ...store.getGradeStats(g),
    }));
    return { gradeData, overallAcc: store.getOverallAccuracy(), overallRet: store.getOverallRetention() };
  }, [store]);

  if (!isTeacher) {
    return (
      <div className="p-7 lg:p-10 max-w-3xl mx-auto">
        <div className="noir-card p-10 text-center space-y-4">
          <span className="text-4xl opacity-80">🔒</span>
          <h2 className="font-serif text-2xl font-light text-creme-100">Teacher access only</h2>
          <p className="text-creme-400 text-sm leading-relaxed">
            Sign in with a teacher account to view this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const nStudents = students.length;

  return (
    <div className="p-7 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div className="fade-up fade-up-1">
        <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">👩‍🏫 Teacher Dashboard</h2>
        <p className="text-creme-400 text-sm mt-1">
          Class overview • {nStudents} registered student{nStudents !== 1 ? 's' : ''} on this device
        </p>
      </div>

      {/* Class Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up fade-up-2">
        <OverviewCard
          icon="👥"
          label="Active (streak)"
          value={nStudents > 0 ? `${classStats.activeStudents}/${nStudents}` : '—'}
          accent="encre"
        />
        <OverviewCard icon="🎯" label="Class accuracy" value={nStudents > 0 ? `${classStats.avgAccuracy}%` : '—'} accent="sauge" />
        <OverviewCard icon="🧠" label="Avg retention" value={nStudents > 0 ? `${classStats.avgRetention}%` : '—'} accent="lilas" />
        <OverviewCard
          icon="📚"
          label="Avg learned / deck"
          value={nStudents > 0 ? `${classStats.avgLearned} / ${classStats.avgTotal}` : '—'}
          accent="miel"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Distribution */}
        <div className="noir-card p-7 fade-up fade-up-3">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📊 Performance distribution</h3>
          {nStudents === 0 ? (
            <p className="text-[13px] text-creme-500">No students yet. Have learners register from the login screen.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Excellent (85%+)', count: classStats.distrib.excellent, color: '#7a8b6d' },
                { label: 'Good (70–84%)', count: classStats.distrib.good, color: '#3a3d5c' },
                { label: 'Average (55–69%)', count: classStats.distrib.average, color: '#b8943f' },
                { label: 'Struggling (&lt;55%)', count: classStats.distrib.struggling, color: '#8b5a42' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-creme-400 w-36 shrink-0">{item.label}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.03)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 flex items-center px-2"
                      style={{
                        width: `${(item.count / nStudents) * 100}%`,
                        minWidth: item.count > 0 ? '24px' : '0',
                        background: item.color,
                      }}
                    >
                      <span className="text-[9px] text-creme-100 font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common Weak Areas */}
        <div className="noir-card p-7 fade-up fade-up-4">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">⚠️ Common tags (weak side)</h3>
          {classStats.commonWeak.length === 0 ? (
            <p className="text-[13px] text-creme-500">No tag data yet (students need study history).</p>
          ) : (
            <div className="space-y-3">
              {classStats.commonWeak.map(([area, count]) => (
                <div
                  key={area}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(139, 90, 66, 0.04)', border: '1px solid rgba(139, 90, 66, 0.08)' }}
                >
                  <span className="text-[13px] text-creme-100 font-medium">{area}</span>
                  <span className="text-[11px] text-terre-light">{count} learner{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Coverage */}
        <div className="noir-card p-7 fade-up fade-up-5">
          <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📈 Your vocabulary coverage</h3>
          <div className="space-y-4">
            {myStats.gradeData.map(g => (
              <div key={g.grade} className="reveal">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-creme-300 font-medium">{GRADE_SHORT[g.grade]}</span>
                  <span className="text-[11px] text-creme-500">{g.learned}/{g.total}</span>
                </div>
                <div className="noir-progress h-2">
                  <div
                    className="noir-progress-fill h-full"
                    style={{
                      width: g.total > 0 ? `${(g.learned / g.total) * 100}%` : '0%',
                      background: 'linear-gradient(90deg, #3a3d5c, #7a6b8a)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="noir-card p-7 fade-up fade-up-6">
        <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">👥 Registered students</h3>
        {nStudents === 0 ? (
          <p className="text-[13px] text-creme-500 py-8 text-center">No student accounts yet. They can register from the login screen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.06)' }}>
                  <th className="text-left py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Student</th>
                  <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Accuracy</th>
                  <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Retention</th>
                  <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Progress</th>
                  <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Streak</th>
                  <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">XP</th>
                  <th className="text-left py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Tags (weak)</th>
                  <th className="text-center py-3 px-3 text-creme-400 font-medium font-sans text-[11px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const pctDeck = student.total > 0 ? Math.round((student.learned / student.total) * 100) : 0;
                  return (
                    <tr
                      key={student.id}
                      className="transition-colors duration-300"
                      style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.03)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232, 227, 216, 0.02)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td className="py-3 px-3">
                        <span className="text-creme-100 font-medium">{student.username}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="font-medium"
                          style={{
                            color: student.accuracy >= 80 ? '#7a8b6d' : student.accuracy >= 60 ? '#b8943f' : '#8b5a42',
                          }}
                        >
                          {student.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-creme-300">{student.retention}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.06)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pctDeck}%`,
                                background: '#3a3d5c',
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-creme-500">{student.learned}/{student.total}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3 text-creme-300">
                        {student.streak > 0 ? `🔥 ${student.streak}` : '—'}
                      </td>
                      <td className="text-center py-3 px-3 text-creme-400">{student.totalXP}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {student.weakAreas.slice(0, 3).map(area => (
                            <span
                              key={area}
                              className="text-[10px] px-1.5 py-0.5 rounded-full text-terre-light"
                              style={{ background: 'rgba(139, 90, 66, 0.08)' }}
                            >
                              {area}
                            </span>
                          ))}
                          {student.weakAreas.length === 0 && <span className="text-[11px] text-creme-500">—</span>}
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
                          {student.accuracy >= 80 && student.streak >= 5
                            ? 'On track'
                            : student.accuracy >= 60
                            ? 'Needs focus'
                            : 'At risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="noir-card p-7 fade-up fade-up-7" style={{ background: 'rgba(58, 61, 92, 0.06)', borderColor: 'rgba(58, 61, 92, 0.1)' }}>
        <h3 className="font-serif text-lg text-creme-100 mb-2 font-light">ℹ️ How this list works</h3>
        <p className="text-[13px] text-creme-400 leading-relaxed">
          Students who register on this browser appear here automatically. Stats read each learner&apos;s saved progress on this device.
          Open this page again after they study, or use another tab — updates sync when storage changes.
        </p>
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
