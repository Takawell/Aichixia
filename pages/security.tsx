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

const accentMap: Record<PillarAccent, { text: string; border: string }> = {
  sky:     { text: "text-sky-400",     border: "border-sky-500/25" },
  emerald: { text: "text-emerald-400", border: "border-emerald-500/25" },
  violet:  { text: "text-violet-400",  border: "border-violet-500/25" },
  amber:   { text: "text-amber-400",   border: "border-amber-500/25" },
  rose:    { text: "text-rose-400",    border: "border-rose-500/25" },
  cyan:    { text: "text-cyan-400",    border: "border-cyan-500/25" },
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

function AnimBlock({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity .5s cubic-bezier(.22,1,.36,1) ${delay}s, transform .5s cubic-bezier(.22,1,.36,1) ${delay}s`,
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
    { href: "/", label: "Home" },
    { href: "/docs", label: "Docs" },
    { href: "/playground", label: "Playground" },
    { href: "/security", label: "Security" },
  ];

  const pillars = [
    { icon: FaLock,         title: "End-to-End Encryption", desc: "TLS 1.3 in transit. AES-256 at rest across every storage layer.",           accent: "sky"     as PillarAccent, tag: "TLS 1.3 · AES-256" },
    { icon: FaFingerprint,  title: "Zero Data Retention",   desc: "Prompts and responses are never persisted. Ephemeral by design.",            accent: "emerald" as PillarAccent, tag: "0 ms retention" },
    { icon: FaUserShield,   title: "Access Control",        desc: "Granular API key scoping, IP allowlisting, and per-key rate limits.",        accent: "violet"  as PillarAccent, tag: "RBAC · IP allowlist" },
    { icon: FaNetworkWired, title: "Network Isolation",     desc: "Each tenant runs in a separate VPC. Zero cross-tenant leakage possible.",    accent: "amber"   as PillarAccent, tag: "Per-tenant VPC" },
    { icon: FaSyncAlt,      title: "Continuous Monitoring", desc: "24/7 automated threat detection with sub-5-minute incident response SLA.",   accent: "rose"    as PillarAccent, tag: "< 5 min SLA" },
    { icon: FaCodeBranch,   title: "Secure Development",    desc: "Every commit: peer review, SAST, DAST, and dependency scanning.",            accent: "cyan"    as PillarAccent, tag: "SAST · DAST" },
  ];

  const compliance = [
    { icon: FaCertificate,    label: "SOC 2 Type II", sub: "In progress", color: "sky"     as ComplianceColor },
    { icon: FaGlobe,          label: "GDPR",          sub: "Compliant",   color: "emerald" as ComplianceColor },
    { icon: FaClipboardCheck, label: "ISO 27001",     sub: "Aligned",     color: "violet"  as ComplianceColor },
    { icon: FaFileAlt,        label: "CCPA",          sub: "Compliant",   color: "amber"   as ComplianceColor },
  ];

  const timeline = [
    { num: "01", phase: "Request",    steps: ["TLS 1.3 handshake at edge", "API key validated & hash-checked", "IP allowlist + rate limit enforced"] },
    { num: "02", phase: "Processing", steps: ["Routed to isolated tenant env", "Payload held in memory only", "Model inference — never on disk"] },
    { num: "03", phase: "Response",   steps: ["Response re-encrypted in transit", "Metadata-only audit log written", "Ephemeral context destroyed"] },
  ];

  const bestPractices = [
    { num: "01", title: "Never expose keys client-side", desc: "Keys live only in server environments. Use env vars — never hardcode." },
    { num: "02", title: "Rotate keys every 90 days",     desc: "Generate fresh keys on a 90-day cycle. Revoke the old key immediately." },
    { num: "03", title: "Enable IP allowlisting",        desc: "Lock your key to known server IPs. Stolen keys become useless." },
    { num: "04", title: "Monitor usage anomalies",       desc: "Alert on sudden token spikes — early signs of compromise." },
    { num: "05", title: "Sanitize all user inputs",      desc: "Validate every prompt built from user input to prevent injection." },
  ];

  const faqs = [
    { q: "Do you store my prompts or responses?",    a: "Never. The only data logged is anonymous metadata — timestamp, model ID, token count — for billing. Actual content is never written to any persistent storage." },
    { q: "How are API keys stored?",                 a: "Keys are hashed with bcrypt before storage. The plaintext key is shown exactly once at creation. You can set expiry dates, scope keys to models, and restrict by IP." },
    { q: "Is my data used to train models?",         a: "No. Upstream providers are under strict DPAs that prohibit using customer data for training. We only partner with providers offering zero-training guarantees." },
    { q: "How are security incidents handled?",      a: "Sub-5-minute automated alerting. Affected users are notified within 72 hours of a confirmed breach, in compliance with GDPR Article 33." },
    { q: "Can I request a penetration test report?", a: "Enterprise customers can request the latest pentest summary under NDA. Email contact@aichixia.xyz with 'Security Report Request'." },
  ];

  return (
    <>
      <Head>
        <title>Security — Aichixia</title>
        <meta name="description" content="How Aichixia protects your data, API keys, and infrastructure." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@500;700;800&display=swap');

          html { overflow-x: hidden; }
          body { overflow-x: hidden; min-width: 0; }
          *, *::before, *::after { box-sizing: border-box; min-width: 0; }

          .syne { font-family: 'Syne', sans-serif; }
          .mono { font-family: 'JetBrains Mono', monospace; }

          @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes orbPulse { 0%,100%{opacity:.06;transform:scale(1)} 50%{opacity:.11;transform:scale(1.06)} }

          .fade-up  { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
          .fade-in  { animation: fadeIn .3s ease both; }
          .float-el { animation: floatY 4s ease-in-out infinite; }
          .orb { position:absolute; border-radius:9999px; filter:blur(60px); pointer-events:none; animation:orbPulse 7s ease-in-out infinite; }

          .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s} .d4{animation-delay:.24s}

          .glass { backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }

          .nav-link { position:relative; }
          .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:currentColor; transition:width .2s ease; }
          .nav-link:hover::after { width:100%; }

          .card-3d { transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease; }
          .card-3d:hover { transform: perspective(700px) rotateX(-2deg) rotateY(2deg) translateY(-2px); box-shadow: 4px 10px 28px rgba(0,0,0,.12); }
          .dark .card-3d:hover { box-shadow: 4px 10px 28px rgba(0,0,0,.3); }

          .top-shine::before {
            content:''; position:absolute; inset-x:0; top:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(14,165,233,.35),transparent);
            border-radius:inherit;
          }

          .faq-body { overflow:hidden; transition: max-height .35s cubic-bezier(.22,1,.36,1), opacity .28s ease; }

          .timeline-line { position:absolute; left:16px; top:34px; bottom:-12px; width:1.5px; background:linear-gradient(to bottom,rgba(14,165,233,.28),transparent); }

          ::-webkit-scrollbar{width:3px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(14,165,233,.2);border-radius:4px}
        `}</style>
      </Head>

      <main
        className="min-h-screen w-full bg-white dark:bg-[#07090f] text-zinc-900 dark:text-white syne transition-colors duration-300"
        style={{ overflowX: "hidden" }}
      >

        {/* NAV */}
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/70 dark:border-zinc-800/50 bg-white/80 dark:bg-[#07090f]/80 glass">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-1.5 group shrink-0">
              <FaTerminal className="w-3.5 h-3.5 text-sky-500 group-hover:text-cyan-400 transition-colors duration-200" />
              <span className="text-xs font-black text-zinc-900 dark:text-white">Aichixia</span>
            </Link>

            <div className="hidden md:flex items-center gap-5">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link text-[11px] font-semibold transition-colors duration-200 ${
                    l.href === "/security" ? "text-sky-500 dark:text-sky-400" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button onClick={toggleTheme} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-200">
                {isDark ? <FaSun className="w-3 h-3" /> : <FaMoon className="w-3 h-3" />}
              </button>
              <button className="md:hidden p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <FaTimes className="w-3 h-3" /> : <FaBars className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#07090f] px-4 py-1.5 space-y-0.5 fade-in">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                    l.href === "/security" ? "text-sky-500 bg-sky-500/5" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* HERO */}
        <section className="relative w-full" style={{ overflow: "hidden" }}>
          <div className="orb" style={{ width:"360px", height:"360px", background:"rgba(14,165,233,0.07)", top:"-50px", left:"50%", transform:"translateX(-50%)", animationDelay:"0s" }} />
          <div className="orb" style={{ width:"200px", height:"200px", background:"rgba(16,185,129,0.06)", top:"40px", right:"0", animationDelay:"2s" }} />
          <div className="orb" style={{ width:"160px", height:"160px", background:"rgba(139,92,246,0.05)", bottom:"0", left:"0", animationDelay:"1s" }} />

          <div className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.05]"
            style={{ backgroundImage:`linear-gradient(rgba(14,165,233,1) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,1) 1px,transparent 1px)`, backgroundSize:"40px 40px" }}
          />

          <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              <div className="w-full min-w-0">
                <div className="fade-up">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sky-500/30 bg-sky-500/5 text-sky-400 text-[10px] font-semibold mono mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                    Zero Trust Architecture
                  </span>
                </div>

                <h1 className="fade-up d1 text-[1.65rem] sm:text-[2rem] lg:text-[2.3rem] font-black leading-[1.1] tracking-tight mb-3">
                  Built Secure,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500">By Default</span>
                </h1>

                <p className="fade-up d2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-sm">
                  Security isn't a feature we layer on top — it's the foundation. End-to-end encryption, zero data retention, and continuous monitoring on every request.
                </p>

                <div className="fade-up d3 flex flex-wrap gap-1.5 mb-6">
                  {[
                    { icon: FaDatabase,    label: "Zero Retention" },
                    { icon: FaLock,        label: "TLS 1.3" },
                    { icon: FaServer,      label: "Isolated Tenants" },
                    { icon: FaCertificate, label: "SOC 2" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-900/60 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                      <Icon className="w-2.5 h-2.5 text-sky-500 dark:text-sky-400 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="fade-up d4 flex flex-col sm:flex-row gap-2">
                  <a href="mailto:security@aichixia.xyz" className="group inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    <FaShieldAlt className="w-3 h-3 shrink-0" />
                    Report Vulnerability
                    <FaArrowRight className="w-2.5 h-2.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  </a>
                  <a href="mailto:contact@aichixia.xyz" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    <FaEnvelope className="w-3 h-3 shrink-0" />
                    Contact Us
                  </a>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end w-full min-w-0">
                <div className="fade-up d2 float-el w-full" style={{ maxWidth:"270px" }}>
                  <div className="relative w-full bg-white dark:bg-[#0d1525] rounded-xl border border-zinc-200 dark:border-zinc-700/50 p-4 shadow-xl shadow-zinc-200/40 dark:shadow-black/50 top-shine">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400/80" />
                        <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                      </div>
                      <span className="text-[9px] mono text-zinc-400 dark:text-zinc-500">request_lifecycle.ts</span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { num:"1", color:"text-sky-400",     bg:"rgba(14,165,233,0.1)",  line:"TLS 1.3 handshake",      sub:"edge → client" },
                        { num:"2", color:"text-violet-400",  bg:"rgba(139,92,246,0.1)",  line:"API key validated",       sub:"bcrypt check" },
                        { num:"3", color:"text-emerald-400", bg:"rgba(16,185,129,0.1)",  line:"Memory-only processing",  sub:"never on disk" },
                        { num:"4", color:"text-amber-400",   bg:"rgba(245,158,11,0.1)",  line:"Response re-encrypted",   sub:"AES-256-GCM" },
                        { num:"5", color:"text-rose-400",    bg:"rgba(244,63,94,0.1)",   line:"Context destroyed",       sub:"0ms retention" },
                      ].map(({ num, color, bg, line, sub }) => (
                        <div key={num} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
                            <span className={`text-[8px] font-black mono ${color}`}>{num}</span>
                          </div>
                          <div className="min-w-0">
                            <div className={`text-[11px] mono font-semibold ${color} leading-tight`}>{line}</div>
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 mono">{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] mono font-semibold text-emerald-400">secure</span>
                      </div>
                      <span className="text-[9px] mono text-zinc-400 dark:text-zinc-600">aichixia.xyz</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <AnimBlock className="text-center mb-8">
            <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mb-1.5">Security Pillars</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">Six foundational layers protecting every API call, every time.</p>
          </AnimBlock>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {pillars.map((p, i) => {
              const a = accentMap[p.accent];
              return (
                <AnimBlock key={p.title} delay={i * 0.04} className="h-full">
                  <div
                    className={`relative rounded-xl border ${a.border} bg-white dark:bg-zinc-950 p-3.5 card-3d overflow-hidden h-full flex flex-col cursor-default`}
                    onMouseEnter={() => setHoveredPillar(i)}
                    onMouseLeave={() => setHoveredPillar(null)}
                  >
                    <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background:"linear-gradient(135deg,rgba(255,255,255,.025) 0%,transparent 55%)" }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2.5">
                        <p.icon className={`w-4 h-4 ${a.text} shrink-0`} />
                        <span className={`text-[9px] mono font-bold ${a.text} px-1.5 py-0.5 rounded-full border ${a.border} whitespace-nowrap`}>
                          {p.tag}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">{p.title}</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1">{p.desc}</p>
                    </div>
                  </div>
                </AnimBlock>
              );
            })}
          </div>
        </section>

        {/* LIFECYCLE + COMPLIANCE */}
        <section className="w-full border-y border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/70 dark:bg-zinc-900/25">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

              <AnimBlock>
                <div className="flex items-center gap-1.5 mb-3">
                  <FaBolt className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] font-bold text-violet-400 mono uppercase tracking-widest">Request Lifecycle</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mb-1.5">What Happens to Your Data</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">Every API request follows this exact path. Nothing persists. Nothing leaks.</p>

                <div className="space-y-5">
                  {timeline.map((t, ti) => (
                    <div key={t.phase} className="relative pl-9">
                      {ti < timeline.length - 1 && <div className="timeline-line" />}
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20">
                        <span className="text-[9px] font-black text-white mono">{t.num}</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-1.5 pt-1">{t.phase}</h4>
                      <ul className="space-y-1">
                        {t.steps.map((s) => (
                          <li key={s} className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <FaCheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AnimBlock>

              <div className="space-y-3 min-w-0">
                <AnimBlock>
                  <div className="flex items-center gap-1.5 mb-3">
                    <FaCertificate className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 mono uppercase tracking-widest">Compliance</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mb-3">Regulatory Standards</h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {compliance.map((c) => {
                      const cc = complianceColorMap[c.color];
                      return (
                        <div key={c.label} className={`card-3d rounded-xl border ${cc.border} bg-white dark:bg-zinc-950 p-3`}>
                          <c.icon className={`w-3.5 h-3.5 ${cc.text} mb-2`} />
                          <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{c.label}</div>
                          <div className={`text-[9px] font-semibold mono mt-0.5 ${cc.text}`}>{c.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                </AnimBlock>

                <AnimBlock delay={0.06}>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-start gap-2.5">
                      <FaExclamationTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-900 dark:text-white mb-0.5">Responsible Disclosure</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Found a vulnerability? Report to{" "}
                          <a href="mailto:security@aichixia.xyz" className="text-sky-400 hover:text-sky-300 transition-colors duration-150 underline underline-offset-2">security@aichixia.xyz</a>
                          . We respond within 48h.
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimBlock>

                <AnimBlock delay={0.1}>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
                    <div className="flex items-start gap-2.5">
                      <FaCloud className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-900 dark:text-white mb-0.5">Infrastructure</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          CIS-hardened enterprise cloud with multi-region failover, audited by independent third parties.
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimBlock>
              </div>

            </div>
          </div>
        </section>

        {/* BEST PRACTICES + FAQ */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            <AnimBlock>
              <div className="flex items-center gap-1.5 mb-3">
                <FaKey className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 mono uppercase tracking-widest">Best Practices</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mb-1.5">Developer Security Guide</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">Five things every developer should do from day one.</p>

              <div className="space-y-2">
                {bestPractices.map((item) => (
                  <div
                    key={item.num}
                    className="group flex gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-sky-500/30 cursor-default"
                    style={{ transition: "border-color .2s ease, transform .22s cubic-bezier(.22,1,.36,1)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(3px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)"; }}
                  >
                    <span className="text-sm font-black mono text-zinc-200 dark:text-zinc-700 group-hover:text-sky-400 transition-colors duration-200 shrink-0 leading-none mt-0.5 w-5">{item.num}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">{item.title}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimBlock>

            <AnimBlock delay={0.05}>
              <div className="flex items-center gap-1.5 mb-3">
                <FaEye className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] font-bold text-rose-400 mono uppercase tracking-widest">FAQ</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mb-1.5">Common Questions</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">Answers to the most frequently asked security questions.</p>

              <div className="space-y-1.5">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
                      expandedFaq === idx ? "border-sky-500/30 bg-sky-500/[0.03] dark:bg-sky-500/[0.04]" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors duration-150"
                    >
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white leading-snug">{faq.q}</span>
                      <FaChevronDown className={`w-2.5 h-2.5 shrink-0 transition-transform duration-300 ${expandedFaq === idx ? "rotate-180 text-sky-400" : "text-zinc-400"}`} />
                    </button>
                    <div className="faq-body" style={{ maxHeight: expandedFaq === idx ? "200px" : "0", opacity: expandedFaq === idx ? 1 : 0 }}>
                      <p className="px-3.5 pb-3.5 pt-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimBlock>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-1.5 group">
                <FaTerminal className="w-3.5 h-3.5 text-sky-500 group-hover:text-cyan-400 transition-colors duration-200" />
                <div>
                  <p className="text-xs font-black text-zinc-900 dark:text-white leading-none">Aichixia</p>
                  <p className="text-[9px] text-zinc-500">AI API Platform</p>
                </div>
              </Link>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                © {new Date().getFullYear()} Aichixia. All rights reserved.
              </p>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                {[
                  { href: "mailto:contact@aichixia.xyz", label: "Contact", mail: true },
                  { href: "/privacy",  label: "Privacy",  mail: false },
                  { href: "/terms",    label: "Terms",    mail: false },
                  { href: "/security", label: "Security", mail: false },
                ].map((l, i, arr) => (
                  <span key={l.label} className="flex items-center gap-2">
                    {l.mail ? (
                      <a href={l.href} className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200">{l.label}</a>
                    ) : (
                      <Link href={l.href} className={`text-[10px] transition-colors duration-200 ${l.href === "/security" ? "text-sky-500 dark:text-sky-400" : "text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400"}`}>
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
