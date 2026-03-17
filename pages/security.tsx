import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FaTerminal, FaMoon, FaSun, FaBars, FaTimes,
  FaShieldAlt, FaLock, FaKey, FaServer, FaEye,
  FaCheckCircle, FaGlobe, FaDatabase, FaCloud,
  FaCertificate, FaFileAlt, FaEnvelope, FaChevronDown,
  FaExclamationTriangle, FaBolt, FaFingerprint,
  FaNetworkWired, FaClipboardCheck, FaUserShield,
  FaCodeBranch, FaSyncAlt, FaArrowRight
} from "react-icons/fa";

type PillarAccent = "sky" | "emerald" | "violet" | "amber" | "rose" | "cyan";
type ComplianceColor = "sky" | "emerald" | "violet" | "amber";

const accentMap: Record<PillarAccent, { text: string; border: string; dot: string }> = {
  sky:     { text: "text-sky-400",     border: "border-sky-500/25",     dot: "bg-sky-400" },
  emerald: { text: "text-emerald-400", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  violet:  { text: "text-violet-400",  border: "border-violet-500/25",  dot: "bg-violet-400" },
  amber:   { text: "text-amber-400",   border: "border-amber-500/25",   dot: "bg-amber-400" },
  rose:    { text: "text-rose-400",    border: "border-rose-500/25",    dot: "bg-rose-400" },
  cyan:    { text: "text-cyan-400",    border: "border-cyan-500/25",    dot: "bg-cyan-400" },
};

const complianceColorMap: Record<ComplianceColor, { text: string; border: string }> = {
  sky:     { text: "text-sky-400",     border: "border-sky-500/25" },
  emerald: { text: "text-emerald-400", border: "border-emerald-500/25" },
  violet:  { text: "text-violet-400",  border: "border-violet-500/25" },
  amber:   { text: "text-amber-400",   border: "border-amber-500/25" },
};

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimBlock({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity .55s cubic-bezier(.22,1,.36,1) ${delay}s, transform .55s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function Security() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("theme");
    const dark = t ? t === "dark" : true;
    setIsDark(dark);
    if (!t) localStorage.setItem("theme", "dark");
  }, []);

  const toggleTheme = () => {
    const n = !isDark;
    setIsDark(n);
    localStorage.setItem("theme", n ? "dark" : "light");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const navLinks = [
    { href: "/",           label: "Home" },
    { href: "/docs",       label: "Docs" },
    { href: "/playground", label: "Playground" },
    { href: "/security",   label: "Security" },
  ];

  const pillars = [
    { icon: FaLock,         title: "End-to-End Encryption",  desc: "All transit uses TLS 1.3. At rest, AES-256 across every storage layer — no exceptions.",              accent: "sky"     as PillarAccent, tag: "TLS 1.3 · AES-256" },
    { icon: FaFingerprint,  title: "Zero Data Retention",    desc: "Prompts and responses are never persisted. Every request is ephemeral — held in memory, then gone.",   accent: "emerald" as PillarAccent, tag: "0 ms retention" },
    { icon: FaUserShield,   title: "Access Control",         desc: "Granular API key scoping, IP allowlisting, and per-key rate limits. Only authorized traffic passes.",   accent: "violet"  as PillarAccent, tag: "RBAC · IP allowlist" },
    { icon: FaNetworkWired, title: "Network Isolation",      desc: "Each tenant runs in a separate VPC. Cross-tenant data leakage is architecturally impossible.",          accent: "amber"   as PillarAccent, tag: "Per-tenant VPC" },
    { icon: FaSyncAlt,      title: "Continuous Monitoring",  desc: "24/7 automated threat detection with anomaly alerting and a sub-5-minute incident response SLA.",       accent: "rose"    as PillarAccent, tag: "< 5 min SLA" },
    { icon: FaCodeBranch,   title: "Secure Development",     desc: "Every commit goes through peer review, SAST, DAST, and dependency scanning before reaching production.", accent: "cyan"    as PillarAccent, tag: "SAST · DAST" },
  ];

  const compliance = [
    { icon: FaCertificate,    label: "SOC 2 Type II", sub: "In progress", color: "sky"     as ComplianceColor },
    { icon: FaGlobe,          label: "GDPR",          sub: "Compliant",   color: "emerald" as ComplianceColor },
    { icon: FaClipboardCheck, label: "ISO 27001",     sub: "Aligned",     color: "violet"  as ComplianceColor },
    { icon: FaFileAlt,        label: "CCPA",          sub: "Compliant",   color: "amber"   as ComplianceColor },
  ];

  const timeline = [
    { num: "01", phase: "Request",    steps: ["TLS 1.3 handshake at edge", "API key validated & hash-checked", "IP allowlist + rate limit enforced"] },
    { num: "02", phase: "Processing", steps: ["Routed to isolated tenant env", "Payload held in memory only", "Model inference — never touches disk"] },
    { num: "03", phase: "Response",   steps: ["Response re-encrypted in transit", "Metadata-only audit log written", "Ephemeral context immediately destroyed"] },
  ];

  const bestPractices = [
    { num: "01", title: "Never expose keys client-side",   desc: "Keys live only in server environments. Use env vars — hardcoding is a critical vulnerability." },
    { num: "02", title: "Rotate keys every 90 days",       desc: "Generate fresh keys on a 90-day cycle. Revoke the old key the moment the new one is active." },
    { num: "03", title: "Enable IP allowlisting",          desc: "Lock your key to known server IPs. Stolen keys become useless without a matching IP." },
    { num: "04", title: "Monitor usage anomalies",         desc: "Alert on sudden token spikes or unusual request patterns — early signs of compromise." },
    { num: "05", title: "Sanitize all user inputs",        desc: "Validate every prompt built from user input to prevent injection and jailbreak attempts." },
  ];

  const faqs = [
    { q: "Do you store my prompts or responses?",     a: "Never. We have a strict zero data retention policy. The only data logged is anonymous metadata — timestamp, model ID, token count — for billing and rate limiting. Actual content is never written to any persistent storage." },
    { q: "How are API keys stored?",                  a: "Keys are hashed with bcrypt before storage. The plaintext key is shown exactly once at creation. You can set expiry dates, scope keys to specific models, and restrict them by IP allowlist from your dashboard." },
    { q: "Is my data used to train models?",          a: "No. Requests are forwarded to upstream providers under strict Data Processing Agreements that explicitly prohibit using customer data for training. We only partner with providers offering zero-training guarantees." },
    { q: "How are security incidents handled?",       a: "We maintain a documented incident response playbook with sub-5-minute automated alerting. Affected users are notified within 72 hours of a confirmed breach, in full compliance with GDPR Article 33." },
    { q: "Can I request a penetration test report?",  a: "Enterprise customers can request our latest third-party pentest summary under NDA. Email contact@aichixia.xyz with the subject 'Security Report Request' and we'll respond within one business day." },
  ];

  return (
    <>
      <Head>
        <title>Security — Aichixia</title>
        <meta name="description" content="How Aichixia protects your data, API keys, and infrastructure." />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@500;700;800&display=swap');

          html, body { overflow-x: hidden; max-width: 100%; }
          *, *::before, *::after { box-sizing: border-box; }

          .syne { font-family: 'Syne', sans-serif; }
          .mono { font-family: 'JetBrains Mono', monospace; }

          @keyframes fadeUp {
            from { opacity:0; transform:translateY(16px); }
            to   { opacity:1; transform:translateY(0); }
          }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
          @keyframes orbPulse {
            0%,100%{opacity:.07; transform:scale(1)}
            50%    {opacity:.13; transform:scale(1.07)}
          }

          .fade-up  { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both; }
          .fade-in  { animation: fadeIn .3s ease both; }
          .float-el { animation: floatY 4s ease-in-out infinite; }
          .orb {
            position:absolute; border-radius:9999px; filter:blur(70px);
            pointer-events:none; animation: orbPulse 7s ease-in-out infinite;
          }

          .d1{animation-delay:.06s} .d2{animation-delay:.12s}
          .d3{animation-delay:.18s} .d4{animation-delay:.24s}

          .glass { backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }

          .nav-link { position:relative; }
          .nav-link::after {
            content:''; position:absolute; bottom:-2px; left:0;
            width:0; height:1px; background:currentColor;
            transition:width .2s ease;
          }
          .nav-link:hover::after { width:100%; }

          .card-3d {
            transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease;
          }
          .card-3d:hover {
            transform: perspective(800px) rotateX(-2.5deg) rotateY(2.5deg) translateY(-3px);
            box-shadow: 6px 14px 36px rgba(0,0,0,.15), 0 1px 0 rgba(255,255,255,.04) inset;
          }
          .dark .card-3d:hover {
            box-shadow: 6px 14px 36px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.04) inset;
          }

          .top-shine::before {
            content:''; position:absolute;
            inset-x:0; top:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(14,165,233,.4),transparent);
            border-radius:inherit;
          }

          .faq-body {
            overflow:hidden;
            transition: max-height .38s cubic-bezier(.22,1,.36,1), opacity .3s ease;
          }

          .timeline-connector {
            position:absolute; left:18px; top:38px; bottom:-14px;
            width:2px;
            background:linear-gradient(to bottom,rgba(14,165,233,.3),transparent);
          }

          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(14,165,233,.25);border-radius:4px}
        `}</style>
      </Head>

      <main className="min-h-screen bg-white dark:bg-[#07090f] text-zinc-900 dark:text-white syne transition-colors duration-300" style={{ overflowX: "hidden", width: "100%" }}>

        <nav className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/60 bg-white/80 dark:bg-[#07090f]/80 glass">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <FaTerminal className="w-4 h-4 text-sky-500 group-hover:text-cyan-400 transition-colors duration-200" />
              <span className="text-sm font-black text-zinc-900 dark:text-white">Aichixia</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link text-xs font-semibold transition-colors duration-200 ${
                    l.href === "/security"
                      ? "text-sky-500 dark:text-sky-400"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all duration-200"
              >
                {isDark ? <FaSun className="w-3.5 h-3.5" /> : <FaMoon className="w-3.5 h-3.5" />}
              </button>
              <button
                className="md:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FaTimes className="w-3.5 h-3.5" /> : <FaBars className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#07090f] px-4 py-2 space-y-0.5 fade-in">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    l.href === "/security"
                      ? "text-sky-500 bg-sky-500/5"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <section className="relative" style={{ overflow: "hidden" }}>
          <div className="orb" style={{ width: "420px", height: "420px", background: "rgba(14,165,233,0.08)", top: "-60px", left: "50%", transform: "translateX(-50%)", animationDelay: "0s" }} />
          <div className="orb" style={{ width: "260px", height: "260px", background: "rgba(16,185,129,0.07)", top: "48px", right: "0px", animationDelay: "2.5s" }} />
          <div className="orb" style={{ width: "200px", height: "200px", background: "rgba(139,92,246,0.06)", bottom: "0px", left: "0px", animationDelay: "1.2s" }} />

          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.055]"
            style={{
              backgroundImage: `linear-gradient(rgba(14,165,233,1) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,1) 1px,transparent 1px)`,
              backgroundSize: "44px 44px",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              <div>
                <div className="fade-up">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/5 text-sky-400 text-[11px] font-semibold mono mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    Zero Trust Architecture
                  </span>
                </div>

                <h1 className="fade-up d1 text-[2rem] sm:text-[2.6rem] font-black leading-[1.1] tracking-tight mb-4">
                  Built Secure,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500">
                    By Default
                  </span>
                </h1>

                <p className="fade-up d2 text-sm sm:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-md">
                  Security isn't a feature we layer on top — it's the foundation everything is built on.
                  End-to-end encryption, zero data retention, and continuous monitoring on every single request.
                </p>

                <div className="fade-up d3 flex flex-wrap gap-2 mb-8">
                  {[
                    { icon: FaDatabase,    label: "Zero Data Retention" },
                    { icon: FaLock,        label: "TLS 1.3 Encrypted" },
                    { icon: FaServer,      label: "Isolated Tenants" },
                    { icon: FaCertificate, label: "SOC 2 In Progress" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-900/60 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400"
                    >
                      <Icon className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="fade-up d4 flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:security@aichixia.xyz"
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                  >
                    <FaShieldAlt className="w-3.5 h-3.5 shrink-0" />
                    Report Vulnerability
                    <FaArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  </a>
                  <a
                    href="mailto:contact@aichixia.xyz"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                  >
                    <FaEnvelope className="w-3.5 h-3.5 shrink-0" />
                    Contact Us
                  </a>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="fade-up d2 float-el" style={{ width: "100%", maxWidth: "300px" }}>
                  <div className="relative bg-white dark:bg-[#0d1525] rounded-2xl border border-zinc-200 dark:border-zinc-700/50 p-5 shadow-2xl shadow-zinc-300/30 dark:shadow-black/60 top-shine">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                      </div>
                      <span className="text-[10px] mono text-zinc-400 dark:text-zinc-500">request_lifecycle.ts</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { num: "1", color: "text-sky-400",     bg: "rgba(14,165,233,0.1)",  line: "TLS 1.3 handshake",       sub: "edge → client" },
                        { num: "2", color: "text-violet-400",  bg: "rgba(139,92,246,0.1)",  line: "API key validated",        sub: "bcrypt check" },
                        { num: "3", color: "text-emerald-400", bg: "rgba(16,185,129,0.1)",  line: "Memory-only processing",  sub: "never on disk" },
                        { num: "4", color: "text-amber-400",   bg: "rgba(245,158,11,0.1)",  line: "Response re-encrypted",   sub: "AES-256-GCM" },
                        { num: "5", color: "text-rose-400",    bg: "rgba(244,63,94,0.1)",   line: "Context destroyed",       sub: "0ms retention" },
                      ].map(({ num, color, bg, line, sub }) => (
                        <div key={num} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
                            <span className={`text-[9px] font-black mono ${color}`}>{num}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[12px] mono font-semibold ${color} leading-tight`}>{line}</div>
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-600 mono mt-0.5">{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] mono font-semibold text-emerald-400">secure</span>
                      </div>
                      <span className="text-[10px] mono text-zinc-400 dark:text-zinc-600">aichixia.xyz</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <AnimBlock className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2">Security Pillars</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">Six foundational layers protecting every API call, every time.</p>
          </AnimBlock>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {pillars.map((p, i) => {
              const a = accentMap[p.accent];
              const isH = hoveredPillar === i;
              return (
                <AnimBlock key={p.title} delay={i * 0.05} className="h-full">
                  <div
                    className={`relative rounded-xl border ${a.border} bg-white dark:bg-zinc-950 p-4 sm:p-5 card-3d overflow-hidden h-full flex flex-col cursor-default`}
                    onMouseEnter={() => setHoveredPillar(i)}
                    onMouseLeave={() => setHoveredPillar(null)}
                  >
                    <div
                      className="absolute top-0 right-0 w-14 h-14 rounded-bl-3xl transition-opacity duration-300"
                      style={{ opacity: isH ? 0.1 : 0.05, background: isH ? "currentColor" : "transparent" }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: "linear-gradient(135deg,rgba(255,255,255,.03) 0%,transparent 60%)" }}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <p.icon className={`w-5 h-5 ${a.text} shrink-0`} />
                        <span className={`text-[10px] mono font-bold ${a.text} px-2 py-0.5 rounded-full border ${a.border} whitespace-nowrap`}>
                          {p.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5">{p.title}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1">{p.desc}</p>
                    </div>
                  </div>
                </AnimBlock>
              );
            })}
          </div>
        </section>

        <section className="border-y border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

              <AnimBlock>
                <div className="flex items-center gap-2 mb-4">
                  <FaBolt className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-bold text-violet-400 mono uppercase tracking-widest">Request Lifecycle</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2">What Happens to Your Data</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">Every API request follows this exact path. Nothing persists. Nothing leaks.</p>

                <div className="space-y-7">
                  {timeline.map((t, ti) => (
                    <div key={t.phase} className="relative pl-12">
                      {ti < timeline.length - 1 && <div className="timeline-connector" />}
                      <div className="absolute left-0 top-0 w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
                        <span className="text-[10px] font-black text-white mono">{t.num}</span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 pt-1">{t.phase}</h4>
                      <ul className="space-y-1.5">
                        {t.steps.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <FaCheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AnimBlock>

              <div className="space-y-4">
                <AnimBlock>
                  <div className="flex items-center gap-2 mb-4">
                    <FaCertificate className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 mono uppercase tracking-widest">Compliance</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-4">Regulatory Standards</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {compliance.map((c) => {
                      const cc = complianceColorMap[c.color];
                      return (
                        <div
                          key={c.label}
                          className={`card-3d rounded-xl border ${cc.border} bg-white dark:bg-zinc-950 p-4`}
                        >
                          <c.icon className={`w-4 h-4 ${cc.text} mb-2.5`} />
                          <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{c.label}</div>
                          <div className={`text-[10px] font-semibold mono mt-0.5 ${cc.text}`}>{c.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                </AnimBlock>

                <AnimBlock delay={0.07}>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">Responsible Disclosure</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Found a vulnerability? Report it to{" "}
                          <a href="mailto:security@aichixia.xyz" className="text-sky-400 hover:text-sky-300 transition-colors duration-150 underline underline-offset-2">
                            security@aichixia.xyz
                          </a>
                          . We respond within 48h and never pursue action against good-faith researchers.
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimBlock>

                <AnimBlock delay={0.12}>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                    <div className="flex items-start gap-3">
                      <FaCloud className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">Infrastructure</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          CIS-hardened enterprise cloud with multi-region failover, audited regularly by independent third parties.
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimBlock>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            <AnimBlock>
              <div className="flex items-center gap-2 mb-4">
                <FaKey className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 mono uppercase tracking-widest">Best Practices</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2">Developer Security Guide</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Five things every developer integrating Aichixia should do from day one.
              </p>

              <div className="space-y-2.5">
                {bestPractices.map((item) => (
                  <div
                    key={item.num}
                    className="group flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-sky-500/30 cursor-default"
                    style={{ transition: "border-color .2s ease, transform .25s cubic-bezier(.22,1,.36,1)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)"; }}
                  >
                    <span className="text-base font-black mono text-zinc-200 dark:text-zinc-700 group-hover:text-sky-400 transition-colors duration-200 shrink-0 leading-none mt-0.5 w-6">
                      {item.num}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{item.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimBlock>

            <AnimBlock delay={0.06}>
              <div className="flex items-center gap-2 mb-4">
                <FaEye className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold text-rose-400 mono uppercase tracking-widest">FAQ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2">Common Questions</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Answers to the most frequently asked security questions.
              </p>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
                      expandedFaq === idx
                        ? "border-sky-500/30 bg-sky-500/[0.03] dark:bg-sky-500/[0.04]"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors duration-150"
                    >
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">{faq.q}</span>
                      <FaChevronDown
                        className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                          expandedFaq === idx ? "rotate-180 text-sky-400" : "text-zinc-400"
                        }`}
                      />
                    </button>
                    <div
                      className="faq-body"
                      style={{
                        maxHeight: expandedFaq === idx ? "220px" : "0",
                        opacity: expandedFaq === idx ? 1 : 0,
                      }}
                    >
                      <p className="px-4 pb-4 pt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/70">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimBlock>
          </div>
        </section>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <FaTerminal className="w-4 h-4 text-sky-500 group-hover:text-cyan-400 transition-colors duration-200" />
                <div>
                  <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">Aichixia</p>
                  <p className="text-[10px] text-zinc-500">AI API Platform</p>
                </div>
              </Link>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                © {new Date().getFullYear()} Aichixia. All rights reserved.
              </p>

              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                {[
                  { href: "mailto:contact@aichixia.xyz", label: "Contact", mail: true },
                  { href: "/privacy",  label: "Privacy",  mail: false },
                  { href: "/terms",    label: "Terms",    mail: false },
                  { href: "/security", label: "Security", mail: false },
                ].map((l, i, arr) => (
                  <span key={l.label} className="flex items-center gap-2.5">
                    {l.mail ? (
                      <a href={l.href} className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200">
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className={`text-[11px] transition-colors duration-200 ${
                          l.href === "/security"
                            ? "text-sky-500 dark:text-sky-400"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400"
                        }`}
                      >
                        {l.label}
                      </Link>
                    )}
                    {i < arr.length - 1 && <span className="text-zinc-300 dark:text-zinc-700 text-xs">·</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
