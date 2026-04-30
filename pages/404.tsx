import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaHome, FaBook, FaTerminal, FaRocket, FaSearch, FaMoon, FaSun,
  FaCode, FaDatabase, FaKey, FaShieldAlt, FaChevronRight, FaGithub,
  FaTwitter, FaDiscord, FaArrowLeft, FaLightbulb, FaCompass,
  FaMapMarkedAlt, FaQuestionCircle
} from "react-icons/fa";

type Particle = { id: number; x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number };
type Star = { id: number; x: number; y: number; size: number; delay: number; duration: number };

export default function Custom404() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [currentFact, setCurrentFact] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [konami, setKonami] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cursorTrail, setCursorTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particleRef = useRef<Particle[]>([]);
  const trailIdRef = useRef(0);
  const rippleIdRef = useRef(0);

  const funFacts = [
    "This page doesn't exist, but your API key does! 🔑",
    "404: The only error code with its own fan club 🎉",
    "Lost? Our AI models never get lost in their training data 🤖",
    "This page is as rare as bug-free code on first try 🐛",
    "Even our 404 page is API-powered... just kidding! 😄",
    "Don't worry, our AI can't find this page either 🔍",
    "You've discovered the secret void of the internet! 🌌",
    "This page went to train a new AI model 🎓",
    "Error 404: Page is taking a coffee break ☕",
    "Congratulations! You found the digital Bermuda Triangle 🔺",
  ];

  const quickLinks = [
    { icon: FaHome, label: "Home", sub: "Back to safety", path: "/", accent: "#00d4ff" },
    { icon: FaBook, label: "Docs", sub: "Read the manual", path: "/docs", accent: "#a855f7" },
    { icon: FaTerminal, label: "Console", sub: "Try the API", path: "/console", accent: "#f97316" },
    { icon: FaRocket, label: "Start", sub: "Quick launch", path: "/#quickstart", accent: "#10b981" },
  ];

  const popularPages = [
    { title: "API Reference", description: "Complete API documentation", icon: FaCode, path: "/docs" },
    { title: "Models", description: "Available AI models", icon: FaDatabase, path: "/docs#models" },
    { title: "Authentication", description: "API key management", icon: FaKey, path: "/docs#auth" },
    { title: "Security", description: "Security & compliance", icon: FaShieldAlt, path: "/security" },
  ];

  const searchTags = [
    { label: "API Keys", path: "/console" }, { label: "Pricing", path: "/#pricing" },
    { label: "Models", path: "/docs#models" }, { label: "Quick Start", path: "/docs#quickstart" },
    { label: "Rate Limits", path: "/docs#limits" }, { label: "Streaming", path: "/docs#streaming" },
    { label: "SDKs", path: "/docs#sdks" }, { label: "Status", path: "/status" },
    { label: "Changelog", path: "/changelog" }, { label: "Community", path: "/community" },
  ];

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    setIsDark(theme !== "light");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  useEffect(() => {
    const p: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 0.5, opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + 190,
    }));
    particleRef.current = p;
    setParticles(p);

    const s: Star[] = Array.from({ length: 80 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5, delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));
    setStars(s);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particleRef.current;
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        pts.forEach((q, j) => {
          if (i >= j) return;
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${p.hue},80%,65%,${(1 - dist / 120) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,65%,${p.opacity})`;
        ctx.fill();
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animFrameRef.current); };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const id = ++trailIdRef.current;
      setCursorTrail(prev => [...prev.slice(-8), { x: e.clientX, y: e.clientY, id }]);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 180);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % funFacts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (clickCount >= 10) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 5000);
      setClickCount(0);
    }
  }, [clickCount]);

  useEffect(() => {
    const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    const handleKeyDown = (e: KeyboardEvent) => {
      const next = [...konami, e.key].slice(-10);
      setKonami(next);
      if (next.join(",") === code.join(",")) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
        setKonami([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konami]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/docs?search=${encodeURIComponent(searchQuery)}`);
  };

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++rippleIdRef.current;
    setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>404 — Page Not Found | Aichixia</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; }
        :root {
          --bg: #050710; --surface: rgba(255,255,255,0.03); --surface-hover: rgba(255,255,255,0.06);
          --border: rgba(255,255,255,0.07); --border-hover: rgba(0,212,255,0.35);
          --text: #f0f4ff; --text-muted: rgba(200,210,255,0.5); --text-sub: rgba(200,210,255,0.35);
          --accent: #00d4ff; --accent2: #a855f7; --accent3: #f97316;
          --glow: rgba(0,212,255,0.15); --glow2: rgba(168,85,247,0.12);
          --font-display: 'Syne', sans-serif; --font-mono: 'JetBrains Mono', monospace;
        }
        .light {
          --bg: #f8faff; --surface: rgba(0,0,0,0.025); --surface-hover: rgba(0,0,0,0.04);
          --border: rgba(0,0,0,0.08); --border-hover: rgba(0,100,200,0.3);
          --text: #0d1117; --text-muted: rgba(30,40,80,0.55); --text-sub: rgba(30,40,80,0.4);
          --glow: rgba(0,150,255,0.08); --glow2: rgba(130,60,220,0.07);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--font-display); transition: background 0.4s, color 0.4s; overflow-x: hidden; }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes pulse-ring { 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.25);opacity:0} }
        @keyframes glitch {
          0%,100%{transform:translate(0) skewX(0)} 15%{transform:translate(-3px,1px) skewX(-1deg);filter:hue-rotate(30deg)}
          30%{transform:translate(3px,-1px) skewX(1deg);filter:hue-rotate(-30deg)}
          45%{transform:translate(-1px,2px) skewX(0)}
          60%{transform:translate(2px,-2px)} 75%{transform:translate(-2px,1px)}
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes twinkle { 0%,100%{opacity:0.15;transform:scale(0.8)} 50%{opacity:0.9;transform:scale(1.2)} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(0,212,255,0.2)} 50%{border-color:rgba(0,212,255,0.6)} }
        @keyframes gradientFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fall { to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes rippleAnim { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(4);opacity:0} }
        @keyframes number-flicker {
          0%,95%,100%{opacity:1} 96%{opacity:0.4} 97%{opacity:1} 98%{opacity:0.2} 99%{opacity:1}
        }
        @keyframes tag-float { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-fade-up { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) forwards; opacity: 0; }
        .d1 { animation-delay: 0.08s } .d2 { animation-delay: 0.18s } .d3 { animation-delay: 0.28s }
        .d4 { animation-delay: 0.38s } .d5 { animation-delay: 0.48s } .d6 { animation-delay: 0.58s }
        .d7 { animation-delay: 0.68s } .d8 { animation-delay: 0.78s }
        .twinkle { animation: twinkle var(--dur,3s) var(--del,0s) ease-in-out infinite; }
        .number-404 { animation: number-flicker 8s ease-in-out infinite; }

        .glass {
          background: var(--surface);
          border: 1px solid var(--border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .glass:hover { background: var(--surface-hover); border-color: var(--border-hover); }

        .shimmer-text {
          background: linear-gradient(90deg, #00d4ff 0%, #a855f7 25%, #f97316 50%, #a855f7 75%, #00d4ff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        .glow-accent { box-shadow: 0 0 30px rgba(0,212,255,0.2), 0 0 60px rgba(0,212,255,0.08); }
        .glow-accent:hover { box-shadow: 0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.12); }

        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.25s cubic-bezier(.16,1,.3,1), box-shadow 0.25s ease;
        }
        .card-3d:hover { transform: translateY(-6px) scale(1.015); box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,212,255,0.2); }

        .btn-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #00d4ff, #a855f7);
          color: #fff; border: none; border-radius: 10px;
          font-family: var(--font-display); font-weight: 700;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#a855f7,#00d4ff); opacity:0; transition:opacity 0.3s; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,212,255,0.4); }
        .btn-primary:hover::before { opacity:1; }
        .btn-primary span { position:relative; z-index:1; }

        .btn-ghost {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text-muted); border-radius: 10px;
          font-family: var(--font-display); font-weight: 600;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: var(--border-hover); color: var(--accent); background: var(--surface-hover); transform: translateY(-2px); }

        .search-container { position: relative; }
        .search-container::before {
          content: '';
          position: absolute; inset: -1px; border-radius: 13px;
          background: linear-gradient(90deg, #00d4ff, #a855f7, #f97316, #a855f7, #00d4ff);
          background-size: 300% auto;
          opacity: 0; transition: opacity 0.3s;
          animation: gradientFlow 4s linear infinite;
          z-index: 0;
        }
        .search-container.focused::before { opacity: 1; }
        .search-input {
          position: relative; z-index: 1;
          background: var(--bg); border: 1.5px solid var(--border);
          color: var(--text); border-radius: 12px;
          font-family: var(--font-mono); font-size: 13px;
          transition: border-color 0.3s, box-shadow 0.3s;
          width: 100%;
        }
        .search-input::placeholder { color: var(--text-sub); }
        .search-input:focus { outline: none; border-color: transparent; box-shadow: 0 0 0 2px rgba(0,212,255,0.4); }

        .tag-chip {
          display: inline-flex; align-items: center;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text-muted); border-radius: 8px;
          font-size: 11px; font-weight: 600;
          font-family: var(--font-mono);
          transition: all 0.2s;
          text-decoration: none;
        }
        .tag-chip:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,212,255,0.08); transform: translateY(-2px); }

        .scanline {
          position: fixed; top: 0; left: 0; right: 0;
          height: 2px; background: linear-gradient(90deg,transparent,rgba(0,212,255,0.4),transparent);
          animation: scanline 8s linear infinite; pointer-events: none; z-index: 100;
        }

        .grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .light .grid-bg {
          background-image: linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
        }

        .noise-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .link-row { color: var(--text-muted); font-size: 13px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 8px; padding: 6px 0; border-radius: 6px; transition: color 0.2s, transform 0.2s; }
        .link-row:hover { color: var(--accent); transform: translateX(4px); }
        .link-row svg { opacity: 0.5; font-size: 10px; flex-shrink: 0; }
        .link-row:hover svg { opacity: 1; }

        .popular-card {
          display: flex; align-items: center; gap: 14px; padding: 16px;
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          text-decoration: none; transition: all 0.25s; position: relative; overflow: hidden;
        }
        .popular-card::before { content:''; position:absolute; inset:0; background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(168,85,247,0.04)); opacity:0; transition: opacity 0.25s; }
        .popular-card:hover { border-color: rgba(0,212,255,0.35); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
        .popular-card:hover::before { opacity: 1; }
        .popular-icon { width:42px; height:42px; border-radius:10px; background:var(--surface); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.25s; }
        .popular-card:hover .popular-icon { border-color:rgba(0,212,255,0.4); background:rgba(0,212,255,0.08); }
        .popular-icon svg { color: var(--text-muted); font-size:16px; transition:color 0.25s; }
        .popular-card:hover .popular-icon svg { color: var(--accent); }

        .stat-box { padding:14px 12px; background:var(--surface); border:1px solid var(--border); border-radius:10px; text-align:center; transition:all 0.25s; }
        .stat-box:hover { border-color:rgba(0,212,255,0.3); transform:translateY(-3px); background:var(--surface-hover); }
        .stat-number { font-size:20px; font-weight:800; font-family:var(--font-display); background:linear-gradient(135deg,#00d4ff,#a855f7); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; line-height:1.1; }
        .stat-label { font-size:10px; font-weight:600; color:var(--text-sub); margin-top:3px; font-family:var(--font-mono); letter-spacing:0.05em; text-transform:uppercase; }

        .quick-card {
          padding:16px; border-radius:14px; background:var(--surface); border:1px solid var(--border);
          text-decoration:none; transition:all 0.25s; display:block; position:relative; overflow:hidden;
        }
        .quick-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; opacity:0; transition:opacity 0.25s; }
        .quick-card:hover { transform:translateY(-5px); background:var(--surface-hover); }
        .quick-card:hover::after { opacity:1; }

        .ripple { position:absolute; border-radius:50%; animation:rippleAnim 0.7s ease-out forwards; pointer-events:none; background:rgba(255,255,255,0.15); width:20px; height:20px; transform-origin:center; }

        .cursor-dot { position:fixed; pointer-events:none; z-index:9999; border-radius:50%; transform:translate(-50%,-50%); transition:width 0.15s,height 0.15s,background 0.15s; mix-blend-mode:difference; }
        .status-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); font-size:11px; font-weight:700; color:#10b981; font-family:var(--font-mono); letter-spacing:0.05em; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:#10b981; animation:pulse-ring 2s ease-in-out infinite; box-shadow:0 0 0 3px rgba(16,185,129,0.2); }
        .pulse-ring-404 { position:absolute; inset:-20px; border-radius:50%; border:1px solid rgba(0,212,255,0.15); animation:pulse-ring 3s cubic-bezier(0.4,0,0.6,1) infinite; pointer-events:none; }
        .hint-text { font-family:var(--font-mono); font-size:11px; color:var(--text-sub); }

        .section-label { font-family:var(--font-mono); font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-sub); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .section-label::after { content:''; flex:1; height:1px; background:var(--border); }

        .footer-col { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; }

        @media (max-width: 640px) {
          .stat-number { font-size:16px; }
          .quick-card { padding:12px; }
          .popular-card { padding:12px; gap:10px; }
          .footer-col { padding:12px; }
        }
      `}} />

      <div className={isDark ? "" : "light"}>
        <div className="scanline" />
        <div className="grid-bg" />
        <div className="noise-overlay" />
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />

        {cursorTrail.map((t, i) => (
          <div key={t.id} className="cursor-dot" style={{ left: t.x, top: t.y, width: `${3 + i * 1.2}px`, height: `${3 + i * 1.2}px`, background: `rgba(0,212,255,${0.08 + i * 0.05})`, transition: "none" }} />
        ))}

        {stars.map(s => (
          <div key={s.id} className="twinkle" style={{ position: "fixed", left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: "50%", background: "rgba(0,212,255,0.6)", pointerEvents: "none", zIndex: 0, "--dur": `${s.duration}s`, "--del": `${s.delay}s` } as React.CSSProperties} />
        ))}

        <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
          <div className="status-badge">
            <span className="status-dot" />
            All Systems OK
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="glass p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
            style={{ fontSize: 14 }}
            aria-label="Toggle theme"
          >
            {isDark ? <FaSun style={{ color: "#fbbf24" }} /> : <FaMoon style={{ color: "#6366f1" }} />}
          </button>
        </div>

        <div className="fixed bottom-3 left-3 z-50 flex flex-col gap-1.5">
          <div className="glass rounded-lg px-3 py-1.5" style={{ maxWidth: 220 }}>
            <span className="hint-text">HTTP Status: <span style={{ color: "#f97316", fontWeight: 700 }}>404</span></span>
          </div>
          <div className="glass rounded-lg px-3 py-1.5" style={{ maxWidth: 220, overflow: "hidden" }}>
            <span className="hint-text" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Path: <span style={{ color: "var(--text-muted)" }}>{typeof window !== "undefined" ? window.location.pathname : "/unknown"}</span>
            </span>
          </div>
        </div>

        <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 16px 80px" }}>
          <div style={{ maxWidth: 760, width: "100%" }}>

            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="animate-fade-up d1" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <FaCompass style={{ color: "var(--accent)", fontSize: 12, animation: "float 4s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-sub)" }}>
                  LOST IN CYBERSPACE
                </span>
              </div>

              <div className="animate-fade-up d2" style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                <div className="pulse-ring-404" />
                <div className="pulse-ring-404" style={{ animationDelay: "1s", inset: -40 }} />
                <div
                  className={`number-404 ${glitchActive ? "" : ""}`}
                  style={{
                    fontFamily: "var(--font-display)", fontWeight: 800, lineHeight: 1,
                    fontSize: "clamp(80px, 20vw, 160px)",
                    letterSpacing: "-0.04em", cursor: "pointer",
                    animation: glitchActive ? "glitch 0.18s steps(1) infinite" : "number-flicker 8s ease-in-out infinite",
                    position: "relative", userSelect: "none",
                  }}
                  onClick={(e) => { setClickCount(p => p + 1); addRipple(e); }}
                >
                  <span className="shimmer-text">404</span>
                  {clickCount > 0 && clickCount < 10 && (
                    <span style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", whiteSpace: "nowrap", fontWeight: 600 }}>
                      {clickCount}/10 ✦
                    </span>
                  )}
                </div>
              </div>

              <h1 className="animate-fade-up d3" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 800, color: "var(--text)", marginTop: 16, marginBottom: 8, letterSpacing: "-0.02em" }}>
                Page Not Found
              </h1>
              <p className="animate-fade-up d3" style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 16px", lineHeight: 1.65 }}>
                This page drifted into the digital void. Let's get you back to somewhere real.
              </p>

              <div className="animate-fade-up d4" style={{ display: "inline-block" }}>
                <div className="glass rounded-xl px-4 py-2.5" style={{ maxWidth: 420 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", transition: "opacity 0.4s" }}>
                    {funFacts[currentFact]}
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-fade-up d4" style={{ marginBottom: 36 }}>
              <form onSubmit={handleSearch}>
                <div className={`search-container ${searchFocused ? "focused" : ""}`}>
                  <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 0 }}>
                    <div style={{ position: "absolute", left: 14, zIndex: 2, display: "flex", alignItems: "center" }}>
                      <FaSearch style={{ fontSize: 13, color: "var(--text-sub)" }} />
                    </div>
                    <input
                      className="search-input"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Search documentation, guides, APIs..."
                      style={{ padding: "12px 110px 12px 40px" }}
                    />
                    <button type="submit" className="btn-primary" style={{ position: "absolute", right: 6, padding: "7px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </form>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, justifyContent: "center" }}>
                {searchTags.map((t, i) => (
                  <Link key={i} href={t.path} className="tag-chip" style={{ padding: "4px 10px" }}>
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="animate-fade-up d5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 36 }}>
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.path} className="quick-card card-3d" style={{ "--accent-color": link.accent } as React.CSSProperties}>
                  <style dangerouslySetInnerHTML={{ __html: `.quick-card:nth-child(${i+1}):hover::after { background: linear-gradient(90deg, ${link.accent}, transparent); } .quick-card:nth-child(${i+1}) .q-icon { color: ${link.accent}; }` }} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${link.accent}18`, border: `1px solid ${link.accent}30`, transition: "all 0.25s" }}>
                      <link.icon style={{ fontSize: 15, color: link.accent }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{link.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 1 }}>{link.sub}</div>
                    </div>
                    <FaChevronRight style={{ fontSize: 10, color: link.accent, opacity: 0.7 }} />
                  </div>
                </Link>
              ))}
            </div>

            <div className="animate-fade-up d5" style={{ marginBottom: 36 }}>
              <div className="section-label">Popular Destinations</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {popularPages.map((p, i) => (
                  <Link key={i} href={p.path} className="popular-card">
                    <div className="popular-icon">
                      <p.icon />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-sub)" }}>{p.description}</div>
                    </div>
                    <FaChevronRight style={{ fontSize: 11, color: "var(--text-sub)", flexShrink: 0, transition: "transform 0.2s, color 0.2s" }} className="arrow-icon" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="animate-fade-up d6" style={{ marginBottom: 36 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                <div className="glass rounded-xl p-4" style={{ borderRadius: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: "float 5s ease-in-out infinite" }}>
                      <FaLightbulb style={{ fontSize: 16, color: "#00d4ff" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Need Help?</div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.6 }}>Check our docs or reach out to support</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Link href="/docs" className="btn-primary" style={{ padding: "5px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 8 }}>
                          <FaBook style={{ fontSize: 9 }} /><span>Docs</span>
                        </Link>
                        <a href="mailto:support@aichixia.xyz" className="btn-ghost" style={{ padding: "5px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <FaQuestionCircle style={{ fontSize: 9 }} />Help
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-4" style={{ borderRadius: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: "floatSlow 6s ease-in-out infinite" }}>
                      <FaMapMarkedAlt style={{ fontSize: 16, color: "#a855f7" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Explore More</div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.6 }}>Discover what Aichixia has to offer</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Link href="/#features" style={{ padding: "5px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 8, background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)", textDecoration: "none" }}>
                          <FaRocket style={{ fontSize: 9 }} />Features
                        </Link>
                        <Link href="/console" className="btn-ghost" style={{ padding: "5px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <FaTerminal style={{ fontSize: 9 }} />Console
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-up d6" style={{ marginBottom: 36 }}>
              <div className="section-label">Platform Stats</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[["20+","AI Models"],["99.9%","Uptime"],["<100ms","Latency"],["Free","To Start"]].map(([val,label],i) => (
                  <div key={i} className="stat-box">
                    <div className="stat-number">{val}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up d7" style={{ marginBottom: 36, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 10 }}>
              {[
                { title: "Quick Links", links: [{ label: "Homepage", path: "/" }, { label: "Documentation", path: "/docs" }, { label: "API Console", path: "/console" }, { label: "Pricing", path: "/pricing" }] },
                { title: "Resources", links: [{ label: "Blog", path: "/blog" }, { label: "Guides", path: "/guides" }, { label: "Tutorials", path: "/tutorials" }, { label: "Examples", path: "/examples" }] },
                { title: "Company", links: [{ label: "About Us", path: "/about" }, { label: "Careers", path: "/careers" }, { label: "Contact", path: "/contact" }, { label: "Security", path: "/security" }] },
              ].map((col, i) => (
                <div key={i} className="footer-col">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 10, letterSpacing: "0.02em" }}>{col.title}</div>
                  {col.links.map((l, j) => (
                    <Link key={j} href={l.path} className="link-row">
                      <FaChevronRight />{l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="animate-fade-up d8" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <Link href="/" className="btn-primary" style={{ padding: "10px 22px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 10 }}>
                  <FaArrowLeft style={{ fontSize: 11 }} /><span>Back to Home</span>
                </Link>
                <button onClick={() => router.back()} className="btn-ghost" style={{ padding: "10px 22px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  Go Back
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--text-sub)", marginRight: 4, fontFamily: "var(--font-mono)" }}>Follow us</p>
                {[
                  { href: "https://github.com/aichixia", icon: FaGithub },
                  { href: "https://twitter.com/aichixia", icon: FaTwitter },
                  { href: "https://discord.gg/aichixia", icon: FaDiscord },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="glass p-2 rounded-lg" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, transition: "all 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px) scale(1.1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                    <s.icon style={{ fontSize: 14, color: "var(--text-muted)" }} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>

        {showEasterEgg && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)", animation: "fadeIn 0.3s ease" }}>
            <div className="glass" style={{ maxWidth: 380, width: "100%", padding: 28, borderRadius: 20, border: "1px solid rgba(0,212,255,0.25)", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12, animation: "float 2s ease-in-out infinite" }}>🎉</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>You Found It!</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.65 }}>
                Congratulations, curious explorer! You discovered the hidden easter egg. That's exactly the kind of detail-oriented person we love at Aichixia!
              </p>
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>
                  Secret Code: <span style={{ color: "#a855f7" }}>CURIOUS_EXPLORER_2024</span>
                </p>
                <p style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 4 }}>Use in console for a surprise 😉</p>
              </div>
              <button onClick={() => setShowEasterEgg(false)} className="btn-primary" style={{ padding: "9px 22px", fontSize: 13, borderRadius: 10, cursor: "pointer" }}>
                <span>Awesome!</span>
              </button>
            </div>
          </div>
        )}

        {showConfetti && (
          <div style={{ position: "fixed", inset: 0, zIndex: 998, pointerEvents: "none" }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: `${Math.random() * 100}%`, top: "-10px",
                width: `${Math.random() * 6 + 4}px`, height: `${Math.random() * 6 + 4}px`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                background: ["#00d4ff","#a855f7","#f97316","#10b981","#f59e0b","#ec4899"][Math.floor(Math.random()*6)],
                animation: `fall ${2 + Math.random() * 2.5}s ${Math.random() * 0.8}s linear forwards`,
              }} />
            ))}
          </div>
        )}

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.4),rgba(168,85,247,0.4),transparent)", pointerEvents: "none", zIndex: 100 }} />
      </div>
    </>
  );
}
