import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import type { Grade, PageId } from '../types';
import { ALL_GRADES, GRADE_SHORT } from '../types';

const baseNavItems: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'learn', label: 'Learn', icon: '📖' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
  { id: 'exam', label: 'Exam Mode', icon: '⏱️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'import-export', label: 'Import / Export', icon: '📁' },
];

const teacherOnlyNav: { id: PageId; label: string; icon: string } = {
  id: 'teacher',
  label: 'Teacher View',
  icon: '👩‍🏫',
};

interface Props {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  selectedGrade: Grade | 'all';
  onGradeSelect: (grade: Grade | 'all') => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ currentPage, onNavigate, selectedGrade, onGradeSelect, mobileOpen, onMobileClose }: Props) {
  const { getGradeStats, profile, getTotalDue } = useStore();
  const { user, isTeacher, logout } = useAuth();
  const totalDue = getTotalDue();
  const navItems = isTeacher ? [...baseNavItems, teacherOnlyNav] : baseNavItems;

  const nav = (page: PageId) => {
    onNavigate(page);
    onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(18, 17, 15, 0.75)', backdropFilter: 'blur(4px)' }}
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-[280px] flex flex-col
          transform transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: '#1f1c19',
          borderRight: '1px solid rgba(232, 227, 216, 0.04)',
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.04)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(58, 61, 92, 0.4)', border: '1px solid rgba(58, 61, 92, 0.3)' }}
            >
              <span className="text-creme-200 font-serif text-sm font-semibold italic">F</span>
            </div>
            <div>
              <h1 className="font-serif text-[17px] font-medium text-creme-100 tracking-wide">FrenchMaster</h1>
              <p className="text-[10px] text-creme-500 tracking-widest uppercase mt-0.5">Spaced Repetition System</p>
            </div>
          </div>
        </div>

        {/* Streak & XP */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(232, 227, 216, 0.04)' }}>
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-1.5">
              <span className="text-terre">🔥</span>
              <span className="text-creme-300 font-medium">{profile.streakDays} day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-miel">⭐</span>
              <span className="text-creme-300 font-medium">{profile.totalXP} XP</span>
            </div>
          </div>
          {totalDue > 0 && (
            <div
              className="mt-3 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(184, 148, 63, 0.06)', border: '1px solid rgba(184, 148, 63, 0.12)' }}
            >
              <p className="text-[11px] text-miel font-medium">📬 {totalDue} card{totalDue !== 1 ? 's' : ''} due for review</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 text-[9px] font-semibold text-creme-500 uppercase tracking-[0.15em]">Navigation</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => nav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-400 ${
                currentPage === item.id
                  ? 'text-creme-100'
                  : 'text-creme-400 hover:text-creme-200'
              }`}
              style={
                currentPage === item.id
                  ? { background: 'rgba(58, 61, 92, 0.2)', borderLeft: '2px solid rgba(184, 148, 63, 0.5)' }
                  : { borderLeft: '2px solid transparent' }
              }
            >
              <span className="text-sm opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="pt-5">
            <p className="px-3 pb-2 text-[9px] font-semibold text-creme-500 uppercase tracking-[0.15em]">Grade Filter</p>
            <button
              onClick={() => onGradeSelect('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-400 ${
                selectedGrade === 'all' ? 'text-creme-100' : 'text-creme-400 hover:text-creme-200'
              }`}
              style={selectedGrade === 'all' ? { background: 'rgba(122, 139, 109, 0.12)' } : {}}
            >
              All Grades
              <span
                className="text-[11px] px-2 py-0.5 rounded-full text-creme-400"
                style={{ background: 'rgba(232, 227, 216, 0.05)' }}
              >
                {ALL_GRADES.reduce((s, g) => s + getGradeStats(g).total, 0)}
              </span>
            </button>
            {ALL_GRADES.map(grade => {
              const stats = getGradeStats(grade);
              const pct = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;
              return (
                <button
                  key={grade}
                  onClick={() => onGradeSelect(grade)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-400 ${
                    selectedGrade === grade ? 'text-creme-100' : 'text-creme-400 hover:text-creme-200'
                  }`}
                  style={selectedGrade === grade ? { background: 'rgba(122, 139, 109, 0.12)' } : {}}
                >
                  <span>{GRADE_SHORT[grade]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7a8b6d, #8fa080)' }}
                      />
                    </div>
                    <span className="text-[10px] text-creme-500 w-7 text-right">{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Daily Goal */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(232, 227, 216, 0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-creme-500">Daily Goal</span>
            <span className="text-[11px] text-creme-400">{Math.min(profile.todayXP, profile.dailyGoal)}/{profile.dailyGoal} XP</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(232, 227, 216, 0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (profile.todayXP / profile.dailyGoal) * 100)}%`,
                background: 'linear-gradient(90deg, #7a8b6d, #b8943f)',
              }}
            />
          </div>
          {profile.todayXP >= profile.dailyGoal && (
            <p className="text-[11px] text-sauge mt-1.5 font-medium">✅ Goal reached!</p>
          )}
        </div>

        {/* Account */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(232, 227, 216, 0.04)' }}>
          <p className="text-[10px] text-creme-500 uppercase tracking-widest mb-2">Signed in</p>
          <p className="text-[13px] text-creme-200 font-medium truncate" title={user?.username}>
            {user?.username}
            {isTeacher && (
              <span className="ml-2 text-[10px] text-miel font-normal">Teacher</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              onMobileClose();
            }}
            className="mt-3 w-full py-2.5 rounded-lg text-[12px] font-medium text-creme-300 transition-all duration-400 hover:text-creme-100"
            style={{ background: 'rgba(232, 227, 216, 0.04)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
