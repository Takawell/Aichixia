import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const A = '#0ea5e9';
const A2 = '#6366f1';

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

function InputField({ type, value, onChange, placeholder, required, children, isError, dark, label }: {
  type: string; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean; children?: React.ReactNode; isError?: boolean; dark: boolean; label: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 7,
        color: dark ? 'rgba(226,232,240,0.7)' : 'rgba(15,23,42,0.65)', letterSpacing: '0.01em',
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        borderRadius: 13, padding: '0 14px', height: 46,
        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
        border: `1.5px solid ${isError ? '#ef4444' : focused ? A : dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'}`,
        boxShadow: focused ? `0 0 0 4px ${dark ? 'rgba(14,165,233,0.14)' : 'rgba(14,165,233,0.1)'}` : 'none',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background 0.3s ease',
      }}>
        <input
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, height: '100%', background: 'transparent', border: 'none', outline: 'none',
            fontSize: 14, fontWeight: 500, fontFamily: "'Inter',sans-serif",
            color: dark ? '#f1f5f9' : '#0f172a',
          }}
        />
        {children}
      </div>
    </div>
  );
}

function PrimaryBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: 46, borderRadius: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.01em',
        background: `linear-gradient(135deg,${A},${A2})`,
        boxShadow: hov && !loading ? `0 8px 24px rgba(14,165,233,0.38)` : `0 4px 16px rgba(14,165,233,0.28)`,
        transform: hov && !loading ? 'translateY(-1px)' : 'translateY(0)',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {loading && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

function OAuthBtn({ onClick, loading, icon, label, dark }: { onClick: () => void; loading: boolean; icon: React.ReactNode; label: string; dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: 44, borderRadius: 13, cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        marginBottom: 10, fontSize: 13.5, fontWeight: 600,
        color: dark ? '#e2e8f0' : '#334155',
        background: hov ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.035)') : (dark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.55)'),
        border: `1.5px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'}`,
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.18s ease',
      }}
    >
      {loading
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="12" cy="12" r="9" stroke={dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke={dark ? '#e2e8f0' : '#334155'} strokeWidth="3" strokeLinecap="round" />
          </svg>
        : icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GitHubIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={dark ? '#e2e8f0' : '#1f2328'}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.66.8.55C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12 .5z" />
    </svg>
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
  const [remember, setRemember] = useState(false);
  const [shaking, setShaking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const sub = dark ? 'rgba(226,232,240,0.55)' : 'rgba(15,23,42,0.55)';
  const divider = dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes shake{0%,100%{transform:translateX(0);}15%{transform:translateX(-8px);}30%{transform:translateX(8px);}45%{transform:translateX(-5px);}60%{transform:translateX(5px);}75%{transform:translateX(-3px);}90%{transform:translateX(3px);}}
        @keyframes cardIn{from{opacity:0;transform:translateY(18px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.9);}100%{opacity:1;transform:scale(1);}}
        @keyframes auroraDrift{0%,100%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(2%,-3%) rotate(6deg);}}
        @keyframes auroraDrift2{0%,100%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(-3%,2%) rotate(-8deg);}}
        @keyframes slowSpin{to{transform:rotate(360deg);}}
        @keyframes slowSpinRev{to{transform:rotate(-360deg);}}
        @keyframes nodePulse{0%,100%{opacity:0.35;transform:scale(1);}50%{opacity:1;transform:scale(1.6);}}
        @keyframes dashFlow{to{stroke-dashoffset:-200;}}
        @keyframes floatSlow{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
        @keyframes floatSlow2{0%,100%{transform:translateY(0);}50%{transform:translateY(12px);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        .shake{animation:shake 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both;}
        .pop-in{animation:popIn 0.3s cubic-bezier(0.4,0,0.2,1) both;}
        .login-card{animation:cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;}
        .left-copy{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both;}
        input::placeholder{color:${dark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.32)'};}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 9999s ease-in-out 0s;}
        @media(max-width:480px){.login-card{padding:32px 22px !important;}}
        @media(max-width:900px){.geo-panel{display:none !important;} .mobile-brand{display:flex !important;}}
      `}</style>

      <div style={{
        minHeight: '100vh', position: 'relative', display: 'flex',
        background: dark ? '#05070d' : '#f4f8fc',
        transition: 'background 0.35s ease',
      }}>
        <div style={{ position: 'fixed', top: 18, right: 20, zIndex: 20 }}><ThemeToggle /></div>

        <div className="mobile-brand" style={{ display: 'none', position: 'fixed', top: 22, left: 24, zIndex: 20, alignItems: 'center' }}>
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', background: `linear-gradient(135deg,${A},${A2})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            aichixia.xyz
          </span>
        </div>

        {/* LEFT — geometric panel */}
        <div className="geo-panel" style={{
          flex: '0 0 48%', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: dark
            ? 'linear-gradient(160deg,#070b16 0%,#0a1730 55%,#050a14 100%)'
            : 'linear-gradient(160deg,#eef4fb 0%,#e3edf9 55%,#eef6f4 100%)',
          borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
        }}>
          {/* dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: dark
              ? 'radial-gradient(rgba(148,197,255,0.16) 1px,transparent 1.4px)'
              : 'radial-gradient(rgba(14,60,110,0.14) 1px,transparent 1.4px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%,black 45%,transparent 92%)',
          }} />

          {/* ambient glow */}
          <div style={{
            position: 'absolute', width: 480, height: 480, borderRadius: '50%', top: '8%', left: '-12%',
            background: dark ? 'radial-gradient(circle,rgba(14,165,233,0.16),transparent 70%)' : 'radial-gradient(circle,rgba(14,165,233,0.12),transparent 70%)',
            filter: 'blur(20px)', animation: 'auroraDrift 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 420, height: 420, borderRadius: '50%', bottom: '4%', right: '-10%',
            background: dark ? 'radial-gradient(circle,rgba(99,102,241,0.16),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%)',
            filter: 'blur(20px)', animation: 'auroraDrift2 20s ease-in-out infinite',
          }} />

          {/* rotating outline rings */}
          <svg width="420" height="420" viewBox="0 0 420 420" style={{ position: 'absolute', opacity: dark ? 0.5 : 0.4 }}>
            <g style={{ transformOrigin: '210px 210px', animation: 'slowSpin 40s linear infinite' }}>
              <circle cx="210" cy="210" r="168" fill="none" stroke={dark ? 'rgba(148,197,255,0.22)' : 'rgba(14,60,110,0.18)'} strokeWidth="1" strokeDasharray="2 10" strokeLinecap="round" />
            </g>
            <g style={{ transformOrigin: '210px 210px', animation: 'slowSpinRev 55s linear infinite' }}>
              <circle cx="210" cy="210" r="128" fill="none" stroke={dark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.22)'} strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" />
            </g>
            <g style={{ transformOrigin: '210px 210px', animation: 'slowSpin 70s linear infinite' }}>
              <polygon points="210,80 320,150 320,270 210,340 100,270 100,150" fill="none" stroke={dark ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.28)'} strokeWidth="1.2" />
            </g>
          </svg>

          {/* connecting lines + nodes */}
          <svg width="440" height="300" viewBox="0 0 440 300" style={{ position: 'absolute', top: '14%', animation: 'floatSlow 7s ease-in-out infinite' }}>
            <line x1="60" y1="60" x2="220" y2="130" stroke={dark ? 'rgba(148,197,255,0.32)' : 'rgba(14,60,110,0.22)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 6s linear infinite' }} />
            <line x1="220" y1="130" x2="380" y2="70" stroke={dark ? 'rgba(99,102,241,0.32)' : 'rgba(99,102,241,0.24)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 8s linear infinite' }} />
            <line x1="220" y1="130" x2="240" y2="250" stroke={dark ? 'rgba(14,165,233,0.32)' : 'rgba(14,165,233,0.24)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 7s linear infinite' }} />
            <line x1="240" y1="250" x2="90" y2="220" stroke={dark ? 'rgba(148,197,255,0.24)' : 'rgba(14,60,110,0.18)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 9s linear infinite' }} />
            <circle cx="60" cy="60" r="4.5" fill={A} style={{ animation: 'nodePulse 3s ease-in-out infinite' }} />
            <circle cx="220" cy="130" r="6" fill={A2} style={{ animation: 'nodePulse 3s ease-in-out 0.4s infinite' }} />
            <circle cx="380" cy="70" r="4.5" fill={A} style={{ animation: 'nodePulse 3s ease-in-out 0.8s infinite' }} />
            <circle cx="240" cy="250" r="4.5" fill={A2} style={{ animation: 'nodePulse 3s ease-in-out 1.2s infinite' }} />
            <circle cx="90" cy="220" r="4.5" fill={A} style={{ animation: 'nodePulse 3s ease-in-out 1.6s infinite' }} />
          </svg>

          {/* floating geometric outline shapes */}
          <div style={{ position: 'absolute', top: '18%', right: '14%', animation: 'floatSlow2 8s ease-in-out infinite' }}>
            <svg width="54" height="54" viewBox="0 0 54 54"><rect x="4" y="4" width="46" height="46" rx="12" fill="none" stroke={dark ? 'rgba(148,197,255,0.3)' : 'rgba(14,60,110,0.22)'} strokeWidth="1.4" /></svg>
          </div>
          <div style={{ position: 'absolute', bottom: '22%', left: '12%', animation: 'floatSlow 9s ease-in-out infinite' }}>
            <svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,3 37,32 3,32" fill="none" stroke={dark ? 'rgba(14,165,233,0.35)' : 'rgba(14,165,233,0.3)'} strokeWidth="1.4" /></svg>
          </div>

          <div className="left-copy" style={{ position: 'relative', textAlign: 'center', padding: '0 48px', marginTop: 210 }}>
            <span style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', background: `linear-gradient(135deg,${A},${A2})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              aichixia.xyz
            </span>
            <h2 style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 27, fontWeight: 700, marginTop: 14,
              color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.25,
            }}>
              One API,<br />every model.
            </h2>
            <p style={{ fontSize: 13.5, color: dark ? 'rgba(226,232,240,0.5)' : 'rgba(15,23,42,0.5)', marginTop: 10, lineHeight: 1.6 }}>
              A single, reliable endpoint connecting your product to the world's leading AI models.
            </p>
          </div>
        </div>

        {/* RIGHT — login form */}
        <div style={{
          flex: '1 1 52%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', position: 'relative',
        }}>

        <div
          ref={cardRef}
          className={`login-card ${shaking ? 'shake' : ''}`}
          style={{
            position: 'relative', width: '100%', maxWidth: 400, borderRadius: 24,
            padding: '40px 36px 32px',
            background: dark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.55)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)'}`,
            boxShadow: dark
              ? '0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 24px 70px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 15, marginBottom: 18,
              background: `linear-gradient(135deg,${A},${A2})`,
              boxShadow: `0 8px 22px rgba(14,165,233,0.35)`,
            }}>
              <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                <polygon points="16,3 29,26 3,26" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                <polygon points="16,10 24,24 8,24" fill="white" opacity="0.3" />
              </svg>
            </div>
            <h1 style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700,
              color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.02em', marginBottom: 8,
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13.5, color: sub, fontWeight: 500 }}>Sign in to continue to your account</p>
          </div>

          {error && (
            <div className="pop-in" style={{
              marginBottom: 16, padding: '11px 14px', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 9,
              background: dark ? 'rgba(248,113,113,0.1)' : '#fef2f2',
              border: `1px solid ${dark ? 'rgba(248,113,113,0.28)' : '#fecaca'}`,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" /><path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.45 }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="pop-in" style={{
              marginBottom: 16, padding: '11px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9,
              background: dark ? 'rgba(74,222,128,0.1)' : '#f0fdf4',
              border: `1px solid ${dark ? 'rgba(74,222,128,0.28)' : '#bbf7d0'}`,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="1.5" /><path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 12, color: dark ? '#4ade80' : '#16a34a' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <InputField type="email" label="Email" value={email} onChange={setEmail} placeholder="you@example.com" required isError={!!error} dark={dark} />
            <InputField type={showPassword ? 'text' : 'password'} label="Password" value={password} onChange={setPassword} placeholder="••••••••" required isError={!!error} dark={dark}>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  display: 'flex', alignItems: 'center', color: dark ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.35)',
                  transition: 'color 0.18s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = A)}
                onMouseOut={e => (e.currentTarget.style.color = dark ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.35)')}
              >
                {showPassword
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </InputField>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12.5, color: sub, userSelect: 'none', fontWeight: 500 }}>
                <div
                  onClick={() => setRemember(!remember)}
                  style={{
                    width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                    border: `1.5px solid ${remember ? A : dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)'}`,
                    background: remember ? `linear-gradient(135deg,${A},${A2})` : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s ease', cursor: 'pointer',
                  }}
                >
                  {remember && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                Remember me
              </label>
              <a href="#" style={{ fontSize: 12.5, color: A, fontWeight: 600, textDecoration: 'none' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.75')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                Forgot password?
              </a>
            </div>

            <PrimaryBtn loading={loading}>{loading ? 'Signing in...' : 'Log In'}</PrimaryBtn>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: divider }} />
            <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: divider }} />
          </div>

          <OAuthBtn onClick={handleGoogleLogin} loading={googleLoading} icon={<GoogleIcon />} label="Google" dark={dark} />
          <OAuthBtn onClick={handleGithubLogin} loading={githubLoading} icon={<GitHubIcon dark={dark} />} label="GitHub" dark={dark} />

          <p style={{ textAlign: 'center', fontSize: 13, color: sub, marginTop: 18, fontWeight: 500 }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: A, fontWeight: 700, textDecoration: 'none' }} onMouseOver={e => ((e.target as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.target as HTMLElement).style.textDecoration = 'none')}>
              Sign up
            </Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: 11, color: dark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.32)', marginTop: 16, lineHeight: 1.7 }}>
            By signing in, you agree to our{' '}
            <a href="/terms" style={{ color: A, textDecoration: 'none', fontWeight: 500 }} onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: A, textDecoration: 'none', fontWeight: 500 }} onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>Privacy Policy</a>
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
