import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FaTerminal, FaArrowRight, FaBolt, FaShieldAlt, FaCode, FaStream,
  FaRocket, FaCheck, FaServer, FaLayerGroup, FaGithub, FaTwitter,
  FaDiscord, FaChevronRight, FaTimes, FaLock, FaInfinity, FaClock,
} from "react-icons/fa";
import { SiAnthropic } from "react-icons/si";
import { FiZap, FiTerminal, FiCpu, FiGlobe, FiPackage } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

const terminalLines = [
  { type: "prompt", text: "axcode init --agentic" },
  { type: "info",   text: "◆  AxCode v1.0.0 initializing..." },
  { type: "info",   text: "◆  Connecting to Aichixia backend..." },
  { type: "ok",     text: "✔  Agentic core online" },
  { type: "ok",     text: "✔  MCP server connected" },
  { type: "blank",  text: "" },
  { type: "prompt", text: 'axcode run "refactor entire auth module"' },
  { type: "warn",   text: "⚡  Planning 23 tasks across 8 files..." },
  { type: "ok",     text: "✔  auth/session.ts — rewritten" },
  { type: "ok",     text: "✔  auth/middleware.ts — optimized" },
  { type: "ok",     text: "✔  auth/jwt.ts — hardened" },
  { type: "ok",     text: "✔  tests/ — 31 passing" },
  { type: "out",    text: "→  Deploy? [y/n]" },
];

const features = [
  {
    icon: FiCpu,
    title: "Agentic Loop",
    desc: "Decomposes goals into sub-tasks, executes them sequentially, self-corrects on failure.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Super Intelligence",
    desc: "Powered by frontier models with deep reasoning. Understands your entire codebase in context.",
  },
  {
    icon: FiTerminal,
    title: "Full Shell Access",
    desc: "Runs commands, reads files, edits code, browses the web — complete environment control.",
  },
  {
    icon: FiPackage,
    title: "MCP Native",
    desc: "Extends via Model Context Protocol. Connect any tool, API, or database in seconds.",
  },
  {
    icon: FaLock,
    title: "Sandboxed & Safe",
    desc: "Every action is isolated and reversible. You stay in full control at all times.",
  },
  {
    icon: FiGlobe,
    title: "Real-time Stream",
    desc: "Watch every decision, tool call, and output live in your terminal as it happens.",
  },
];

const timeline = [
  { phase: "Phase 01", title: "Core Runtime", desc: "Agentic loop, tool integration, file ops, shell access.", tag: "Complete", tagColor: "text-emerald-400 border-emerald-800 bg-emerald-950/40" },
  { phase: "Phase 02", title: "Public Launch", desc: "npm install axcode — global CLI, full REST API, and SDK.", tag: "Very Soon", tagColor: "text-blue-400 border-blue-800 bg-blue-950/40" },
  { phase: "Phase 03", title: "Team Mode", desc: "Shared workspaces, audit logs, RBAC, private model routing.", tag: "Q3 2026", tagColor: "text-amber-400 border-amber-800 bg-amber-950/40" },
  { phase: "Phase 04", title: "Auto-Deploy", desc: "AxCode manages CI/CD — write intent, it ships autonomously.", tag: "Future", tagColor: "text-zinc-400 border-zinc-700 bg-zinc-900/40" },
];

const stats = [
  { val: "60MB", label: "Package size" },
  { val: "<1s",  label: "Cold start" },
  { val: "∞",    label: "Context window" },
  { val: "99.9%",label: "Uptime SLA" },
];

