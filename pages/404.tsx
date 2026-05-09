import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaHome,
  FaBook,
  FaTerminal,
  FaMoon,
  FaSun,
  FaArrowRight,
  FaGithub,
  FaTwitter,
  FaDiscord,
} from "react-icons/fa";

function useMousePosition() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return pos;
}

function SpotlightCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMousePosition();
  const animRef = useRef<number>(0);
  const dotsRef = useRef<{ x: number; y: number; ox: number; oy: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const build = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dotsRef.current = [];
      const gap = 44;
      const cols = Math.ceil(canvas.width / gap) + 1;
      const rows = Math.ceil(canvas.height / gap) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dotsRef.current.push({ x: i * gap, y: j * gap, ox: i * gap, oy: j * gap, vx: 0, vy: 0 });
        }
      }
    };
    build();
    window.addEventListener("resize", build);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dotsRef.current) {
        const dx = mouse.x - d.x;
        const dy = mouse.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const R = 160;
        if (dist < R && dist > 0) {
          const f = ((R - dist) / R) * 2.8;
          d.vx -= (dx / dist) * f;
          d.vy -= (dy / dist) * f;
        }
        d.vx += (d.ox - d.x) * 0.12;
        d.vy += (d.oy - d.y) * 0.12;
        d.vx *= 0.78;
        d.vy *= 0.78;
        d.x += d.vx;
        d.y += d.vy;

        const near = dist < 180;
        const proximity = near ? 1 - dist / 180 : 0;
        const base = isDark ? 0.055 : 0.09;
        const alpha = base + proximity * 0.3;
        const r = 1.2 + proximity * 1.8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(148,163,184,${alpha})`
          : `rgba(71,85,105,${alpha})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", build);
    };
  }, [mouse, isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

function GlitchNumber({ isDark }: { isDark: boolean }) {
  const [glitch, setGlitch] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setOffset({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 2 });
      setTimeout(() => {
        setGlitch(false);
        setOffset({ x: 0, y: 0 });
      }, 180);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const fs = "clamp(88px, 19vw, 192px)";
  const base: React.CSSProperties = {
    fontSize: fs,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.05em",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "block",
  };

  return (
    <div style={{ position: "relative", display: "inline-block", userSelect: "none" }}>
      <span
        style={{
          ...base,
          background: isDark
            ? "linear-gradient(160deg, #f8fafc 0%, #94a3b8 60%, #475569 100%)"
            : "linear-gradient(160deg, #0f172a 0%, #334155 60%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          filter: glitch
            ? "drop-shadow(3px 0 #38bdf8) drop-shadow(-3px 0 #f43f5e)"
            : isDark
            ? "drop-shadow(0 0 80px rgba(148,163,184,0.12))"
            : "none",
          transition: glitch ? "none" : "transform 0.4s ease, filter 0.4s ease",
        }}
      >
        404
      </span>
      {glitch && (
        <>
          <span
            style={{
              ...base,
              position: "absolute",
              inset: 0,
              color: "#38bdf8",
              WebkitTextFillColor: "#38bdf8",
              clipPath: "polygon(0 20%, 100% 20%, 100% 42%, 0 42%)",
              transform: "translate(4px, 0)",
              opacity: 0.75,
            }}
          >
            404
          </span>
          <span
            style={{
              ...base,
              position: "absolute",
              inset: 0,
              color: "#f43f5e",
              WebkitTextFillColor: "#f43f5e",
              clipPath: "polygon(0 58%, 100% 58%, 100% 80%, 0 80%)",
              transform: "translate(-4px, 0)",
              opacity: 0.75,
            }}
          >
            404
          </span>
        </>
      )}
    </div>
  );
}

function TypewriterPath() {
  const router = useRouter();
  const path = router.asPath;
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(path.slice(0, i));
      if (i >= path.length) clearInterval(t);
    }, 38);
    return () => clearInterval(t);
  }, [path]);

  return (
    <span style={{ fontFamily: "'SF Mono','Fira Code',monospace" }}>
      <span style={{ opacity: 0.45 }}>GET </span>
      {displayed}
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: "0.85em",
          background: "#38bdf8",
          verticalAlign: "text-bottom",
          marginLeft: 2,
          animation: "cur 1s step-end infinite",
        }}
      />
    </span>
  );
}

