import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth, userStorageId } from './hooks/useAuth';
import { StoreProvider } from './hooks/useStore';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LearnMode } from './components/LearnMode';
import { QuizEngine } from './components/QuizEngine';
import { ExamMode } from './components/ExamMode';
import { Analytics } from './components/Analytics';
import { ImportExport } from './components/ImportExport';
import { TeacherDashboard } from './components/TeacherDashboard';
import type { Grade, PageId } from './types';

/* ——— Lilac Branch Loading Screen ——— */
function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 4200);
    const removeTimer = setTimeout(() => onComplete(), 5400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1816',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
        pointerEvents: fadeOut ? 'none' as const : 'all' as const,
      }}
    >
      <svg width="280" height="280" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M200 380 C200 340 195 300 190 260 C185 220 178 180 180 140 C182 100 190 70 200 40"
          stroke="#e8e3d8" strokeWidth="1.5" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawPath 3.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards' }}
        />
        <path
          d="M190 260 C175 245 155 235 130 230"
          stroke="#e8e3d8" strokeWidth="1.2" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawPath 3s cubic-bezier(0.22, 0.61, 0.36, 1) 0.4s forwards' }}
        />
        <path
          d="M188 230 C205 215 225 210 250 212"
          stroke="#e8e3d8" strokeWidth="1.2" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawPath 3s cubic-bezier(0.22, 0.61, 0.36, 1) 0.6s forwards' }}
        />
        <path
          d="M182 190 C165 175 145 168 120 170"
          stroke="#e8e3d8" strokeWidth="1.2" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawPath 3s cubic-bezier(0.22, 0.61, 0.36, 1) 0.8s forwards' }}
        />
        <path
          d="M183 155 C200 140 222 133 248 138"
          stroke="#e8e3d8" strokeWidth="1.2" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawPath 3s cubic-bezier(0.22, 0.61, 0.36, 1) 1s forwards' }}
        />
        <path
          d="M185 120 C170 108 152 105 138 108"
          stroke="#e8e3d8" strokeWidth="1" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawPath 3s cubic-bezier(0.22, 0.61, 0.36, 1) 1.2s forwards' }}
        />
        {[
          { cx: 125, cy: 226, r: 4, delay: '1.6s' },
          { cx: 132, cy: 220, r: 3, delay: '1.7s' },
          { cx: 138, cy: 228, r: 3.5, delay: '1.8s' },
          { cx: 245, cy: 208, r: 4, delay: '1.9s' },
          { cx: 252, cy: 214, r: 3, delay: '2s' },
          { cx: 248, cy: 220, r: 3.5, delay: '2.1s' },
          { cx: 115, cy: 166, r: 4, delay: '2.2s' },
          { cx: 122, cy: 172, r: 3, delay: '2.3s' },
          { cx: 118, cy: 160, r: 3.5, delay: '2.4s' },
          { cx: 243, cy: 133, r: 4, delay: '2.5s' },
          { cx: 250, cy: 140, r: 3, delay: '2.6s' },
          { cx: 246, cy: 146, r: 3.5, delay: '2.7s' },
          { cx: 133, cy: 104, r: 3.5, delay: '2.8s' },
          { cx: 140, cy: 110, r: 3, delay: '2.9s' },
          { cx: 196, cy: 38, r: 4, delay: '3s' },
          { cx: 204, cy: 42, r: 3.5, delay: '3.1s' },
        ].map((dot, i) => (
          <circle
            key={i} cx={dot.cx} cy={dot.cy} r={dot.r}
            fill="none" stroke="#e8e3d8" strokeWidth="0.8"
            style={{ opacity: 0, animation: `crossfadeIn 1s ease ${dot.delay} forwards` }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ——— Floating Matisse Cutout ——— */
function FloatingCutout() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '36px',
        right: '36px',
        width: '52px',
        height: '52px',
        zIndex: 40,
        pointerEvents: 'none',
        animation: 'drift 35s infinite ease-in-out',
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.12 }}>
        <path
          d="M50 5 C70 5 90 20 92 40 C94 60 80 75 70 85 C60 95 45 98 30 90 C15 82 5 65 8 45 C11 25 30 5 50 5Z"
          fill="#7a8b6d"
        />
      </svg>
    </div>
  );
}

/* ——— Scroll Reveal Hook ——— */
function useScrollReveal(pageKey: number) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observerRef.current?.observe(el));
    }, 150);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [pageKey]);
}

function AppContent() {
  const { isTeacher } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'all'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(() => {
    try {
      return !sessionStorage.getItem('fm_visited');
    } catch {
      return false;
    }
  });
  const [pageKey, setPageKey] = useState(0);

  useScrollReveal(pageKey);

  const handleNavigate = useCallback((page: PageId) => {
    if (page === 'teacher' && !isTeacher) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage(page);
    }
    setPageKey((k) => k + 1);
    setMobileMenuOpen(false);
  }, [isTeacher]);

  useEffect(() => {
    if (currentPage === 'teacher' && !isTeacher) setCurrentPage('dashboard');
  }, [currentPage, isTeacher]);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
    try {
      sessionStorage.setItem('fm_visited', 'true');
    } catch {
      // storage blocked
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard selectedGrade={selectedGrade} onNavigate={handleNavigate} />;
      case 'learn': return <LearnMode selectedGrade={selectedGrade} onGradeSelect={setSelectedGrade} />;
      case 'quiz': return <QuizEngine selectedGrade={selectedGrade} />;
      case 'exam': return <ExamMode selectedGrade={selectedGrade} />;
      case 'analytics': return <Analytics selectedGrade={selectedGrade} />;
      case 'import-export': return <ImportExport />;
      case 'teacher': return <TeacherDashboard />;
      default: return <Dashboard selectedGrade={selectedGrade} onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {showLoader && <IntroLoader onComplete={handleLoaderComplete} />}

      <div className="flex h-screen overflow-hidden" style={{ background: '#1a1816' }}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          selectedGrade={selectedGrade}
          onGradeSelect={setSelectedGrade}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header
            className="lg:hidden flex items-center justify-between px-5 py-4"
            style={{
              background: '#221f1c',
              borderBottom: '1px solid rgba(232, 227, 216, 0.05)',
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 transition-colors duration-300"
              style={{ color: '#b8b1a4' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-lg font-medium tracking-wide" style={{ color: '#e8e3d8' }}>FrenchMaster</span>
            </div>
            <div className="w-9" />
          </header>

          {/* Page content with crossfade */}
          <div className="flex-1 overflow-y-auto" key={pageKey} style={{ animation: 'crossfadeIn 350ms ease both' }}>
            {renderPage()}
            <footer className="px-7 lg:px-10 py-5 text-[11px] text-creme-500 text-center">
              <p>for any problem contact us :</p>
              <p>Ahmed Raafat +201151449087</p>
              <p>Anas Mahfouz +201111161109</p>
              <p>WhatsApp</p>
            </footer>
          </div>
        </main>
      </div>

      <FloatingCutout />
    </>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return (
    <StoreProvider key={user.username} userStorageId={userStorageId(user.username)} accountUsername={user.username}>
      <AppContent />
    </StoreProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
