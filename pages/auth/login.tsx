import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface MousePos {
  x: number;
  y: number;
}

function ParticleCanvas({ mousePos }: { mousePos: MousePos }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const counterRef = useRef(0);

  const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#60a5fa', '#34d399'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.3;
      particlesRef.current.push({
        id: counterRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 80 + 40,
      });
    };

    let lastMouse = { x: mousePos.x, y: mousePos.y };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (
        Math.abs(mousePos.x - lastMouse.x) > 2 ||
        Math.abs(mousePos.y - lastMouse.y) > 2
      ) {
        for (let i = 0; i < 2; i++) {
          spawnParticle(
            mousePos.x + (Math.random() - 0.5) * 10,
            mousePos.y + (Math.random() - 0.5) * 10
          );
        }
        lastMouse = { ...mousePos };
      }

      if (Math.random() < 0.04) {
        spawnParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
      }

      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      particlesRef.current.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01;
        p.vx *= 0.99;

        const progress = p.life / p.maxLife;
        const alpha = p.opacity * (1 - progress);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      const gridSpacing = 80;
      const cols = Math.ceil(canvas.width / gridSpacing) + 1;
      const rows = Math.ceil(canvas.height / gridSpacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const gx = i * gridSpacing;
          const gy = j * gridSpacing;
          const dist = Math.sqrt(
            Math.pow(mousePos.x - gx, 2) + Math.pow(mousePos.y - gy, 2)
          );
          const influence = Math.max(0, 1 - dist / 200);
          if (influence > 0.01) {
            ctx.beginPath();
            ctx.arc(gx, gy, 1 + influence * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99,102,241,${influence * 0.4})`;
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99,102,241,0.08)';
            ctx.fill();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {}, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
}

function EyeCharacter({
  isWatching,
  isCovered,
  isPeeking,
  isError,
  isSuccess,
  mousePos,
}: {
  isWatching: boolean;
  isCovered: boolean;
  isPeeking: boolean;
  isError: boolean;
  isSuccess: boolean;
  mousePos: MousePos;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeDir, setEyeDir] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mousePos.x - cx;
    const dy = mousePos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const maxMove = 6;
    setEyeDir({
      x: (dx / dist) * Math.min(maxMove, dist / 20),
      y: (dy / dist) * Math.min(maxMove, dist / 20),
    });
  }, [mousePos]);

  const eyeColor = isError ? '#f87171' : isSuccess ? '#34d399' : '#6366f1';
  const glowColor = isError
    ? '0 0 20px rgba(248,113,113,0.6)'
    : isSuccess
    ? '0 0 20px rgba(52,211,153,0.6)'
    : '0 0 20px rgba(99,102,241,0.6)';

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{
        width: 120,
        height: 120,
        filter: `drop-shadow(${glowColor})`,
        transition: 'filter 0.5s ease',
      }}
    >
      <svg
        viewBox="0 0 120 120"
        width="120"
        height="120"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0e1a" />
          </radialGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={eyeColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={eyeColor} stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="60"
          cy="60"
          r="52"
          fill="url(#faceGrad)"
          stroke={eyeColor}
          strokeWidth="1.5"
          strokeOpacity="0.4"
          style={{ transition: 'stroke 0.4s ease' }}
        />

        <circle cx="60" cy="60" r="52" fill="url(#eyeGlow)" opacity="0.15" />

        {[...Array(3)].map((_, i) => (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={52 - i * 4}
            fill="none"
            stroke={eyeColor}
            strokeWidth="0.3"
            strokeOpacity={0.1 - i * 0.02}
          />
        ))}

        {!isCovered && !isPeeking && (
          <>
            <g filter="url(#glow)">
              <ellipse cx={36 + eyeDir.x} cy={52 + eyeDir.y} rx="11" ry="11" fill="white" />
              <circle cx={36 + eyeDir.x} cy={52 + eyeDir.y} r="7" fill={eyeColor} style={{ transition: 'fill 0.3s ease' }} />
              <circle cx={36 + eyeDir.x} cy={52 + eyeDir.y} r="4" fill="#050408" />
              <circle cx={38 + eyeDir.x} cy={50 + eyeDir.y} r="1.5" fill="white" opacity="0.9" />
            </g>

            <g filter="url(#glow)">
              <ellipse cx={84 + eyeDir.x} cy={52 + eyeDir.y} rx="11" ry="11" fill="white" />
              <circle cx={84 + eyeDir.x} cy={52 + eyeDir.y} r="7" fill={eyeColor} style={{ transition: 'fill 0.3s ease' }} />
              <circle cx={84 + eyeDir.x} cy={52 + eyeDir.y} r="4" fill="#050408" />
              <circle cx={86 + eyeDir.x} cy={50 + eyeDir.y} r="1.5" fill="white" opacity="0.9" />
            </g>

            {isWatching && (
              <>
                <path d="M28 44 Q36 40 44 44" stroke={eyeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                <path d="M76 44 Q84 40 92 44" stroke={eyeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
              </>
            )}

            {isError && (
              <>
                <path d="M28 48 Q36 44 44 48" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M76 48 Q84 44 92 48" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M44 80 Q60 72 76 80" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none" />
              </>
            )}

            {isSuccess && (
              <>
                <path d="M28 42 Q36 46 44 42" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M76 42 Q84 46 92 42" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M44 76 Q60 86 76 76" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
              </>
            )}

            {!isError && !isSuccess && (
              <path d="M44 78 Q60 84 76 78" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            )}
          </>
        )}

        {isCovered && !isPeeking && (
          <>
            <rect x="22" y="46" width="29" height="14" rx="7" fill="#312e81" />
            <path d="M22 50 Q36 42 51 50" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            <rect x="70" y="46" width="29" height="14" rx="7" fill="#312e81" />
            <path d="M70 50 Q84 42 99 50" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M40 80 Q60 74 80 80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {isPeeking && (
          <>
            <rect x="22" y="50" width="29" height="10" rx="5" fill="#312e81" />
            <path d="M22 52 Q36 44 51 52" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            <circle cx={36 + eyeDir.x * 0.5} cy={57 + eyeDir.y * 0.3} r="5" fill="white" />
            <circle cx={36 + eyeDir.x * 0.5} cy={57 + eyeDir.y * 0.3} r="3" fill={eyeColor} />
            <circle cx={37.5 + eyeDir.x * 0.5} cy={55.5 + eyeDir.y * 0.3} r="1" fill="white" opacity="0.9" />

            <rect x="70" y="50" width="29" height="10" rx="5" fill="#312e81" />
            <path d="M70 52 Q84 44 99 52" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            <circle cx={84 + eyeDir.x * 0.5} cy={57 + eyeDir.y * 0.3} r="5" fill="white" />
            <circle cx={84 + eyeDir.x * 0.5} cy={57 + eyeDir.y * 0.3} r="3" fill={eyeColor} />
            <circle cx={85.5 + eyeDir.x * 0.5} cy={55.5 + eyeDir.y * 0.3} r="1" fill="white" opacity="0.9" />

            <path d="M40 80 Q60 86 80 80" stroke={eyeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
          </>
        )}
      </svg>

      {isError && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%)',
            animation: 'pulse 0.8s ease-in-out',
          }}
        />
      )}
    </div>
  );
}

function FloatingLabel({
  label,
  isFocused,
  hasValue,
  color,
}: {
  label: string;
  isFocused: boolean;
  hasValue: boolean;
  color: string;
}) {
  const active = isFocused || hasValue;
  return (
    <span
      style={{
        position: 'absolute',
        left: 0,
        top: active ? '-22px' : '12px',
        fontSize: active ? '11px' : '14px',
        color: isFocused ? color : 'rgba(255,255,255,0.4)',
        letterSpacing: active ? '0.08em' : '0.02em',
        textTransform: active ? 'uppercase' : 'none',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  );
}

function InputField({
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  label,
  required,
  children,
  accentColor,
  isError,
}: {
  type: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  label: string;
  required?: boolean;
  children?: React.ReactNode;
  accentColor: string;
  isError?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: 'relative', paddingTop: 28, paddingBottom: 4 }}>
      <FloatingLabel
        label={label}
        isFocused={focused}
        hasValue={value.length > 0}
        color={isError ? '#f87171' : accentColor}
      />
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1.5px solid ${
              isError ? '#f87171' : focused ? accentColor : 'rgba(255,255,255,0.15)'
            }`,
            color: 'white',
            fontSize: 15,
            padding: '10px 0',
            paddingRight: children ? 36 : 0,
            outline: 'none',
            transition: 'border-color 0.25s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.01em',
          }}
          autoComplete="off"
        />
        {children && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {children}
          </div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          height: 1.5,
          background: isError ? '#f87171' : accentColor,
          transform: focused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          borderRadius: 2,
        }}
      />
    </div>
  );
}

