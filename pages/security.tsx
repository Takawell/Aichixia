import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  FaTerminal, FaMoon, FaSun, FaBars, FaTimes,
  FaShieldAlt, FaLock, FaKey, FaServer, FaEye,
  FaCheckCircle, FaGlobe, FaDatabase, FaCloud,
  FaCertificate, FaFileAlt, FaEnvelope, FaChevronDown,
  FaChevronRight, FaExclamationTriangle, FaBolt,
  FaFingerprint, FaNetworkWired, FaClipboardCheck,
  FaUserShield, FaCodeBranch, FaSyncAlt, FaInfinity
} from "react-icons/fa";

export default function Security() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      setIsDark(theme === "dark");
    } else {
      setIsDark(true);
      localStorage.setItem("theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/docs", label: "Docs" },
    { href: "/playground", label: "Playground" },
    { href: "/security", label: "Security" },
  ];

  const pillars = [
    {
      icon: FaLock,
      title: "End-to-End Encryption",
      desc: "All data in transit is encrypted with TLS 1.3. Data at rest uses AES-256 encryption across all storage layers.",
      accent: "sky",
      detail: "TLS 1.3 + AES-256",
    },
    {
      icon: FaFingerprint,
      title: "Zero Data Retention",
      desc: "We never store your prompts or responses. Every request is ephemeral — processed and discarded immediately.",
      accent: "emerald",
      detail: "0ms retention",
    },
    {
      icon: FaUserShield,
      title: "Access Control",
      desc: "API keys with granular scoping, IP allowlisting, and rate limiting ensure only authorized requests go through.",
      accent: "violet",
      detail: "RBAC + IP allowlist",
    },
    {
      icon: FaNetworkWired,
      title: "Network Isolation",
      desc: "Each tenant runs in an isolated network environment. No cross-tenant data leakage is architecturally possible.",
      accent: "amber",
      detail: "Per-tenant VPC",
    },
    {
      icon: FaSyncAlt,
      title: "Continuous Monitoring",
      desc: "24/7 automated threat detection, anomaly alerting, and incident response with sub-5-minute SLA.",
      accent: "rose",
      detail: "< 5 min response",
    },
    {
      icon: FaCodeBranch,
      title: "Secure Development",
      desc: "All code undergoes mandatory peer review, static analysis, and automated security scanning before deployment.",
      accent: "cyan",
      detail: "SAST + DAST",
    },
  ];

  const complianceItems = [
    {
      icon: FaCertificate,
      label: "SOC 2 Type II",
      sub: "In progress",
      color: "sky",
    },
    {
      icon: FaGlobe,
      label: "GDPR",
      sub: "Compliant",
      color: "emerald",
    },
    {
      icon: FaClipboardCheck,
      label: "ISO 27001",
      sub: "Aligned",
      color: "violet",
    },
    {
      icon: FaFileAlt,
      label: "CCPA",
      sub: "Compliant",
      color: "amber",
    },
  ];

  const timeline = [
    {
      phase: "Request",
      steps: [
        "Client sends request over TLS 1.3",
        "API key validated at edge",
        "Rate limit & IP check enforced",
      ],
    },
    {
      phase: "Processing",
      steps: [
        "Request routed to isolated tenant env",
        "Payload never written to disk",
        "Model inference in memory only",
      ],
    },
    {
      phase: "Response",
      steps: [
        "Response encrypted before transmission",
        "Audit log written (no payload stored)",
        "Ephemeral context destroyed",
      ],
    },
  ];

  const faqs = [
    {
      q: "Do you store my API requests or responses?",
      a: "No. We follow a strict zero data retention policy. Your prompts and model responses are never persisted to disk. The only thing we log is metadata (timestamp, model used, token count) for billing and rate limiting.",
    },
    {
      q: "How are API keys secured?",
      a: "API keys are hashed using bcrypt before storage. The plaintext key is only shown once at creation time. You can scope keys to specific models, set expiry dates, and restrict by IP allowlist.",
    },
    {
      q: "Is my data shared with model providers?",
      a: "Requests are proxied to upstream providers under strict DPA agreements. Providers are contractually prohibited from using your data for training. We work only with providers who offer zero-training guarantees.",
    },
    {
      q: "How do you handle security incidents?",
      a: "We have a documented incident response playbook with sub-5-minute automated alerting. Affected users are notified within 72 hours of a confirmed breach, in accordance with GDPR Article 33.",
    },
    {
      q: "Can I get a penetration test report?",
      a: "Enterprise customers can request our latest third-party penetration test summary under NDA. Contact contact@aichixia.xyz with the subject 'Security Report Request'.",
    },
  ];

  const accentMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20",     glow: "shadow-sky-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
    violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  glow: "shadow-violet-500/20" },
    amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   glow: "shadow-amber-500/20" },
    rose:    { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    glow: "shadow-rose-500/20" },
    cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20",    glow: "shadow-cyan-500/20" },
  };

  const complianceColor: Record<string, string> = {
    sky:     "text-sky-400 bg-sky-500/10 border-sky-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
    amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <>
      <Head>
        <title>Security — Aichixia</title>
        <meta name="description" content="How Aichixia protects your data, API keys, and infrastructure." />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');

          * { box-sizing: border-box; }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes scanline {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes pulse-ring {
            0%   { transform: scale(1);    opacity: 0.4; }
            100% { transform: scale(1.6);  opacity: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%      { transform: translateY(-6px); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes dash {
            to { stroke-dashoffset: 0; }
          }

          .fade-up   { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
          .fade-in   { animation: fadeIn 0.4s ease both; }
          .float-el  { animation: float 4s ease-in-out infinite; }
          .spin-slow { animation: spin-slow 20s linear infinite; }

          .delay-1 { animation-delay: 0.05s; }
          .delay-2 { animation-delay: 0.1s; }
          .delay-3 { animation-delay: 0.15s; }
          .delay-4 { animation-delay: 0.2s; }
          .delay-5 { animation-delay: 0.25s; }
          .delay-6 { animation-delay: 0.3s; }

          .grid-bg {
            background-image:
              linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px);
            background-size: 40px 40px;
          }

          .card-hover {
            transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, border-color 0.25s ease;
          }
          .card-hover:hover {
            transform: translateY(-3px);
          }

          .glass {
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }

          .mono { font-family: 'JetBrains Mono', monospace; }
          .syne { font-family: 'Syne', sans-serif; }

          .shield-glow {
            filter: drop-shadow(0 0 16px rgba(14,165,233,0.5));
          }

          .timeline-line::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 24px;
            bottom: -16px;
            width: 2px;
            background: linear-gradient(to bottom, rgba(14,165,233,0.4), transparent);
          }

          .faq-content {
            overflow: hidden;
            transition: max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
          }

          .nav-link {
            position: relative;
          }
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: currentColor;
            transition: width 0.25s ease;
          }
          .nav-link:hover::after { width: 100%; }

          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.3); border-radius: 4px; }
        `}</style>
      </Head>

      <main className="min-h-screen bg-white dark:bg-[#07090f] text-zinc-900 dark:text-white syne transition-colors duration-300">

        <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-[#07090f]/80 glass">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <FaTerminal className="w-4 h-4 text-sky-500 group-hover:text-cyan-400 transition-colors duration-200" />
              <div>
                <span className="text-sm font-black text-zinc-900 dark:text-white">Aichixia</span>
                <span className="hidden sm:inline text-[10px] text-zinc-500 dark:text-zinc-500 ml-1.5">AI API Platform</span>
              </div>
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

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
              >
                {isDark ? <FaSun className="w-3.5 h-3.5" /> : <FaMoon className="w-3.5 h-3.5" />}
              </button>
              <button
                className="md:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FaTimes className="w-3.5 h-3.5" /> : <FaBars className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#07090f] px-4 py-3 space-y-1 fade-in">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
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

        <section className="relative overflow-hidden grid-bg">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px]" />
            <div className="absolute top-20 right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
            <div className="fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/5 text-sky-400 text-xs font-semibold mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              security.aichixia.xyz
            </div>

            <div className="fade-up delay-1 relative inline-block mb-6 float-el">
              <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl scale-150 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-sky-500/30">
                <FaShieldAlt className="w-8 h-8 sm:w-10 sm:h-10 text-white shield-glow" />
              </div>
            </div>

            <h1 className="fade-up delay-2 text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white leading-tight mb-4">
              Built Secure,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                By Default
              </span>
            </h1>

            <p className="fade-up delay-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Security isn't a checkbox. At Aichixia, every layer of our infrastructure is
              designed with zero-trust principles, end-to-end encryption, and no data retention.
            </p>

            <div className="fade-up delay-4 mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "Zero Data Retention", icon: FaDatabase },
                { label: "TLS 1.3 Encrypted", icon: FaLock },
                { label: "SOC 2 In Progress", icon: FaCertificate },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                >
                  <Icon className="w-3 h-3 text-sky-500" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3">
              Security Pillars
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Six foundational layers that protect every API call, every time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((p, i) => {
              const a = accentMap[p.accent];
              return (
                <div
                  key={p.title}
                  className={`card-hover group relative rounded-2xl border ${a.border} bg-white dark:bg-zinc-950 p-5 sm:p-6 fade-up`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-2xl ${a.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className={`relative w-10 h-10 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mb-4`}>
                    <p.icon className={`w-4.5 h-4.5 ${a.text}`} style={{ width: 18, height: 18 }} />
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{p.desc}</p>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${a.bg} border ${a.border}`}>
                    <span className={`text-[10px] font-bold mono ${a.text}`}>{p.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-400 text-xs font-semibold mono mb-4">
                  <FaBolt className="w-3 h-3" />
                  Request Lifecycle
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3">
                  What Happens to Your Data
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                  Every API request follows this exact path. Nothing persists. Nothing leaks.
                </p>

                <div className="space-y-4">
                  {timeline.map((t, ti) => (
                    <div key={t.phase} className="relative pl-9 timeline-line last:timeline-line-none">
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white text-xs font-black">
                        {ti + 1}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 pt-1">{t.phase}</h4>
                      <ul className="space-y-1.5">
                        {t.steps.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <FaCheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs font-semibold mono mb-2">
                  <FaCertificate className="w-3 h-3" />
                  Compliance & Standards
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-4">
                  Regulatory Compliance
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {complianceItems.map((c) => (
                    <div
                      key={c.label}
                      className={`card-hover rounded-xl border p-4 ${complianceColor[c.color].split(" ").filter(x => x.startsWith("border")).join(" ")} bg-white dark:bg-zinc-950`}
                    >
                      <c.icon className={`w-5 h-5 mb-2 ${complianceColor[c.color].split(" ")[0]}`} />
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">{c.label}</div>
                      <div className={`text-[10px] font-semibold mono mt-0.5 ${complianceColor[c.color].split(" ")[0]}`}>{c.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">Responsible Disclosure</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Found a vulnerability? We run a responsible disclosure program. Report to{" "}
                        <a href="mailto:security@aichixia.xyz" className="text-sky-400 hover:text-sky-300 transition-colors duration-150">
                          security@aichixia.xyz
                        </a>{" "}
                        and we&apos;ll respond within 48 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <div className="flex items-start gap-3">
                    <FaCloud className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">Infrastructure</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Hosted on enterprise cloud with multi-region failover. Our infrastructure is
                        hardened with CIS benchmarks and regularly audited by independent third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid sm:grid-cols-3 gap-4 mb-14">
            {[
              { icon: FaKey, label: "API Key Security", value: "Hashed at rest", accent: "sky" },
              { icon: FaServer, label: "Infrastructure", value: "CIS Hardened", accent: "emerald" },
              { icon: FaEye, label: "Audit Logging", value: "Metadata only", accent: "violet" },
            ].map((s) => {
              const a = accentMap[s.accent];
              return (
                <div key={s.label} className={`rounded-2xl border ${a.border} bg-white dark:bg-zinc-950 p-5 flex items-center gap-4 card-hover`}>
                  <div className={`w-10 h-10 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className={`w-4 h-4 ${a.text}`} />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold mono uppercase tracking-wider">{s.label}</div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">{s.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mono mb-4">
                <FaInfinity className="w-3 h-3" />
                Best Practices
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3">
                Developer Security Guide
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Follow these practices to keep your integration secure.
              </p>

              <div className="space-y-3">
                {[
                  {
                    num: "01",
                    title: "Never expose keys client-side",
                    desc: "API keys must only exist in server-side environments. Use environment variables, never hardcode.",
                  },
                  {
                    num: "02",
                    title: "Rotate keys regularly",
                    desc: "Generate a new API key every 90 days. Revoke old keys immediately after rotation.",
                  },
                  {
                    num: "03",
                    title: "Use IP allowlisting",
                    desc: "Restrict your API key to known server IP ranges. Reduces attack surface dramatically.",
                  },
                  {
                    num: "04",
                    title: "Monitor usage anomalies",
                    desc: "Set up alerts for unusual token consumption or request patterns in your dashboard.",
                  },
                  {
                    num: "05",
                    title: "Sanitize user inputs",
                    desc: "Always validate and sanitize prompts built from user input to prevent prompt injection.",
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 card-hover group"
                  >
                    <span className="text-lg font-black mono text-zinc-200 dark:text-zinc-700 group-hover:text-sky-400 transition-colors duration-200 flex-shrink-0 leading-none mt-0.5">
                      {item.num}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{item.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs font-semibold mono mb-4">
                <FaClipboardCheck className="w-3 h-3" />
                FAQ
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3">
                Security Questions
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Common questions about our security practices.
              </p>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150"
                    >
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">{faq.q}</span>
                      <FaChevronDown
                        className={`w-3 h-3 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${expandedFaq === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className="faq-content"
                      style={{
                        maxHeight: expandedFaq === idx ? "300px" : "0",
                        opacity: expandedFaq === idx ? 1 : 0,
                      }}
                    >
                      <div className="px-4 pb-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl" />
                <div className="relative w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-sky-500/25">
                  <FaEnvelope className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3">
                Have a Security Concern?
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Our security team is available around the clock. For vulnerabilities, use our
                responsible disclosure channel. For general questions, reach us anytime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="mailto:security@aichixia.xyz"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 transition-all duration-200"
                >
                  <FaShieldAlt className="w-3.5 h-3.5" />
                  Report a Vulnerability
                </a>
                <a
                  href="mailto:contact@aichixia.xyz"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 transition-all duration-200"
                >
                  <FaEnvelope className="w-3.5 h-3.5" />
                  General Inquiry
                </a>
              </div>
              <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600 mono">
                security@aichixia.xyz · response within 48h
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Link href="/" className="inline-flex items-center gap-1.5 group">
                <FaTerminal className="w-4 h-4 text-sky-500 group-hover:text-cyan-400 transition-colors duration-200" />
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">Aichixia</h3>
                  <p className="text-[10px] text-zinc-500">AI API Platform</p>
                </div>
              </Link>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                © {new Date().getFullYear()} Aichixia. All rights reserved.
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {[
                  { href: "mailto:contact@aichixia.xyz", label: "Contact" },
                  { href: "/privacy", label: "Privacy" },
                  { href: "/terms", label: "Terms" },
                  { href: "/security", label: "Security" },
                ].map((l, i, arr) => (
                  <span key={l.label} className="flex items-center gap-2">
                    {l.href.startsWith("mailto") ? (
                      <a href={l.href} className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={`text-[10px] sm:text-xs transition-colors duration-200 ${l.href === "/security" ? "text-sky-500 dark:text-sky-400" : "text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400"}`}>
                        {l.label}
                      </Link>
                    )}
                    {i < arr.length - 1 && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
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
