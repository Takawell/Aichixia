import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

function AbstractCharacter({
  eyeX,
  eyeY,
  isTyping,
  isCovered,
  isPeeking,
}: {
  eyeX: number;
  eyeY: number;
  isTyping: boolean;
  isCovered: boolean;
  isPeeking: boolean;
}) {
  const maxShift = 6;
  const ex = Math.max(-maxShift, Math.min(maxShift, eyeX * maxShift));
  const ey = Math.max(-maxShift, Math.min(maxShift, eyeY * maxShift));

  return (
    <svg
      viewBox="0 0 320 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-72 h-80 drop-shadow-xl"
      style={{ transition: 'filter 0.3s ease' }}
    >
      <circle cx="160" cy="290" r="110" fill="#38bdf8" opacity="0.08" />
      <circle cx="160" cy="290" r="75" fill="#38bdf8" opacity="0.1" />

      <rect x="105" y="155" width="70" height="135" rx="10" fill="#7c3aed" />
      <rect x="105" y="155" width="70" height="30" rx="10" fill="#6d28d9" />

      <rect x="68" y="198" width="55" height="92" rx="8" fill="#0f172a" />
      <rect x="68" y="198" width="55" height="22" rx="8" fill="#1e293b" />

      <circle cx="220" cy="272" r="42" fill="#f97316" />
      <circle cx="220" cy="272" r="42" fill="url(#orangeShade)" />

      <rect x="178" y="218" width="24" height="62" rx="5" fill="#eab308" />
      <circle cx="190" cy="214" r="12" fill="#eab308" />

      <ellipse cx="160" cy="310" rx="95" ry="10" fill="#0f172a" opacity="0.07" />

      <defs>
        <radialGradient id="orangeShade" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
      </defs>

      {!isCovered && !isPeeking && (
        <>
          <circle cx={126 + ex} cy={182 + ey} r="7" fill="white" />
          <circle cx={126 + ex} cy={182 + ey} r="4" fill="#0f172a" />
          <circle cx={126 + ex + 1.5} cy={182 + ey - 1.5} r="1.2" fill="white" />

          <circle cx={162 + ex} cy={182 + ey} r="7" fill="white" />
          <circle cx={162 + ex} cy={182 + ey} r="4" fill="#0f172a" />
          <circle cx={162 + ex + 1.5} cy={182 + ey - 1.5} r="1.2" fill="white" />

          <circle cx={84 + ex * 0.6} cy={218 + ey * 0.6} r="6" fill="white" />
          <circle cx={84 + ex * 0.6} cy={218 + ey * 0.6} r="3.5" fill="#0f172a" />
          <circle cx={84 + ex * 0.6 + 1} cy={218 + ey * 0.6 - 1} r="1" fill="white" />

          <circle cx={107 + ex * 0.6} cy={218 + ey * 0.6} r="6" fill="white" />
          <circle cx={107 + ex * 0.6} cy={218 + ey * 0.6} r="3.5" fill="#0f172a" />
          <circle cx={107 + ex * 0.6 + 1} cy={218 + ey * 0.6 - 1} r="1" fill="white" />

          <circle cx={208 + ex * 0.5} cy={265 + ey * 0.5} r="7" fill="white" />
          <circle cx={208 + ex * 0.5} cy={265 + ey * 0.5} r="4" fill="#0f172a" />
          <circle cx={208 + ex * 0.5 + 1.5} cy={265 + ey * 0.5 - 1.5} r="1.2" fill="white" />

          <circle cx={232 + ex * 0.5} cy={265 + ey * 0.5} r="7" fill="white" />
          <circle cx={232 + ex * 0.5} cy={265 + ey * 0.5} r="4" fill="#0f172a" />
          <circle cx={232 + ex * 0.5 + 1.5} cy={265 + ey * 0.5 - 1.5} r="1.2" fill="white" />

          {isTyping && (
            <>
              <path d="M118 192 Q126 196 134 192" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M154 192 Q162 196 170 192" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {!isTyping && (
            <>
              <path d="M119 193 Q126 189 133 193" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M155 193 Q162 189 169 193" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </>
          )}

          <path d="M205 278 Q220 286 235 278" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {isCovered && !isPeeking && (
        <>
          <rect x="108" y="168" width="62" height="22" rx="4" fill="#4c1d95" />
          <path d="M108 172 Q139 162 170 172" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" fill="none" />

          <rect x="68" y="207" width="54" height="18" rx="4" fill="#0f172a" />
          <path d="M68 211 Q95 202 122 211" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          <rect x="196" y="255" width="50" height="18" rx="4" fill="#c2410c" />
          <path d="M196 259 Q221 250 246 259" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          <path d="M205 285 Q220 280 235 285" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {isPeeking && (
        <>
          <rect x="108" y="174" width="62" height="16" rx="4" fill="#4c1d95" />
          <path d="M108 174 Q139 164 170 174" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" fill="none" />

          <circle cx="126" cy="183" r="5" fill="white" />
          <circle cx="126" cy="183" r="3" fill="#0f172a" />

          <circle cx="162" cy="183" r="5" fill="white" />
          <circle cx="162" cy="183" r="3" fill="#0f172a" />

          <rect x="68" y="212" width="54" height="12" rx="4" fill="#0f172a" />
          <path d="M68 212 Q95 203 122 212" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          <circle cx="84" cy="220" r="4.5" fill="white" />
          <circle cx="84" cy="220" r="2.5" fill="#0f172a" />

          <circle cx="107" cy="220" r="4.5" fill="white" />
          <circle cx="107" cy="220" r="2.5" fill="#0f172a" />

          <rect x="196" y="261" width="50" height="12" rx="4" fill="#c2410c" />
          <path d="M196 261 Q221 252 246 261" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          <circle cx="208" cy="269" r="5" fill="white" />
          <circle cx="208" cy="269" r="3" fill="#0f172a" />

          <circle cx="232" cy="269" r="5" fill="white" />
          <circle cx="232" cy="269" r="3" fill="#0f172a" />

          <path d="M205 282 Q220 288 235 282" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      <circle cx="95" cy="128" r="8" fill="#38bdf8" opacity="0.35" />
      <circle cx="248" cy="155" r="5" fill="#7c3aed" opacity="0.35" />
      <circle cx="268" cy="238" r="6" fill="#f97316" opacity="0.3" />
      <circle cx="78" cy="265" r="4" fill="#eab308" opacity="0.4" />
      <circle cx="230" cy="320" r="5" fill="#38bdf8" opacity="0.25" />
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

  const [eyeX, setEyeX] = useState(0);
  const [eyeY, setEyeY] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isCovered, setIsCovered] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isTyping || isCovered || isPeeking) return;
      if (!leftPanelRef.current) return;
      const rect = leftPanelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      setEyeX(dx / dist);
      setEyeY(dy / dist);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTyping, isCovered, isPeeking]);

  const pointToForm = () => {
    if (!leftPanelRef.current || !formRef.current) return;
    const lRect = leftPanelRef.current.getBoundingClientRect();
    const fRect = formRef.current.getBoundingClientRect();
    const charCX = lRect.left + lRect.width / 2;
    const charCY = lRect.top + lRect.height / 2;
    const formCX = fRect.left + fRect.width / 2;
    const formCY = fRect.top + fRect.height / 2;
    const dx = formCX - charCX;
    const dy = formCY - charCY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    setEyeX(dx / dist);
    setEyeY(dy / dist);
  };

  const handleTyping = () => {
    setIsTyping(true);
    pointToForm();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (!showPassword) {
      setIsCovered(true);
      setIsPeeking(false);
    } else {
      setIsCovered(false);
      setIsPeeking(false);
    }
  }, [showPassword]);

  const handlePeekHover = () => {
    if (!showPassword) {
      setIsCovered(false);
      setIsPeeking(true);
    }
  };

  const handlePeekLeave = () => {
    if (!showPassword) {
      setIsPeeking(false);
      setIsCovered(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess('Login successful! Redirecting...');
    setTimeout(() => {
      router.push('/console');
    }, 1000);
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/console`,
      },
    });

    if (authError) {
      setError(authError.message);
      setGithubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/console`,
      },
    });

    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-8 left-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-600">
            aichixia.xyz
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <AbstractCharacter
            eyeX={eyeX}
            eyeY={eyeY}
            isTyping={isTyping}
            isCovered={isCovered}
            isPeeking={isPeeking}
          />
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-xs leading-relaxed mt-2">
            One unified API for 20+ AI models — fast, open source, and ready to use.
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
                onChange={(e) => { setEmail(e.target.value); handleTyping(); }}
                onFocus={() => { setIsTyping(true); pointToForm(); }}
                onBlur={() => { setIsTyping(false); }}
                placeholder="Email"
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            </div>

            <div className="relative pb-6">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); handleTyping(); }}
                onFocus={() => { setIsTyping(false); setIsCovered(!showPassword); pointToForm(); }}
                onBlur={() => { setIsCovered(false); setIsTyping(false); }}
                placeholder="Password"
                required
                className="w-full px-0 py-3 pr-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
              <button
                type="button"
                onMouseEnter={handlePeekHover}
                onMouseLeave={handlePeekLeave}
                onClick={() => setShowPassword(!showPassword)}
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