function GlowButton({
  onClick,
  disabled,
  loading,
  children,
  variant = 'primary',
  accentColor,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  accentColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: '100%',
        padding: '14px 0',
        borderRadius: 12,
        border: variant === 'primary' ? 'none' : `1px solid rgba(255,255,255,0.1)`,
        background:
          variant === 'primary'
            ? hovered
              ? `linear-gradient(135deg, ${accentColor}ee, #8b5cf6ee)`
              : `linear-gradient(135deg, ${accentColor}, #8b5cf6)`
            : hovered
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.04)',
        color: 'white',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.05em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transform: pressed ? 'scale(0.98)' : hovered ? 'scale(1.01)' : 'scale(1)',
        boxShadow:
          variant === 'primary' && hovered
            ? `0 8px 30px ${accentColor}55, 0 2px 8px rgba(0,0,0,0.3)`
            : variant === 'primary'
            ? `0 4px 20px ${accentColor}33`
            : 'none',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function OAuthIcon({ type }: { type: 'google' | 'github' }) {
  if (type === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
  const [isWatching, setIsWatching] = useState(false);
  const [isCovered, setIsCovered] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [remember, setRemember] = useState(false);
  const accentColor = '#6366f1';

  useEffect(() => {
    setMounted(true);
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    if (!showPassword) {
      setIsCovered(true);
      setIsPeeking(false);
    } else {
      setIsCovered(false);
      setIsPeeking(false);
    }
  }, [showPassword]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
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
      triggerShake();
      return;
    }

    setSuccess('Login successful! Redirecting...');
    setTimeout(() => router.push('/console'), 1000);
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/console` },
    });
    if (authError) { setError(authError.message); setGithubLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/console` },
    });
    if (authError) { setError(authError.message); setGoogleLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #05040f;
          font-family: 'Outfit', sans-serif;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          50% { transform: translateX(-6px); }
          70% { transform: translateX(6px); }
          90% { transform: translateX(-3px); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1); }
          50% { box-shadow: 0 0 30px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2); }
        }

        @keyframes borderRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes successPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .login-card {
          animation: fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) both;
        }

        .eye-container {
          animation: float 4s ease-in-out infinite;
        }

        .shake {
          animation: shake 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both;
        }

        .brand-text {
          background: linear-gradient(135deg, #6366f1, #a78bfa, #60a5fa);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }

        .card-glow {
          animation: glowPulse 3s ease-in-out infinite;
        }

        .divider-line::before,
        .divider-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 4px; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#05040f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Outfit', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          padding: '20px',
        }}
      >
        {mounted && <ParticleCanvas mousePos={mousePos} />}

        <div
          style={{
            position: 'fixed',
            top: '10%',
            left: '15%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'fixed',
            bottom: '15%',
            right: '10%',
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(50px)',
          }}
        />

        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 50 }}>
          <ThemeToggle />
        </div>

        <div
          className={`login-card card-glow ${shaking ? 'shake' : ''}`}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 420,
            background: 'rgba(10,9,25,0.85)',
            backdropFilter: 'blur(24px)',
            borderRadius: 24,
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '48px 40px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(167,139,250,0.6), transparent)',
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="eye-container" style={{ display: 'inline-block', marginBottom: 20 }}>
              <EyeCharacter
                isWatching={isWatching}
                isCovered={isCovered}
                isPeeking={isPeeking}
                isError={!!error}
                isSuccess={!!success}
                mousePos={mousePos}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <span
                className="brand-text"
                style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                aichixia.xyz
              </span>
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>
              Sign in to your account
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                animation: 'fadeSlideUp 0.3s ease both',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
                <path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                animation: 'successPop 0.4s ease both',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.5" />
                <path d="M8 12l3 3 5-5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 13, color: '#6ee7b7' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8 }}>
              <InputField
                type="email"
                value={email}
                onChange={setEmail}
                onFocus={() => setIsWatching(true)}
                onBlur={() => setIsWatching(false)}
                label="Email address"
                required
                accentColor={accentColor}
                isError={!!error}
              />
            </div>

            <div style={{ marginBottom: 4 }}>
              <InputField
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                onFocus={() => {
                  setIsWatching(false);
                  if (!showPassword) setIsCovered(true);
                }}
                onBlur={() => {
                  if (!showPassword) setIsCovered(false);
                }}
                label="Password"
                required
                accentColor={accentColor}
                isError={!!error}
              >
                <button
                  type="button"
                  onMouseEnter={() => {
                    if (!showPassword) { setIsCovered(false); setIsPeeking(true); }
                  }}
                  onMouseLeave={() => {
                    if (!showPassword) { setIsPeeking(false); setIsCovered(true); }
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </InputField>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20,
                marginBottom: 28,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                <div
                  onClick={() => setRemember(!remember)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1.5px solid ${remember ? accentColor : 'rgba(255,255,255,0.2)'}`,
                    background: remember ? accentColor : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                Remember me
              </label>

              <a
                href="#"
                style={{
                  fontSize: 13,
                  color: accentColor,
                  textDecoration: 'none',
                  opacity: 0.8,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.8')}
              >
                Forgot password?
              </a>
            </div>

            <GlowButton loading={loading} disabled={loading} accentColor={accentColor}>
              {loading ? 'Signing in...' : 'Sign In'}
            </GlowButton>
          </form>

          <div
            className="divider-line"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
              OR
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <GlowButton
              onClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={googleLoading}
              variant="secondary"
              accentColor={accentColor}
            >
              <OAuthIcon type="google" />
              <span style={{ fontSize: 14 }}>
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </span>
            </GlowButton>

            <GlowButton
              onClick={handleGithubLogin}
              loading={githubLoading}
              disabled={githubLoading}
              variant="secondary"
              accentColor={accentColor}
            >
              <OAuthIcon type="github" />
              <span style={{ fontSize: 14 }}>
                {githubLoading ? 'Redirecting...' : 'Continue with GitHub'}
              </span>
            </GlowButton>
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 28,
            }}
          >
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              style={{
                color: accentColor,
                fontWeight: 600,
                textDecoration: 'none',
                opacity: 0.9,
                transition: 'opacity 0.2s ease',
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.opacity = '1')}
              onMouseOut={(e) => ((e.target as HTMLElement).style.opacity = '0.9')}
            >
              Sign Up
            </Link>
          </p>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
            }}
          />
        </div>

        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 20,
            zIndex: 10,
          }}
        >
          {['OpenAI Compatible', 'Supabase Powered', 'Next.js 14'].map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.15)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
