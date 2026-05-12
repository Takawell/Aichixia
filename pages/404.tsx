import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { NextPage } from "next";

const GLYPHS = "アイウエオカキクケコ0123456789ABCDEF<>[]{}";

const STATIC_STEPS: { q: string; a: string | null; hint: string; reward: string }[] = [
  {
    q: "SHA-256 hash of the string 'hello' — what are the first 6 hex characters? (lowercase)",
    a: "2cf24d",
    hint: "Run: echo -n 'hello' | sha256sum — copy first 6 chars",
    reward: "LAYER 1 DECRYPTED",
  },
  {
    q: "In IPv4, what is the broadcast address of the subnet 192.168.10.0/28?",
    a: "192.168.10.15",
    hint: "/28 = 4 host bits → 16 addresses. Last address = broadcast.",
    reward: "LAYER 2 DECRYPTED",
  },
  {
    q: "What is the decimal value of the two's complement 8-bit number 11110110?",
    a: "-10",
    hint: "Flip all bits → 00001001, add 1 → 00001010 = 10. It's negative.",
    reward: "LAYER 3 DECRYPTED",
  },
  {
    q: "A classic programmer's first output. Two words, lowercase, separated by a hyphen. No spaces.",
    a: "hello-world",
    hint: "Every language's first program. Two words. Hyphen between them.",
    reward: "LAYER 4 DECRYPTED",
  },
  {
    q: "In Big-O notation, what is the average time complexity of QuickSort? (format: o(n log n))",
    a: "o(n log n)",
    hint: "Not worst case O(n²). The average. Include O( ) with lowercase o.",
    reward: "LAYER 5 DECRYPTED",
  },
  {
    q: "Convert hexadecimal 0xDEAD to decimal.",
    a: "57005",
    hint: "D=13 E=14 A=10 D=13. Expand: 13×16³ + 14×16² + 10×16¹ + 13×16⁰",
    reward: "LAYER 6 DECRYPTED",
  },
  {
    q: "What CPU vulnerability disclosed in January 2018 exploits speculative execution to leak data across process boundaries? (one word, lowercase)",
    a: "spectre",
    hint: "Disclosed alongside Meltdown. Named after something that haunts you.",
    reward: "LAYER 7 DECRYPTED",
  },
  {
    q: "In asymmetric cryptography, Alice wants to send Bob an encrypted message only Bob can read. Which key does Alice use to encrypt?",
    a: "bob's public key",
    hint: "Only Bob can decrypt it. So Alice needs Bob's ___ key. Include 'Bob's'.",
    reward: "LAYER 8 DECRYPTED",
  },
  {
    q: "What HTTP status code is defined in RFC 2324 as 'I'm a teapot'?",
    a: "418",
    hint: "An April Fools' RFC from 1998. Still an official IANA status code.",
    reward: "LAYER 9 DECRYPTED",
  },
  {
    q: "What is the port number used by DNS over HTTPS (DoH) as standardized in RFC 8484?",
    a: "443",
    hint: "DoH runs over HTTPS. What port does HTTPS always use?",
    reward: "LAYER 10 DECRYPTED — ALL SYSTEMS BREACHED",
  },
];

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #000; margin: 0; padding: 0; }

