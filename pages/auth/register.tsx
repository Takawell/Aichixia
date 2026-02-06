```typescript
import { useState, useRef, useEffect } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const particles: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      speedX: number;
      speedY: number;
      speedZ: number;
      color: string;
    }> = [];

    const colors = ['rgba(14, 165, 233, 0.6)', 'rgba(59, 130, 246, 0.6)', 'rgba(99, 102, 241, 0.6)', 'rgba(168, 85, 247, 0.6)'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        speedZ: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const cubes: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      speedRotX: number;
      speedRotY: number;
      speedRotZ: number;
    }> = [];

    for (let i = 0; i < 8; i++) {
      cubes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 800 + 200,
        size: Math.random() * 40 + 30,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        speedRotX: (Math.random() - 0.5) * 0.02,
        speedRotY: (Math.random() - 0.5) * 0.02,
        speedRotZ: (Math.random() - 0.5) * 0.02
      });
    }

    const project = (x: number, y: number, z: number) => {
      const scale = 600 / (600 + z);
      return {
        x: x * scale + canvas.width / 2,
        y: y * scale + canvas.height / 2,
        scale
      };
    };

    const drawCube = (cube: typeof cubes[0]) => {
      const size = cube.size;
      const centerX = cube.x - canvas.width / 2;
      const centerY = cube.y - canvas.height / 2;

      const vertices = [
        [-size/2, -size/2, -size/2],
        [size/2, -size/2, -size/2],
        [size/2, size/2, -size/2],
        [-size/2, size/2, -size/2],
        [-size/2, -size/2, size/2],
        [size/2, -size/2, size/2],
        [size/2, size/2, size/2],
        [-size/2, size/2, size/2]
      ];

      const rotatedVertices = vertices.map(([x, y, z]) => {
        let newX = x;
        let newY = y;
        let newZ = z;

        const cosX = Math.cos(cube.rotX);
        const sinX = Math.sin(cube.rotX);
        const tempY = newY * cosX - newZ * sinX;
        newZ = newY * sinX + newZ * cosX;
        newY = tempY;

        const cosY = Math.cos(cube.rotY);
        const sinY = Math.sin(cube.rotY);
        const tempX = newX * cosY + newZ * sinY;
        newZ = -newX * sinY + newZ * cosY;
        newX = tempX;

        const cosZ = Math.cos(cube.rotZ);
        const sinZ = Math.sin(cube.rotZ);
        const tempX2 = newX * cosZ - newY * sinZ;
        newY = newX * sinZ + newY * cosZ;
        newX = tempX2;

        return project(centerX + newX, centerY + newY, cube.z + newZ);
      });

      const faces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [2, 3, 7, 6],
        [0, 3, 7, 4],
        [1, 2, 6, 5]
      ];

      const faceColors = [
        'rgba(14, 165, 233, 0.15)',
        'rgba(59, 130, 246, 0.15)',
        'rgba(99, 102, 241, 0.15)',
        'rgba(168, 85, 247, 0.15)',
        'rgba(14, 165, 233, 0.2)',
        'rgba(59, 130, 246, 0.2)'
      ];

      faces.forEach((face, idx) => {
        ctx.beginPath();
        ctx.moveTo(rotatedVertices[face[0]].x, rotatedVertices[face[0]].y);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(rotatedVertices[face[i]].x, rotatedVertices[face[i]].y);
        }
        ctx.closePath();
        ctx.fillStyle = faceColors[idx];
        ctx.fill();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rotationRef.current.x += mouseRef.current.y * 0.001;
      rotationRef.current.y += mouseRef.current.x * 0.001;

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.z -= particle.speedZ;

        if (particle.z < 1) {
          particle.z = 1000;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        const projected = project(particle.x - canvas.width / 2, particle.y - canvas.height / 2, particle.z);
        
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, particle.size * projected.scale, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      cubes.forEach(cube => {
        cube.rotX += cube.speedRotX;
        cube.rotY += cube.speedRotY;
        cube.rotZ += cube.speedRotZ;

        cube.rotX += rotationRef.current.x * 0.1;
        cube.rotY += rotationRef.current.y * 0.1;

        drawCube(cube);
      });

      rotationRef.current.x *= 0.95;
      rotationRef.current.y *= 0.95;

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-3 sm:p-4">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}
      />

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50 pointer-events-none" />
      
      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl p-5 sm:p-7 transform transition-all duration-500 hover:shadow-sky-500/20 hover:shadow-3xl">
          <div className="text-center mb-5 sm:mb-7">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg transform transition-transform hover:scale-110 hover:rotate-6">
              <FiUser className="text-white text-xl sm:text-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-1.5 sm:mb-2">Create Account</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Join Aichixia API Platform</p>
          </div>

          <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border border-sky-200/60 dark:border-sky-800/60 rounded-xl backdrop-blur-sm transform transition-all hover:scale-[1.02]">
            <div className="flex items-start gap-2">
              <div className="p-1.5 sm:p-2 bg-sky-500/10 dark:bg-sky-500/20 rounded-lg">
                <FiZap className="text-sky-600 dark:text-sky-400 text-sm sm:text-base flex-shrink-0" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-sky-900 dark:text-sky-100 mb-0.5">Quick Start Recommended</p>
                <p className="text-[10px] sm:text-xs text-sky-700 dark:text-sky-300 leading-relaxed">Sign up with GitHub or Google for instant access</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 animate-shake">
              <FiAlertCircle className="text-red-600 dark:text-red-400 text-base sm:text-lg flex-shrink-0" />
              <p className="text-[11px] sm:text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 animate-slideIn">
              <FiCheckCircle className="text-green-600 dark:text-green-400 text-base sm:text-lg flex-shrink-0" />
              <p className="text-[11px] sm:text-xs text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="relative overflow-hidden py-2.5 sm:py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <FaGoogle className="text-base sm:text-lg group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">{googleLoading ? 'Wait...' : 'Google'}</span>
            </button>

            <button
              onClick={handleGithubSignup}
              disabled={githubLoading}
              className="relative overflow-hidden py-2.5 sm:py-3 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <FaGithub className="text-base sm:text-lg group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">{githubLoading ? 'Wait...' : 'GitHub'}</span>
            </button>
          </div>

          <div className="relative my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-[11px] sm:text-xs">
              <span className="px-2 sm:px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
            <div className="group">
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm transition-colors group-focus-within:text-sky-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm transition-colors group-focus-within:text-sky-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-all hover:scale-110"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <div className="group">
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm transition-colors group-focus-within:text-sky-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-all hover:scale-110"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 hover:from-sky-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-sky-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold transition-colors hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-300 dark:text-slate-500 text-[10px] sm:text-xs mt-3 sm:mt-4 backdrop-blur-sm">
          By creating an account, you agree to our Terms & Privacy Policy
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