export default function Custom404() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  if (!mounted) return null;

  const bg = isDark ? "#060b14" : "#fafafa";
  const surface = isDark ? "rgba(13,20,36,0.7)" : "rgba(255,255,255,0.85)";
  const border = isDark ? "rgba(30,41,59,0.9)" : "rgba(226,232,240,0.9)";
  const tp = isDark ? "#f1f5f9" : "#0f172a";
  const ts = isDark ? "#64748b" : "#94a3b8";

  return (
    <>
      <Head>
        <title>404 — Page Not Found | Aichixia</title>
        <meta name="description" content="This page doesn't exist." />
        <meta name="robots" content="noindex,nofollow" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        @keyframes cur { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes u1 { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes u2 { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes si { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes pls { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .a1{animation:u1 0.65s cubic-bezier(0.16,1,0.3,1) 0.00s both}
        .a2{animation:u2 0.65s cubic-bezier(0.16,1,0.3,1) 0.08s both}
        .a3{animation:u2 0.65s cubic-bezier(0.16,1,0.3,1) 0.16s both}
        .a4{animation:u2 0.65s cubic-bezier(0.16,1,0.3,1) 0.24s both}
        .a5{animation:u2 0.65s cubic-bezier(0.16,1,0.3,1) 0.34s both}
        .a6{animation:si  0.55s cubic-bezier(0.16,1,0.3,1) 0.44s both}
        .a7{animation:si  0.55s cubic-bezier(0.16,1,0.3,1) 0.52s both}
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div
        style={{
          minHeight: "100dvh",
          background: bg,
          fontFamily: "'Inter',system-ui,sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SpotlightCanvas isDark={isDark} />

        {isDark && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              background:
                "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(14,165,233,0.07) 0%, transparent 65%)",
            }}
          />
        )}

        <header
          style={{
            position: "relative",
            zIndex: 10,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 clamp(16px,4vw,40px)",
            borderBottom: `1px solid ${border}`,
            background: surface,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 27,
                height: 27,
                borderRadius: 7,
                background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 12px rgba(14,165,233,0.35)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: tp, letterSpacing: "-0.015em" }}>
              Aichixia
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#f43f5e",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.22)",
                borderRadius: 6,
                padding: "3px 8px",
              }}
            >
              ERROR 404
            </span>
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: surface,
                backdropFilter: "blur(8px)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: ts,
                transition: "all 0.2s",
              }}
            >
              {isDark ? <FaSun size={12} /> : <FaMoon size={12} />}
            </button>
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
            padding: "clamp(28px,7vw,72px) clamp(16px,4vw,40px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 0,
            }}
          >
            <div className="a1" style={{ marginBottom: 4 }}>
              <GlitchNumber isDark={isDark} />
            </div>

            <div
              className="a2"
              style={{
                fontSize: "clamp(12px,1.6vw,13px)",
                padding: "5px 12px",
                borderRadius: 7,
                background: isDark ? "rgba(15,23,42,0.8)" : "rgba(241,245,249,0.9)",
                border: `1px solid ${border}`,
                color: ts,
                marginBottom: 22,
                display: "inline-block",
              }}
            >
              <TypewriterPath />
            </div>

            <h1
              className="a3"
              style={{
                fontSize: "clamp(19px,3.2vw,25px)",
                fontWeight: 700,
                color: tp,
                letterSpacing: "-0.025em",
                lineHeight: 1.25,
                marginBottom: 10,
              }}
            >
              Page not found
            </h1>

            <p
              className="a3"
              style={{
                fontSize: "clamp(13px,1.7vw,14.5px)",
                color: ts,
                lineHeight: 1.7,
                maxWidth: 370,
                marginBottom: 30,
              }}
            >
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Try one of the links below to get back on track.
            </p>

            <div
              className="a4"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginBottom: 36,
              }}
            >
              {[
                {
                  href: "/",
                  label: "Back to Home",
                  icon: <FaHome size={12} />,
                  primary: true,
                },
                {
                  href: "/docs",
                  label: "Documentation",
                  icon: <FaBook size={12} />,
                  primary: false,
                },
                {
                  href: "/console",
                  label: "Console",
                  icon: <FaTerminal size={12} />,
                  primary: false,
                },
              ].map((btn) => (
                <Link
                  key={btn.href}
                  href={btn.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                    transition: "all 0.18s ease",
                    ...(btn.primary
                      ? {
                          background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
                          color: "#fff",
                          boxShadow: "0 4px 18px rgba(14,165,233,0.38)",
                        }
                      : {
                          background: surface,
                          backdropFilter: "blur(12px)",
                          color: isDark ? "#cbd5e1" : "#334155",
                          border: `1px solid ${border}`,
                        }),
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-2px)";
                    if (btn.primary) {
                      el.style.boxShadow = "0 8px 28px rgba(14,165,233,0.48)";
                    } else {
                      el.style.color = tp;
                      el.style.borderColor = isDark ? "rgba(100,116,139,0.7)" : "rgba(148,163,184,0.9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(0)";
                    if (btn.primary) {
                      el.style.boxShadow = "0 4px 18px rgba(14,165,233,0.38)";
                    } else {
                      el.style.color = isDark ? "#cbd5e1" : "#334155";
                      el.style.borderColor = border;
                    }
                  }}
                >
                  {btn.icon}
                  {btn.label}
                  {!btn.primary && (
                    <FaArrowRight
                      size={10}
                      style={{ opacity: 0.4, marginLeft: 1 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div
              className="a5"
              style={{
                width: "100%",
                borderRadius: 14,
                border: `1px solid ${border}`,
                background: surface,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                    <div
                      key={i}
                      style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.85 }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: ts,
                    fontFamily: "'SF Mono','Fira Code',monospace",
                    letterSpacing: "0.02em",
                  }}
                >
                  api · aichixia.xyz
                </span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                {[
                  { k: "status", v: "404", vc: "#f43f5e" },
                  {
                    k: "error",
                    v: '"route_not_found"',
                    vc: isDark ? "#fda4af" : "#e11d48",
                  },
                  {
                    k: "message",
                    v: '"This endpoint does not exist"',
                    vc: isDark ? "#86efac" : "#16a34a",
                  },
                  {
                    k: "docs",
                    v: '"aichixia.xyz/docs"',
                    vc: isDark ? "#7dd3fc" : "#0369a1",
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.k}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                      padding: "2.5px 0",
                      fontFamily: "'SF Mono','Fira Code',monospace",
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    <span
                      style={{
                        color: isDark ? "#334155" : "#cbd5e1",
                        minWidth: 18,
                        textAlign: "right",
                        userSelect: "none",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: isDark ? "#7dd3fc" : "#0369a1" }}>
                      &quot;{row.k}&quot;
                    </span>
                    <span style={{ color: ts }}>:</span>
                    <span style={{ color: row.vc }}>{row.v}</span>
                    {i < arr.length - 1 && <span style={{ color: ts }}>,</span>}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="a6"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 7,
                width: "100%",
                marginBottom: 0,
              }}
            >
              {[
                { label: "API Status", value: "Operational", ok: true },
                { label: "Uptime", value: "99.99%", ok: true },
                { label: "Active Models", value: "20+", ok: true },
                { label: "This Route", value: "Not Found", ok: false },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "9px 13px",
                    borderRadius: 10,
                    border: `1px solid ${s.ok ? border : "rgba(244,63,94,0.2)"}`,
                    background: surface,
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 500, color: ts }}>
                    {s.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        display: "block",
                        background: s.ok ? "#22c55e" : "#f43f5e",
                        boxShadow: `0 0 5px ${s.ok ? "#22c55e" : "#f43f5e"}`,
                        animation: "pls 2s ease-in-out infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "'SF Mono','Fira Code',monospace",
                        color: s.ok ? (isDark ? "#4ade80" : "#16a34a") : "#f43f5e",
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: "12px clamp(16px,4vw,40px)",
            borderTop: `1px solid ${border}`,
            background: surface,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span style={{ fontSize: 11, color: ts }}>
            © 2025 Aichixia · contact@aichixia.xyz
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { href: "https://github.com/aichixia", icon: <FaGithub size={12} /> },
              { href: "https://twitter.com/aichixia", icon: <FaTwitter size={12} /> },
              { href: "https://discord.gg/aichixia", icon: <FaDiscord size={12} /> },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  border: `1px solid ${border}`,
                  background: surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: ts,
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = tp;
                  el.style.borderColor = isDark
                    ? "rgba(100,116,139,0.6)"
                    : "rgba(148,163,184,0.8)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = ts;
                  el.style.borderColor = border;
                  el.style.transform = "translateY(0)";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
