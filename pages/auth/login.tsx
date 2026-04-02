import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface MousePos { x: number; y: number; }

const A = '#0ea5e9';
const AL = '#38bdf8';
const AD = '#0284c7';

type ErrorExpr = 0|1|2|3|4;
type SuccessExpr = 0|1|2|3|4;
type ClickReaction = 'none'|'squeeze'|'spin'|'dizzy'|'hearts'|'jump';

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

function Eye({ cx, cy, r = 7, pr = 4, dx = 0, dy = 0, squish = 1 }: { cx: number; cy: number; r?: number; pr?: number; dx?: number; dy?: number; squish?: number }) {
  return (
    <g transform={`scale(1,${squish})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <circle cx={cx + dx} cy={cy + dy} r={pr} fill="#0f172a" />
      <circle cx={cx + dx + pr * 0.35} cy={cy + dy - pr * 0.35} r={pr * 0.28} fill="white" opacity="0.9" />
    </g>
  );
}

function StarEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} ${cx + r * 0.45 * Math.cos(b)},${cy + r * 0.45 * Math.sin(b)}`;
  }).join(' ');
  return <polygon points={pts} fill="#fbbf24" />;
}

function HeartEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  const s = r * 0.55;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <path d={`M${cx},${cy + s * 0.5} C${cx},${cy - s * 0.3} ${cx - s},${cy - s * 0.3} ${cx - s},${cy + s * 0.2} C${cx - s},${cy + s * 0.8} ${cx},${cy + s * 1.2} ${cx},${cy + s * 1.2} C${cx},${cy + s * 1.2} ${cx + s},${cy + s * 0.8} ${cx + s},${cy + s * 0.2} C${cx + s},${cy - s * 0.3} ${cx},${cy - s * 0.3} ${cx},${cy + s * 0.5} Z`}
        fill="#f43f5e" transform={`translate(0,${-s * 0.3}) scale(0.85)`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
    </g>
  );
}

function SpinEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <path d={`M${cx - r * 0.6},${cy} A${r * 0.6},${r * 0.6} 0 1,1 ${cx + r * 0.6},${cy}`} stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ animation: 'spinEye 0.6s linear infinite' }} />
    </g>
  );
}

function DizzyEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <path d={`M${cx - r * 0.55},${cy - r * 0.55} L${cx + r * 0.55},${cy + r * 0.55}`} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx + r * 0.55},${cy - r * 0.55} L${cx - r * 0.55},${cy + r * 0.55}`} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
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
      <circle cx={cx + dx + 1} cy={cy + 3} r={r * 0.28} fill="#0f172a" />
    </g>
  );
}

function LookAway({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <circle cx={cx - r * 0.55} cy={cy - r * 0.45} r={r * 0.52} fill="#0f172a" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.55} r={r * 0.2} fill="white" opacity="0.85" />
    </g>
  );
}

function WideEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.2} fill="white" />
      <circle cx={cx} cy={cy} r={r * 0.75} fill="#0f172a" />
      <circle cx={cx + r * 0.25} cy={cy - r * 0.3} r={r * 0.25} fill="white" opacity="0.9" />
    </g>
  );
}

function SleepyEye({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.7" />
      <path d={`M${cx - r * 0.9} ${cy} Q${cx} ${cy + r * 0.5} ${cx + r * 0.9} ${cy}`} fill="#0f172a" />
    </g>
  );
}

function getClickAnimation(reaction: ClickReaction): string {
  if (reaction === 'squeeze') return 'charSqueeze 0.5s cubic-bezier(0.4,0,0.2,1)';
  if (reaction === 'spin') return 'charSpin 0.6s cubic-bezier(0.4,0,0.6,1)';
  if (reaction === 'dizzy') return 'charDizzy 0.8s ease-in-out';
  if (reaction === 'hearts') return 'charJump 0.5s cubic-bezier(0.4,0,0.2,1)';
  if (reaction === 'jump') return 'charJump 0.45s cubic-bezier(0.2,0,0.3,1)';
  return 'none';
}

function FloatingHearts({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', fontSize: 14, left: `${(i - 1) * 18}px`,
          animation: `heartFloat 0.8s ease-out ${i * 0.12}s forwards`, opacity: 0,
        }}>❤️</div>
      ))}
    </div>
  );
}

function FloatingStars({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10 }}>
      {['⭐', '✨', '🌟'].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', fontSize: 12, left: `${(i - 1) * 16}px`,
          animation: `heartFloat 0.7s ease-out ${i * 0.1}s forwards`, opacity: 0,
        }}>{s}</div>
      ))}
    </div>
  );
}

interface CharProps {
  mousePos: MousePos;
  isCovered: boolean;
  isPeeking: boolean;
  isError: boolean;
  isSuccess: boolean;
  isTyping: boolean;
  errorExpr: ErrorExpr;
  successExpr: SuccessExpr;
  reaction: ClickReaction;
  onCharClick: () => void;
}

function CharTall({ mousePos, isCovered, isPeeking, isError, isSuccess, isTyping, errorExpr, successExpr, reaction, onCharClick }: CharProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 4);
  const col = isError ? '#dc2626' : isSuccess ? '#16a34a' : A;
  const colL = isError ? '#f87171' : isSuccess ? '#4ade80' : AL;

  const renderEyes = () => {
    if (isCovered && !isPeeking) return <><ClosedEye cx={25} cy={30} r={9} /><ClosedEye cx={55} cy={30} r={9} /></>;
    if (isPeeking) return <><PeekEye cx={25} cy={32} dx={dir.x * 0.5} r={9} /><PeekEye cx={55} cy={32} dx={dir.x * 0.5} r={9} /></>;
    if (reaction === 'dizzy') return <><DizzyEye cx={25} cy={30} r={9} /><DizzyEye cx={55} cy={30} r={9} /></>;
    if (reaction === 'hearts') return <><HeartEye cx={25} cy={30} r={9} /><HeartEye cx={55} cy={30} r={9} /></>;
    if (reaction === 'spin') return <><SpinEye cx={25} cy={30} r={9} /><SpinEye cx={55} cy={30} r={9} /></>;
    if (isError) {
      if (errorExpr === 0) return <><WideEye cx={25} cy={30} r={9} /><WideEye cx={55} cy={30} r={9} /></>;
      if (errorExpr === 1) return <><DizzyEye cx={25} cy={30} r={9} /><DizzyEye cx={55} cy={30} r={9} /></>;
      if (errorExpr === 2) return <><ClosedEye cx={25} cy={30} r={9} /><ClosedEye cx={55} cy={30} r={9} /></>;
      if (errorExpr === 3) return <><Eye cx={25} cy={30} r={9} pr={5} dx={-3} dy={2} /><Eye cx={55} cy={30} r={9} pr={5} dx={3} dy={2} /></>;
      return <><SleepyEye cx={25} cy={30} r={9} /><SleepyEye cx={55} cy={30} r={9} /></>;
    }
    if (isSuccess) {
      if (successExpr === 0) return <><StarEye cx={25} cy={30} r={9} /><StarEye cx={55} cy={30} r={9} /></>;
      if (successExpr === 1) return <><HeartEye cx={25} cy={30} r={9} /><HeartEye cx={55} cy={30} r={9} /></>;
      if (successExpr === 2) return <><Eye cx={25} cy={28} r={9} pr={5} dx={dir.x} dy={dir.y} squish={0.5} /><Eye cx={55} cy={28} r={9} pr={5} dx={dir.x} dy={dir.y} squish={0.5} /></>;
      if (successExpr === 3) return <><Eye cx={25} cy={30} r={11} pr={6} dx={0} dy={0} /><Eye cx={55} cy={30} r={11} pr={6} dx={0} dy={0} /></>;
      return <><StarEye cx={25} cy={30} r={10} /><StarEye cx={55} cy={30} r={10} /></>;
    }
    return <><Eye cx={25} cy={30} r={9} pr={5} dx={dir.x} dy={dir.y} /><Eye cx={55} cy={30} r={9} pr={5} dx={dir.x} dy={dir.y} /></>;
  };

  const mouth = () => {
    if (isError) {
      if (errorExpr === 0) return <path d="M18 52 Q40 58 62 52" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
      if (errorExpr === 1) return <path d="M22 55 Q40 50 58 55" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
      if (errorExpr === 2) return <path d="M25 53 L55 53" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
      if (errorExpr === 3) return <path d="M18 50 Q40 45 62 50" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      return <circle cx="40" cy="52" r="5" fill="none" stroke="white" strokeWidth="2" />;
    }
    if (isSuccess) {
      if (successExpr === 0) return <path d="M18 46 Q40 56 62 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      if (successExpr === 1) return <path d="M20 46 Q40 58 60 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      if (successExpr === 2) return <><path d="M18 46 Q40 58 62 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" /><circle cx="25" cy="50" r="3" fill="white" opacity="0.4" /><circle cx="55" cy="50" r="3" fill="white" opacity="0.4" /></>;
      if (successExpr === 3) return <path d="M22 47 Q40 57 58 47" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
      return <><path d="M18 46 Q40 58 62 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M28 40 Q40 38 52 40" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" /></>;
    }
    return <path d={isTyping ? 'M18 48 Q40 42 62 48' : 'M18 46 Q40 51 62 46'} stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />;
  };

  const anim = reaction !== 'none' ? getClickAnimation(reaction) : undefined;

  return (
    <div ref={ref} className="char-tall" style={{ position: 'absolute', left: 6, bottom: 0, cursor: 'pointer', userSelect: 'none', position: 'relative' } as any}>
      <FloatingHearts active={reaction === 'hearts'} />
      <FloatingStars active={isSuccess && successExpr === 4} />
      <div onClick={onCharClick} style={{ animation: anim, display: 'inline-block' }}>
        <svg width="80" height="168" viewBox="0 0 80 168" style={{ overflow: 'visible', filter: `drop-shadow(0 8px 22px ${col}55)`, transition: 'filter 0.3s' }}>
          <defs>
            <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colL} /><stop offset="100%" stopColor={col} />
            </linearGradient>
          </defs>
          <rect x="6" y="0" width="68" height="165" rx="12" fill="url(#tg)" />
          <rect x="6" y="0" width="68" height="64" rx="12" fill={col} />
          <rect x="6" y="52" width="68" height="12" fill={col} />
          {isTyping && [0,1,2].map(i => (
            <circle key={i} cx={22 + i * 18} cy={155} r="4" fill="white" opacity="0.4"
              style={{ animation: `dotBounce 0.7s ease-in-out ${i * 0.18}s infinite alternate` }} />
          ))}
          {renderEyes()}
          {mouth()}
        </svg>
      </div>
    </div>
  );
}

function CharRound({ mousePos, isCovered, isPeeking, isError, isSuccess, errorExpr, successExpr, reaction, onCharClick }: Omit<CharProps, 'isTyping'> & { isTyping?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 4);
  const col = isError ? '#ea580c' : isSuccess ? '#059669' : '#ea580c';
  const colL = isError ? '#fb923c' : isSuccess ? '#34d399' : '#fb923c';

  const renderEyes = () => {
    if (isCovered && !isPeeking) return <><ClosedEye cx={34} cy={43} r={8.5} /><ClosedEye cx={66} cy={43} r={8.5} /></>;
    if (isPeeking) return <><PeekEye cx={34} cy={46} dx={dir.x * 0.5} r={8.5} /><PeekEye cx={66} cy={46} dx={dir.x * 0.5} r={8.5} /></>;
    if (reaction === 'dizzy') return <><DizzyEye cx={34} cy={43} r={8.5} /><DizzyEye cx={66} cy={43} r={8.5} /></>;
    if (reaction === 'hearts') return <><HeartEye cx={34} cy={43} r={8.5} /><HeartEye cx={66} cy={43} r={8.5} /></>;
    if (reaction === 'spin') return <><SpinEye cx={34} cy={43} r={8.5} /><SpinEye cx={66} cy={43} r={8.5} /></>;
    if (isError) {
      if (errorExpr === 0) return <><WideEye cx={34} cy={43} r={8.5} /><WideEye cx={66} cy={43} r={8.5} /></>;
      if (errorExpr === 1) return <><Eye cx={34} cy={43} r={8.5} pr={5} dx={-2.5} dy={2} /><Eye cx={66} cy={43} r={8.5} pr={5} dx={2.5} dy={2} /></>;
      if (errorExpr === 2) return <><ClosedEye cx={34} cy={43} r={8.5} /><ClosedEye cx={66} cy={43} r={8.5} /></>;
      if (errorExpr === 3) return <><DizzyEye cx={34} cy={43} r={8.5} /><DizzyEye cx={66} cy={43} r={8.5} /></>;
      return <><SleepyEye cx={34} cy={43} r={8.5} /><SleepyEye cx={66} cy={43} r={8.5} /></>;
    }
    if (isSuccess) {
      if (successExpr === 0) return <><Eye cx={34} cy={41} r={8.5} pr={5} dx={0} dy={0} squish={0.4} /><Eye cx={66} cy={41} r={8.5} pr={5} dx={0} dy={0} squish={0.4} /></>;
      if (successExpr === 1) return <><HeartEye cx={34} cy={43} r={8.5} /><HeartEye cx={66} cy={43} r={8.5} /></>;
      if (successExpr === 2) return <><StarEye cx={34} cy={43} r={8.5} /><StarEye cx={66} cy={43} r={8.5} /></>;
      if (successExpr === 3) return <><Eye cx={34} cy={43} r={10} pr={6} dx={dir.x} dy={dir.y} /><Eye cx={66} cy={43} r={10} pr={6} dx={dir.x} dy={dir.y} /></>;
      return <><StarEye cx={34} cy={43} r={9} /><StarEye cx={66} cy={43} r={9} /></>;
    }
    return <><Eye cx={34} cy={43} r={8.5} pr={4.8} dx={dir.x} dy={dir.y} /><Eye cx={66} cy={43} r={8.5} pr={4.8} dx={dir.x} dy={dir.y} /></>;
  };

  const mouth = () => {
    if (isError) {
      if (errorExpr === 0) return <path d="M28 67 Q50 60 72 67" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
      if (errorExpr === 1) return <path d="M30 65 Q50 59 70 65" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
      if (errorExpr === 2) return <path d="M32 63 L68 63" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
      if (errorExpr === 3) return <circle cx="50" cy="64" r="5" fill="none" stroke="white" strokeWidth="2" />;
      return <path d="M30 63 Q50 58 70 63" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
    if (isSuccess) {
      if (successExpr === 0) return <path d="M28 60 Q50 72 72 60" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      if (successExpr === 1) return <><path d="M28 60 Q50 72 72 60" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" /><circle cx="34" cy="65" r="3" fill="white" opacity="0.35" /><circle cx="66" cy="65" r="3" fill="white" opacity="0.35" /></>;
      if (successExpr === 2) return <path d="M30 60 Q50 70 70 60" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      if (successExpr === 3) return <path d="M26 60 Q50 74 74 60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
      return <path d="M28 60 Q50 72 72 60" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
    return <path d="M30 60 Q50 67 70 60" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65" />;
  };

  const anim = reaction !== 'none' ? getClickAnimation(reaction) : undefined;

  return (
    <div ref={ref} className="char-round" style={{ position: 'absolute', left: 112, bottom: 0, cursor: 'pointer', userSelect: 'none' }}>
      <FloatingHearts active={reaction === 'hearts'} />
      <div onClick={onCharClick} style={{ animation: anim, display: 'inline-block' }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ overflow: 'visible', filter: `drop-shadow(0 8px 22px ${col}55)`, transition: 'filter 0.3s' }}>
          <defs>
            <radialGradient id="rg" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={colL} /><stop offset="100%" stopColor={col} />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#rg)" />
          {renderEyes()}
          {mouth()}
        </svg>
      </div>
    </div>
  );
}

function CharSmall({ mousePos, isCovered, isError, isSuccess, errorExpr, successExpr, reaction, onCharClick }: Omit<CharProps,'isPeeking'|'isTyping'> & { isPeeking?: boolean; isTyping?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 3);

  const renderEyes = () => {
    if (isCovered) return <><LookAway cx={26} cy={53} r={7} /><LookAway cx={44} cy={53} r={7} /></>;
    if (reaction === 'dizzy') return <><DizzyEye cx={26} cy={53} r={7} /><DizzyEye cx={44} cy={53} r={7} /></>;
    if (reaction === 'hearts') return <><HeartEye cx={26} cy={53} r={7} /><HeartEye cx={44} cy={53} r={7} /></>;
    if (reaction === 'spin') return <><SpinEye cx={26} cy={53} r={7} /><SpinEye cx={44} cy={53} r={7} /></>;
    if (isError) {
      if (errorExpr === 0) return <><WideEye cx={26} cy={53} r={7} /><WideEye cx={44} cy={53} r={7} /></>;
      if (errorExpr === 1) return <><DizzyEye cx={26} cy={53} r={7} /><DizzyEye cx={44} cy={53} r={7} /></>;
      if (errorExpr === 2) return <><Eye cx={26} cy={53} r={7} pr={4} dx={-2} dy={2} /><Eye cx={44} cy={53} r={7} pr={4} dx={2} dy={2} /></>;
      if (errorExpr === 3) return <><ClosedEye cx={26} cy={53} r={7} /><ClosedEye cx={44} cy={53} r={7} /></>;
      return <><SleepyEye cx={26} cy={53} r={7} /><SleepyEye cx={44} cy={53} r={7} /></>;
    }
    if (isSuccess) {
      if (successExpr === 0) return <><StarEye cx={26} cy={53} r={7} /><StarEye cx={44} cy={53} r={7} /></>;
      if (successExpr === 1) return <><HeartEye cx={26} cy={53} r={7} /><HeartEye cx={44} cy={53} r={7} /></>;
      if (successExpr === 2) return <><Eye cx={26} cy={52} r={7} pr={4} dx={0} dy={0} squish={0.45} /><Eye cx={44} cy={52} r={7} pr={4} dx={0} dy={0} squish={0.45} /></>;
      if (successExpr === 3) return <><Eye cx={26} cy={53} r={8} pr={5} dx={dir.x} dy={dir.y} /><Eye cx={44} cy={53} r={8} pr={5} dx={dir.x} dy={dir.y} /></>;
      return <><StarEye cx={26} cy={53} r={7.5} /><StarEye cx={44} cy={53} r={7.5} /></>;
    }
    return <><Eye cx={26} cy={53} r={7} pr={4} dx={dir.x * 0.65} dy={dir.y * 0.65} /><Eye cx={44} cy={53} r={7} pr={4} dx={dir.x * 0.65} dy={dir.y * 0.65} /></>;
  };

  const mouth = () => {
    if (isError) return <path d="M22 68 Q35 63 48 68" stroke="#78350f" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />;
    if (isSuccess) return <path d="M22 66 Q35 73 48 66" stroke="#78350f" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />;
    if (isCovered) return <path d="M22 68 Q35 64 48 68" stroke="#78350f" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.4" />;
    return <path d="M22 66 Q35 72 48 66" stroke="#78350f" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />;
  };

  const anim = reaction !== 'none' ? getClickAnimation(reaction) : undefined;

  return (
    <div ref={ref} className="char-small" style={{ position: 'absolute', left: 230, bottom: 0, cursor: 'pointer', userSelect: 'none' }}>
      <FloatingHearts active={reaction === 'hearts'} />
      <div onClick={onCharClick} style={{ animation: anim, display: 'inline-block' }}>
        <svg width="70" height="100" viewBox="0 0 70 100" style={{ overflow: 'visible', filter: 'drop-shadow(0 7px 18px rgba(234,179,8,0.55))' }}>
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" /><stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          <rect x="10" y="26" width="50" height="72" rx="25" fill="url(#sg)" />
          {renderEyes()}
          {mouth()}
          <rect x="60" y="58" width="9" height="24" rx="4.5" fill="#eab308" opacity="0.85" />
          <rect x="1" y="58" width="9" height="24" rx="4.5" fill="#eab308" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}

function CharGhost({ mousePos, isCovered, isError, isSuccess, errorExpr, successExpr, reaction, onCharClick }: Omit<CharProps,'isPeeking'|'isTyping'> & { isPeeking?: boolean; isTyping?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const dir = useEyeDir(ref as React.RefObject<HTMLElement>, mousePos, 3.5);
  const [wave, setWave] = useState(0);
  useEffect(() => {
    let raf: number; let t = 0;
    const tick = () => { t += 0.04; setWave(Math.sin(t) * 5); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const ty = 94 + wave * 0.35;

  const renderEyes = () => {
    if (isCovered) return <><LookAway cx={23} cy={42} r={8} /><LookAway cx={45} cy={42} r={8} /></>;
    if (reaction === 'dizzy') return <><DizzyEye cx={23} cy={42} r={8} /><DizzyEye cx={45} cy={42} r={8} /></>;
    if (reaction === 'hearts') return <><HeartEye cx={23} cy={42} r={8} /><HeartEye cx={45} cy={42} r={8} /></>;
    if (reaction === 'spin') return <><SpinEye cx={23} cy={42} r={8} /><SpinEye cx={45} cy={42} r={8} /></>;
    if (isError) {
      if (errorExpr === 0) return <><WideEye cx={23} cy={42} r={8} /><WideEye cx={45} cy={42} r={8} /></>;
      if (errorExpr === 1) return <><DizzyEye cx={23} cy={42} r={8} /><DizzyEye cx={45} cy={42} r={8} /></>;
      if (errorExpr === 2) return <><Eye cx={23} cy={42} r={8} pr={4.5} dx={-2.5} dy={2} /><Eye cx={45} cy={42} r={8} pr={4.5} dx={2.5} dy={2} /></>;
      if (errorExpr === 3) return <><ClosedEye cx={23} cy={42} r={8} /><ClosedEye cx={45} cy={42} r={8} /></>;
      return <><SleepyEye cx={23} cy={42} r={8} /><SleepyEye cx={45} cy={42} r={8} /></>;
    }
    if (isSuccess) {
      if (successExpr === 0) return <><StarEye cx={23} cy={42} r={8} /><StarEye cx={45} cy={42} r={8} /></>;
      if (successExpr === 1) return <><HeartEye cx={23} cy={42} r={8} /><HeartEye cx={45} cy={42} r={8} /></>;
      if (successExpr === 2) return <><Eye cx={23} cy={40} r={8} pr={4.5} dx={0} dy={0} squish={0.4} /><Eye cx={45} cy={40} r={8} pr={4.5} dx={0} dy={0} squish={0.4} /></>;
      if (successExpr === 3) return <><Eye cx={23} cy={42} r={9.5} pr={6} dx={dir.x} dy={dir.y} /><Eye cx={45} cy={42} r={9.5} pr={6} dx={dir.x} dy={dir.y} /></>;
      return <><StarEye cx={23} cy={42} r={8.5} /><StarEye cx={45} cy={42} r={8.5} /></>;
    }
    return <><Eye cx={23} cy={42} r={8} pr={4.5} dx={dir.x * 0.7} dy={dir.y * 0.7} /><Eye cx={45} cy={42} r={8} pr={4.5} dx={dir.x * 0.7} dy={dir.y * 0.7} /></>;
  };

  const mouth = () => {
    if (isCovered) return <path d="M23 59 Q34 55 45 59" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.4" />;
    if (isError) return <path d="M23 59 Q34 54 45 59" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />;
    if (isSuccess) return <path d="M23 57 Q34 65 45 57" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />;
    return <path d="M23 57 Q34 63 45 57" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />;
  };

  const anim = reaction !== 'none' ? getClickAnimation(reaction) : undefined;

  return (
    <div ref={ref} className="char-ghost" style={{ position: 'absolute', left: 316, bottom: 0, cursor: 'pointer', userSelect: 'none' }}>
      <FloatingHearts active={reaction === 'hearts'} />
      <div onClick={onCharClick} style={{ animation: anim, display: 'inline-block' }}>
        <svg width="68" height="112" viewBox="0 0 68 112" style={{ overflow: 'visible', filter: 'drop-shadow(0 7px 20px rgba(20,184,166,0.5))' }}>
          <defs>
            <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <path d={`M6 50 Q6 8 34 8 Q62 8 62 50 L62 ${ty} Q53 ${ty-8} 44 ${ty} Q36 ${ty+8} 34 ${ty} Q32 ${ty+8} 24 ${ty} Q15 ${ty-8} 6 ${ty} Z`} fill="url(#gg)" />
          <path d={`M6 50 Q6 8 34 8 Q62 8 62 50 L62 56 Q53 48 44 56 Q36 64 34 56 Q32 48 24 56 Q15 64 6 56 Z`} fill="#0d9488" opacity="0.3" />
          {renderEyes()}
          {mouth()}
          <circle cx="22" cy="24" r="3.5" fill="white" opacity="0.22" />
          <circle cx="30" cy="17" r="2" fill="white" opacity="0.18" />
        </svg>
      </div>
    </div>
  );
}

function InputField({ type, value, onChange, onFocus, onBlur, placeholder, required, children, isError, dark }: { type: string; value: string; onChange: (v: string) => void; onFocus?: () => void; onBlur?: () => void; placeholder: string; required?: boolean; children?: React.ReactNode; isError?: boolean; dark: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 13 }}>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        style={{
          width: '100%', padding: '13px 15px', paddingRight: children ? 48 : 15,
          fontSize: 14, fontFamily: 'inherit',
          color: dark ? '#f1f5f9' : '#0f172a',
          background: dark ? (focused ? '#1e3a5f' : '#0f2744') : (focused ? '#f0f9ff' : '#f8fafc'),
          border: `2px solid ${isError ? '#f87171' : focused ? A : dark ? '#1e40af' : '#e2e8f0'}`,
          borderRadius: 12, outline: 'none',
          boxShadow: focused ? `0 0 0 3px ${isError ? 'rgba(248,113,113,0.15)' : 'rgba(14,165,233,0.15)'}` : 'none',
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxSizing: 'border-box',
        }}
      />
      {children && <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)' }}>{children}</div>}
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
        width: '100%', padding: '14px 0', marginBottom: 12,
        background: hov ? `linear-gradient(135deg,${AD},${A})` : `linear-gradient(135deg,${A},${AL})`,
        color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
        border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transform: press ? 'scale(0.98)' : hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? `0 8px 28px ${A}55` : `0 4px 14px ${A}33`,
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '0.02em',
      }}
    >
      {loading && <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
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
        width: '100%', padding: '12px 0', marginBottom: 9,
        background: hov ? (dark ? '#1e3a5f' : '#f0f9ff') : (dark ? '#0f2744' : '#f8fafc'),
        color: dark ? '#e2e8f0' : '#1e293b', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        border: `1.5px solid ${dark ? '#1e40af' : '#e2e8f0'}`, borderRadius: 12,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        transition: 'all 0.18s ease', boxShadow: hov ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
      }}
    >{icon}{loading ? 'Redirecting...' : label}</button>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={dark ? '#e2e8f0' : '#1e293b'}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const CLICK_REACTIONS: ClickReaction[] = ['squeeze', 'spin', 'dizzy', 'hearts', 'jump'];

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
  const [errorExpr, setErrorExpr] = useState<ErrorExpr>(0);
  const [successExpr, setSuccessExpr] = useState<SuccessExpr>(0);
  const [reactions, setReactions] = useState<{ tall: ClickReaction; round: ClickReaction; small: ClickReaction; ghost: ClickReaction }>({ tall: 'none', round: 'none', small: 'none', ghost: 'none' });
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const reactionTimers = useRef<{ [k: string]: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    const h = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (leftPanelRef.current) {
        const r = leftPanelRef.current.getBoundingClientRect();
        const rx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ry = ((e.clientY - r.top) / r.height - 0.5) * 2;
        setTiltX(rx * 4); setTiltY(ry * -4);
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

  const fireReaction = useCallback((char: 'tall'|'round'|'small'|'ghost') => {
    const pick = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
    setReactions(r => ({ ...r, [char]: pick }));
    if (reactionTimers.current[char]) clearTimeout(reactionTimers.current[char]);
    reactionTimers.current[char] = setTimeout(() => {
      setReactions(r => ({ ...r, [char]: 'none' }));
    }, pick === 'hearts' ? 900 : pick === 'dizzy' ? 900 : 650);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      const expr = Math.floor(Math.random() * 5) as ErrorExpr;
      setErrorExpr(expr);
      setError(authError.message); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    const expr = Math.floor(Math.random() * 5) as SuccessExpr;
    setSuccessExpr(expr);
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

  const bg = dark ? '#020b18' : '#ffffff';
  const leftBg = dark ? 'linear-gradient(148deg,#020b18 0%,#0c1f3f 50%,#051224 100%)' : 'linear-gradient(148deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%)';
  const txt = dark ? '#f1f5f9' : '#0f172a';
  const sub = dark ? '#7dd3fc' : '#64748b';
  const divider = dark ? '#1e40af' : '#e2e8f0';

  const charProps = { mousePos, isCovered, isPeeking, isError: !!error, isSuccess: !!success, isTyping, errorExpr, successExpr };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes spinEye{to{transform:rotate(360deg);}}
        @keyframes shake{0%,100%{transform:translateX(0);}15%{transform:translateX(-8px);}30%{transform:translateX(8px);}45%{transform:translateX(-5px);}60%{transform:translateX(5px);}75%{transform:translateX(-3px);}90%{transform:translateX(3px);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes charBobAlt{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes charBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes charBobSlow{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
        @keyframes charGhostFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes gradShift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.88);}60%{transform:scale(1.03);}100%{opacity:1;transform:scale(1);}}
        @keyframes orbDrift{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(7px,-10px) scale(1.03);}66%{transform:translate(-5px,5px) scale(0.97);}}
        @keyframes dotBounce{from{transform:translateY(0);}to{transform:translateY(-6px);}}
        @keyframes groundPulse{0%,100%{opacity:0.18;transform:scaleX(1);}50%{opacity:0.26;transform:scaleX(1.06);}}
        @keyframes ghostWiggle{0%,100%{transform:rotate(0deg);}25%{transform:rotate(-2.5deg);}75%{transform:rotate(2.5deg);}}
        @keyframes charSqueeze{0%{transform:scale(1);}25%{transform:scale(1.18,0.78);}50%{transform:scale(0.82,1.2);}75%{transform:scale(1.1,0.9);}100%{transform:scale(1);}}
        @keyframes charSpin{0%{transform:rotate(0);}100%{transform:rotate(360deg);}}
        @keyframes charDizzy{0%{transform:rotate(0) scale(1);}20%{transform:rotate(-12deg) scale(1.05);}40%{transform:rotate(10deg) scale(0.95);}60%{transform:rotate(-8deg) scale(1.03);}80%{transform:rotate(5deg) scale(0.98);}100%{transform:rotate(0) scale(1);}}
        @keyframes charJump{0%{transform:translateY(0) scale(1);}30%{transform:translateY(-22px) scale(1.05,0.95);}55%{transform:translateY(-28px) scale(0.96,1.06);}75%{transform:translateY(-8px) scale(1.04,0.96);}90%{transform:translateY(-2px) scale(1);}100%{transform:translateY(0) scale(1);}}
        @keyframes heartFloat{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-40px) scale(1.4);}}
        .char-tall{animation:charBobAlt 3.2s ease-in-out infinite;}
        .char-round{animation:charBob 2.8s ease-in-out 0.4s infinite;}
        .char-small{animation:charBobSlow 3.6s ease-in-out 0.9s infinite;}
        .char-ghost{animation:charGhostFloat 2.4s ease-in-out 1.1s infinite,ghostWiggle 4s ease-in-out infinite;}
        .shake{animation:shake 0.65s cubic-bezier(0.36,0.07,0.19,0.97) both;}
        .pop-in{animation:popIn 0.35s cubic-bezier(0.4,0,0.2,1) both;}
        .right-panel{animation:fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.08s both;}
        .brand-gradient{background:linear-gradient(135deg,#0ea5e9,#38bdf8,#7dd3fc);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradShift 5s ease infinite;}
        input::placeholder{color:#64748b;}
        input:focus{outline:none;}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 9999s ease-in-out 0s;}
        @media(max-width:768px){.desktop-left{display:none !important;}.right-panel{padding:48px 20px 36px !important;}}
        @media(min-width:769px){.desktop-left{display:flex !important;}}
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',sans-serif", background: bg, transition: 'background 0.35s ease' }}>
        <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 60 }}><ThemeToggle /></div>

        <div ref={leftPanelRef} className="desktop-left" style={{ flex: '0 0 50%', background: leftBg, position: 'relative', overflow: 'hidden', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'background 0.35s ease', perspective: '900px' }}>
          <div style={{ position: 'absolute', top: 22, left: 26 }}>
            <span className="brand-gradient" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>aichixia.xyz</span>
          </div>

          {[
            { s: 180, c: dark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.18)', x: '3%', y: '5%', d: 0 },
            { s: 130, c: dark ? 'rgba(234,88,12,0.13)' : 'rgba(234,88,12,0.17)', x: '66%', y: '8%', d: 1.2 },
            { s: 100, c: dark ? 'rgba(234,179,8,0.11)' : 'rgba(234,179,8,0.18)', x: '70%', y: '60%', d: 2 },
            { s: 85, c: dark ? 'rgba(20,184,166,0.13)' : 'rgba(20,184,166,0.2)', x: '6%', y: '68%', d: 0.5 },
            { s: 65, c: dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.15)', x: '48%', y: '3%', d: 1.7 },
            { s: 50, c: dark ? 'rgba(14,165,233,0.1)' : 'rgba(14,165,233,0.14)', x: '80%', y: '40%', d: 2.8 },
          ].map((o, i) => (
            <div key={i} style={{ position: 'absolute', left: o.x, top: o.y, width: o.s, height: o.s, borderRadius: '50%', background: o.c, filter: 'blur(2px)', animation: `orbDrift ${5 + o.d}s ease-in-out ${o.d}s infinite`, pointerEvents: 'none', transition: 'background 0.35s ease', transform: `translate(${tiltX * 0.5}px,${tiltY * 0.5}px)` }} />
          ))}

          <div style={{ position: 'relative', width: 420, height: 200, maxWidth: '88%', transform: `rotateX(${tiltY * 0.45}deg) rotateY(${tiltX * 0.45}deg)`, transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d' }}>
            <CharTall {...charProps} reaction={reactions.tall} onCharClick={() => fireReaction('tall')} />
            <CharRound {...charProps} reaction={reactions.round} onCharClick={() => fireReaction('round')} />
            <CharSmall {...charProps} reaction={reactions.small} onCharClick={() => fireReaction('small')} />
            <CharGhost {...charProps} reaction={reactions.ghost} onCharClick={() => fireReaction('ghost')} />
            <div style={{ position: 'absolute', bottom: -8, left: '2%', right: '2%', height: 18, background: dark ? 'radial-gradient(ellipse,rgba(14,165,233,0.32) 0%,transparent 70%)' : 'radial-gradient(ellipse,rgba(14,165,233,0.25) 0%,transparent 70%)', animation: 'groundPulse 3s ease-in-out infinite', borderRadius: '50%', transition: 'background 0.35s ease' }} />
          </div>

          <div style={{ marginTop: 32, textAlign: 'center', padding: '0 42px', transform: `translate(${tiltX * 0.7}px,${tiltY * 0.7}px)`, transition: 'transform 0.15s ease-out' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: dark ? '#38bdf8' : '#0369a1', lineHeight: 1.5, transition: 'color 0.3s' }}>One unified API for 20+ AI models</p>
            <p style={{ fontSize: 12, color: dark ? '#0ea5e9' : '#7dd3fc', marginTop: 5, letterSpacing: '0.02em', fontWeight: 500, transition: 'color 0.3s' }}>Fast · Open Source · Ready to use</p>
          </div>

          <div style={{ position: 'absolute', bottom: 18, display: 'flex', gap: 20 }}>
            {['OpenAI Compatible', 'Supabase', 'Next.js 14'].map(t => (
              <span key={t} style={{ fontSize: 10, color: dark ? '#1e40af' : '#bae6fd', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, transition: 'color 0.3s' }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="right-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 32px 36px', background: bg, transition: 'background 0.35s ease' }}>
          <div className={shaking ? 'shake' : ''} style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, borderRadius: 14, marginBottom: 16, background: `linear-gradient(135deg,${A},${AL})`, boxShadow: `0 4px 18px ${A}44` }}>
                <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                  <polygon points="16,3 29,26 3,26" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <polygon points="16,10 24,24 8,24" fill="white" opacity="0.3" />
                </svg>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: txt, letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.1, transition: 'color 0.3s' }}>Welcome back!</h1>
              <p style={{ fontSize: 13, color: sub, fontWeight: 400, transition: 'color 0.3s' }}>Please enter your details</p>
            </div>

            {error && (
              <div className="pop-in" style={{ marginBottom: 16, padding: '11px 14px', background: dark ? 'rgba(248,113,113,0.1)' : '#fef2f2', border: `1.5px solid ${dark ? 'rgba(248,113,113,0.3)' : '#fecaca'}`, borderRadius: 11, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" /><path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.45 }}>{error}</span>
              </div>
            )}

            {success && (
              <div className="pop-in" style={{ marginBottom: 16, padding: '11px 14px', background: dark ? 'rgba(74,222,128,0.1)' : '#f0fdf4', border: `1.5px solid ${dark ? 'rgba(74,222,128,0.3)' : '#bbf7d0'}`, borderRadius: 11, display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="1.5" /><path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 12, color: dark ? '#4ade80' : '#16a34a' }}>{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <InputField type="email" value={email} onChange={v => { setEmail(v); handleTyping(); }} onFocus={() => {}} onBlur={() => {}} placeholder="Email" required isError={!!error} dark={dark} />
              <InputField type={showPassword ? 'text' : 'password'} value={password} onChange={v => { setPassword(v); handleTyping(); }}
                onFocus={() => { if (!showPassword) setIsCovered(true); }}
                onBlur={() => { if (!showPassword) setIsCovered(false); }}
                placeholder="Password" required isError={!!error} dark={dark}>
                <button type="button"
                  onMouseEnter={() => { if (!showPassword) { setIsCovered(false); setIsPeeking(true); } }}
                  onMouseLeave={() => { if (!showPassword) { setIsPeeking(false); setIsCovered(true); } }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#38bdf8' : '#94a3b8', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.18s' }}
                  onMouseOver={e => (e.currentTarget.style.color = A)}
                  onMouseOut={e => (e.currentTarget.style.color = dark ? '#38bdf8' : '#94a3b8')}
                >
                  {showPassword
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </InputField>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, color: sub, userSelect: 'none', transition: 'color 0.3s' }}>
                  <div onClick={() => setRemember(!remember)} style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, border: `2px solid ${remember ? A : dark ? '#1e40af' : '#cbd5e1'}`, background: remember ? A : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', cursor: 'pointer' }}>
                    {remember && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  Remember for 30 days
                </label>
                <a href="#" style={{ fontSize: 12, color: A, fontWeight: 600, textDecoration: 'none' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.75')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>Forgot password?</a>
              </div>

              <PrimaryBtn loading={loading}>{loading ? 'Signing in...' : 'Log In'}</PrimaryBtn>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: divider, transition: 'background 0.3s' }} />
              <span style={{ fontSize: 11, color: sub, fontWeight: 500, letterSpacing: '0.05em', transition: 'color 0.3s' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: divider, transition: 'background 0.3s' }} />
            </div>

            <OAuthBtn onClick={handleGoogleLogin} loading={googleLoading} icon={<GoogleIcon />} label="Log In with Google" dark={dark} />
            <OAuthBtn onClick={handleGithubLogin} loading={githubLoading} icon={<GitHubIcon dark={dark} />} label="Log In with GitHub" dark={dark} />

            <p style={{ textAlign: 'center', fontSize: 12, color: sub, marginTop: 16, transition: 'color 0.3s' }}>
              Don't have an account?{' '}
              <Link href="/auth/register" style={{ color: A, fontWeight: 700, textDecoration: 'none' }} onMouseOver={e => ((e.target as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.target as HTMLElement).style.textDecoration = 'none')}>Sign Up</Link>
            </p>
            <p style={{ textAlign: 'center', fontSize: 11, color: dark ? '#1e40af' : '#cbd5e1', marginTop: 14, lineHeight: 1.7, transition: 'color 0.3s' }}>
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
