"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const SECRET = process.env.NEXT_PUBLIC_SECRET_CODE ?? "";

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>[]{}";

function useRain(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const fontSize = 13;
    let cols: number;
    let drops: number[];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = Array(cols).fill(1);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const intensity = Math.random();
        if (intensity > 0.98) {
          ctx.fillStyle = "#ffffff";
        } else if (intensity > 0.85) {
          ctx.fillStyle = "#3b82f6";
        } else {
          ctx.fillStyle = "rgba(59,130,246,0.25)";
        }
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

const PUZZLE_STEPS = [
  {
    id: 1,
    question: "What 3-letter acronym describes a model trained with human feedback?",
    answer: "rlhf",
    hint: "Reinforcement Learning from Human ___",
    reward: "LAYER 1 UNLOCKED",
  },
  {
    id: 2,
    question: "How many bits are in a byte? Answer in binary.",
    answer: "1000",
    hint: "8 in decimal = ? in binary",
    reward: "LAYER 2 UNLOCKED",
  },
  {
    id: 3,
    question: "The year the Transformer architecture was introduced. (Hint: 'Attention Is All You Need')",
    answer: "2017",
    hint: "Google Brain dropped a legendary paper this year",
    reward: "LAYER 3 UNLOCKED",
  },
  {
    id: 4,
    question: "Reverse this string: 2026-EMOCLEW-ORP",
    answer: "pro-welcome-2026",
    hint: "Read it backwards, character by character",
    reward: "ACCESS GRANTED",
  },
];

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [termLines, setTermLines] = useState<string[]>([]);
  const [typedText, setTypedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useRain(canvasRef);

  useEffect(() => {
    setMounted(true);
    const glitchTimer = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 180);
    }, 3800);
    return () => clearInterval(glitchTimer);
  }, []);

  useEffect(() => {
    const cursor = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(cursor);
  }, []);

  const mainText = "404";
  useEffect(() => {
    if (!mounted) return;
    let i = 0;
    const bootLines = [
      "> AICHIXIA KERNEL v3.14.1",
      "> Booting system modules...",
      "> [OK] Neural network initialized",
      "> [OK] Route resolver loaded",
      "> [ERR] Requested endpoint not found",
      "> Diagnostic: path corrupted or never existed",
      "> Initiating recovery protocol...",
    ];
    const lineTimer = setInterval(() => {
      if (i < bootLines.length) {
        setTermLines(prev => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(lineTimer);
      }
    }, 420);
    return () => clearInterval(lineTimer);
  }, [mounted]);

  useEffect(() => {
    const full = "ENDPOINT_NOT_FOUND";
    let i = 0;
    const t = setInterval(() => {
      if (i <= full.length) {
        setTypedText(full.slice(0, i));
        i++;
      } else {
        clearInterval(t);
      }
    }, 70);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = useCallback(() => {
    const step = PUZZLE_STEPS[currentStep];
    const normalized = input.trim().toLowerCase();
    if (normalized === step.answer) {
      setError("");
      setInput("");
      setShowHint(false);
      if (currentStep === PUZZLE_STEPS.length - 1) {
        setCompleted(true);
        setTermLines(prev => [...prev, "> [SUCCESS] All layers decrypted.", "> [ACCESS] Welcome, Operator."]);
      } else {
        setCurrentStep(s => s + 1);
        setTermLines(prev => [...prev, `> [OK] ${step.reward}`]);
      }
    } else {
      setError("INCORRECT — try again");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [currentStep, input]);

  const handleRevealSecret = () => {
    setSecretRevealed(true);
    setTermLines(prev => [...prev, `> [SECRET] Code: ${SECRET}`]);
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#e2e8f0",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&family=Space+Grotesk:wght@700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes glitch1 {
          0%,100% { clip-path: inset(0 0 98% 0); transform: translate(-4px,0); }
          20% { clip-path: inset(33% 0 55% 0); transform: translate(4px,0); }
          40% { clip-path: inset(70% 0 12% 0); transform: translate(-2px,0); }
          60% { clip-path: inset(15% 0 75% 0); transform: translate(2px,0); }
          80% { clip-path: inset(55% 0 30% 0); transform: translate(-4px,0); }
        }
        @keyframes glitch2 {
          0%,100% { clip-path: inset(60% 0 10% 0); transform: translate(4px,0); color:#3b82f6; }
          25% { clip-path: inset(10% 0 75% 0); transform: translate(-4px,0); color:#06b6d4; }
          50% { clip-path: inset(40% 0 40% 0); transform: translate(2px,0); color:#8b5cf6; }
          75% { clip-path: inset(80% 0 5% 0); transform: translate(-2px,0); color:#3b82f6; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform:scale(1); opacity:0.6; }
          100% { transform:scale(1.8); opacity:0; }
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        @keyframes flicker {
          0%,19%,21%,23%,25%,54%,56%,100%{opacity:1}
          20%,24%,55%{opacity:0.4}
        }
        @keyframes float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-12px)}
        }
        @keyframes borderFlow {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        @keyframes termScroll {
          from{opacity:0;transform:translateX(-8px)}
          to{opacity:1;transform:translateX(0)}
        }

        .glitch-wrap { position:relative; display:inline-block; }
        .glitch-main { font-family:'Space Grotesk',sans-serif; font-weight:900; }
        .glitch-main::before,
        .glitch-main::after {
          content:attr(data-text);
          position:absolute;
          top:0; left:0;
          width:100%; height:100%;
          font-family:'Space Grotesk',sans-serif;
          font-weight:900;
        }
        .glitch-active .glitch-main::before {
          animation: glitch1 0.18s steps(1) forwards;
          color:#ef4444;
        }
        .glitch-active .glitch-main::after {
          animation: glitch2 0.18s steps(1) forwards;
        }

        .scanline {
          position:fixed;
          top:0; left:0;
          width:100%;
          height:4px;
          background:linear-gradient(transparent, rgba(59,130,246,0.12), transparent);
          animation:scanline 5s linear infinite;
          pointer-events:none;
          z-index:10;
        }

        .grid-bg {
          position:fixed;
          inset:0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size:40px 40px;
          pointer-events:none;
        }

        .fadeup { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
        .fadeup-2 { animation: fadeUp 0.7s 0.15s cubic-bezier(.16,1,.3,1) both; }
        .fadeup-3 { animation: fadeUp 0.7s 0.3s cubic-bezier(.16,1,.3,1) both; }
        .fadeup-4 { animation: fadeUp 0.7s 0.45s cubic-bezier(.16,1,.3,1) both; }
        .fadeup-5 { animation: fadeUp 0.7s 0.6s cubic-bezier(.16,1,.3,1) both; }

        .float-anim { animation: float 4s ease-in-out infinite; }
        .flicker { animation: flicker 4s infinite; }

        .btn-primary {
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:11px 22px;
          border-radius:8px;
          font-family:inherit;
          font-size:13px;
          font-weight:700;
          cursor:pointer;
          transition:all 0.2s;
          border:none;
          outline:none;
          letter-spacing:0.05em;
        }
        .btn-primary:hover { transform:translateY(-2px); }
        .btn-primary:active { transform:translateY(0); }

        .terminal {
          background:rgba(0,0,0,0.85);
          border:1px solid rgba(59,130,246,0.25);
          border-radius:10px;
          backdrop-filter:blur(10px);
        }

        .term-line { animation: termScroll 0.3s ease both; }

        .progress-bar {
          height:3px;
          border-radius:2px;
          background:linear-gradient(90deg,#3b82f6,#06b6d4);
          transition:width 0.5s cubic-bezier(.16,1,.3,1);
        }

        .modal-bg {
          position:fixed;
          inset:0;
          background:rgba(0,0,0,0.85);
          backdrop-filter:blur(12px);
          z-index:50;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:16px;
          animation:fadeUp 0.25s ease both;
        }
        .modal {
          background:#08090d;
          border:1px solid rgba(59,130,246,0.3);
          border-radius:16px;
          width:100%;
          max-width:520px;
          max-height:90vh;
          overflow-y:auto;
          position:relative;
        }
        .modal-glow {
          position:absolute;
          inset:-1px;
          border-radius:16px;
          background:linear-gradient(135deg,rgba(59,130,246,0.3),rgba(6,182,212,0.2),rgba(139,92,246,0.2));
          background-size:300% 300%;
          animation:borderFlow 4s ease infinite;
          z-index:-1;
          pointer-events:none;
        }

        .shake { animation: shake 0.4s ease; }

        .input-field {
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(59,130,246,0.25);
          border-radius:8px;
          padding:10px 14px;
          font-family:inherit;
          font-size:13px;
          color:#e2e8f0;
          outline:none;
          transition:all 0.2s;
          letter-spacing:0.05em;
        }
        .input-field:focus {
          border-color:rgba(59,130,246,0.6);
          box-shadow:0 0 0 3px rgba(59,130,246,0.12);
        }

        .secret-reveal {
          background:linear-gradient(135deg,rgba(59,130,246,0.1),rgba(6,182,212,0.08));
          border:1px solid rgba(59,130,246,0.4);
          border-radius:10px;
          padding:16px 20px;
          font-family:inherit;
          letter-spacing:0.08em;
        }

        @media(max-width:480px){
          .four-o-four { font-size:clamp(80px,22vw,150px) !important; }
          .sub-label { font-size:11px !important; }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div className="grid-bg" />
      <div className="scanline" />

      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "15%",
          right: "8%",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          gap: "0",
        }}
      >
        <div className="fadeup" style={{ marginBottom: "8px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "100px",
              fontSize: "11px",
              letterSpacing: "0.12em",
              color: "#3b82f6",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ef4444",
                animation: "pulse-ring 1.5s ease infinite",
                boxShadow: "0 0 0 0 rgba(239,68,68,0.4)",
              }}
            />
            AICHIXIA SYSTEM ERROR
          </span>
        </div>

        <div className={`glitch-wrap ${glitchActive ? "glitch-active" : ""} fadeup-2`}>
          <h1
            className="glitch-main four-o-four"
            data-text="404"
            style={{
              fontSize: "clamp(100px,18vw,200px)",
              lineHeight: 1,
              background: "linear-gradient(135deg, #ffffff 0%, #3b82f6 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              userSelect: "none",
              letterSpacing: "-0.02em",
            }}
          >
            404
          </h1>
        </div>

        <div className="fadeup-3" style={{ marginBottom: "6px" }}>
          <span
            className="flicker"
            style={{
              fontSize: "clamp(13px,2.5vw,17px)",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: "#3b82f6",
              letterSpacing: "0.18em",
            }}
          >
            {typedText}
            <span style={{ opacity: cursorVisible ? 1 : 0, color: "#06b6d4" }}>█</span>
          </span>
        </div>

        <p
          className="fadeup-3"
          style={{
            fontSize: "13px",
            color: "rgba(148,163,184,0.8)",
            textAlign: "center",
            maxWidth: "380px",
            lineHeight: 1.7,
            letterSpacing: "0.03em",
            marginBottom: "28px",
          }}
        >
          The route you're looking for has been lost in the void.
          <br />
          Or maybe it never existed. Either way — we can't find it.
        </p>

        <div
          className="terminal fadeup-4"
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "14px 16px",
            marginBottom: "24px",
            minHeight: "120px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
              paddingBottom: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "block" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "block" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "block" }} />
            <span style={{ fontSize: "10px", color: "rgba(148,163,184,0.4)", marginLeft: "8px", letterSpacing: "0.1em" }}>
              system.log
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {termLines.map((line, i) => (
              <div
                key={i}
                className="term-line"
                style={{
                  fontSize: "11px",
                  color: line.includes("[ERR]")
                    ? "#ef4444"
                    : line.includes("[SUCCESS]") || line.includes("[ACCESS]")
                    ? "#22c55e"
                    : line.includes("[SECRET]")
                    ? "#f59e0b"
                    : line.includes("[OK]")
                    ? "#3b82f6"
                    : "rgba(148,163,184,0.7)",
                  lineHeight: 1.6,
                  letterSpacing: "0.04em",
                }}
              >
                {line}
              </div>
            ))}
            {!completed && (
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(148,163,184,0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {">"}
                <span
                  style={{
                    display: "inline-block",
                    width: "7px",
                    height: "13px",
                    background: "#3b82f6",
                    opacity: cursorVisible ? 1 : 0,
                  }}
                />
              </span>
            )}
          </div>
        </div>

        <div
          className="fadeup-5"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <Link href="/">
            <button
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              RETURN HOME
            </button>
          </Link>

          <button
            className="btn-primary"
            onClick={() => setPuzzleOpen(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "#3b82f6",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            DECRYPT PROTOCOL
          </button>

          <button
            className="btn-primary"
            onClick={() => window.history.back()}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(148,163,184,0.7)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            GO BACK
          </button>
        </div>

        <div
          className="fadeup-5"
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "LATENCY", val: "<100ms" },
            { label: "MODELS", val: "22+" },
            { label: "UPTIME", val: "99.9%" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "'Space Grotesk',sans-serif",
                }}
              >
                {stat.val}
              </div>
              <div style={{ fontSize: "9px", color: "rgba(148,163,184,0.4)", letterSpacing: "0.15em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {puzzleOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) { if (!completed) setPuzzleOpen(false); } }}>
          <div className={`modal ${shake ? "shake" : ""}`} style={{ position: "relative" }}>
            <div className="modal-glow" />

            <div
              style={{
                padding: "20px 22px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    color: "#3b82f6",
                    fontWeight: 700,
                    marginBottom: "3px",
                  }}
                >
                  DECRYPT PROTOCOL
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Space Grotesk',sans-serif" }}>
                  {completed ? "ACCESS GRANTED" : `LAYER ${currentStep + 1} OF ${PUZZLE_STEPS.length}`}
                </div>
              </div>
              {!completed && (
                <button
                  onClick={() => { setPuzzleOpen(false); setInput(""); setError(""); setShowHint(false); }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "rgba(148,163,184,0.6)",
                    fontSize: "16px",
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <div style={{ padding: "16px 22px 0" }}>
              <div
                style={{
                  height: "3px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${completed ? 100 : (currentStep / PUZZLE_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {!completed ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      background: "rgba(59,130,246,0.06)",
                      border: "1px solid rgba(59,130,246,0.18)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        letterSpacing: "0.15em",
                        color: "#3b82f6",
                        marginBottom: "8px",
                        fontWeight: 700,
                      }}
                    >
                      CHALLENGE_{currentStep + 1}
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#e2e8f0",
                        lineHeight: 1.7,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {PUZZLE_STEPS[currentStep].question}
                    </p>
                  </div>

                  {showHint && (
                    <div
                      style={{
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "12px",
                        color: "#f59e0b",
                        letterSpacing: "0.04em",
                      }}
                    >
                      HINT: {PUZZLE_STEPS[currentStep].hint}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      ref={inputRef}
                      className="input-field"
                      placeholder="Enter your answer..."
                      value={input}
                      onChange={e => { setInput(e.target.value); setError(""); }}
                      onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#ef4444",
                        letterSpacing: "0.08em",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>✕</span> {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-primary"
                      onClick={handleSubmit}
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                        justifyContent: "center",
                      }}
                    >
                      SUBMIT ANSWER
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => setShowHint(h => !h)}
                      style={{
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        color: "#f59e0b",
                      }}
                    >
                      {showHint ? "HIDE" : "HINT"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "center" }}>
                  <div className="float-anim" style={{ fontSize: "52px" }}>🔓</div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 900,
                        fontFamily: "'Space Grotesk',sans-serif",
                        background: "linear-gradient(135deg,#22c55e,#06b6d4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        marginBottom: "6px",
                      }}
                    >
                      ALL LAYERS DECRYPTED
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(148,163,184,0.6)", lineHeight: 1.7 }}>
                      You've proven worthy of access.
                      <br />
                      Reveal your classified access code below.
                    </p>
                  </div>

                  {!secretRevealed ? (
                    <button
                      className="btn-primary"
                      onClick={handleRevealSecret}
                      style={{
                        background: "linear-gradient(135deg,#22c55e,#06b6d4)",
                        color: "#fff",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
                        fontSize: "13px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      REVEAL SECRET CODE
                    </button>
                  ) : (
                    <div className="secret-reveal">
                      <div
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.18em",
                          color: "#22c55e",
                          marginBottom: "10px",
                          fontWeight: 700,
                        }}
                      >
                        CLASSIFIED ACCESS CODE
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(14px,3.5vw,20px)",
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          color: "#f1f5f9",
                          fontFamily: "'Space Grotesk',sans-serif",
                          wordBreak: "break-all",
                        }}
                      >
                        {SECRET}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(148,163,184,0.4)",
                          marginTop: "8px",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Use this at checkout or activation page
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    onClick={() => setPuzzleOpen(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(148,163,184,0.6)",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                  >
                    CLOSE TERMINAL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
