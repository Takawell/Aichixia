import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

function AbstractIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-72 h-72">
      <circle cx="200" cy="260" r="80" fill="#38bdf8" opacity="0.15" />
      <circle cx="200" cy="260" r="55" fill="#38bdf8" opacity="0.2" />

      <rect x="155" y="150" width="50" height="110" rx="6" fill="#7c3aed" />
      <rect x="175" y="162" width="6" height="6" rx="3" fill="white" opacity="0.8" />
      <rect x="185" y="162" width="6" height="6" rx="3" fill="white" opacity="0.8" />

      <rect x="115" y="185" width="42" height="75" rx="6" fill="#0f172a" />
      <rect x="127" y="196" width="5" height="5" rx="2.5" fill="white" opacity="0.6" />
      <rect x="136" y="196" width="5" height="5" rx="2.5" fill="white" opacity="0.6" />
      <rect x="121" y="220" width="28" height="3" rx="1.5" fill="white" opacity="0.2" />
      <rect x="121" y="226" width="20" height="3" rx="1.5" fill="white" opacity="0.2" />

      <circle cx="242" cy="255" r="30" fill="#f97316" />
      <circle cx="235" cy="260" r="3" fill="#0f172a" />
      <circle cx="249" cy="260" r="3" fill="#0f172a" />
      <path d="M233 269 Q242 275 251 269" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />

      <rect x="205" y="210" width="18" height="50" rx="4" fill="#eab308" />
      <circle cx="214" cy="207" r="9" fill="#eab308" />
      <circle cx="218" cy="227" r="2.5" fill="#0f172a" />
      <rect x="214" y="232" width="14" height="2" rx="1" fill="#0f172a" opacity="0.4" />

      <ellipse cx="200" cy="285" rx="70" ry="8" fill="#0f172a" opacity="0.08" />

      <circle cx="120" cy="140" r="6" fill="#38bdf8" opacity="0.4" />
      <circle cx="290" cy="160" r="4" fill="#7c3aed" opacity="0.4" />
      <circle cx="310" cy="220" r="5" fill="#f97316" opacity="0.3" />
      <circle cx="100" cy="240" r="3" fill="#eab308" opacity="0.4" />
      <circle cx="270" cy="300" r="4" fill="#38bdf8" opacity="0.3" />
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

      <div className="hidden lg:flex lg:flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center relative overflow-hidden">
        <div className="absolute top-8 left-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-600">
            aichixia.xyz
          </span>
        </div>
        <div className="flex flex-col items-center gap-6">
          <AbstractIllustration />
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-xs leading-relaxed">
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
        <div className="w-full max-w-sm">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            </div>

            <div className="relative pb-6">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-0 py-3 pr-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
              <button
                type="button"
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
