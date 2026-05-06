import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";

const CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

const PROVIDERS = [
  { name: "OpenAI", slug: "openai" },
  { name: "Anthropic", slug: "anthropic" },
  { name: "DeepSeek", slug: "deepseek" },
  { name: "Google", slug: "gemini" },
  { name: "xAI", slug: "xai" },
  { name: "Groq", slug: "groq" },
  { name: "Mistral", slug: "mistral" },
  { name: "Meta", slug: "meta" },
  { name: "Cohere", slug: "cohere" },
  { name: "Moonshot", slug: "moonshot" },
  { name: "MiniMax", slug: "minimax" },
  { name: "Zhipu", slug: "zhipu" },
  { name: "Alibaba", slug: "qwen" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Black Forest", slug: "flux" },
  { name: "Cerebras", slug: "cerebras" },
  { name: "SiliconFlow", slug: "siliconcloud" },
  { name: "Novita AI", slug: "novita" },
  { name: "Hugging Face", slug: "huggingface" },
  { name: "Cloudflare", slug: "cloudflare" },
  { name: "OpenRouter", slug: "openrouter" },
  { name: "Nvidia", slug: "nvidia" },
];

const ORBIT_CONFIG = [
  { count: 6, radius: 140, speed: 28, size: 36 },
  { count: 8, radius: 220, speed: 42, size: 32 },
  { count: 9, radius: 305, speed: 60, size: 28 },
];

const STATS = [
  { value: "23+", label: "Providers" },
  { value: "50+", label: "Models" },
  { value: "99.9%", label: "Uptime" },
  { value: "<100ms", label: "Latency" },
];

function useIntersectionObserver(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, isVisible };
}