export default function AxCode() {
  const [termIdx, setTermIdx] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyDone, setNotifyDone] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (termIdx < terminalLines.length) {
      const delay = terminalLines[termIdx].type === "blank" ? 80 : terminalLines[termIdx].type === "prompt" ? 420 : 180;
      const t = setTimeout(() => setTermIdx((p) => p + 1), delay);
      return () => clearTimeout(t);
    }
  }, [termIdx]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((p) => ({ ...p, [e.target.id]: true }));
      }),
      { threshold: 0.1 }
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const reg = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  const handleNotify = () => {
    if (notifyEmail.includes("@")) setNotifyDone(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --bg: #030508;
          --surface: #0c1018;
          --border: rgba(255,255,255,0.07);
          --border-accent: rgba(59,130,246,0.25);
          --blue: #3b82f6;
          --cyan: #06b6d4;
          --text: #f1f5ff;
          --muted: rgba(180,200,240,0.5);
          --glow-blue: rgba(59,130,246,0.18);
          --glow-cyan: rgba(6,182,212,0.12);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ax-page {
          background: var(--bg);
          color: var(--text);
          font-family: 'Geist', 'DM Sans', system-ui, sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .ax-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 15% 8%, rgba(59,130,246,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 50% 35% at 85% 90%, rgba(6,182,212,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 65% 35%, rgba(99,102,241,0.04) 0%, transparent 55%);
          pointer-events: none;
          z-index: 0;
        }

        .grid-lines {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 30%, black 0%, transparent 100%);
        }

        .ax-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: rgba(3,5,8,0.75);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }

        .logo-mark {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px rgba(59,130,246,0.35);
        }

        .logo-mark svg { width: 14px; height: 14px; color: white; }

        .logo-name {
          font-family: 'Geist', sans-serif;
          font-weight: 800;
          font-size: 15px;
          color: var(--text);
          letter-spacing: -0.4px;
        }

        .nav-pill {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--blue);
          padding: 4px 10px;
          border: 1px solid var(--border-accent);
          border-radius: 99px;
          background: rgba(59,130,246,0.08);
          animation: pill-pulse 3s ease-in-out infinite;
        }

        @keyframes pill-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.2); }
          50% { box-shadow: 0 0 0 5px rgba(59,130,246,0); }
        }

        .nav-back {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-back:hover { color: var(--text); }

        .content { position: relative; z-index: 1; }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 110px 20px 60px;
          text-align: center;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--cyan);
          padding: 5px 13px;
          border: 1px solid rgba(6,182,212,0.22);
          border-radius: 99px;
          background: rgba(6,182,212,0.06);
          margin-bottom: 24px;
          opacity: 0;
          animation: rise 0.6s 0.2s ease forwards;
        }

        .pulse-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--cyan);
          animation: dot-blink 1.6s ease-in-out infinite;
        }

        @keyframes dot-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }

        .hero-title {
          font-family: 'Geist', sans-serif;
          font-size: clamp(48px, 10vw, 96px);
          font-weight: 900;
          line-height: 0.92;
          letter-spacing: -3.5px;
          margin-bottom: 20px;
          opacity: 0;
          animation: rise 0.7s 0.35s ease forwards;
        }

        .title-ax {
          background: linear-gradient(125deg, var(--blue) 0%, var(--cyan) 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 32px rgba(59,130,246,0.4));
        }

        .hero-sub {
          font-size: clamp(12px, 2.2vw, 15px);
          color: var(--muted);
          max-width: 420px;
          line-height: 1.75;
          margin-bottom: 40px;
          opacity: 0;
          animation: rise 0.7s 0.5s ease forwards;
        }

        .hero-sub strong { color: var(--text); font-weight: 600; }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 56px;
          opacity: 0;
          animation: rise 0.7s 0.65s ease forwards;
        }

        .btn-glow {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 22px;
          font-family: 'Geist', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
          color: white;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          border: none;
          border-radius: 9px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.22s ease;
          box-shadow: 0 0 24px rgba(59,130,246,0.3), 0 4px 16px rgba(0,0,0,0.3);
        }
        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(59,130,246,0.5), 0 8px 24px rgba(0,0,0,0.4);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 22px;
          font-family: 'Geist', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 9px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }

        .terminal-wrap {
          width: 100%;
          max-width: 560px;
          opacity: 0;
          animation: rise 0.8s 0.85s ease forwards;
        }

        .terminal {
          background: rgba(8,12,20,0.95);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 0 60px rgba(59,130,246,0.08),
            0 32px 64px rgba(0,0,0,0.5);
        }

        .term-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid var(--border);
        }

        .term-dot { width: 10px; height: 10px; border-radius: 50%; }
        .td-r { background: #ff5f57; }
        .td-y { background: #febc2e; }
        .td-g { background: #28c840; }
        .term-label { font-size: 10px; color: rgba(255,255,255,0.25); margin-left: 8px; font-family: 'DM Mono', monospace; }

        .term-body {
          padding: 16px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          line-height: 1.85;
          min-height: 230px;
        }

        .tl { display: flex; gap: 8px; }
        .tl-prompt { color: rgba(59,130,246,0.55); flex-shrink: 0; }
        .tl-cmd { color: #e2e8f0; }
        .tl-info { color: rgba(6,182,212,0.85); }
        .tl-ok { color: #34d399; }
        .tl-warn { color: #fbbf24; }
        .tl-out { color: rgba(255,255,255,0.55); }
        .tl-cursor { display: inline-block; width: 6px; height: 12px; background: var(--blue); animation: curblink 1s step-end infinite; vertical-align: middle; margin-left: 2px; }
        @keyframes curblink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        @keyframes rise {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-wrap {
          padding: 72px 20px;
          max-width: 960px;
          margin: 0 auto;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 12px;
        }
        .section-label::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: var(--blue);
        }

        .section-title {
          font-family: 'Geist', sans-serif;
          font-size: clamp(24px, 4.5vw, 38px);
          font-weight: 800;
          letter-spacing: -1.2px;
          line-height: 1.05;
          margin-bottom: 12px;
        }

        .section-desc {
          font-size: 12.5px;
          color: var(--muted);
          max-width: 380px;
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin: 0 20px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .feat-card {
          background: rgba(12,16,24,0.7);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.28s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .feat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feat-card:hover {
          border-color: rgba(59,130,246,0.22);
          transform: translateY(-3px);
          background: rgba(12,16,24,0.95);
          box-shadow: 0 16px 48px rgba(0,0,0,0.35), 0 0 30px rgba(59,130,246,0.06);
        }
        .feat-card:hover::after { opacity: 1; }

        .feat-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 13px;
          color: var(--blue);
        }
        .feat-icon svg { width: 15px; height: 15px; }

        .feat-name {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 6px;
          letter-spacing: -0.2px;
        }

        .feat-desc { font-size: 11px; color: var(--muted); line-height: 1.65; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 72px;
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item:nth-child(3) { border-right: 1px solid var(--border); border-top: 1px solid var(--border); }
          .stat-item:nth-child(4) { border-top: 1px solid var(--border); }
        }

        .stat-item {
          padding: 24px 20px;
          background: rgba(12,16,24,0.7);
          text-align: center;
        }
        .stat-item + .stat-item { border-left: 1px solid var(--border); }

        @media (max-width: 600px) {
          .stat-item + .stat-item { border-left: none; }
        }

        .stat-val {
          font-family: 'Geist', sans-serif;
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 900;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, var(--text), var(--cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 5px;
        }
        .stat-lbl { font-size: 9.5px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }

        .timeline { display: flex; flex-direction: column; position: relative; }
        .timeline::before {
          content: '';
          position: absolute;
          left: 15px; top: 28px; bottom: 28px;
          width: 1px;
          background: linear-gradient(180deg, var(--blue), rgba(6,182,212,0.3), transparent);
          opacity: 0.25;
        }

        .tl-item { display: flex; gap: 18px; padding: 20px 0; }

        .tl-node {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; font-family: 'DM Mono', monospace;
          color: var(--muted);
          position: relative; z-index: 1;
        }
        .tl-node.active {
          border-color: rgba(59,130,246,0.45);
          background: rgba(59,130,246,0.08);
          color: var(--blue);
          box-shadow: 0 0 16px rgba(59,130,246,0.25);
        }
        .tl-node.next {
          border-color: rgba(6,182,212,0.35);
          background: rgba(6,182,212,0.06);
          color: var(--cyan);
        }

        .tl-body { flex: 1; padding-top: 4px; }
        .tl-phase { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 3px; }
        .tl-title { font-weight: 700; font-size: 14px; margin-bottom: 5px; letter-spacing: -0.2px; }
        .tl-desc { font-size: 11.5px; color: var(--muted); line-height: 1.6; }
        .tl-tag {
          display: inline-block;
          margin-top: 7px;
          font-size: 9px; font-weight: 700;
          padding: 3px 9px;
          border-radius: 99px;
          border: 1px solid;
          letter-spacing: 0.5px;
          font-family: 'DM Mono', monospace;
        }

        .notify-box {
          max-width: 460px;
          margin: 0 auto;
          background: rgba(12,16,24,0.9);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(59,130,246,0.07), 0 32px 64px rgba(0,0,0,0.4);
        }
        .notify-box::before {
          content: '';
          position: absolute;
          top: 0; left: 15%; right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(6,182,212,0.5), transparent);
        }

        .notify-title {
          font-family: 'Geist', sans-serif;
          font-size: clamp(20px, 3.5vw, 26px);
          font-weight: 800;
          letter-spacing: -0.8px;
          margin-bottom: 10px;
        }
        .notify-desc { font-size: 11.5px; color: var(--muted); line-height: 1.7; margin-bottom: 24px; }

        .input-row { display: flex; gap: 8px; }

        @media (max-width: 480px) {
          .input-row { flex-direction: column; }
          .btn-glow, .btn-ghost { width: 100%; justify-content: center; }
        }

        .email-inp {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 11.5px;
          color: var(--text);
          outline: none;
          transition: all 0.2s;
        }
        .email-inp::placeholder { color: rgba(255,255,255,0.2); }
        .email-inp:focus {
          border-color: rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.04);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }

        .success-row {
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          font-size: 12px; color: #34d399;
          padding: 11px;
          background: rgba(52,211,153,0.07);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 8px;
          margin-top: 10px;
        }

        .ax-footer {
          border-top: 1px solid var(--border);
          padding: 28px 24px;
          text-align: center;
          font-size: 10.5px;
          color: rgba(255,255,255,0.2);
          position: relative;
          z-index: 1;
        }
        .ax-footer a { color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .ax-footer a:hover { color: var(--text); }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal.in { opacity: 1; transform: none; }

        @media (max-width: 640px) {
          .section-wrap { padding: 48px 16px; }
          .notify-box { padding: 28px 18px; }
          .hero { padding: 96px 16px 48px; }
          .ax-nav { padding: 12px 16px; }
          .hero-title { letter-spacing: -2px; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .stat-item + .stat-item { border-left: none; border-top: 1px solid var(--border); }
        }
      `}} />

      <Head>
        <title>AxCode — Agentic Coding Intelligence</title>
        <meta name="description" content="AxCode is the next evolution of AI-powered development. A super-intelligent agentic terminal — coming soon." />
      </Head>

      <div className="ax-page">
        <div className="grid-lines" />

        <nav className="ax-nav">
          <Link href="/" className="nav-logo">
            <div className="logo-mark"><FaTerminal /></div>
            <span className="logo-name">AxCode</span>
          </Link>
          <span className="nav-pill">Coming Soon</span>
          <Link href="/" className="nav-back">
            <FaTimes style={{ width: 10, height: 10 }} />
            <span>Aichixia</span>
          </Link>
        </nav>

        <div className="content">
          <section className="hero">
            <div className="hero-eyebrow">
              <span className="pulse-dot" />
              Agentic Coding Intelligence — Launching Soon
            </div>

            <h1 className="hero-title">
              <span className="title-ax">Ax</span>Code
            </h1>

            <p className="hero-sub">
              The <strong>agentic terminal</strong> for the next generation of builders.
              Write, debug, and ship — <strong>autonomously</strong>, at machine speed.
            </p>

            <div className="hero-actions">
              <a href="#notify" className="btn-glow" onClick={(e) => { e.preventDefault(); document.getElementById("notify")?.scrollIntoView({ behavior: "smooth" }); }}>
                <FaRocket style={{ width: 12, height: 12 }} />
                Get Early Access
                <FaArrowRight style={{ width: 10, height: 10 }} />
              </a>
              <a href="#features" className="btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}>
                <FiZap style={{ width: 12, height: 12 }} />
                See Features
              </a>
            </div>

            <div className="terminal-wrap">
              <div className="terminal">
                <div className="term-bar">
                  <span className="term-dot td-r" />
                  <span className="term-dot td-y" />
                  <span className="term-dot td-g" />
                  <span className="term-label">axcode — ~/project</span>
                </div>
                <div className="term-body">
                  {terminalLines.slice(0, termIdx).map((line, i) => (
                    <div key={i} className="tl">
                      {line.type === "prompt" && <span className="tl-prompt">❯</span>}
                      {line.type !== "prompt" && line.type !== "blank" && <span style={{ width: 10, flexShrink: 0 }} />}
                      {line.type === "prompt" && <span className="tl-cmd">{line.text}</span>}
                      {line.type === "info" && <span className="tl-info">{line.text}</span>}
                      {line.type === "ok" && <span className="tl-ok">{line.text}</span>}
                      {line.type === "warn" && <span className="tl-warn">{line.text}</span>}
                      {line.type === "out" && <span className="tl-out">{line.text}</span>}
                    </div>
                  ))}
                  {termIdx < terminalLines.length && (
                    <div className="tl">
                      <span className="tl-prompt">❯</span>
                      <span className="tl-cursor" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="divider" />

          <section
            id="features"
            ref={reg("features")}
            className="section-wrap"
          >
            <div className={`reveal ${visible.features ? "in" : ""}`}>
              <div className="section-label">Capabilities</div>
              <h2 className="section-title">Built for autonomous<br />engineering.</h2>
              <p className="section-desc">AxCode isn't a copilot. It's a full agent — plans, executes, and ships code end-to-end with zero friction.</p>
            </div>
            <div className={`features-grid reveal ${visible.features ? "in" : ""}`} style={{ transitionDelay: "0.1s" }}>
              {features.map((f, i) => (
                <div className="feat-card" key={i} style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className="feat-icon"><f.icon /></div>
                  <div className="feat-name">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          <section ref={reg("stats")} className="section-wrap">
            <div className={`stats-grid reveal ${visible.stats ? "in" : ""}`}>
              {stats.map((s, i) => (
                <div className="stat-item" key={i}>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          <section ref={reg("roadmap")} className="section-wrap">
            <div className={`reveal ${visible.roadmap ? "in" : ""}`}>
              <div className="section-label">Roadmap</div>
              <h2 className="section-title">What's coming.</h2>
              <p className="section-desc">AxCode is being engineered for developers who refuse to move slowly.</p>
            </div>
            <div className={`timeline reveal ${visible.roadmap ? "in" : ""}`} style={{ transitionDelay: "0.1s" }}>
              {timeline.map((t, i) => (
                <div className="tl-item" key={i}>
                  <div className={`tl-node ${i === 0 ? "active" : i === 1 ? "next" : ""}`}>
                    {i === 0 ? <FaCheck style={{ width: 9, height: 9 }} /> : `0${i + 1}`}
                  </div>
                  <div className="tl-body">
                    <div className="tl-phase">{t.phase}</div>
                    <div className="tl-title">{t.title}</div>
                    <div className="tl-desc">{t.desc}</div>
                    <span className={`tl-tag ${t.tagColor}`}>{t.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          <section id="notify" ref={reg("notify")} className="section-wrap" style={{ paddingTop: 72, paddingBottom: 72 }}>
            <div className={`notify-box reveal ${visible.notify ? "in" : ""}`}>
              <div className="notify-title">Be first in line.</div>
              <div className="notify-desc">Drop your email and we'll notify you the moment AxCode goes live. No spam — just the launch.</div>
              {!notifyDone ? (
                <div className="input-row">
                  <input
                    type="email"
                    className="email-inp"
                    placeholder="you@example.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNotify()}
                  />
                  <button className="btn-glow" onClick={handleNotify}>
                    Notify Me
                    <FaArrowRight style={{ width: 10, height: 10 }} />
                  </button>
                </div>
              ) : (
                <div className="success-row">
                  <FaCheck style={{ width: 11, height: 11 }} />
                  You're on the list. We'll be in touch.
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="ax-footer">
          <strong style={{ color: "rgba(255,255,255,0.4)" }}>AxCode</strong>
          {" "}by{" "}
          <a href="https://www.aichixia.xyz">Aichixia</a>
          {" · "}
          <a href="mailto:contact@aichixia.xyz">Contact</a>
          {" · "}
          © {new Date().getFullYear()}
        </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var els = document.querySelectorAll('.reveal');
          var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
              if (e.isIntersecting) e.target.classList.add('in');
            });
          }, { threshold: 0.08 });
          els.forEach(function(el) { obs.observe(el); });
        })();
      ` }} />
    </>
  );
}
