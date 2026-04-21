import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = mode === 'login' ? login(username, password) : register(username, password);
    if (!result.ok) setError(result.message);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#1a1816' }}
    >
      <div
        className="w-full max-w-md noir-card p-8 lg:p-10 space-y-6"
        style={{ animation: 'crossfadeIn 400ms ease both' }}
      >
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(58, 61, 92, 0.4)', border: '1px solid rgba(58, 61, 92, 0.35)' }}
            >
              <span className="font-serif text-lg font-semibold italic text-creme-200">F</span>
            </div>
          </div>
          <h1 className="font-serif text-2xl font-light text-creme-100 tracking-wide">FrenchMaster</h1>
          <p className="text-[12px] text-creme-500 tracking-widest uppercase">
            {mode === 'login' ? 'Sign in' : 'Create student account'}
          </p>
        </div>

        <div className="flex rounded-lg overflow-hidden text-[13px]" style={{ background: 'rgba(232, 227, 216, 0.04)' }}>
          <button
            type="button"
            className={`flex-1 py-2.5 font-medium transition-colors ${mode === 'login' ? 'text-creme-100' : 'text-creme-500'}`}
            style={mode === 'login' ? { background: 'rgba(58, 61, 92, 0.35)' } : {}}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 font-medium transition-colors ${mode === 'register' ? 'text-creme-100' : 'text-creme-500'}`}
            style={mode === 'register' ? { background: 'rgba(58, 61, 92, 0.35)' } : {}}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-creme-400 uppercase tracking-widest block mb-2">Username</label>
            <input
              className="noir-input w-full px-4 py-3 rounded-lg text-[14px]"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-creme-400 uppercase tracking-widest block mb-2">Password</label>
            <input
              type="password"
              className="noir-input w-full px-4 py-3 rounded-lg text-[14px]"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[13px] text-terre-light" style={{ animation: 'crossfadeIn 200ms ease' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg font-medium text-[14px] text-creme-100 hover-float"
            style={{ background: 'linear-gradient(135deg, #3a3d5c, #4f5375)', border: '1px solid rgba(79, 83, 117, 0.35)' }}
          >
            {mode === 'login' ? 'Continue' : 'Create account'}
          </button>
        </form>

        <p className="text-[11px] text-creme-500 text-center leading-relaxed">
          Progress is saved on this device only.
        </p>
      </div>
    </div>
  );
}
