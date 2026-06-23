import { useEffect, useRef, useState } from "react";
import Head from "next/head";

export default function Maintenance() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 2.5;
        if (p >= 87) { p = 87; clearInterval(interval); }
        setProgress(Math.floor(p));
      }, 60);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 60;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; pulse: number };
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${a})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("status@aichixia.xyz");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tasks = [
    { label: "Database migration", done: true },
    { label: "Security patches", done: true },
    { label: "Performance tuning", done: true },
    { label: "API endpoint updates", done: false },
    { label: "Final QA & deploy", done: false },
  ];

  return (
    <>
      <Head>
        <title>Aichixia — Under Maintenance</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #020507; overflow: hidden; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glitch1 {
          0%, 90%, 100% { clip-path: none; transform: none; }
          91% { clip-path: inset(30% 0 40% 0); transform: translate(-3px); }
          93% { clip-path: inset(60% 0 10% 0); transform: translate(3px); }
          95% { clip-path: inset(10% 0 70% 0); transform: translate(-2px); }
        }
        @keyframes glitch2 {
          0%, 85%, 100% { clip-path: none; transform: none; opacity: 0; }
          86% { clip-path: inset(40% 0 30% 0); transform: translate(4px); opacity: 0.6; color: #0ea5e9; }
          88% { clip-path: inset(70% 0 5% 0); transform: translate(-4px); opacity: 0.6; color: #a855f7; }
          90% { opacity: 0; }
        }
        @keyframes progressFill {
          from { width: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 20px) scale(0.9); }
          66% { transform: translate(30px, -40px) scale(1.05); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes taskReveal {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ani-fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .ani-fade-in { animation: fadeIn 1s ease both; }
        .glitch-base { animation: glitch1 8s infinite; }
        .glitch-layer { position: absolute; inset: 0; animation: glitch2 8s infinite; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: "#020507", overflow: "hidden", fontFamily: "'Syne', sans-serif" }}>

        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.07) 0%, transparent 70%)", zIndex: 1 }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb1 12s ease-in-out infinite", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb2 15s ease-in-out infinite", zIndex: 1 }} />

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.15), rgba(14,165,233,0.6), rgba(14,165,233,0.15), transparent)", animation: "scanline 6s linear infinite", zIndex: 2 }} />

        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>

          <div className="ani-fade-in" style={{ animationDelay: "0.1s", marginBottom: 36 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(14,165,233,0.2)", animation: "spinSlow 10s linear infinite" }} />
              <div style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "1px dashed rgba(14,165,233,0.15)", animation: "spinReverse 7s linear infinite" }} />
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(168,85,247,0.1))", border: "1px solid rgba(14,165,233,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="rgba(14,165,233,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="ani-fade-up" style={{ animationDelay: "0.2s", textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: "rgba(14,165,233,0.7)", textTransform: "uppercase", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 4, padding: "4px 10px" }}>
              System Maintenance
            </span>
          </div>

          <div className="ani-fade-up" style={{ animationDelay: "0.35s", textAlign: "center", marginBottom: 12 }}>
            <h1 style={{ position: "relative", display: "inline-block", fontSize: "clamp(2.2rem, 6vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#f8fafc", lineHeight: 1.1 }}>
              <span className="glitch-base" style={{ display: "inline-block" }}>Aichixia</span>
              <span className="glitch-layer" aria-hidden>Aichixia</span>
            </h1>
            <p style={{ fontSize: "clamp(1.1rem, 3vw, 1.6rem)", fontWeight: 700, color: "rgba(14,165,233,0.9)", letterSpacing: "-0.01em", marginTop: 2 }}>
              is getting an upgrade.
            </p>
          </div>

          <div className="ani-fade-up" style={{ animationDelay: "0.5s", textAlign: "center", maxWidth: 420, marginBottom: 32 }}>
            <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "clamp(0.78rem, 2vw, 0.9rem)", lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}>
              We're upgrading our infrastructure to deliver<br />
              faster, more reliable AI API services.
            </p>
          </div>

          <div className="ani-fade-up" style={{ animationDelay: "0.6s", width: "100%", maxWidth: 380, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(148,163,184,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Progress</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0ea5e9", fontWeight: 500 }}>
                {mounted ? progress : 0}%
                <span style={{ animation: "blink 1s infinite", marginLeft: 2 }}>_</span>
              </span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ height: "100%", width: `${mounted ? progress : 0}%`, background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #a855f7)", borderRadius: 99, transition: "width 0.3s ease", boxShadow: "0 0 10px rgba(14,165,233,0.5)" }} />
            </div>
          </div>

          <div className="ani-fade-up" style={{ animationDelay: "0.7s", width: "100%", maxWidth: 380, marginBottom: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", backdropFilter: "blur(8px)" }}>
            {tasks.map((task, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", animation: `taskReveal 0.4s ease ${0.7 + i * 0.1}s both` }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: task.done ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${task.done ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}` }}>
                  {task.done ? (
                    <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5L4.5 7.5L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(14,165,233,0.4)", animation: "blink 1.5s infinite" }} />
                  )}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: task.done ? "rgba(148,163,184,0.5)" : "rgba(248,250,252,0.85)", textDecoration: task.done ? "line-through" : "none", letterSpacing: "0.02em" }}>
                  {task.label}
                </span>
                {!task.done && (
                  <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(14,165,233,0.6)", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)", borderRadius: 4, padding: "1px 6px" }}>
                    in progress
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="ani-fade-up" style={{ animationDelay: "0.9s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(148,163,184,0.5)", letterSpacing: "0.08em" }}>QUESTIONS? REACH US AT</p>
            <button
              onClick={handleCopy}
              style={{ cursor: "pointer", background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease", color: copied ? "#22c55e" : "#0ea5e9" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,165,233,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,165,233,0.05)")}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500 }}>
                {copied ? "✓ Copied!" : "status@aichixia.xyz"}
              </span>
              {!copied && (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5V9.5A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              )}
            </button>
          </div>

          <div className="ani-fade-in" style={{ animationDelay: "1.1s", position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "blink 2s infinite" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(148,163,184,0.4)", letterSpacing: "0.12em" }}>AICHIVERSE © {new Date().getFullYear()}</span>
          </div>

        </div>
      </div>
    </>
  );
}
