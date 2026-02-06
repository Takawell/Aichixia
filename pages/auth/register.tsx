import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiUser, FiZap } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists');
      setLoading(false);
      return;
    }
    setSuccess('Account created! Please check your email to confirm your account.');
    setLoading(false);
  };

  const handleGithubSignup = async () => {
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

  const handleGoogleSignup = async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 dark:opacity-10" />
      
      <div className="w-full max-w-md relative">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiUser className="text-white text-2xl sm:text-3xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Create Account</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Get started with Aichixia API</p>
          </div>

          <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
            <div className="flex items-start gap-2 sm:gap-3">
              <FiZap className="text-sky-600 dark:text-sky-400 text-base sm:text-lg flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-sky-900 dark:text-sky-100 mb-1">Recommended</p>
                <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-300">Sign up faster with GitHub or Google for instant access</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 sm:gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400 text-lg sm:text-xl flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 sm:gap-3">
              <FiCheckCircle className="text-green-600 dark:text-green-400 text-lg sm:text-xl flex-shrink-0" />
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="py-2.5 sm:py-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaGoogle className="text-lg sm:text-xl" />
              {googleLoading ? 'Wait...' : 'Google'}
            </button>

            <button
              onClick={handleGithubSignup}
              disabled={githubLoading}
              className="py-2.5 sm:py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaGithub className="text-lg sm:text-xl" />
              {githubLoading ? 'Wait...' : 'GitHub'}
            </button>
          </div>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm sm:text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm sm:text-base" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-sm sm:text-base" /> : <FiEye className="text-sm sm:text-base" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm sm:text-base" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-sm sm:text-base" /> : <FiEye className="text-sm sm:text-base" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-4 sm:mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
