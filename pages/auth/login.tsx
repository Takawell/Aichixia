import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type CharState = 'idle' | 'typing' | 'covered' | 'peeking' | 'happy' | 'error';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function useSmoothValue(target: number, speed = 0.07) {
  const val = useRef(target);
  const [v, setV] = useState(target);
  const raf = useRef<number>();
  useEffect(() => {
    const tick = () => {
      val.current = lerp(val.current, target, speed);
      setV(val.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, speed]);
  return v;
}

function useBlink(active: boolean) {
  const [blink, setBlink] = useState(0);
  useEffect(() => {
    if (!active) { setBlink(0); return; }
    let cancelled = false;
    const schedule = () => {
      const wait = 2000 + Math.random() * 3500;
      setTimeout(() => {
        if (cancelled) return;
        let p = 0;
        const step = () => {
          if (cancelled) return;
          p += 0.15;
          setBlink(Math.max(0, Math.sin(p * Math.PI)));
          if (p < 1) requestAnimationFrame(step);
          else { setBlink(0); schedule(); }
        };
        requestAnimationFrame(step);
      }, wait);
    };
    schedule();
    return () => { cancelled = true; };
  }, [active]);
  return blink;
}

interface GroupProps {
  lx: number;
  ly: number;
  state: CharState;
}

function CharacterGroup({ lx, ly, state }: GroupProps) {
  const ex = useSmoothValue(lx * 4.5, 0.06);
  const ey = useSmoothValue(ly * 4.5, 0.06);
  const tiltX = useSmoothValue(lx * 5, 0.05);
  const tiltY = useSmoothValue(ly * 2.5, 0.05);
  const blink = useBlink(state === 'idle' || state === 'typing');

  const isCovered = state === 'covered';
  const isPeeking = state === 'peeking';
  const isHappy = state === 'happy';
  const isError = state === 'error';
  const isTyping = state === 'typing';

  const eyeScaleY = 1 - blink * 0.92;

  const purpleMouth = isHappy
    ? `M 152 ${248 + tiltY} Q 163 ${258 + tiltY} 174 ${248 + tiltY}`
    : isError
    ? `M 152 ${253 + tiltY} Q 163 ${246 + tiltY} 174 ${253 + tiltY}`
    : isTyping
    ? `M 155 ${250 + tiltY} Q 163 ${254 + tiltY} 171 ${250 + tiltY}`
    : `M 154 ${250 + tiltY} Q 163 ${256 + tiltY} 172 ${250 + tiltY}`;

  const orangeMouth = isHappy
    ? `M 74 ${360} Q 85 ${370} 96 ${360}`
    : isError
    ? `M 74 ${364} Q 85 ${357} 96 ${364}`
    : `M 76 ${362} Q 85 ${367} 94 ${362}`;

  return (
    <svg
      viewBox="0 0 290 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xs h-auto"
      style={{ maxHeight: 360 }}
    >
      <defs>
        <radialGradient id="purpleG" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <radialGradient id="orangeG" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
        <radialGradient id="blackG" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id="yellowG" cx="38%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        <filter id="shadow" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>

      <ellipse cx={145} cy={412} rx={110} ry={9} fill="#0f172a" opacity={0.08} />

      <g transform={`translate(${tiltX * 0.2}, ${tiltY * 0.1})`} filter="url(#shadow)">
        <ellipse cx={85} cy={396} rx={60} ry={30} fill="url(#orangeG)" />
        <ellipse cx={85} cy={380} rx={60} ry={18} fill="url(#orangeG)" />

        <circle cx={72} cy={355} r={3.5} fill="#7c2d12" opacity={0.7} />
        <circle cx={98} cy={355} r={3.5} fill="#7c2d12" opacity={0.7} />

        <path d={orangeMouth} stroke="#7c2d12" strokeWidth={2.5} strokeLinecap="round" fill="none" />

        {isHappy && (
          <path d={`M 74 360 Q 85 372 96 360`} fill="#ea580c" opacity={0.3} />
        )}
      </g>

      <g transform={`translate(${tiltX * 0.35}, ${tiltY * 0.2})`} filter="url(#shadow)">
        <rect x={148} y={265} width={52} height={120} rx={10} fill="url(#blackG)" />
        <rect x={148} y={265} width={52} height={30} rx={10} fill="#1e293b" />

        <circle cx={163} cy={288} r={4.5} fill="white" opacity={0.9} />
        <circle cx={182} cy={288} r={4.5} fill="white" opacity={0.9} />
        <circle cx={163} cy={288} r={2.5} fill="#0f172a" />
        <circle cx={182} cy={288} r={2.5} fill="#0f172a" />

        <rect x={161} cy={310} width={26} height={3} rx={1.5} fill="white" opacity={0.15} y={310} />
        <rect x={161} cy={316} width={18} height={3} rx={1.5} fill="white" opacity={0.1} y={316} />
      </g>

      <g transform={`translate(${tiltX * 0.45}, ${tiltY * 0.25})`} filter="url(#shadow)">
        <rect x={193} y={290} width={46} height={95} rx={22} fill="url(#yellowG)" />
        <rect x={193} y={290} width={46} height={46} rx={22} fill="url(#yellowG)" />

        <circle cx={216} cy={313} r={5} fill="white" opacity={0.9} />
        <circle cx={216} cy={313} r={3} fill="#78350f" />
        <circle cx={218} cy={311} r={1.2} fill="white" />

        <rect x={239} y={321} width={18} height={4} rx={2} fill="url(#yellowG)" />
        <rect x={239} y={321} width={18} height={4} rx={2} fill="#a16207" opacity={0.5} />
      </g>

      <g transform={`translate(${tiltX * 0.6}, ${tiltY * 0.4})`} filter="url(#shadow)">
        <rect
          x={114}
          y={140}
          width={86}
          height={165}
          rx={14}
          fill="url(#purpleG)"
          style={{ transformOrigin: '157px 310px' }}
        />
        <rect x={114} y={140} width={86} height={36} rx={14} fill="#7c3aed" />

        {!isCovered && !isPeeking && (
          <>
            <g transform={`translate(${143 + ex + tiltX * 0.3}, ${173 + ey + tiltY * 0.3})`}>
              <ellipse cx={0} cy={0} rx={8} ry={9 * eyeScaleY} fill="white" />
              <circle cx={0} cy={0} r={5} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={3} fill="#0f172a" />
              <circle cx={1.5} cy={-1.5} r={1.5} fill="white" />
              <circle cx={-1.5} cy={1.5} r={0.7} fill="white" opacity={0.5} />
            </g>
            <g transform={`translate(${171 + ex + tiltX * 0.3}, ${173 + ey + tiltY * 0.3})`}>
              <ellipse cx={0} cy={0} rx={8} ry={9 * eyeScaleY} fill="white" />
              <circle cx={0} cy={0} r={5} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={3} fill="#0f172a" />
              <circle cx={1.5} cy={-1.5} r={1.5} fill="white" />
              <circle cx={-1.5} cy={1.5} r={0.7} fill="white" opacity={0.5} />
            </g>

            {isTyping && (
              <>
                <path d={`M ${136 + ex} ${162 + ey} Q ${143 + ex} ${157 + ey} ${150 + ex} ${162 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
                <path d={`M ${164 + ex} ${162 + ey} Q ${171 + ex} ${157 + ey} ${178 + ex} ${162 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
              </>
            )}
            {isHappy && (
              <>
                <path d={`M ${136 + ex} ${163 + ey} Q ${143 + ex} ${156 + ey} ${150 + ex} ${163 + ey}`} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                <path d={`M ${164 + ex} ${163 + ey} Q ${171 + ex} ${156 + ey} ${178 + ex} ${163 + ey}`} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                <ellipse cx={136} cy={172} rx={6} ry={3.5} fill="#f9a8d4" opacity={0.45} />
                <ellipse cx={178} cy={172} rx={6} ry={3.5} fill="#f9a8d4" opacity={0.45} />
              </>
            )}
            {isError && (
              <>
                <path d={`M ${136 + ex} ${160 + ey} Q ${143 + ex} ${166 + ey} ${150 + ex} ${160 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
                <path d={`M ${164 + ex} ${160 + ey} Q ${171 + ex} ${166 + ey} ${178 + ex} ${160 + ey}`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
              </>
            )}
          </>
        )}

        {isCovered && (
          <>
            <rect x={131} y={163} width={26} height={18} rx={5} fill="#4c1d95" />
            <rect x={159} y={163} width={26} height={18} rx={5} fill="#4c1d95" />
            <path d={`M 129 167 Q 144 157 159 167`} stroke="#5b21b6" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d={`M 157 167 Q 172 157 187 167`} stroke="#5b21b6" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d={`M 150 252 Q 157 247 164 252`} stroke="#5b21b6" strokeWidth={2} strokeLinecap="round" fill="none" />

            <g opacity={0.6}>
              <path d={`M 126 155 Q 135 140 148 150`} stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" fill="none" />
              <path d={`M 168 150 Q 181 140 190 155`} stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            </g>
          </>
        )}

        {isPeeking && (
          <>
            <rect x={131} y={168} width={26} height={12} rx={4} fill="#4c1d95" />
            <rect x={159} y={168} width={26} height={12} rx={4} fill="#4c1d95" />
            <path d={`M 129 170 Q 144 161 159 170`} stroke="#5b21b6" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            <path d={`M 157 170 Q 172 161 187 170`} stroke="#5b21b6" strokeWidth={2.5} strokeLinecap="round" fill="none" />

            <g transform={`translate(${143 + ex * 0.5}, 175)`}>
              <ellipse cx={0} cy={0} rx={8} ry={5} fill="white" />
              <circle cx={0} cy={0} r={3.5} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={2} fill="#0f172a" />
              <circle cx={1} cy={-1} r={1} fill="white" />
            </g>
            <g transform={`translate(${171 + ex * 0.5}, 175)`}>
              <ellipse cx={0} cy={0} rx={8} ry={5} fill="white" />
              <circle cx={0} cy={0} r={3.5} fill="#1e1b4b" />
              <circle cx={0} cy={0} r={2} fill="#0f172a" />
              <circle cx={1} cy={-1} r={1} fill="white" />
            </g>
          </>
        )}

        <path d={purpleMouth} stroke="#4c1d95" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        {isHappy && (
          <path d={`M 152 ${248 + tiltY} Q 163 ${260 + tiltY} 174 ${248 + tiltY}`} fill="#5b21b6" opacity={0.25} />
        )}
      </g>
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

  const [charState, setCharState] = useState<CharState>('idle');
  const [lookX, setLookX] = useState(0);
  const [lookY, setLookY] = useState(0);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const activeField = useRef<'none' | 'email' | 'password'>('none');
  const typingTimer = useRef<NodeJS.Timeout>();
  const errorTimer = useRef<NodeJS.Timeout>();

  const getLookToForm = useCallback((): [number, number] => {
    if (!leftPanelRef.current || !formRef.current) return [1, 0];
    const lr = leftPanelRef.current.getBoundingClientRect();
    const fr = formRef.current.getBoundingClientRect();
    const ox = lr.left + lr.width / 2;
    const oy = lr.top + lr.height / 2;
    const tx = fr.left + fr.width / 2;
    const ty = fr.top + fr.height / 2;
    const dx = tx - ox;
    const dy = ty - oy;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / d, dy / d];
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (activeField.current !== 'none') return;
      if (charState === 'covered') return;
      if (!leftPanelRef.current) return;
      const r = leftPanelRef.current.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2 + 30;
      const dx = e.clientX - ox;
      const dy = e.clientY - oy;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      setLookX(dx / d);
      setLookY(dy / d);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [charState]);

  const pointToForm = useCallback(() => {
    const [lx, ly] = getLookToForm();
    setLookX(lx);
    setLookY(ly);
  }, [getLookToForm]);

  const triggerError = () => {
    setCharState('error');
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setCharState('idle'), 3000);
  };

  const handleEmailFocus = () => {
    activeField.current = 'email';
    setCharState('typing');
    pointToForm();
  };

  const handleEmailBlur = () => {
    activeField.current = 'none';
    setCharState('idle');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setCharState('typing');
    pointToForm();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (activeField.current === 'email') setCharState('idle');
    }, 1500);
  };

  const handlePasswordFocus = () => {
    activeField.current = 'password';
    setCharState(showPassword ? 'typing' : 'covered');
    pointToForm();
  };

  const handlePasswordBlur = () => {
    activeField.current = 'none';
    setCharState('idle');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setCharState(showPassword ? 'typing' : 'covered');
    pointToForm();
  };

  const handleTogglePassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    if (activeField.current === 'password') {
      setCharState(next ? 'typing' : 'covered');
    }
  };

  const handlePeekEnter = () => {
    if (!showPassword && activeField.current === 'none') setCharState('peeking');
  };

  const handlePeekLeave = () => {
    if (!showPassword && activeField.current === 'none') setCharState('idle');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      triggerError();
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
      triggerError();
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
      triggerError();
    }
  };

  const caption: Record<CharState, string> = {
    idle: 'One unified API for 20+ AI models.',
    typing: "Go ahead, I'm watching! 👀",
    covered: "I'm not looking, I promise! 🙈",
    peeking: 'Just… a little peek? 👀',
    happy: 'Yay! Welcome back! 🎉',
    error: 'Hmm, something went wrong… 😬',
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:flex-1 bg-slate-100 dark:bg-slate-950 flex-col items-center justify-center relative overflow-hidden select-none"
      >
        <div className="absolute top-8 left-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-600">
            aichixia.xyz
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 px-8" style={{ marginTop: 32 }}>
          <CharacterGroup lx={lookX} ly={lookY} state={charState} />
          <p
            className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-xs leading-relaxed"
            style={{ minHeight: 40, transition: 'opacity 0.3s ease' }}
          >
            {caption[charState]}
          </p>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-between">
          <span className="text-xs text-slate-300 dark:text-slate-700">OpenAI Compatible</span>
          <span className="text-xs text-slate-300 dark:text-slate-700">Supabase Powered</span>
          <span className="text-xs text-slate-300 dark:text-slate-700">Next.js 14</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-12 bg-white dark:bg-black">
        <div ref={formRef} className="w-full max-w-sm">

          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 mb-2" style={{ maxHeight: 120 }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
                <rect x={20} y={10} width={38} height={60} rx={7} fill="#7c3aed" />
                <ellipse cx={30} cy={25} rx={5} ry={6} fill="white" />
                <ellipse cx={48} cy={25} rx={5} ry={6} fill="white" />
                <circle cx={30} cy={25} r={3} fill="#0f172a" />
                <circle cx={48} cy={25} r={3} fill="#0f172a" />
                <path d={`M 30 38 Q 39 44 48 38`} stroke="#4c1d95" strokeWidth={2} strokeLinecap="round" fill="none" />
                <circle cx={18} cy={65} r={22} fill="#f97316" />
                <circle cx={65} cy={72} r={16} fill="#eab308" />
                <rect x={44} y={42} width={20} height={38} rx={5} fill="#0f172a" />
              </svg>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your details
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
              <FiAlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2">
              <FiCheckCircle className="text-green-500 dark:text-green-400 flex-shrink-0" />
              <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-0">
            <div className="relative pb-7">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
                placeholder="Email"
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-slate-900 dark:focus:border-slate-200 transition-all duration-300"
              />
            </div>

            <div className="relative pb-7">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                placeholder="Password"
                required
                className="w-full px-0 py-3 pr-9 bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-slate-900 dark:focus:border-slate-200 transition-all duration-300"
              />
              <button
                type="button"
                onMouseEnter={handlePeekEnter}
                onMouseLeave={handlePeekLeave}
                onClick={handleTogglePassword}
                className="absolute right-0 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 pb-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 accent-sky-500 cursor-pointer"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 select-none">Remember for 30 days</span>
              </label>
              <a href="#" className="text-xs text-sky-600 dark:text-sky-400 hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 active:scale-95 text-white dark:text-slate-900 rounded-full font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-3 flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white rounded-full font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2.5"
            >
              <FaGoogle size={14} />
              {googleLoading ? 'Redirecting...' : 'Log In with Google'}
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={githubLoading}
              className="w-full py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white rounded-full font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2.5"
            >
              <FaGithub size={14} />
              {githubLoading ? 'Redirecting...' : 'Log In with GitHub'}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-slate-900 dark:text-white font-semibold hover:underline transition-colors"
            >
              Sign Up
            </Link>
          </p>

          <p className="text-center text-xs text-slate-300 dark:text-slate-700 mt-4">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-slate-500 dark:hover:text-slate-500 transition-colors">Terms</Link>
            {' & '}
            <Link href="/privacy" className="underline hover:text-slate-500 dark:hover:text-slate-500 transition-colors">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
