import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const GRID_COLS = 20;
const GRID_ROWS = 12;

function GlitchText({ text, className }: { text: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className={`relative z-10 transition-all duration-75 ${glitching ? "animate-pulse" : ""}`}
        style={{
          textShadow: glitching
            ? "2px 0 #38bdf8, -2px 0 #f43f5e, 0 0 20px #38bdf8"
            : "0 0 40px rgba(56,189,248,0.4)",
        }}
      >
        {text}
      </span>
      {glitching && (
        <>
          <span
            className="absolute inset-0 z-0"
            style={{
              color: "#38bdf8",
              clipPath: "polygon(0 20%, 100% 20%, 100% 40%, 0 40%)",
              transform: "translateX(3px)",
              opacity: 0.8,
            }}
          >
            {text}
          </span>
          <span
            className="absolute inset-0 z-0"
            style={{
              color: "#f43f5e",
              clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)",
              transform: "translateX(-3px)",
              opacity: 0.8,
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: {
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulse: number;
    }[] = [];

    const cols = GRID_COLS;
    const rows = GRID_ROWS;
    const spacingX = width / cols;
    const spacingY = height / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = spacingX * i + spacingX / 2;
        const y = spacingY * j + spacingY / 2;
        particles.push({
          x,
          y,
          ox: x,
          oy: y,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", onResize);

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      for (const p of particles) {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 100;

        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          p.vx -= (dx / dist) * force * 3;
          p.vy -= (dy / dist) * force * 3;
        }

        p.vx += (p.ox - p.x) * 0.08;
        p.vy += (p.oy - p.y) * 0.08;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        const alpha = p.alpha + Math.sin(p.pulse) * 0.15;
        const distFromMouse = Math.sqrt(
          (mouseRef.current.x - p.x) ** 2 + (mouseRef.current.y - p.y) ** 2
        );
        const highlight = distFromMouse < 120 ? 1 - distFromMouse / 120 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + highlight * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${56 + highlight * 100}, ${189 + highlight * 30}, ${248}, ${alpha + highlight * 0.5})`;
        ctx.fill();

        if (highlight > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, (p.size + highlight * 3) * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${highlight * 0.15})`;
          ctx.fill();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 60) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(56,189,248,${(1 - d / 60) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
}

function TerminalBlock() {
  const lines = [
    { delay: 0, text: "> GET /this-page HTTP/1.1", color: "#94a3b8" },
    { delay: 400, text: "  Host: aichixia.xyz", color: "#64748b" },
    { delay: 700, text: "  Authorization: Bearer sk-***", color: "#64748b" },
    { delay: 1100, text: "", color: "" },
    { delay: 1400, text: "< HTTP/1.1 404 Not Found", color: "#f43f5e" },
    { delay: 1800, text: '< {"error":"route_not_found"}', color: "#fb923c" },
    { delay: 2200, text: "", color: "" },
    { delay: 2600, text: "// Page does not exist in API registry", color: "#38bdf8" },
    { delay: 3000, text: "// Redirecting to known endpoints...", color: "#38bdf8" },
  ];

  const [visible, setVisible] = useState(0);

  useEffect(() => {
    lines.forEach((line, i) => {
      setTimeout(() => setVisible(i + 1), line.delay);
    });
  }, []);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm backdrop-blur-sm overflow-hidden">
      <div className="flex gap-1.5 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-2 text-slate-500 text-xs">aichixia — terminal</span>
      </div>
      <div className="space-y-1">
        {lines.slice(0, visible).map((line, i) => (
          <div
            key={i}
            className="transition-all duration-300"
            style={{ color: line.color || "transparent", opacity: line.text ? 1 : 0.5 }}
          >
            {line.text || "\u00a0"}
            {i === visible - 1 && (
              <span className="inline-block w-2 h-4 bg-sky-400 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingOrb({ x, y, size, delay, color }: { x: string; y: string; size: string; delay: string; color: string }) {
  return (
    <div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        animation: `floatOrb 8s ease-in-out infinite`,
        animationDelay: delay,
        opacity: 0.15,
      }}
    />
  );
}

export default function Custom404() {
  const [mounted, setMounted] = useState(false);
  const [hoverBtn, setHoverBtn] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  return (
    <>
      <Head>
        <title>404 — Page Not Found | Aichixia</title>
        <meta name="description" content="This page doesn't exist in Aichixia's API registry." />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #020617;
          overflow-x: hidden;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes spin404 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.3); }
          50% { box-shadow: 0 0 40px rgba(56,189,248,0.6), 0 0 80px rgba(56,189,248,0.2); }
        }

        .fade-up-1 { animation: fadeSlideUp 0.7s ease forwards; animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation: fadeSlideUp 0.7s ease forwards; animation-delay: 0.3s; opacity: 0; }
        .fade-up-3 { animation: fadeSlideUp 0.7s ease forwards; animation-delay: 0.5s; opacity: 0; }
        .fade-up-4 { animation: fadeSlideUp 0.7s ease forwards; animation-delay: 0.7s; opacity: 0; }
        .fade-up-5 { animation: fadeSlideUp 0.7s ease forwards; animation-delay: 0.9s; opacity: 0; }

        .btn-primary {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          color: #0f172a;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          animation: borderGlow 3s ease-in-out infinite;
        }

        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(14,165,233,0.4);
        }

        .btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .btn-primary:hover::after {
          left: 100%;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 12px;
          padding: 14px 32px;
          color: #38bdf8;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
        }

        .btn-ghost:hover {
          background: rgba(56,189,248,0.08);
          border-color: rgba(56,189,248,0.6);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(56,189,248,0.15);
        }

        .scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
          z-index: 100;
        }

        .number-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(56,189,248,0.2);
          animation: spin404 linear infinite;
        }

        .ring-1 { width: 200px; height: 200px; animation-duration: 20s; border-color: rgba(56,189,248,0.15); }
        .ring-2 { width: 260px; height: 260px; animation-duration: 30s; animation-direction: reverse; border-style: dashed; }
        .ring-3 { width: 320px; height: 320px; animation-duration: 40s; border-color: rgba(56,189,248,0.08); }

        @media (max-width: 640px) {
          .ring-1 { width: 140px; height: 140px; }
          .ring-2 { width: 180px; height: 180px; }
          .ring-3 { width: 220px; height: 220px; }
        }

        .dot-ring {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          box-shadow: 0 0 10px #38bdf8;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          z-index: 0;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          fontFamily: "'Syne', sans-serif",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="noise" />
        <div className="scanline" />

        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div className="grid-bg" />
          <ParticleGrid />
          <FloatingOrb x="10%" y="15%" size="400px" delay="0s" color="radial-gradient(circle, #0ea5e9, transparent)" />
          <FloatingOrb x="70%" y="60%" size="300px" delay="3s" color="radial-gradient(circle, #6366f1, transparent)" />
          <FloatingOrb x="50%" y="5%" size="250px" delay="6s" color="radial-gradient(circle, #38bdf8, transparent)" />
        </div>

        <header
          style={{
            position: "relative",
            zIndex: 10,
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(56,189,248,0.08)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18 }}>Aichixia</span>
          </Link>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Space Mono', monospace",
                color: "#f43f5e",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: 6,
                padding: "4px 10px",
                letterSpacing: "0.05em",
              }}
            >
              ERROR 404
            </span>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            gap: 48,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div className="fade-up-1 number-container" style={{ marginBottom: 32 }}>
              <div className="ring ring-1">
                <div className="dot-ring" style={{ top: -4, left: "50%", transform: "translateX(-50%)" }} />
              </div>
              <div className="ring ring-2" />
              <div className="ring ring-3" />

              <GlitchText
                text="404"
                className="fade-up-1"
                {...({} as any)}
              />
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(80px, 18vw, 160px)",
                  background: "linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #0ea5e9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  textShadow: "none",
                  display: "block",
                  filter: "drop-shadow(0 0 40px rgba(56,189,248,0.3))",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                404
              </span>
            </div>

            <div className="fade-up-2">
              <h1
                style={{
                  fontSize: "clamp(22px, 4vw, 36px)",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                Route Not Found in API Registry
              </h1>
              <p
                style={{
                  fontSize: "clamp(14px, 2vw, 16px)",
                  color: "#64748b",
                  maxWidth: 480,
                  margin: "0 auto",
                  lineHeight: 1.7,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                The endpoint you requested doesn&apos;t exist or has been deprecated.
                <br />
                <span style={{ color: "#38bdf8" }}>aichixia.xyz</span> couldn&apos;t resolve this route.
              </p>
            </div>
          </div>

          <div className="fade-up-3" style={{ width: "100%", maxWidth: 520 }}>
            <TerminalBlock />
          </div>

          <div className="fade-up-4" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link href="/" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Go Home
            </Link>
            <Link href="/docs" className="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              View Docs
            </Link>
            <Link href="/console" className="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              Console
            </Link>
          </div>

          <div
            className="fade-up-5"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              maxWidth: 520,
              width: "100%",
            }}
          >
            {[
              { label: "API Status", value: "Operational", ok: true },
              { label: "Uptime", value: "99.99%", ok: true },
              { label: "This Page", value: "Not Found", ok: false },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${item.ok ? "rgba(56,189,248,0.15)" : "rgba(244,63,94,0.2)"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#475569",
                    fontFamily: "'Space Mono', monospace",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: item.ok ? "#38bdf8" : "#f43f5e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: item.ok ? "#38bdf8" : "#f43f5e",
                      boxShadow: `0 0 6px ${item.ok ? "#38bdf8" : "#f43f5e"}`,
                      display: "inline-block",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer
          style={{
            position: "relative",
            zIndex: 10,
            padding: "16px 32px",
            borderTop: "1px solid rgba(56,189,248,0.06)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#334155" }}>
            © 2025 Aichixia · All endpoints registered ·
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#38bdf8", opacity: 0.6 }}>
            except this one
          </span>
        </footer>
      </div>
    </>
  );
}
