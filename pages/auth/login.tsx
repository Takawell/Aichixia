import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type CharacterState = 'idle' | 'typing' | 'covered' | 'peeking' | 'happy' | 'error';

interface Vec2 {
  x: number;
  y: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function useAnimatedValue(target: number, speed = 0.08) {
  const [value, setValue] = useState(target);
  const ref = useRef(target);
  const raf = useRef<number>();

  useEffect(() => {
    const tick = () => {
      ref.current = lerp(ref.current, target, speed);
      setValue(ref.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, speed]);

  return value;
}

function useAnimatedVec2(target: Vec2, speed = 0.06) {
  const [value, setValue] = useState(target);
  const ref = useRef(target);
  const raf = useRef<number>();

  useEffect(() => {
    const tick = () => {
      ref.current = {
        x: lerp(ref.current.x, target.x, speed),
        y: lerp(ref.current.y, target.y, speed),
      };
      setValue({ ...ref.current });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target.x, target.y, speed]);

  return value;
}

interface CharacterProps {
  lookTarget: Vec2;
  state: CharacterState;
  mouseInPanel: boolean;
}

function Character({ lookTarget, state, mouseInPanel }: CharacterProps) {
  const smoothLook = useAnimatedVec2(lookTarget, 0.055);
  const blinkRef = useRef(0);
  const [blinkProgress, setBlinkProgress] = useState(0);
  const blinkRaf = useRef<number>();

  useEffect(() => {
    let t = 0;
    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      setTimeout(() => {
        let progress = 0;
        const doBlink = () => {
          progress += 0.12;
          const p = Math.sin(progress * Math.PI);
          setBlinkProgress(Math.max(0, p));
          if (progress < 1) {
            blinkRaf.current = requestAnimationFrame(doBlink);
          } else {
            setBlinkProgress(0);
            scheduleNextBlink();
          }
        };
        blinkRaf.current = requestAnimationFrame(doBlink);
      }, delay);
    };
    if (state === 'idle' || state === 'typing') scheduleNextBlink();
    return () => { if (blinkRaf.current) cancelAnimationFrame(blinkRaf.current); };
  }, [state]);

  const ex = smoothLook.x * 5;
  const ey = smoothLook.y * 5;
  const headTiltX = smoothLook.x * 3;
  const headTiltY = smoothLook.y * 2;

  const bodySwayX = smoothLook.x * 4;
  const bodySwayY = Math.abs(smoothLook.y) * 2;

  const isCovered = state === 'covered';
  const isPeeking = state === 'peeking';
  const isHappy = state === 'happy';
  const isError = state === 'error';
  const isTyping = state === 'typing';
  const showEyes = !isCovered && !isPeeking;
  const peekAmount = isPeeking ? 0.45 : 0;

  const mouthPath = isHappy
    ? `M 148 ${198 + headTiltY} Q 160 ${208 + headTiltY} 172 ${198 + headTiltY}`
    : isError
    ? `M 148 ${202 + headTiltY} Q 160 ${196 + headTiltY} 172 ${202 + headTiltY}`
    : isTyping
    ? `M 152 ${200 + headTiltY} Q 160 ${204 + headTiltY} 168 ${200 + headTiltY}`
    : `M 150 ${200 + headTiltY} Q 160 ${205 + headTiltY} 170 ${200 + headTiltY}`;

  const eyeScaleY = 1 - blinkProgress * 0.95;

  return (
    <svg
      viewBox="0 0 340 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-80 h-96"
    >
      <g transform={`translate(${bodySwayX * 0.5}, ${bodySwayY * 0.3})`}>

        <rect
          x={145 + bodySwayX * 0.3}
          y={230}
          width={50}
          height={90}
          rx={8}
          fill="#7c3aed"
          style={{ transition: 'none' }}
        />
        <rect
          x={108 + bodySwayX * 0.5}
          y={258}
          width={40}
          height={62}
          rx={7}
          fill="#0f172a"
        />
        <rect
          x={192 + bodySwayX * 0.2}
          y={265}
          width={32}
          height={55}
          rx={6}
          fill="#eab308"
        />
        <circle
          cx={208 + bodySwayX * 0.2}
          cy={261}
          r={10}
          fill="#eab308"
        />

        <circle
          cx={224 + bodySwayX * 0.15}
          cy={298}
          r={34}
          fill="#f97316"
        />
        <circle cx={224 + bodySwayX * 0.15} cy={298} r={34} fill="url(#orangeGrad)" />

        {[
          { cx: 117 + bodySwayX * 0.5, cy: 275, r: 5 },
          { cx: 130 + bodySwayX * 0.5, cy: 275, r: 5 },
        ].map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill="white" opacity={0.8} />
        ))}
        {[
          { cx: 117 + bodySwayX * 0.5, cy: 275, r: 2.5 },
          { cx: 130 + bodySwayX * 0.5, cy: 275, r: 2.5 },
        ].map((dot, i) => (
          <circle key={`p-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#0f172a" />
        ))}

        {[
          { cx: 213 + bodySwayX * 0.15, cy: 291, r: 5 },
          { cx: 235 + bodySwayX * 0.15, cy: 291, r: 5 },
        ].map((dot, i) => (
          <circle key={`oe-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="white" opacity={0.9} />
        ))}
        {[
          { cx: 213 + bodySwayX * 0.15, cy: 291, r: 3 },
          { cx: 235 + bodySwayX * 0.15, cy: 291, r: 3 },
        ].map((dot, i) => (
          <circle key={`op-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#0f172a" />
        ))}
        <path
          d={`M ${210 + bodySwayX * 0.15} ${305} Q ${224 + bodySwayX * 0.15} ${isHappy ? 313 : 308} ${238 + bodySwayX * 0.15} ${305}`}
          stroke="#0f172a"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />

        {[
          { cx: 200 + bodySwayX * 0.2, cy: 268, r: 4.5 },
          { cx: 218 + bodySwayX * 0.2, cy: 268, r: 4.5 },
        ].map((dot, i) => (
          <circle key={`ye-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="white" opacity={0.85} />
        ))}
        {[
          { cx: 200 + bodySwayX * 0.2, cy: 268, r: 2.5 },
          { cx: 218 + bodySwayX * 0.2, cy: 268, r: 2.5 },
        ].map((dot, i) => (
          <circle key={`yp-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#0f172a" />
        ))}
      </g>

      <g transform={`translate(${headTiltX}, ${headTiltY * 0.5})`}>

        <ellipse cx={170} cy={155} rx={52} ry={58} fill="#7c3aed" />
        <ellipse cx={170} cy={148} rx={52} ry={50} fill="#8b5cf6" />

        {isHappy && (
          <>
            <ellipse cx={143} cy={128} rx={7} ry={4} fill="#f9a8d4" opacity={0.5} />
            <ellipse cx={197} cy={128} rx={7} ry={4} fill="#f9a8d4" opacity={0.5} />
          </>
        )}
        {isError && (
          <>
            <ellipse cx={143} cy={128} rx={6} ry={3} fill="#fca5a5" opacity={0.4} />
            <ellipse cx={197} cy={128} rx={6} ry={3} fill="#fca5a5" opacity={0.4} />
          </>
        )}

        {showEyes && (
          <>
            <g transform={`translate(${147 + ex}, ${138 + ey}) scale(1, ${eyeScaleY})`}>
              <ellipse cx={0} cy={0} rx={10} ry={11} fill="white" />
              <circle cx={0} cy={0} r={6} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={3.5} fill="#0f172a" />
              <circle cx={2} cy={-2} r={1.8} fill="white" />
              <circle cx={-2} cy={2} r={0.8} fill="white" opacity={0.6} />
            </g>
            <g transform={`translate(${193 + ex}, ${138 + ey}) scale(1, ${eyeScaleY})`}>
              <ellipse cx={0} cy={0} rx={10} ry={11} fill="white" />
              <circle cx={0} cy={0} r={6} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={3.5} fill="#0f172a" />
              <circle cx={2} cy={-2} r={1.8} fill="white" />
              <circle cx={-2} cy={2} r={0.8} fill="white" opacity={0.6} />
            </g>

            {isTyping && (
              <>
                <path d={`M ${138 + ex} ${126 + ey} Q ${147 + ex} ${122 + ey} ${156 + ex} ${126 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
                <path d={`M ${184 + ex} ${126 + ey} Q ${193 + ex} ${122 + ey} ${202 + ex} ${126 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
              </>
            )}
            {isHappy && (
              <>
                <path d={`M ${138 + ex} ${127 + ey} Q ${147 + ex} ${120 + ey} ${156 + ex} ${127 + ey}`} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                <path d={`M ${184 + ex} ${127 + ey} Q ${193 + ex} ${120 + ey} ${202 + ex} ${127 + ey}`} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />
              </>
            )}
            {isError && (
              <>
                <path d={`M ${138 + ex} ${124 + ey} Q ${147 + ex} ${130 + ey} ${156 + ex} ${124 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
                <path d={`M ${184 + ex} ${124 + ey} Q ${193 + ex} ${130 + ey} ${202 + ex} ${124 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
              </>
            )}
          </>
        )}

        {isCovered && (
          <>
            <rect x={134} y={128} width={28} height={20} rx={5} fill="#4c1d95" />
            <rect x={180} y={128} width={28} height={20} rx={5} fill="#4c1d95" />
            <path d={`M 132 132 Q 148 122 162 132`} stroke="#6d28d9" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d={`M 178 132 Q 194 122 208 132`} stroke="#6d28d9" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d={`M 155 198 Q 170 192 185 198`} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          </>
        )}

        {isPeeking && (
          <>
            <rect x={134} y={134} width={28} height={14} rx={4} fill="#4c1d95" />
            <rect x={180} y={134} width={28} height={14} rx={4} fill="#4c1d95" />
            <path d={`M 132 136 Q 148 126 162 136`} stroke="#6d28d9" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d={`M 178 136 Q 194 126 208 136`} stroke="#6d28d9" strokeWidth={3} strokeLinecap="round" fill="none" />

            <g transform={`translate(${147 + ex}, ${141 + ey}) scale(1, ${0.5})`}>
              <ellipse cx={0} cy={0} rx={10} ry={11} fill="white" />
              <circle cx={0} cy={0} r={6} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={3.5} fill="#0f172a" />
              <circle cx={2} cy={-2} r={1.8} fill="white" />
            </g>
            <g transform={`translate(${193 + ex}, ${141 + ey}) scale(1, ${0.5})`}>
              <ellipse cx={0} cy={0} rx={10} ry={11} fill="white" />
              <circle cx={0} cy={0} r={6} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={3.5} fill="#0f172a" />
              <circle cx={2} cy={-2} r={1.8} fill="white" />
            </g>

            <path d={`M 155 200 Q 170 206 185 200`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
          </>
        )}

        <path d={mouthPath} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />

        {isHappy && (
          <path d={`M 148 ${198 + headTiltY} Q 160 ${212 + headTiltY} 172 ${198 + headTiltY}`} fill="#6d28d9" opacity={0.3} />
        )}
      </g>

      <ellipse cx={170} cy={335} rx={80} ry={9} fill="#0f172a" opacity={0.06} />

      <defs>
        <radialGradient id="orangeGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [charState, setCharState] = useState<CharacterState>('idle');
  const [lookTarget, setLookTarget] = useState<Vec2>({ x: 0, y: 0 });

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout>();
  const activeField = useRef<'none' | 'email' | 'password'>('none');
  const prevState = useRef<CharacterState>('idle');

  const getLookTowardForm = useCallback((): Vec2 => {
    if (!leftPanelRef.current || !formRef.current) return { x: 0.8, y: 0 };
    const lRect = leftPanelRef.current.getBoundingClientRect();
    const fRect = formRef.current.getBoundingClientRect();
    const originX = lRect.left + lRect.width / 2;
    const originY = lRect.top + lRect.height / 2;
    const targetX = fRect.left + fRect.width / 2;
    const targetY = fRect.top + fRect.height / 2;
    const dx = targetX - originX;
    const dy = targetY - originY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / dist, y: dy / dist };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeField.current !== 'none') return;
      if (charState === 'covered') return;
      if (!leftPanelRef.current) return;
      const rect = leftPanelRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2 + 40;
      const dx = e.clientX - originX;
      const dy = e.clientY - originY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      setLookTarget({ x: dx / dist, y: dy / dist });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [charState]);

  const handleEmailFocus = () => {
    activeField.current = 'email';
    setCharState('typing');
    setLookTarget(getLookTowardForm());
  };

  const handleEmailBlur = () => {
    activeField.current = 'none';
    if (charState === 'typing') setCharState('idle');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setCharState('typing');
    setLookTarget(getLookTowardForm());
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (activeField.current === 'email') setCharState('idle');
    }, 1200);
  };

  const handlePasswordFocus = () => {
    activeField.current = 'password';
    if (!showPassword) {
      setCharState('covered');
    } else {
      setCharState('typing');
    }
    setLookTarget(getLookTowardForm());
  };

  const handlePasswordBlur = () => {
    activeField.current = 'none';
    setCharState('idle');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!showPassword) {
      setCharState('covered');
    } else {
      setCharState('typing');
    }
    setLookTarget(getLookTowardForm());
  };

  const handleTogglePassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    if (activeField.current === 'password') {
      setCharState(next ? 'typing' : 'covered');
    }
  };

  const handlePeekEnter = () => {
    if (!showPassword && activeField.current === 'none') {
      setCharState('peeking');
    }
  };

  const handlePeekLeave = () => {
    if (!showPassword && activeField.current === 'none') {
      setCharState('idle');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      setCharState('error');
      setTimeout(() => setCharState('idle'), 2500);
      return;
    }

    setSuccess('Login successful! Redirecting...');
    setCharState('happy');
    setTimeout(() => router.push('/console'), 1000);
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/console` },
    });
    if (authError) {
      setError(authError.message);
      setGithubLoading(false);
      setCharState('error');
      setTimeout(() => setCharState('idle'), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/console` },
    });
    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
      setCharState('error');
      setTimeout(() => setCharState('idle'), 2500);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center relative overflow-hidden select-none"
      >
        <div className="absolute top-8 left-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-600">
            aichixia.xyz
          </span>
        </div>

        <div className="flex flex-col items-center" style={{ marginTop: 48 }}>
          <Character
            lookTarget={lookTarget}
            state={charState}
            mouseInPanel={true}
          />
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-xs leading-relaxed mt-1">
            {charState === 'covered' && 'I\'m not looking, I promise! 🙈'}
            {charState === 'peeking' && 'Just... one peek? 👀'}
            {charState === 'happy' && 'Yay! Welcome back! 🎉'}
            {charState === 'error' && 'Hmm, something went wrong... 😬'}
            {charState === 'typing' && 'Go ahead, I\'m watching! 👁️'}
            {charState === 'idle' && 'One unified API for 20+ AI models.'}
          </p>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-between">
          <span className="text-xs text-slate-300 dark:text-slate-700">OpenAI Compatible</span>
          <span className="text-xs text-slate-300 dark:text-slate-700">Supabase Powered</span>
          <span className="text-xs text-slate-300 dark:text-slate-700">Next.js 14</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white dark:bg-black">
        <div ref={formRef} className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 mb-6">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <polygon points="20,2 38,38 2,38" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-slate-900 dark:text-white" />
                <polygon points="20,10 32,34 8,34" fill="currentColor" opacity="0.15" className="text-sky-500" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your details
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <FiAlertCircle className="text-red-500 dark:text-red-400 text-sm flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <FiCheckCircle className="text-green-500 dark:text-green-400 text-sm flex-shrink-0" />
              <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-1">
            <div className="relative pb-6">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
                placeholder="Email"
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            </div>

            <div className="relative pb-6">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                placeholder="Password"
                required
                className="w-full px-0 py-3 pr-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
              <button
                type="button"
                onMouseEnter={handlePeekEnter}
                onMouseLeave={handlePeekLeave}
                onClick={handleTogglePassword}
                className="absolute right-0 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 pb-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-sky-500 cursor-pointer"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">Remember for 30 days</span>
              </label>
              <a href="#" className="text-xs text-sky-600 dark:text-sky-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-3 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white rounded-full font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              <FaGoogle className="text-base" />
              {googleLoading ? 'Redirecting...' : 'Log In with Google'}
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={githubLoading}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white rounded-full font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              <FaGithub className="text-base" />
              {githubLoading ? 'Redirecting...' : 'Log In with GitHub'}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-slate-900 dark:text-white font-semibold hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