export default function Provider() {
  const [isDark, setIsDark] = useState(true);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: statsRef, isVisible: statsVisible } = useIntersectionObserver();
  const { ref: gridRef, isVisible: gridVisible } = useIntersectionObserver();
  const { ref: codeRef, isVisible: codeVisible } = useIntersectionObserver();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const mo = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    let frame: number;
    let last = 0;
    const step = (ts: number) => {
      if (ts - last > 16) { setTick(ts); last = ts; }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - r.left - r.width / 2) / r.width, y: (e.clientY - r.top - r.height / 2) / r.height });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const allOrbitProviders: { provider: typeof PROVIDERS[0]; orbit: number; idx: number; angle: number }[] = [];
  let pIdx = 0;
  ORBIT_CONFIG.forEach((orb, oIdx) => {
    for (let i = 0; i < orb.count; i++) {
      allOrbitProviders.push({
        provider: PROVIDERS[pIdx % PROVIDERS.length],
        orbit: oIdx,
        idx: i,
        angle: (360 / orb.count) * i,
      });
      pIdx++;
    }
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');

        :root {
          --accent: #38bdf8;
          --accent2: #818cf8;
          --accent3: #34d399;
          --bg: #020408;
          --surface: #080e18;
          --border: rgba(56,189,248,0.12);
          --text: #e2e8f0;
          --muted: #64748b;
        }

        .provider-page { font-family: 'Cabinet Grotesk', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }

        @keyframes spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes counter-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes counter-spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes pulse-ring { 0%,100% { opacity:0.15; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.04); } }
        @keyframes float-logo { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-8px) scale(1.02); } }
        @keyframes fade-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes data-flow { 0% { stroke-dashoffset:100; opacity:0; } 30% { opacity:1; } 70% { opacity:1; } 100% { stroke-dashoffset:-100; opacity:0; } }
        @keyframes blink-cursor { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes scan-line { 0% { top:-4px; } 100% { top:100%; } }
        @keyframes orbit-glow { 0%,100% { box-shadow:0 0 8px rgba(56,189,248,0.3),0 0 16px rgba(56,189,248,0.1); } 50% { box-shadow:0 0 16px rgba(56,189,248,0.6),0 0 32px rgba(56,189,248,0.2); } }

        .orbit-ring-0 { animation: spin-cw 28s linear infinite; }
        .orbit-ring-1 { animation: spin-ccw 42s linear infinite; }
        .orbit-ring-2 { animation: spin-cw 60s linear infinite; }
        .counter-0 { animation: counter-spin-ccw 28s linear infinite; }
        .counter-1 { animation: counter-spin-cw 42s linear infinite; }
        .counter-2 { animation: counter-spin-ccw 60s linear infinite; }

        .logo-float { animation: float-logo 4s ease-in-out infinite; }
        .pulse-ring-1 { animation: pulse-ring 3s ease-in-out infinite; }
        .pulse-ring-2 { animation: pulse-ring 3s ease-in-out infinite 1s; }
        .pulse-ring-3 { animation: pulse-ring 3s ease-in-out infinite 2s; }

        .hero-title { font-family: 'Syne', sans-serif; font-weight: 800; }
        .mono { font-family: 'DM Mono', monospace; }

        .shimmer-text {
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 30%, var(--accent3) 60%, var(--accent) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .glass-card {
          background: rgba(8,14,24,0.7);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .glass-card:hover {
          border-color: rgba(56,189,248,0.3);
          background: rgba(8,14,24,0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(56,189,248,0.08), 0 0 0 1px rgba(56,189,248,0.1);
        }

        .provider-node {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .provider-node:hover { filter: brightness(1.4); }
        .provider-node.active { animation: orbit-glow 2s ease-in-out infinite; }

        .scan-overlay { position:absolute; inset:0; overflow:hidden; pointer-events:none; border-radius:inherit; }
        .scan-overlay::after {
          content:'';
          position:absolute;
          left:0; right:0;
          height:2px;
          background:linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent);
          animation:scan-line 4s linear infinite;
        }

        .grid-dot-bg {
          background-image: radial-gradient(circle, rgba(56,189,248,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .connection-line {
          stroke: rgba(56,189,248,0.25);
          stroke-width: 1;
          stroke-dasharray: 4 4;
          fill: none;
        }

        .code-terminal {
          background: linear-gradient(135deg, rgba(8,14,24,0.95), rgba(4,8,16,0.98));
          border: 1px solid rgba(56,189,248,0.15);
          border-radius: 16px;
          overflow: hidden;
        }
        .code-terminal-bar {
          background: rgba(56,189,248,0.05);
          border-bottom: 1px solid rgba(56,189,248,0.1);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot-red { width:10px;height:10px;border-radius:50%;background:#ff5f57; }
        .dot-yellow { width:10px;height:10px;border-radius:50%;background:#ffbd2e; }
        .dot-green { width:10px;height:10px;border-radius:50%;background:#28c840; }

        .cursor-blink { display:inline-block; width:2px; height:1em; background:var(--accent); vertical-align:middle; margin-left:2px; animation:blink-cursor 1s step-end infinite; }

        .stat-card { position:relative; overflow:hidden; }
        .stat-card::before {
          content:'';
          position:absolute;
          inset:0;
          background:linear-gradient(135deg,rgba(56,189,248,0.05),transparent);
          border-radius:inherit;
        }

        .badge-coming {
          background: linear-gradient(90deg, rgba(56,189,248,0.15), rgba(129,140,248,0.15));
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
        }

        .noise-overlay {
          position:fixed;
          inset:0;
          pointer-events:none;
          z-index:0;
          opacity:0.025;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat:repeat;
          background-size:128px;
        }

        .fade-up { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fade-up-1 { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) 0.1s forwards; opacity:0; }
        .fade-up-2 { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s forwards; opacity:0; }
        .fade-up-3 { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) 0.35s forwards; opacity:0; }
        .fade-up-4 { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) 0.5s forwards; opacity:0; }
        .fade-up-5 { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) 0.65s forwards; opacity:0; }

        .visible-up { animation: fade-up 0.6s cubic-bezier(0.4,0,0.2,1) forwards; }
        .visible-up-1 { animation: fade-up 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s forwards; opacity:0; }
        .visible-up-2 { animation: fade-up 0.6s cubic-bezier(0.4,0,0.2,1) 0.2s forwards; opacity:0; }
        .visible-up-3 { animation: fade-up 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s forwards; opacity:0; }
        .visible-up-4 { animation: fade-up 0.6s cubic-bezier(0.4,0,0.2,1) 0.4s forwards; opacity:0; }

        @media (max-width: 640px) {
          .orbit-container { transform: scale(0.52); }
          .hero-section { padding-top: 48px; padding-bottom: 320px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .orbit-container { transform: scale(0.72); }
          .hero-section { padding-bottom: 360px; }
        }
      `}} />

      <Head>
        <title>AI Providers · Aichixia</title>
        <meta name="description" content="Aichixia integrates 23+ world-class AI providers into one unified, OpenAI-compatible API." />
      </Head>

      <div className="provider-page relative">
        <div className="noise-overlay" />

        <div className="fixed inset-0 pointer-events-none z-0">
          <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'60%', background:'radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)', borderRadius:'50%' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'50%', height:'50%', background:'radial-gradient(ellipse, rgba(129,140,248,0.04) 0%, transparent 70%)', borderRadius:'50%' }} />
        </div>

        <header className="relative z-50" style={{ borderBottom:'1px solid rgba(56,189,248,0.08)', background:'rgba(2,4,8,0.8)', backdropFilter:'blur(20px)', position:'sticky', top:0 }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12 sm:h-14">
            <Link href="/" className="flex items-center gap-2 group">
              <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#38bdf8,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#020408', fontFamily:'Syne,sans-serif' }}>A</div>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#e2e8f0', letterSpacing:'-0.02em' }}>Aichixia</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/" style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, color:'#64748b', transition:'color 0.2s' }} className="hover:text-white">Home</Link>
              <Link href="/docs" style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, color:'#64748b', transition:'color 0.2s' }} className="hover:text-white">Docs</Link>
              <Link href="/console" style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:'linear-gradient(135deg,rgba(56,189,248,0.15),rgba(129,140,248,0.15))', border:'1px solid rgba(56,189,248,0.25)', color:'#38bdf8' }}>Console</Link>
            </nav>
          </div>
        </header>

        <section className="hero-section relative z-10 grid-dot-bg" style={{ paddingTop:72, paddingBottom:420, textAlign:'center', overflow:'hidden' }} ref={heroRef}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="fade-up-1" style={{ marginBottom:16 }}>
              <span className="badge-coming mono" style={{ fontSize:11, color:'#38bdf8', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'pulse-ring 2s ease-in-out infinite' }} />
                23 Providers · Live
              </span>
            </div>
            <h1 className="hero-title fade-up-2" style={{ fontSize:'clamp(32px,6vw,64px)', lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:20, color:'#f1f5f9' }}>
              One API.<br />
              <span className="shimmer-text">Every Provider.</span>
            </h1>
            <p className="fade-up-3 mono" style={{ fontSize:'clamp(13px,1.6vw,16px)', color:'#475569', lineHeight:1.7, maxWidth:500, margin:'0 auto 32px', fontWeight:300 }}>
              Aichixia aggregates the world's leading AI providers into a single, unified, OpenAI-compatible endpoint.
            </p>
            <div className="fade-up-4" style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
              <Link href="/console" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:10, background:'linear-gradient(135deg,#38bdf8,#818cf8)', color:'#020408', fontWeight:800, fontSize:13, letterSpacing:'-0.01em', textDecoration:'none', boxShadow:'0 0 32px rgba(56,189,248,0.25)' }}>
                Get API Key
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/docs" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:10, background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.2)', color:'#94a3b8', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                View Docs
              </Link>
            </div>
          </div>

          <div className="orbit-container" style={{ position:'absolute', left:'50%', bottom:'-40px', transform:'translateX(-50%)', width:680, height:680, marginLeft:-340 }}>
            {[1,2,3].map(i => (
              <div key={i} className={`pulse-ring-${i}`} style={{ position:'absolute', inset:-(i*28), borderRadius:'50%', border:'1px solid rgba(56,189,248,0.08)', pointerEvents:'none' }} />
            ))}

            {ORBIT_CONFIG.map((orb, oIdx) => (
              <div key={oIdx} className={`orbit-ring-${oIdx}`} style={{ position:'absolute', inset:(340 - orb.radius), borderRadius:'50%', border:`1px dashed rgba(56,189,248,${0.06 + oIdx*0.03})` }}>
                {allOrbitProviders.filter(p => p.orbit === oIdx).map((item, i) => {
                  const angleDeg = item.angle;
                  const rad = (angleDeg * Math.PI) / 180;
                  const x = orb.radius * Math.cos(rad - Math.PI/2);
                  const y = orb.radius * Math.sin(rad - Math.PI/2);
                  const isHovered = hoveredProvider === item.provider.slug;
                  return (
                    <div key={i} className={`counter-${oIdx} provider-node ${isHovered ? 'active' : ''}`}
                      style={{ position:'absolute', left:'50%', top:'50%', transform:`translate(calc(${x}px - 50%), calc(${y}px - 50%))`, width:orb.size, height:orb.size, borderRadius:8, background: isHovered ? 'rgba(56,189,248,0.15)' : 'rgba(8,14,24,0.9)', border:`1px solid ${isHovered ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)', transition:'all 0.2s' }}
                      onMouseEnter={() => setHoveredProvider(item.provider.slug)}
                      onMouseLeave={() => setHoveredProvider(null)}
                    >
                      <img src={`${CDN}/${item.provider.slug}.svg`} alt={item.provider.name} style={{ width:orb.size * 0.55, height:orb.size * 0.55, objectFit:'contain', filter:'brightness(0) invert(1)', opacity: isHovered ? 1 : 0.5, transition:'opacity 0.2s' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                    </div>
                  );
                })}
              </div>
            ))}

            <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', zIndex:10 }}>
              <div className="logo-float" style={{ position:'relative', width:80, height:80 }}>
                <div style={{ position:'absolute', inset:-16, borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.15), transparent 70%)' }} />
                <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,rgba(56,189,248,0.2),rgba(129,140,248,0.2))', border:'1px solid rgba(56,189,248,0.3)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(16px)', boxShadow:'0 0 48px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:32, background:'linear-gradient(135deg,#38bdf8,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>A</span>
                </div>
              </div>
            </div>

            {hoveredProvider && (
              <div style={{ position:'absolute', bottom:-48, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', background:'rgba(8,14,24,0.95)', border:'1px solid rgba(56,189,248,0.25)', borderRadius:8, padding:'4px 12px', fontSize:11, color:'#38bdf8', fontFamily:'DM Mono,monospace', letterSpacing:'0.05em', backdropFilter:'blur(8px)', zIndex:20 }}>
                {PROVIDERS.find(p => p.slug === hoveredProvider)?.name}
              </div>
            )}
          </div>
        </section>

        <section className="relative z-10" ref={statsRef} style={{ paddingTop:48, paddingBottom:48 }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
              {STATS.map((s, i) => (
                <div key={s.label} className={`glass-card stat-card ${statsVisible ? `visible-up-${i+1}` : ''}`} style={{ borderRadius:14, padding:'20px 24px', textAlign:'center', opacity: statsVisible ? undefined : 0 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(22px,3vw,32px)', letterSpacing:'-0.03em', background:'linear-gradient(135deg,#38bdf8,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:4 }}>{s.value}</div>
                  <div className="mono" style={{ fontSize:11, color:'#475569', letterSpacing:'0.08em', textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10" style={{ paddingTop:32, paddingBottom:64 }} ref={gridRef}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className={gridVisible ? 'visible-up' : ''} style={{ textAlign:'center', marginBottom:40, opacity: gridVisible ? undefined : 0 }}>
              <span className="badge-coming mono" style={{ fontSize:10, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12, display:'inline-flex' }}>
                Provider Network
              </span>
              <h2 className="hero-title" style={{ fontSize:'clamp(22px,3.5vw,36px)', letterSpacing:'-0.03em', color:'#f1f5f9', marginTop:10 }}>Integrated Providers</h2>
              <p className="mono" style={{ fontSize:13, color:'#475569', marginTop:8, fontWeight:300 }}>All accessible through a single API key</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
              {PROVIDERS.map((p, i) => (
                <div key={p.slug} className={`glass-card ${gridVisible ? `visible-up-${Math.min(i % 4 + 1, 4)}` : ''}`}
                  style={{ borderRadius:12, padding:'16px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, cursor:'pointer', opacity: gridVisible ? undefined : 0, animationDelay: gridVisible ? `${i * 0.04}s` : '0s', position:'relative', overflow:'hidden' }}
                  onMouseEnter={() => setHoveredProvider(p.slug)}
                  onMouseLeave={() => setHoveredProvider(null)}
                >
                  {hoveredProvider === p.slug && <div className="scan-overlay" />}
                  <div style={{ width:40, height:40, borderRadius:10, background: hoveredProvider === p.slug ? 'rgba(56,189,248,0.12)' : 'rgba(56,189,248,0.05)', border:`1px solid ${hoveredProvider === p.slug ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.08)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 }}>
                    <img src={`${CDN}/${p.slug}.svg`} alt={p.name} style={{ width:22, height:22, objectFit:'contain', filter:'brightness(0) invert(1)', opacity: hoveredProvider === p.slug ? 0.95 : 0.45, transition:'opacity 0.2s' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:700, color: hoveredProvider === p.slug ? '#e2e8f0' : '#94a3b8', letterSpacing:'-0.01em', transition:'color 0.2s' }}>{p.name}</div>
                    <div className="mono" style={{ fontSize:9, color:'#334155', letterSpacing:'0.06em', marginTop:2, textTransform:'uppercase' }}>{p.slug}</div>
                  </div>
                  {hoveredProvider === p.slug && (
                    <div style={{ position:'absolute', bottom:8, right:8, width:5, height:5, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399' }} />
                  )}
                </div>
              ))}
            </div>

            <div className={gridVisible ? 'visible-up-4' : ''} style={{ marginTop:24, textAlign:'center', opacity: gridVisible ? undefined : 0 }}>
              <span className="mono" style={{ fontSize:11, color:'#334155', letterSpacing:'0.06em' }}>+ More providers added regularly</span>
            </div>
          </div>
        </section>

        <section className="relative z-10" style={{ paddingTop:32, paddingBottom:80 }} ref={codeRef}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid rgba(56,189,248,0.1)', background:'linear-gradient(135deg,rgba(8,14,24,0.98),rgba(4,8,16,0.99))', boxShadow:'0 0 80px rgba(56,189,248,0.06), 0 32px 64px rgba(0,0,0,0.5)' }}>
              <div style={{ padding:'32px 32px 0', position:'relative' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.4),rgba(129,140,248,0.3),transparent)' }} />
                <div className={codeVisible ? 'visible-up' : ''} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:16, opacity: codeVisible ? undefined : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'#38bdf8', boxShadow:'0 0 12px #38bdf8', animation:'pulse-ring 2s ease-in-out infinite' }} />
                    <span className="mono" style={{ fontSize:10, color:'#38bdf8', letterSpacing:'0.12em', textTransform:'uppercase' }}>Coming Soon</span>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'#818cf8', boxShadow:'0 0 12px #818cf8', animation:'pulse-ring 2s ease-in-out infinite 0.5s' }} />
                  </div>
                  <div>
                    <h2 className="hero-title" style={{ fontSize:'clamp(28px,5vw,52px)', letterSpacing:'-0.04em', lineHeight:1.0, color:'#f8fafc', marginBottom:8 }}>
                      Aichixia
                      <span className="shimmer-text"> Code</span>
                    </h2>
                    <p className="mono" style={{ fontSize:'clamp(11px,1.4vw,14px)', color:'#475569', lineHeight:1.7, maxWidth:520, margin:'0 auto', fontWeight:300 }}>
                      An agentic AI coding CLI built for developers. Understands your entire codebase, writes & edits files, runs tests, and ships features — all from your terminal.
                    </p>
                  </div>
                </div>

                <div className={codeVisible ? 'visible-up-2' : ''} style={{ marginTop:32, opacity: codeVisible ? undefined : 0 }}>
                  <div className="code-terminal">
                    <div className="code-terminal-bar">
                      <div className="dot-red" /><div className="dot-yellow" /><div className="dot-green" />
                      <span className="mono" style={{ marginLeft:8, fontSize:10, color:'#334155' }}>terminal</span>
                      <span style={{ marginLeft:'auto', fontSize:9, color:'#1e3a5f', fontFamily:'DM Mono,monospace', background:'rgba(56,189,248,0.06)', padding:'2px 8px', borderRadius:4, border:'1px solid rgba(56,189,248,0.1)' }}>~/your-project</span>
                    </div>
                    <div style={{ padding:'20px 20px 24px' }}>
                      <div className="mono" style={{ fontSize:'clamp(11px,1.5vw,13px)', lineHeight:2, color:'#475569' }}>
                        <div><span style={{ color:'#334155' }}>$</span> <span style={{ color:'#38bdf8' }}>npm</span> <span style={{ color:'#94a3b8' }}>install -g</span> <span style={{ color:'#34d399' }}>@aichixia/code</span></div>
                        <div style={{ color:'#1e3a5f' }}>Installing Aichixia Code v1.0.0...</div>
                        <div style={{ color:'#334155' }}>✓ Installed successfully</div>
                        <div style={{ marginTop:8 }}><span style={{ color:'#334155' }}>$</span> <span style={{ color:'#38bdf8' }}>aix</span> <span style={{ color:'#34d399' }}>"build me a REST API with auth"</span></div>
                        <div style={{ color:'#818cf8' }}>◆ Analyzing codebase...</div>
                        <div style={{ color:'#818cf8' }}>◆ Planning implementation...</div>
                        <div style={{ color:'#34d399' }}>✓ Created <span style={{ color:'#e2e8f0' }}>src/api/auth.ts</span></div>
                        <div style={{ color:'#34d399' }}>✓ Created <span style={{ color:'#e2e8f0' }}>src/middleware/jwt.ts</span></div>
                        <div style={{ color:'#34d399' }}>✓ Updated <span style={{ color:'#e2e8f0' }}>src/routes/index.ts</span></div>
                        <div style={{ color:'#334155' }}>✓ Running tests... <span style={{ color:'#34d399' }}>12/12 passed</span></div>
                        <div style={{ marginTop:8 }}><span style={{ color:'#334155' }}>$</span> <span style={{ color:'#94a3b8' }}>█</span><span className="cursor-blink" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding:'32px' }}>
                <div className={codeVisible ? 'visible-up-3' : ''} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10, marginBottom:32, opacity: codeVisible ? undefined : 0 }}>
                  {[
                    { icon:'⚡', title:'Instant Context', desc:'Reads your entire repo in seconds' },
                    { icon:'🔁', title:'Agentic Loops', desc:'Plans, writes, tests, and iterates' },
                    { icon:'🔒', title:'Secure & Local', desc:'Your code never leaves your machine' },
                    { icon:'🌐', title:'Any Provider', desc:'Powered by all Aichixia models' },
                  ].map((f, i) => (
                    <div key={i} className="glass-card" style={{ borderRadius:12, padding:'16px 16px', display:'flex', flexDirection:'column', gap:6 }}>
                      <span style={{ fontSize:20 }}>{f.icon}</span>
                      <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.01em' }}>{f.title}</div>
                      <div className="mono" style={{ fontSize:11, color:'#475569', fontWeight:300, lineHeight:1.5 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                <div className={codeVisible ? 'visible-up-4' : ''} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, opacity: codeVisible ? undefined : 0 }}>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
                    <button style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 28px', borderRadius:10, background:'linear-gradient(135deg,#38bdf8,#818cf8)', color:'#020408', fontWeight:800, fontSize:13, letterSpacing:'-0.01em', cursor:'pointer', border:'none', boxShadow:'0 0 32px rgba(56,189,248,0.3)', fontFamily:'Cabinet Grotesk,sans-serif' }}>
                      Join Waitlist
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <Link href="/docs" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:10, background:'rgba(56,189,248,0.05)', border:'1px solid rgba(56,189,248,0.15)', color:'#64748b', fontWeight:700, fontSize:13, textDecoration:'none', fontFamily:'Cabinet Grotesk,sans-serif' }}>Learn More</Link>
                  </div>
                  <p className="mono" style={{ fontSize:10, color:'#1e3a5f', letterSpacing:'0.06em', textTransform:'uppercase' }}>Early access · Limited spots</p>
                </div>
              </div>

              <div style={{ padding:'0 32px 32px' }}>
                <div style={{ borderTop:'1px solid rgba(56,189,248,0.08)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div style={{ display:'flex', items:'center', gap:16, flexWrap:'wrap' }}>
                    {['CLI Tool', 'Multi-model', 'Agentic', 'Open Source'].map(t => (
                      <span key={t} className="mono" style={{ fontSize:10, color:'#334155', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:'rgba(56,189,248,0.4)', display:'inline-block' }} />
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="mono" style={{ fontSize:10, color:'#1e3a5f', letterSpacing:'0.06em' }}>v1.0 · 2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative z-10" style={{ borderTop:'1px solid rgba(56,189,248,0.06)', padding:'24px 16px', textAlign:'center' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
              <div style={{ width:24, height:24, borderRadius:6, background:'linear-gradient(135deg,#38bdf8,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#020408', fontFamily:'Syne,sans-serif' }}>A</div>
              <span className="mono" style={{ fontSize:12, color:'#334155' }}>Aichixia · {new Date().getFullYear()}</span>
            </Link>
            <div style={{ display:'flex', gap:16 }}>
              {[['Privacy','/privacy'],['Terms','/terms'],['Docs','/docs']].map(([l,h]) => (
                <Link key={l} href={h} className="mono" style={{ fontSize:11, color:'#334155', textDecoration:'none', letterSpacing:'0.04em' }}>{l}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
