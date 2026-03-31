import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface MousePos { x: number; y: number; }

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function useEyeDir(ref: React.RefObject<HTMLElement>, mousePos: MousePos, max = 5) {
  const [dir, setDir] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = mousePos.x - cx;
    const dy = mousePos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    setDir({ x: (dx / dist) * Math.min(max, dist / 25), y: (dy / dist) * Math.min(max, dist / 25) });
  }, [mousePos]);
  return dir;
}

function Eye({ cx, cy, r = 7, pr = 4, dx = 0, dy = 0 }: { cx: number; cy: number; r?: number; pr?: number; dx?: number; dy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <circle cx={cx + dx} cy={cy + dy} r={pr} fill="#1a1a2e" />
      <circle cx={cx + dx + pr * 0.35} cy={cy + dy - pr * 0.35} r={pr * 0.28} fill="white" opacity="0.85" />
    </g>
  );
}

function ClosedEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return <path d={`M${cx - r} ${cy + 1} Q${cx} ${cy - r * 0.7} ${cx + r} ${cy + 1}`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
}

function PeekEye({ cx, cy, dx = 0, r = 7 }: { cx: number; cy: number; dx?: number; r?: number }) {
  return (
    <g>
      <path d={`M${cx - r} ${cy + 2} Q${cx} ${cy - r * 0.4} ${cx + r} ${cy + 2}`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx={cx + dx} cy={cy + 3.5} r={r * 0.5} fill="white" />
      <circle cx={cx + dx + 1} cy={cy + 3} r={r * 0.28} fill="#1a1a2e" />
    </g>
  );
}

function CharTall({ mousePos, isCovered, isPeeking, isError, isSuccess, isTyping }: { mousePos: MousePos; isCovered: boolean; isPeeking: boolean; isError: boolean; isSuccess: boolean; isTyping: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 4);
  const col = isError ? '#e03131' : isSuccess ? '#2f9e44' : '#7048e8';
  const colL = isError ? '#ff6b6b' : isSuccess ? '#51cf66' : '#9775fa';
  return (
    <div ref={ref} className="char-tall" style={{ position: 'absolute', left: 10, bottom: 0 }}>
      <svg width="96" height="200" viewBox="0 0 96 200" style={{ overflow: 'visible', filter: `drop-shadow(0 10px 28px ${col}55)` }}>
        <defs>
          <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colL} /><stop offset="100%" stopColor={col} />
          </linearGradient>
        </defs>
        <rect x="8" y="0" width="80" height="196" rx="14" fill="url(#tg)" />
        <rect x="8" y="0" width="80" height="76" rx="14" fill={col} />
        <rect x="8" y="62" width="80" height="14" fill={col} />
        {isTyping && [0, 1, 2].map(i => (
          <circle key={i} cx={28 + i * 20} cy={185} r="5" fill="white" opacity="0.45"
            style={{ animation: `dotBounce 0.7s ease-in-out ${i * 0.18}s infinite alternate` }} />
        ))}
        {!isCovered && !isPeeking && (
          <>
            <Eye cx={30} cy={36} r={11} pr={6} dx={dir.x} dy={dir.y} />
            <Eye cx={66} cy={36} r={11} pr={6} dx={dir.x} dy={dir.y} />
            {isError && <path d="M20 58 Q48 52 76 58" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
            {isSuccess && <path d="M20 55 Q48 62 76 55" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
            {!isError && !isSuccess && <path d={isTyping ? 'M22 57 Q48 51 74 57' : 'M22 55 Q48 60 74 55'} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />}
          </>
        )}
        {isCovered && !isPeeking && (
          <>
            <ClosedEye cx={30} cy={36} r={11} />
            <ClosedEye cx={66} cy={36} r={11} />
            <path d="M22 56 Q48 51 74 56" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />
          </>
        )}
        {isPeeking && (
          <>
            <PeekEye cx={30} cy={38} dx={dir.x * 0.5} r={11} />
            <PeekEye cx={66} cy={38} dx={dir.x * 0.5} r={11} />
          </>
        )}
      </svg>
    </div>
  );
}

function CharRound({ mousePos, isCovered, isPeeking, isError, isSuccess }: { mousePos: MousePos; isCovered: boolean; isPeeking: boolean; isError: boolean; isSuccess: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 4);
  const col = isError ? '#e8590c' : isSuccess ? '#099268' : '#e8590c';
  const colL = isError ? '#ff922b' : isSuccess ? '#20c997' : '#ff8c5a';
  return (
    <div ref={ref} className="char-round" style={{ position: 'absolute', left: 134, bottom: 0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ overflow: 'visible', filter: `drop-shadow(0 10px 28px ${col}55)` }}>
        <defs>
          <radialGradient id="rg" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colL} /><stop offset="100%" stopColor={col} />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="url(#rg)" />
        {!isCovered && !isPeeking && (
          <>
            <Eye cx={40} cy={52} r={10} pr={5.5} dx={dir.x} dy={dir.y} />
            <Eye cx={80} cy={52} r={10} pr={5.5} dx={dir.x} dy={dir.y} />
            {isError && <path d="M34 76 Q60 68 86 76" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
            {isSuccess && <path d="M34 72 Q60 82 86 72" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
            {!isError && !isSuccess && <path d="M36 72 Q60 81 84 72" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.65" />}
          </>
        )}
        {isCovered && !isPeeking && (
          <>
            <ClosedEye cx={40} cy={52} r={10} />
            <ClosedEye cx={80} cy={52} r={10} />
            <path d="M36 72 Q60 77 84 72" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />
          </>
        )}
        {isPeeking && (
          <>
            <PeekEye cx={40} cy={55} dx={dir.x * 0.5} r={10} />
            <PeekEye cx={80} cy={55} dx={dir.x * 0.5} r={10} />
          </>
        )}
      </svg>
    </div>
  );
}

function CharSmall({ mousePos }: { mousePos: MousePos }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 3);
  return (
    <div ref={ref} className="char-small" style={{ position: 'absolute', left: 276, bottom: 0 }}>
      <svg width="82" height="120" viewBox="0 0 82 120" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 22px rgba(252,196,25,0.55))' }}>
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffe066" /><stop offset="100%" stopColor="#f59f00" />
          </linearGradient>
        </defs>
        <rect x="13" y="32" width="56" height="84" rx="28" fill="url(#sg)" />
        <rect x="25" y="17" width="9" height="22" rx="4.5" fill="#f59f00" />
        <circle cx="29" cy="15" r="9" fill="#f59f00" />
        <Eye cx={30} cy={62} r={8} pr={4.5} dx={dir.x * 0.65} dy={dir.y * 0.65} />
        <Eye cx={52} cy={62} r={8} pr={4.5} dx={dir.x * 0.65} dy={dir.y * 0.65} />
        <path d="M26 78 Q41 85 56 78" stroke="#7b4f00" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.45" />
        <rect x="69" y="68" width="11" height="28" rx="5.5" fill="#f59f00" opacity="0.85" />
        <rect x="2" y="68" width="11" height="28" rx="5.5" fill="#f59f00" opacity="0.85" />
      </svg>
    </div>
  );
}

function CharGhost({ mousePos }: { mousePos: MousePos }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 3.5);
  const [wave, setWave] = useState(0);
  useEffect(() => {
    let raf: number;
    let t = 0;
    const tick = () => { t += 0.04; setWave(Math.sin(t) * 6); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const tailY = 112 + wave * 0.4;
  return (
    <div ref={ref} className="char-ghost" style={{ position: 'absolute', left: 376, bottom: 0 }}>
      <svg width="80" height="130" viewBox="0 0 80 130" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 26px rgba(32,201,151,0.5))' }}>
        <defs>
          <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63e6be" /><stop offset="100%" stopColor="#20c997" />
          </linearGradient>
          <linearGradient id="gg2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38d9a9" /><stop offset="100%" stopColor="#0ca678" />
          </linearGradient>
        </defs>
        <path d={`M8 60 Q8 10 40 10 Q72 10 72 60 L72 ${tailY} Q62 ${tailY - 10} 52 ${tailY} Q42 ${tailY + 10} 40 ${tailY} Q38 ${tailY + 10} 28 ${tailY} Q18 ${tailY - 10} 8 ${tailY} Z`} fill="url(#gg)" />
        <path d={`M8 60 Q8 10 40 10 Q72 10 72 60 L72 68 Q62 58 52 68 Q42 78 40 68 Q38 58 28 68 Q18 78 8 68 Z`} fill="url(#gg2)" opacity="0.35" />
        <Eye cx={27} cy={50} r={9} pr={5} dx={dir.x * 0.7} dy={dir.y * 0.7} />
        <Eye cx={53} cy={50} r={9} pr={5} dx={dir.x * 0.7} dy={dir.y * 0.7} />
        <path d="M28 68 Q40 75 52 68" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        <circle cx="27" cy="30" r="4" fill="white" opacity="0.25" />
        <circle cx="36" cy="22" r="2.5" fill="white" opacity="0.2" />
      </svg>
    </div>
  );
}

function InputField({ type, value, onChange, onFocus, onBlur, placeholder, required, children, isError, dark }: { type: string; value: string; onChange: (v: string) => void; onFocus?: () => void; onBlur?: () => void; placeholder: string; required?: boolean; children?: React.ReactNode; isError?: boolean; dark: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        style={{
          width: '100%', padding: '14px 16px', paddingRight: children ? 50 : 16,
          fontSize: 14, fontFamily: 'inherit',
          color: dark ? '#f1f3f5' : '#1a1a2e',
          background: dark ? (focused ? '#2d2b55' : '#1e1c42') : (focused ? '#faf9ff' : '#f8f9fa'),
          border: `2px solid ${isError ? '#ff6b6b' : focused ? '#6c5ce7' : dark ? '#3d3a6e' : '#e9ecef'}`,
          borderRadius: 14, outline: 'none',
          boxShadow: focused ? `0 0 0 4px ${isError ? 'rgba(255,107,107,0.12)' : 'rgba(108,92,231,0.12)'}` : 'none',
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxSizing: 'border-box',
        }}
      />
      {children && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>{children}</div>}
    </div>
  );
}

function PrimaryBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);
  return (
    <button type="submit" disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        width: '100%', padding: '15px 0', marginBottom: 12,
        background: hov ? 'linear-gradient(135deg,#5f4fe8,#7048e8)' : 'linear-gradient(135deg,#6c5ce7,#9775fa)',
        color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
        border: 'none', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transform: press ? 'scale(0.98)' : hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 8px 32px rgba(108,92,231,0.45)' : '0 4px 16px rgba(108,92,231,0.28)',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '0.02em',
      }}
    >
      {loading && <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
      {children}
    </button>
  );
}