@keyframes glitch1 {
  0%,100%{clip-path:inset(0 0 98% 0);transform:translate(-4px,0)}
  20%{clip-path:inset(33% 0 55% 0);transform:translate(4px,0)}
  40%{clip-path:inset(70% 0 12% 0);transform:translate(-2px,0)}
  60%{clip-path:inset(15% 0 75% 0);transform:translate(2px,0)}
  80%{clip-path:inset(55% 0 30% 0);transform:translate(-4px,0)}
}
@keyframes glitch2 {
  0%,100%{clip-path:inset(60% 0 10% 0);transform:translate(4px,0);color:#ef4444}
  25%{clip-path:inset(10% 0 75% 0);transform:translate(-4px,0);color:#06b6d4}
  50%{clip-path:inset(40% 0 40% 0);transform:translate(2px,0);color:#8b5cf6}
  75%{clip-path:inset(80% 0 5% 0);transform:translate(-2px,0);color:#ef4444}
}
@keyframes scan { 0%{top:-4px} 100%{top:100vh} }
@keyframes fadeup { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes shake {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-8px)}
  40%{transform:translateX(8px)}
  60%{transform:translateX(-5px)}
  80%{transform:translateX(5px)}
}
@keyframes bflow {
  0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
}
@keyframes tin { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
@keyframes pulse {
  0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}
  70%{box-shadow:0 0 0 7px rgba(239,68,68,0)}
  100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}
}
@keyframes flicker {
  0%,19%,21%,23%,25%,54%,56%,100%{opacity:1}
  20%,24%,55%{opacity:.4}
}
@keyframes progpulse { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes spinreact {
  from{transform:rotate(0deg)} to{transform:rotate(360deg)}
}
@keyframes reactglow {
  0%,100%{filter:drop-shadow(0 0 8px rgba(97,218,251,.6))}
  50%{filter:drop-shadow(0 0 20px rgba(97,218,251,1))}
}
@keyframes navajofade {
  from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}
}

.p404-root {
  min-height:100vh; background:#000; color:#e2e8f0;
  font-family:'Courier New',Courier,monospace;
  overflow-x:hidden; position:relative;
}
.p404-canvas { position:fixed; inset:0; opacity:.15; z-index:0; pointer-events:none; }
.p404-grid {
  position:fixed; inset:0;
  background-image:
    linear-gradient(rgba(59,130,246,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(59,130,246,.04) 1px,transparent 1px);
  background-size:42px 42px; pointer-events:none; z-index:0;
}
.p404-scan {
  position:fixed; left:0; width:100%; height:3px;
  background:linear-gradient(transparent,rgba(59,130,246,.1),transparent);
  animation:scan 6s linear infinite; pointer-events:none; z-index:5;
}
.p404-glow-l {
  position:fixed; top:18%; left:4%; width:300px; height:300px;
  background:radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%);
  border-radius:50%; pointer-events:none; z-index:0;
}
.p404-glow-r {
  position:fixed; bottom:10%; right:4%; width:250px; height:250px;
  background:radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%);
  border-radius:50%; pointer-events:none; z-index:0;
}
.p404-content {
  position:relative; z-index:1; min-height:100vh;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:32px 16px;
}
.p404-badge {
  display:inline-flex; align-items:center; gap:8px; padding:5px 14px;
  background:rgba(59,130,246,.08); border:1px solid rgba(59,130,246,.2);
  border-radius:100px; font-size:10px; letter-spacing:.14em;
  color:#3b82f6; font-weight:700; margin-bottom:12px;
  animation:fadeup .6s ease both;
}
.p404-dot-red {
  width:7px; height:7px; border-radius:50%; background:#ef4444;
  display:inline-block; animation:pulse 1.5s ease infinite;
}
.p404-glitch-wrap {
  position:relative; display:inline-block; margin-bottom:4px;
  animation:fadeup .6s .1s ease both;
}
.p404-num {
  font-size:clamp(88px,17vw,188px); font-weight:900;
  font-family:'Arial Black','Arial',sans-serif;
  line-height:1; letter-spacing:-.02em;
  background:linear-gradient(135deg,#fff 0%,#3b82f6 50%,#06b6d4 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; user-select:none; position:relative;
}
.p404-num::before, .p404-num::after {
  content:'404'; position:absolute; top:0; left:0; width:100%; height:100%;
  font-size:clamp(88px,17vw,188px); font-weight:900;
  font-family:'Arial Black','Arial',sans-serif;
  -webkit-text-fill-color:transparent; background-clip:text; -webkit-background-clip:text;
}
.p404-glitch-on .p404-num::before {
  -webkit-background-clip:unset; background-clip:unset;
  -webkit-text-fill-color:#ef4444;
  animation:glitch1 .18s steps(1) forwards;
}
.p404-glitch-on .p404-num::after { animation:glitch2 .18s steps(1) forwards; }
.p404-typed {
  font-size:clamp(12px,2.2vw,15px); font-weight:700; color:#3b82f6;
  letter-spacing:.18em; margin-bottom:8px; min-height:22px;
  animation:fadeup .6s .2s ease both, flicker 4s 1s infinite;
}
.p404-desc {
  font-size:13px; color:rgba(148,163,184,.75); text-align:center;
  max-width:360px; line-height:1.8; letter-spacing:.03em; margin-bottom:24px;
  animation:fadeup .6s .3s ease both;
}
.p404-term {
  width:100%; max-width:500px;
  background:rgba(0,0,0,.82); border:1px solid rgba(59,130,246,.2);
  border-radius:10px; padding:14px 16px; min-height:116px; margin-bottom:22px;
  animation:fadeup .6s .4s ease both;
}
.p404-term-head {
  display:flex; align-items:center; gap:6px; margin-bottom:10px;
  padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,.05);
}
.p404-dot { width:8px; height:8px; border-radius:50%; display:block; }
.p404-tline { font-size:11px; line-height:1.65; letter-spacing:.04em; animation:tin .3s ease both; }
.p404-btns {
  display:flex; flex-wrap:wrap; gap:10px; justify-content:center;
  margin-bottom:26px; animation:fadeup .6s .5s ease both;
}
.p404-btn {
  display:inline-flex; align-items:center; gap:8px; padding:10px 20px;
  border-radius:8px; font-family:inherit; font-size:12px; font-weight:700;
  cursor:pointer; transition:transform .18s; border:none; outline:none;
  letter-spacing:.06em; text-decoration:none; line-height:1; color:inherit;
}
.p404-btn:hover { transform:translateY(-2px); }
.p404-btn:active { transform:translateY(0); }
.p404-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.p404-btn-blue {
  background:linear-gradient(135deg,#3b82f6,#06b6d4); color:#fff !important;
  box-shadow:0 4px 18px rgba(59,130,246,.3);
}
.p404-btn-outline {
  background:transparent; border:1px solid rgba(59,130,246,.3) !important; color:#3b82f6 !important;
}
.p404-btn-ghost {
  background:transparent; border:1px solid rgba(255,255,255,.07) !important;
  color:rgba(148,163,184,.6) !important;
}
.p404-stats {
  display:flex; gap:28px; align-items:center; justify-content:center; flex-wrap:wrap;
  animation:fadeup .6s .6s ease both;
}
.p404-stat-v {
  font-size:16px; font-weight:900;
  background:linear-gradient(135deg,#3b82f6,#06b6d4);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; text-align:center;
}
.p404-stat-l { font-size:9px; color:rgba(148,163,184,.35); letter-spacing:.16em; text-align:center; }
.p404-backdrop {
  position:fixed; inset:0; background:rgba(0,0,0,.92);
  z-index:50; display:flex; align-items:center; justify-content:center;
  padding:16px; animation:fadeup .2s ease both;
}
.p404-modal {
  background:#07080c; border:1px solid rgba(59,130,246,.28);
  border-radius:16px; width:100%; max-width:560px;
  max-height:90vh; overflow-y:auto; position:relative;
}
.p404-modal.p404-shake { animation:shake .4s ease; }
.p404-mglow {
  position:absolute; inset:-1px; border-radius:16px;
  background:linear-gradient(135deg,rgba(59,130,246,.25),rgba(6,182,212,.15),rgba(139,92,246,.18));
  background-size:300% 300%; animation:bflow 5s ease infinite;
  z-index:-1; pointer-events:none;
}
.p404-mhead { padding:20px 22px 0; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.p404-prog-wrap { padding:14px 22px 0; }
.p404-prog-track { height:3px; background:rgba(255,255,255,.06); border-radius:2px; overflow:hidden; }
.p404-prog-fill {
  height:100%; background:linear-gradient(90deg,#3b82f6,#06b6d4);
  border-radius:2px; transition:width .5s cubic-bezier(.16,1,.3,1);
}
.p404-layer-dots { display:flex; gap:4px; margin-top:8px; flex-wrap:wrap; }
.p404-ldot { width:6px; height:6px; border-radius:50%; transition:background .3s,box-shadow .3s; }
.p404-ldot-done { background:#3b82f6; box-shadow:0 0 6px rgba(59,130,246,.6); }
.p404-ldot-active { background:#06b6d4; animation:progpulse 1s ease infinite; }
.p404-ldot-pending { background:rgba(255,255,255,.1); }
.p404-mbody { padding:18px 22px 22px; }
.p404-challenge {
  background:rgba(59,130,246,.06); border:1px solid rgba(59,130,246,.16);
  border-radius:10px; padding:14px 16px; margin-bottom:14px;
}
.p404-ch-tag { font-size:9px; letter-spacing:.16em; color:#3b82f6; font-weight:700; margin-bottom:8px; }
.p404-ch-q { font-size:13px; color:#e2e8f0; line-height:1.75; letter-spacing:.03em; }
.p404-hint {
  background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.2);
  border-radius:8px; padding:10px 14px; font-size:11px; color:#f59e0b;
  letter-spacing:.04em; margin-bottom:12px;
}
.p404-inp-row { display:flex; gap:8px; margin-bottom:10px; }
.p404-inp {
  flex:1; background:rgba(255,255,255,.04); border:1px solid rgba(59,130,246,.22);
  border-radius:8px; padding:10px 14px; font-family:inherit; font-size:13px;
  color:#e2e8f0; outline:none; transition:border-color .18s,box-shadow .18s; letter-spacing:.05em;
}
.p404-inp:focus { border-color:rgba(59,130,246,.55); box-shadow:0 0 0 3px rgba(59,130,246,.1); }
.p404-err { font-size:11px; color:#ef4444; letter-spacing:.08em; margin-bottom:12px; }
.p404-act { display:flex; gap:8px; }
.p404-close {
  width:34px; height:34px; min-width:34px; background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08); border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:rgba(148,163,184,.5); font-size:20px;
  font-family:inherit; transition:background .18s; line-height:1;
}
.p404-close:hover { background:rgba(255,255,255,.08); }
.p404-success { display:flex; flex-direction:column; align-items:center; gap:18px; text-align:center; }
.p404-react-icon { animation:reactglow 2s ease infinite; }
.p404-react-orbit { animation:spinreact 6s linear infinite; transform-origin:center; }
.p404-navajo-box {
  width:100%;
  background:linear-gradient(135deg,rgba(139,92,246,.08),rgba(59,130,246,.06));
  border:1px solid rgba(139,92,246,.35); border-radius:12px; padding:18px;
  text-align:left; animation:navajofade .5s ease both;
}
.p404-navajo-tag { font-size:9px; letter-spacing:.2em; color:#a78bfa; font-weight:700; margin-bottom:6px; }
.p404-navajo-title { font-size:12px; color:rgba(148,163,184,.6); margin-bottom:14px; line-height:1.6; }
.p404-navajo-code {
  font-size:11px; color:#c4b5fd; line-height:2; letter-spacing:.06em;
  word-break:break-word; border-top:1px solid rgba(139,92,246,.2); padding-top:12px;
}
.p404-navajo-note {
  font-size:10px; color:rgba(148,163,184,.35); margin-top:12px;
  border-top:1px solid rgba(255,255,255,.05); padding-top:10px; letter-spacing:.04em; line-height:1.6;
}

@media(max-width:480px){
  .p404-btns { gap:8px; }
  .p404-btn { font-size:11px; padding:9px 15px; }
  .p404-stats { gap:18px; }
  .p404-modal { border-radius:12px; }
  .p404-mhead, .p404-mbody { padding-left:16px; padding-right:16px; }
  .p404-prog-wrap { padding-left:16px; padding-right:16px; }
  .p404-navajo-code { font-size:10px; }
}
`;

const ReactIcon = () => (
  <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="p404-react-icon">
    <ellipse cx="50" cy="50" rx="10" ry="10" fill="#61DAFB" />
    <g className="p404-react-orbit">
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61DAFB" strokeWidth="3" fill="none" />
    </g>
    <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61DAFB" strokeWidth="3" fill="none" transform="rotate(60 50 50)" />
    <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61DAFB" strokeWidth="3" fill="none" transform="rotate(120 50 50)" />
  </svg>
);

const NotFound: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);
  const dropsRef = useRef<number[]>([]);

  const [ready, setReady] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [termLines, setTermLines] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [blink, setBlink] = useState(true);
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const [navajo, setNavajo] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const fs = 13;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dropsRef.current = Array(Math.floor(canvas.width / fs)).fill(1);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fs}px monospace`;
      const d = dropsRef.current;
      for (let i = 0; i < d.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const r = Math.random();
        ctx.fillStyle = r > 0.98 ? "#fff" : r > 0.85 ? "#3b82f6" : "rgba(59,130,246,0.18)";
        ctx.fillText(ch, i * fs, d[i] * fs);
        if (d[i] * fs > canvas.height && Math.random() > 0.975) d[i] = 0;
        d[i]++;
      }
      animIdRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 3800);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    const id = setInterval(() => setBlink(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const lines = [
      "> AICHIXIA KERNEL v3.14.1",
      "> Booting system modules...",
      "> [OK] Neural network initialized",
      "> [OK] Route resolver loaded",
      "> [ERR] Requested endpoint not found",
      "> Diagnostic: path corrupted or never existed",
      "> Initiating recovery protocol...",
    ];
    let i = 0;
    const id = setInterval(() => {
      if (i < lines.length) {
        const line = lines[i];
        if (line) setTermLines(p => [...p, line]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 420);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const full = "ENDPOINT_NOT_FOUND";
    let i = 0;
    const id = setInterval(() => {
      if (i <= full.length) { setTyped(full.slice(0, i)); i++; }
      else clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, [ready]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    const s = STATIC_STEPS[step];
    if (!s) return;
    const isLast = step === STATIC_STEPS.length - 1;

    if (!isLast) {
      if (input.trim().toLowerCase() === (s.a ?? "")) {
        setErr(""); setInput(""); setHint(false);
        setStep(n => n + 1);
        setTermLines(p => [...p, "> [OK] " + (s.reward || "")]);
      } else {
        setErr("INCORRECT — try again");
        triggerShake();
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: input.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.correct) {
        setErr(""); setInput(""); setHint(false);
        setNavajo(data.navajo || "");
        setDone(true);
        setTermLines(p => [
          ...p,
          "> [OK] " + (s.reward || ""),
          "> [SUCCESS] All 10 layers decrypted.",
          "> [ACCESS] Navajo cipher transmitted. Decode to claim your key.",
        ]);
      } else {
        setErr("INCORRECT — try again");
        triggerShake();
      }
    } catch {
      setErr("Connection error — try again");
    } finally {
      setLoading(false);
    }
  }, [step, input, loading]);

  const closeModal = () => { setPuzzleOpen(false); setInput(""); setErr(""); setHint(false); };

  const lineColor = (l: string) => {
    if (!l || typeof l !== "string") return "rgba(148,163,184,0.6)";
    if (l.includes("[ERR]")) return "#ef4444";
    if (l.includes("[SUCCESS]") || l.includes("[ACCESS]")) return "#22c55e";
    if (l.includes("[SECRET]")) return "#f59e0b";
    if (l.includes("[OK]")) return "#3b82f6";
    return "rgba(148,163,184,0.6)";
  };

  if (!ready) return null;

  const total = STATIC_STEPS.length;
  const progress = done ? 100 : (step / total) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="p404-root">
        <canvas ref={canvasRef} className="p404-canvas" />
        <div className="p404-grid" />
        <div className="p404-scan" />
        <div className="p404-glow-l" />
        <div className="p404-glow-r" />

        <div className="p404-content">
          <div className="p404-badge">
            <span className="p404-dot-red" />
            AICHIXIA SYSTEM ERROR
          </div>

          <div className={`p404-glitch-wrap${glitch ? " p404-glitch-on" : ""}`}>
            <h1 className="p404-num">404</h1>
          </div>

          <div className="p404-typed">
            {typed}
            <span style={{ opacity: blink ? 1 : 0, display: "inline-block", width: 8, height: 14, background: "#06b6d4", verticalAlign: "middle", marginLeft: 2 }} />
          </div>

          <p className="p404-desc">
            The route you&apos;re looking for has been lost in the void.
            <br />
            Or maybe it never existed. Either way — we can&apos;t find it.
          </p>

          <div className="p404-term">
            <div className="p404-term-head">
              <span className="p404-dot" style={{ background: "#ef4444" }} />
              <span className="p404-dot" style={{ background: "#f59e0b" }} />
              <span className="p404-dot" style={{ background: "#22c55e" }} />
              <span style={{ fontSize: 10, color: "rgba(148,163,184,0.35)", marginLeft: 8, letterSpacing: "0.1em" }}>system.log</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {termLines.filter(Boolean).map((l, i) => (
                <div key={i} className="p404-tline" style={{ color: lineColor(l) }}>{l}</div>
              ))}
              {!done && (
                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.3)" }}>
                  {">"}&nbsp;
                  <span style={{ display: "inline-block", width: 7, height: 12, background: "#3b82f6", opacity: blink ? 1 : 0, verticalAlign: "middle" }} />
                </div>
              )}
            </div>
          </div>

          <div className="p404-btns">
            <Link href="/" className="p404-btn p404-btn-blue">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              RETURN HOME
            </Link>
            <button className="p404-btn p404-btn-outline" onClick={() => setPuzzleOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              DECRYPT PROTOCOL
            </button>
            <button className="p404-btn p404-btn-ghost" onClick={() => history.back()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              GO BACK
            </button>
          </div>

          <div className="p404-stats">
            {[{ l: "LATENCY", v: "<100ms" }, { l: "MODELS", v: "22+" }, { l: "UPTIME", v: "99.9%" }].map(s => (
              <div key={s.l}>
                <div className="p404-stat-v">{s.v}</div>
                <div className="p404-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {puzzleOpen && (
          <div
            className="p404-backdrop"
            onClick={e => { if (e.target === e.currentTarget && !done) closeModal(); }}
          >
            <div className={`p404-modal${shake ? " p404-shake" : ""}`}>
              <div className="p404-mglow" />

              <div className="p404-mhead">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#3b82f6", fontWeight: 700, marginBottom: 3 }}>
                    DECRYPT PROTOCOL
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#f1f5f9" }}>
                    {done ? "ACCESS GRANTED" : `LAYER ${step + 1} OF ${total}`}
                  </div>
                </div>
                {!done && (
                  <button className="p404-close" onClick={closeModal}>&#215;</button>
                )}
              </div>

              <div className="p404-prog-wrap">
                <div className="p404-prog-track">
                  <div className="p404-prog-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="p404-layer-dots">
                  {Array.from({ length: total }).map((_, i) => (
                    <span
                      key={i}
                      className={`p404-ldot ${done || i < step ? "p404-ldot-done" : i === step ? "p404-ldot-active" : "p404-ldot-pending"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p404-mbody">
                {!done ? (
                  <>
                    <div className="p404-challenge">
                      <div className="p404-ch-tag">CHALLENGE_{step + 1} / {total}</div>
                      <p className="p404-ch-q">{STATIC_STEPS[step]?.q ?? ""}</p>
                    </div>

                    {hint && (
                      <div className="p404-hint">HINT: {STATIC_STEPS[step]?.hint ?? ""}</div>
                    )}

                    <div className="p404-inp-row">
                      <input
                        className="p404-inp"
                        placeholder="Enter your answer..."
                        value={input}
                        autoComplete="off"
                        autoFocus
                        onChange={e => { setInput(e.target.value); setErr(""); }}
                        onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                      />
                    </div>

                    {err && <div className="p404-err">&#10005; {err}</div>}

                    <div className="p404-act">
                      <button
                        className="p404-btn p404-btn-blue"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? "CHECKING..." : "SUBMIT ANSWER"}
                      </button>
                      <button
                        className="p404-btn"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}
                        onClick={() => setHint(h => !h)}
                      >
                        {hint ? "HIDE" : "HINT"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p404-success">
                    <ReactIcon />

                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg,#22c55e,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 8 }}>
                        ALL 10 LAYERS DECRYPTED
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(148,163,184,0.55)", lineHeight: 1.8 }}>
                        Selamat. Kamu berhasil menembus semua lapisan enkripsi.<br />
                        Tapi perjalanan belum selesai — satu teka-teki terakhir menantimu.
                      </p>
                    </div>

                    <div className="p404-navajo-box">
                      <div className="p404-navajo-tag">&#9650; CLASSIFIED TRANSMISSION — NAVAJO CODE</div>
                      <div className="p404-navajo-title">
                        Pesan ini dienkripsi menggunakan <strong style={{ color: "#c4b5fd" }}>Navajo Code Talkers Cipher</strong> — sistem sandi yang digunakan semasa Perang Dunia II dan tidak pernah berhasil dipecahkan musuh.<br />
                        Decode setiap kata untuk menemukan access code rahasiamu.
                      </div>
                      <div className="p404-navajo-code">
                        {navajo || "[ SET SECRET_CODE_NAVAJO IN .env.local ]"}
                      </div>
                      <div className="p404-navajo-note">
                        &#128218; Referensi: setiap kata Navajo mewakili satu huruf dalam alfabet.<br />
                        Contoh: WOL-LA-CHEE = A &nbsp;|&nbsp; SHUSH = B &nbsp;|&nbsp; MOASI = C<br />
                        Gunakan referensi lengkap Navajo Code Talkers untuk mendekode pesan di atas.
                      </div>
                    </div>

                    <button
                      className="p404-btn p404-btn-ghost"
                      style={{ width: "100%", justifyContent: "center", fontSize: 11 }}
                      onClick={() => setPuzzleOpen(false)}
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
    </>
  );
};

export default NotFound;
