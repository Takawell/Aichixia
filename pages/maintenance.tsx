import { useEffect, useRef, useState } from "react";
import Head from "next/head";

const messages = [
  { icon: "💔", text: "Takawell & Reina are on a date. Server will be back when they stop being adorable." },
  { icon: "🌹", text: "Our two devs decided love > uptime. We respect the decision." },
  { icon: "☕", text: "Takawell is writing code. Reina is distracting him. Productivity: 0%." },
  { icon: "🤝", text: "Both developers are currently \"debugging\" their relationship." },
  { icon: "🛠️", text: "Server is under maintenance. (Translation: the devs forgot to push before the date.)" },
  { icon: "📡", text: "Systems offline. Reason: Takawell looked at Reina and forgot what an API is." },
];

export default function Maintenance() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [progress] = useState(47);
  const [dots, setDots] = useState(".");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % messages.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; t: number };
    const pts: P[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.4,
      a: Math.random() * 0.3 + 0.08,
      t: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.t += 0.015;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${p.a * (0.6 + 0.4 * Math.sin(p.t))})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${0.07 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const copy = () => {
    navigator.clipboard.writeText("hello@aichixia.xyz");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Aichixia — Under Maintenance</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #060a0f; font-family: system-ui, -apple-system, sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinR { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes msgFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradMove { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .fu1 { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.1s both; }
        .fu2 { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.25s both; }
        .fu3 { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.4s both; }
        .fu4 { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.55s both; }
        .fu5 { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.7s both; }
        .fu6 { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.85s both; }
        .fi { animation: fadeIn 1s ease 0.2s both; }
        .grad-text {
          background: linear-gradient(270deg, #0ea5e9, #38bdf8, #7dd3fc, #0ea5e9);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradMove 4s ease infinite;
        }
      `}</style>

      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>

        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,165,233,0.06) 0%, transparent 65%)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.04) 0%, transparent 70%)", filter: "blur(50px)", zIndex: 1, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>

          <div className="fu1" style={{ marginBottom: 32, animation: "float 4s ease-in-out infinite" }}>
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(14,165,233,0.15)", animation: "spin 12s linear infinite" }} />
              <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "1px dashed rgba(14,165,233,0.1)", animation: "spinR 8s linear infinite" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="rgba(14,165,233,0.4)" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="fu2" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s ease infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,158,11,0.8)" }}>Under Maintenance</span>
          </div>

          <div className="fu3" style={{ textAlign: "center", marginBottom: 10 }}>
            <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#f8fafc" }}>
              We'll be right back<span className="grad-text">.</span>
            </h1>
          </div>

          <div className="fu3" style={{ textAlign: "center", maxWidth: 440, marginBottom: 32 }}>
            <p style={{ color: "rgba(148,163,184,0.75)", fontSize: "clamp(0.82rem, 2.2vw, 0.95rem)", lineHeight: 1.75 }}>
              Aichixia is currently undergoing scheduled maintenance to improve performance, reliability, and security across all endpoints.
            </p>
          </div>

          <div className="fu4" style={{ width: "100%", maxWidth: 400, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", fontWeight: 500 }}>Restoration progress</span>
              <span style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #0284c7, #0ea5e9, #38bdf8)", borderRadius: 99, boxShadow: "0 0 12px rgba(14,165,233,0.4)", transition: "width 1.2s ease" }} />
            </div>
          </div>

          <div className="fu4" style={{ marginBottom: 32, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", fontWeight: 500 }}>
              Estimated downtime: a few hours{dots}
            </p>
          </div>

          <div className="fu5" style={{ width: "100%", maxWidth: 400, marginBottom: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", backdropFilter: "blur(12px)", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ textAlign: "center", fontSize: "clamp(0.8rem, 2vw, 0.88rem)", color: "rgba(203,213,225,0.8)", lineHeight: 1.6, transition: "opacity 0.4s, transform 0.4s", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(6px)" }}>
              <span style={{ marginRight: 8 }}>{messages[msgIndex].icon}</span>
              {messages[msgIndex].text}
            </p>
          </div>

          <div className="fu6" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 11, color: "rgba(148,163,184,0.35)", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Questions? We (might) respond
            </p>
            <button
              onClick={copy}
              style={{ cursor: "pointer", background: "rgba(14,165,233,0.06)", border: `1px solid ${copied ? "rgba(34,197,94,0.35)" : "rgba(14,165,233,0.18)"}`, borderRadius: 10, padding: "9px 18px", display: "flex", alignItems: "center", gap: 8, color: copied ? "#4ade80" : "#38bdf8", fontSize: 13, fontWeight: 500, transition: "all 0.2s ease" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,165,233,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,165,233,0.06)")}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  hello@aichixia.xyz
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5V9.5A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.3" /></svg>
                </>
              )}
            </button>
          </div>

          <div className="fi" style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", letterSpacing: "0.08em" }}>
              © {new Date().getFullYear()} Aichixia · Built with ♥ by Takawell & Reina
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