function OAuthBtn({ onClick, loading, icon, label, dark }: { onClick: () => void; loading: boolean; icon: React.ReactNode; label: string; dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '13px 0', marginBottom: 10,
        background: hov ? (dark ? '#2d2b55' : '#f1f3f5') : (dark ? '#1e1c42' : '#f8f9fa'),
        color: dark ? '#e9ecef' : '#2d2d2d', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        border: `2px solid ${dark ? '#3d3a6e' : '#e9ecef'}`, borderRadius: 14,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.18s ease', boxShadow: hov ? '0 2px 12px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {icon}
      {loading ? 'Redirecting...' : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={dark ? '#e9ecef' : '#24292e'}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function FormPanel({ shaking, error, success, email, setEmail, password, setPassword, loading, googleLoading, githubLoading, showPassword, setShowPassword, remember, setRemember, isCovered, setIsCovered, isPeeking, setIsPeeking, handleLogin, handleGoogleLogin, handleGithubLogin, handleTyping, dark }: { shaking: boolean; error: string; success: string; email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void; loading: boolean; googleLoading: boolean; githubLoading: boolean; showPassword: boolean; setShowPassword: (v: boolean) => void; remember: boolean; setRemember: (v: boolean) => void; isCovered: boolean; setIsCovered: (v: boolean) => void; isPeeking: boolean; setIsPeeking: (v: boolean) => void; handleLogin: (e: React.FormEvent) => void; handleGoogleLogin: () => void; handleGithubLogin: () => void; handleTyping: () => void; dark: boolean }) {
  const txt = dark ? '#f1f3f5' : '#1a1a2e';
  const sub = dark ? '#8b8ab8' : '#868e96';
  const divider = dark ? '#3d3a6e' : '#e9ecef';
  const link = '#6c5ce7';

  return (
    <div className={shaking ? 'shake' : ''} style={{ width: '100%', maxWidth: 380 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 15, marginBottom: 18, background: 'linear-gradient(135deg,#6c5ce7,#a29bfe)', boxShadow: '0 4px 22px rgba(108,92,231,0.38)' }}>
          <svg viewBox="0 0 32 32" width="24" height="24" fill="none">
            <polygon points="16,3 29,26 3,26" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            <polygon points="16,10 24,24 8,24" fill="white" opacity="0.28" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: txt, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.1, transition: 'color 0.3s' }}>Welcome back!</h1>
        <p style={{ fontSize: 14, color: sub, fontWeight: 400, transition: 'color 0.3s' }}>Please enter your details</p>
      </div>

      {error && (
        <div className="pop-in" style={{ marginBottom: 18, padding: '12px 16px', background: dark ? 'rgba(255,107,107,0.1)' : '#fff5f5', border: `1.5px solid ${dark ? 'rgba(255,107,107,0.3)' : '#ffc9c9'}`, borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="1.5" />
            <path d="M12 8v4m0 4h.01" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, color: '#fa5252', lineHeight: 1.45 }}>{error}</span>
        </div>
      )}

      {success && (
        <div className="pop-in" style={{ marginBottom: 18, padding: '12px 16px', background: dark ? 'rgba(81,207,102,0.1)' : '#f0fff4', border: `1.5px solid ${dark ? 'rgba(81,207,102,0.3)' : '#b2f2bb'}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#51cf66" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="#51cf66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, color: dark ? '#69db7c' : '#2f9e44' }}>{success}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <InputField type="email" value={email} onChange={v => { setEmail(v); handleTyping(); }} onFocus={() => {}} onBlur={() => {}} placeholder="Email" required isError={!!error} dark={dark} />
        <InputField type={showPassword ? 'text' : 'password'} value={password} onChange={v => { setPassword(v); handleTyping(); }} onFocus={() => { if (!showPassword) setIsCovered(true); }} onBlur={() => { if (!showPassword) setIsCovered(false); }} placeholder="Password" required isError={!!error} dark={dark}>
          <button type="button"
            onMouseEnter={() => { if (!showPassword) { setIsCovered(false); setIsPeeking(true); } }}
            onMouseLeave={() => { if (!showPassword) { setIsPeeking(false); setIsCovered(true); } }}
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#6c6aaa' : '#adb5bd', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.18s' }}
            onMouseOver={e => (e.currentTarget.style.color = '#6c5ce7')}
            onMouseOut={e => (e.currentTarget.style.color = dark ? '#6c6aaa' : '#adb5bd')}
          >
            {showPassword
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            }
          </button>
        </InputField>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: sub, userSelect: 'none', transition: 'color 0.3s' }}>
            <div onClick={() => setRemember(!remember)} style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: `2px solid ${remember ? '#6c5ce7' : dark ? '#4a4880' : '#ced4da'}`, background: remember ? '#6c5ce7' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', cursor: 'pointer' }}>
              {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            Remember for 30 days
          </label>
          <a href="#" style={{ fontSize: 13, color: link, fontWeight: 600, textDecoration: 'none' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.7')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>Forgot password?</a>
        </div>

        <PrimaryBtn loading={loading}>{loading ? 'Signing in...' : 'Log In'}</PrimaryBtn>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: divider, transition: 'background 0.3s' }} />
        <span style={{ fontSize: 12, color: sub, fontWeight: 500, letterSpacing: '0.05em', transition: 'color 0.3s' }}>OR</span>
        <div style={{ flex: 1, height: 1, background: divider, transition: 'background 0.3s' }} />
      </div>

      <OAuthBtn onClick={handleGoogleLogin} loading={googleLoading} icon={<GoogleIcon />} label="Log In with Google" dark={dark} />
      <OAuthBtn onClick={handleGithubLogin} loading={githubLoading} icon={<GitHubIcon dark={dark} />} label="Log In with GitHub" dark={dark} />

      <p style={{ textAlign: 'center', fontSize: 13, color: sub, marginTop: 18, transition: 'color 0.3s' }}>
        Don't have an account?{' '}
        <Link href="/auth/register" style={{ color: link, fontWeight: 700, textDecoration: 'none' }} onMouseOver={e => ((e.target as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.target as HTMLElement).style.textDecoration = 'none')}>Sign Up</Link>
      </p>

      <p style={{ textAlign: 'center', fontSize: 12, color: dark ? '#4a4880' : '#adb5bd', marginTop: 16, lineHeight: 1.7, transition: 'color 0.3s' }}>
        By signing in, you agree to our{' '}
        <a href="/terms" style={{ color: link, textDecoration: 'none', fontWeight: 500 }} onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" style={{ color: link, textDecoration: 'none', fontWeight: 500 }} onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>Privacy Policy</a>
      </p>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const dark = useIsDark();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [isCovered, setIsCovered] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (leftPanelRef.current) {
        const r = leftPanelRef.current.getBoundingClientRect();
        const rx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ry = ((e.clientY - r.top) / r.height - 0.5) * 2;
        setTiltX(rx * 4);
        setTiltY(ry * -4);
      }
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useEffect(() => {
    if (!showPassword) { setIsCovered(true); setIsPeeking(false); }
    else { setIsCovered(false); setIsPeeking(false); }
  }, [showPassword]);

  const handleTyping = () => {
    setIsTyping(true);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => setIsTyping(false), 1200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    setSuccess('Login successful! Redirecting...');
    setTimeout(() => router.push('/console'), 1000);
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/console` } });
    if (authError) { setError(authError.message); setGithubLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/console` } });
    if (authError) { setError(authError.message); setGoogleLoading(false); }
  };

  const bg = dark ? '#13122a' : '#ffffff';
  const leftBg = dark ? 'linear-gradient(148deg,#1a1838 0%,#1e1b40 50%,#221630 100%)' : 'linear-gradient(148deg,#f3f0ff 0%,#ede9fe 45%,#fce4ec 100%)';

  const formProps = { shaking, error, success, email, setEmail, password, setPassword, loading, googleLoading, githubLoading, showPassword, setShowPassword, remember, setRemember, isCovered, setIsCovered, isPeeking, setIsPeeking, handleLogin, handleGoogleLogin, handleGithubLogin, handleTyping, dark };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes shake{0%,100%{transform:translateX(0);}15%{transform:translateX(-9px);}30%{transform:translateX(9px);}45%{transform:translateX(-6px);}60%{transform:translateX(6px);}75%{transform:translateX(-3px);}90%{transform:translateX(3px);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes charBobAlt{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes charBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);}}
        @keyframes charBobSlow{0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
        @keyframes charGhostFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
        @keyframes gradShift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.85);}60%{transform:scale(1.04);}100%{opacity:1;transform:scale(1);}}
        @keyframes orbDrift{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(8px,-12px) scale(1.04);}66%{transform:translate(-6px,6px) scale(0.97);}}
        @keyframes dotBounce{from{transform:translateY(0);}to{transform:translateY(-7px);}}
        @keyframes groundPulse{0%,100%{transform:scaleX(1);opacity:0.18;}50%{transform:scaleX(1.08);opacity:0.28;}}
        @keyframes ghostWiggle{0%,100%{transform:rotate(0deg);}25%{transform:rotate(-3deg);}75%{transform:rotate(3deg);}}
        .char-tall{animation:charBobAlt 3.2s ease-in-out infinite;}
        .char-round{animation:charBob 2.8s ease-in-out 0.4s infinite;}
        .char-small{animation:charBobSlow 3.6s ease-in-out 0.9s infinite;}
        .char-ghost{animation:charGhostFloat 2.4s ease-in-out 1.1s infinite, ghostWiggle 4s ease-in-out infinite;}
        .shake{animation:shake 0.65s cubic-bezier(0.36,0.07,0.19,0.97) both;}
        .pop-in{animation:popIn 0.35s cubic-bezier(0.4,0,0.2,1) both;}
        .right-panel{animation:fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.08s both;}
        .brand-gradient{background:linear-gradient(135deg,#6c5ce7,#a29bfe,#fd79a8);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradShift 5s ease infinite;}
        input::placeholder{color:#8b8ab8;}
        input:focus{outline:none;}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 9999s ease-in-out 0s;}
        @media(max-width:768px){.desktop-left{display:none !important;}}
        @media(min-width:769px){.desktop-left{display:flex !important;}}
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',sans-serif", background: bg, transition: 'background 0.35s ease' }}>

        <div style={{ position: 'fixed', top: 18, right: 22, zIndex: 60 }}>
          <ThemeToggle />
        </div>

        <div
          ref={leftPanelRef}
          className="desktop-left"
          style={{
            flex: '0 0 52%', background: leftBg, position: 'relative', overflow: 'hidden',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.35s ease', perspective: '800px',
          }}
        >
          <div style={{ position: 'absolute', top: 26, left: 30 }}>
            <span className="brand-gradient" style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>aichixia.xyz</span>
          </div>

          {[
            { s: 200, c: dark ? 'rgba(108,92,231,0.18)' : 'rgba(132,94,247,0.22)', x: '4%', y: '6%', d: 0 },
            { s: 140, c: dark ? 'rgba(232,89,12,0.15)' : 'rgba(255,107,53,0.2)', x: '68%', y: '10%', d: 1.2 },
            { s: 110, c: dark ? 'rgba(240,196,25,0.13)' : 'rgba(252,196,25,0.22)', x: '72%', y: '62%', d: 2 },
            { s: 90, c: dark ? 'rgba(81,207,102,0.12)' : 'rgba(81,207,102,0.2)', x: '8%', y: '70%', d: 0.5 },
            { s: 70, c: dark ? 'rgba(230,73,128,0.15)' : 'rgba(240,101,149,0.18)', x: '50%', y: '4%', d: 1.7 },
            { s: 55, c: dark ? 'rgba(32,201,151,0.13)' : 'rgba(32,201,151,0.18)', x: '82%', y: '42%', d: 2.8 },
          ].map((o, i) => (
            <div key={i} style={{
              position: 'absolute', left: o.x, top: o.y, width: o.s, height: o.s, borderRadius: '50%',
              background: o.c, filter: 'blur(2px)',
              animation: `orbDrift ${5 + o.d}s ease-in-out ${o.d}s infinite`,
              pointerEvents: 'none', transition: 'background 0.35s ease',
              transform: `translate(${tiltX * 0.5}px, ${tiltY * 0.5}px)`,
            }} />
          ))}

          <div
            style={{
              position: 'relative', width: 490, height: 230, maxWidth: '90%',
              transform: `rotateX(${tiltY * 0.5}deg) rotateY(${tiltX * 0.5}deg)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            <CharTall mousePos={mousePos} isCovered={isCovered} isPeeking={isPeeking} isError={!!error} isSuccess={!!success} isTyping={isTyping} />
            <CharRound mousePos={mousePos} isCovered={isCovered} isPeeking={isPeeking} isError={!!error} isSuccess={!!success} />
            <CharSmall mousePos={mousePos} />
            <CharGhost mousePos={mousePos} />
            <div style={{
              position: 'absolute', bottom: -10, left: '2%', right: '2%', height: 22,
              background: dark ? 'radial-gradient(ellipse,rgba(108,92,231,0.35) 0%,transparent 70%)' : 'radial-gradient(ellipse,rgba(108,92,231,0.28) 0%,transparent 70%)',
              animation: 'groundPulse 3s ease-in-out infinite', borderRadius: '50%',
              transition: 'background 0.35s ease',
            }} />
          </div>

          <div style={{ marginTop: 36, textAlign: 'center', padding: '0 48px', transform: `translate(${tiltX * 0.8}px, ${tiltY * 0.8}px)`, transition: 'transform 0.15s ease-out' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: dark ? '#a29bfe' : '#6c5ce7', lineHeight: 1.5, transition: 'color 0.3s' }}>
              One unified API for 20+ AI models
            </p>
            <p style={{ fontSize: 13, color: dark ? '#6c6aaa' : '#a29bfe', marginTop: 6, letterSpacing: '0.02em', fontWeight: 500, transition: 'color 0.3s' }}>
              Fast · Open Source · Ready to use
            </p>
          </div>

          <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 22 }}>
            {['OpenAI Compatible', 'Supabase', 'Next.js 14'].map(t => (
              <span key={t} style={{ fontSize: 11, color: dark ? '#4a4880' : '#c5bef8', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 500, transition: 'color 0.3s' }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="right-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 32px 40px', background: bg, transition: 'background 0.35s ease' }}>
          <FormPanel {...formProps} />
        </div>

      </div>
    </>
  );
}
