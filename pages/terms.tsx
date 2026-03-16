import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FaTerminal, FaFileAlt, FaBars, FaTimes, FaCheck, FaTimes as FaX,
  FaBolt, FaChevronRight, FaArrowRight, FaEnvelope, FaShieldAlt,
  FaClock, FaUserCheck, FaBan, FaExclamationTriangle
} from 'react-icons/fa';

const LAST_UPDATED = 'March 2025';

const QUICK = [
  { ok: true,  text: 'Build apps & products within plan limits' },
  { ok: true,  text: 'Use for personal or commercial purposes' },
  { ok: true,  text: 'Keep API keys secure and private' },
  { ok: false, text: 'No illegal or abusive content generation' },
  { ok: false, text: 'No sharing or reselling API keys' },
  { ok: false, text: 'No circumventing rate limits' },
];

const SECTIONS = [
  {
    id: 'acceptance',
    num: '01',
    icon: FaFileAlt,
    accent: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-950/20',
    accentBorder: 'border-blue-200 dark:border-blue-900/40',
    title: 'Acceptance of Terms',
    summary: 'Using Aichixia means you agree to these terms.',
    items: [
      { heading: 'Agreement', body: 'By accessing or using the Aichixia API platform, you agree to be bound by these Terms of Service. If you do not agree, you may not access or use the Service.' },
      { heading: 'Eligibility', body: 'You must be at least 13 years of age to use this Service. By using it, you represent you meet this requirement and have the legal capacity to enter into these terms.' },
      { heading: 'Updates', body: 'We may modify these terms at any time. Continued use after changes constitutes acceptance. We will notify you of material changes via email or in-console notice.' },
    ],
  },
  {
    id: 'permitted',
    num: '02',
    icon: FaUserCheck,
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    accentBorder: 'border-emerald-200 dark:border-emerald-900/40',
    title: 'Permitted Use',
    summary: 'What you can build and do with the platform.',
    items: [
      { heading: 'Allowed Uses', body: 'Build applications, automate workflows, conduct research, and create personal or commercial products — subject to applicable rate limits and plan restrictions.' },
      { heading: 'API Keys', body: 'Each API key is tied to your account and may not be shared. You are responsible for all activity under your keys. Revoke compromised keys immediately via the console.' },
      { heading: 'Fair Use', body: 'Usage must stay within your plan limits. Attempting to circumvent rate limits, reverse-engineer the API, or access other accounts is strictly prohibited.' },
    ],
  },
  {
    id: 'prohibited',
    num: '03',
    icon: FaBan,
    accent: 'text-red-600 dark:text-red-400',
    accentBg: 'bg-red-50 dark:bg-red-950/20',
    accentBorder: 'border-red-200 dark:border-red-900/40',
    title: 'Prohibited Activities',
    summary: 'These actions result in immediate termination.',
    items: [
      { heading: 'Illegal Content', body: 'Do not use the Service to generate, distribute, or facilitate content that is unlawful, harmful, threatening, abusive, harassing, or defamatory under applicable law.' },
      { heading: 'Security Violations', body: 'Probing or testing vulnerabilities, launching denial of service attacks, or attempting to gain unauthorized access to any part of the Service is forbidden.' },
      { heading: 'Model Abuse', body: 'Using the API to generate malware, exploit code, CSAM, or content designed to facilitate real-world harm is prohibited and may be reported to authorities.' },
    ],
  },
  {
    id: 'availability',
    num: '04',
    icon: FaClock,
    accent: 'text-yellow-600 dark:text-yellow-400',
    accentBg: 'bg-yellow-50 dark:bg-yellow-950/20',
    accentBorder: 'border-yellow-200 dark:border-yellow-900/40',
    title: 'Service Availability',
    summary: 'Uptime, rate limits, and plan changes.',
    items: [
      { heading: 'Uptime', body: 'We strive for high availability but do not guarantee uninterrupted access. The Service is provided "as is". Scheduled maintenance is communicated in advance.' },
      { heading: 'Rate Limits', body: 'Your plan determines daily API request limits. Exceeding limits returns HTTP 429. Limits reset daily at midnight UTC.' },
      { heading: 'Plan Changes', body: 'We reserve the right to modify pricing tiers or features. Active plan holders receive at least 14 days notice before any adverse changes.' },
    ],
  },
  {
    id: 'liability',
    num: '05',
    icon: FaShieldAlt,
    accent: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-50 dark:bg-purple-950/20',
    accentBorder: 'border-purple-200 dark:border-purple-900/40',
    title: 'Liability & Warranties',
    summary: 'Limitations on our legal responsibility.',
    items: [
      { heading: 'Disclaimer', body: 'The Service is provided without warranties of any kind. We do not warrant that the Service will be error-free, secure, or meet your specific requirements.' },
      { heading: 'Limitation of Liability', body: 'To the maximum extent permitted by law, Aichixia shall not be liable for any indirect, incidental, consequential, or punitive damages from your use of the Service.' },
      { heading: 'Indemnification', body: 'You agree to indemnify Aichixia and its affiliates from claims, damages, or expenses arising from your violation of these Terms or use of the Service.' },
    ],
  },
  {
    id: 'termination',
    num: '06',
    icon: FaExclamationTriangle,
    accent: 'text-orange-600 dark:text-orange-400',
    accentBg: 'bg-orange-50 dark:bg-orange-950/20',
    accentBorder: 'border-orange-200 dark:border-orange-900/40',
    title: 'Termination',
    summary: 'How and when accounts can be closed.',
    items: [
      { heading: 'By You', body: 'You may terminate your account at any time through Settings. Termination removes access to the Service but does not entitle you to any refund of prepaid fees.' },
      { heading: 'By Us', body: 'We may suspend or terminate your account immediately for violations of these Terms. We may also close accounts for extended inactivity.' },
      { heading: 'Effect of Termination', body: 'Upon termination, your right to use the Service ceases immediately. Sections on liability, indemnification, and dispute resolution survive termination.' },
    ],
  },
];

export default function TermsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('acceptance');
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    Object.entries(sectionRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(prev => ({ ...prev, [id]: true })); },
        { threshold: 0.08 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const setRef = (id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes heroIn {
          from { opacity:0; transform:translateY(24px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes orbitSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes glowPulse { 0%,100%{opacity:.3;} 50%{opacity:.7;} }
        @keyframes expandDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes quickIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .trm-hero { animation: heroIn 0.55s cubic-bezier(0.22,1,0.36,1) both 0.05s; }
        .trm-orbit { animation: orbitSpin 14s linear infinite; }
        .trm-glow { animation: glowPulse 3s ease-in-out infinite; }
        .trm-expand { animation: expandDown 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .trm-fade {
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .trm-fade.visible { opacity:1; transform:translateY(0); }
        .quick-item { animation: quickIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .quick-item:nth-child(1){animation-delay:0.10s;}
        .quick-item:nth-child(2){animation-delay:0.14s;}
        .quick-item:nth-child(3){animation-delay:0.18s;}
        .quick-item:nth-child(4){animation-delay:0.22s;}
        .quick-item:nth-child(5){animation-delay:0.26s;}
        .quick-item:nth-child(6){animation-delay:0.30s;}
        .section-card { transition: border-color 250ms, box-shadow 250ms; }
        .section-btn { transition: background 180ms; }
        .section-btn:hover { background: rgba(0,0,0,0.02); }
        .dark .section-btn:hover { background: rgba(255,255,255,0.03); }
        .acc-chevron { transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1); }
        .acc-chevron.open { transform: rotate(90deg); }
        .info-card { transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms; }
        .info-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .dark .info-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
      `}} />

      <Head>
        <title>Terms of Service — Aichixia</title>
        <meta name="description" content="Aichixia Terms of Service — the rules and conditions for using our platform." />
      </Head>

      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 60,
          background: 'linear-gradient(90deg, #f59e0b, #fb923c, #ef4444)',
          width: `${Math.min(scrollY / Math.max((typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1), 1) * 100, 100)}%`,
          transition: 'width 80ms linear',
        }}
      />

      <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">

        <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrollY > 20
            ? 'border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm'
            : 'border-transparent bg-transparent'
        }`}>
          <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <Link href="/" className="flex items-center gap-1.5 group">
                <FaTerminal className="w-4 h-4 text-blue-500 group-hover:text-cyan-500 transition-colors duration-200" />
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight">Aichixia</h1>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5">API Platform</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-0.5">
                <Link href="/" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">Home</Link>
                <Link href="/docs" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">Docs</Link>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <Link href="/console" className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all duration-200">Console</Link>
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                >
                  {mobileMenuOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <nav className="flex flex-col p-2 space-y-1">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">Home</Link>
                <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">Docs</Link>
                <Link href="/console" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200">Console</Link>
              </nav>
            </div>
          )}
        </header>

        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-yellow-950/20 dark:via-black dark:to-orange-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_70%)]" />
          <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
            <div className="text-center space-y-4 trm-hero">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="trm-glow absolute inset-0 -m-4 rounded-full bg-yellow-400/10 dark:bg-yellow-500/10 pointer-events-none" />
                  <div className="trm-orbit absolute inset-0 -m-3 rounded-full border border-dashed border-yellow-400/20 dark:border-yellow-500/20 pointer-events-none" />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <FaFileAlt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
                <FaBolt className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Updated {LAST_UPDATED}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                Terms of <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Service</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Simple, fair terms for using Aichixia. Know your rights and responsibilities clearly.
              </p>

              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
                {[
                  { dot: 'bg-blue-500', label: 'OpenAI Compatible' },
                  { dot: 'bg-emerald-500', label: 'Free Tier Available' },
                  { dot: 'bg-purple-500', label: '14-Day Notice Policy' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                    <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10">

          <div ref={setRef('quick')} className={`trm-fade mb-8 sm:mb-10 ${visible['quick'] ? 'visible' : ''}`}>
            <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Quick Summary</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {QUICK.map((q, i) => (
                  <div key={i} className="quick-item flex items-start gap-2.5">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                      {q.ok
                        ? <FaCheck className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
                        : <FaX className="w-2 h-2 text-red-600 dark:text-red-400" />
                      }
                    </div>
                    <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-snug font-medium">{q.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-8 sm:mb-10">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              const isOpen = expandedSection === sec.id;
              return (
                <div
                  key={sec.id}
                  ref={setRef(sec.id)}
                  className={`trm-fade section-card rounded-xl border overflow-hidden bg-white dark:bg-zinc-950 ${
                    isOpen ? 'border-zinc-300 dark:border-zinc-700 shadow-sm' : 'border-zinc-200 dark:border-zinc-800'
                  } ${visible[sec.id] ? 'visible' : ''}`}
                  style={{ transitionDelay: `${idx * 45}ms` }}
                >
                  <button
                    className="section-btn w-full flex items-center gap-3 p-3.5 sm:p-4 text-left"
                    onClick={() => setExpandedSection(isOpen ? null : sec.id)}
                  >
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ transition: 'transform 280ms cubic-bezier(0.34,1.56,0.64,1)', transform: isOpen ? 'scale(1.08) rotate(-4deg)' : 'scale(1)' }}
                    >
                      <Icon className={`w-4 h-4 ${sec.accent}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold ${sec.accent} opacity-60 tracking-widest`}>{sec.num}</span>
                        <span className={`text-sm sm:text-base font-bold tracking-tight transition-colors duration-200 ${isOpen ? sec.accent : 'text-zinc-900 dark:text-white'}`}>
                          {sec.title}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{sec.summary}</p>
                    </div>

                    <FaChevronRight className={`acc-chevron w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 ${isOpen ? 'open' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="trm-expand px-3.5 sm:px-4 pb-4">
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-3.5" />
                      <div className="space-y-3.5">
                        {sec.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                              <FaCheck className={`w-2 h-2 ${sec.accent}`} />
                            </div>
                            <div>
                              <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${sec.accent}`}>{item.heading}</p>
                              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div ref={setRef('bottom')} className={`trm-fade space-y-3 ${visible['bottom'] ? 'visible' : ''}`} style={{ transitionDelay: '80ms' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="info-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-2 mb-2">
                  <FaShieldAlt className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Governing Law</p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  These terms are governed by applicable laws. Disputes resolved through binding arbitration where permitted.
                </p>
              </div>
              <div className="info-card p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <FaEnvelope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Legal Questions?</p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Email{' '}
                  <a href="mailto:contact@aichixia.xyz" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    contact@aichixia.xyz
                  </a>
                  {' '}— we reply within 48 hours.
                </p>
              </div>
            </div>
          </div>

          <div ref={setRef('footer')} className={`trm-fade pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 ${visible['footer'] ? 'visible' : ''}`} style={{ transitionDelay: '120ms' }}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} Aichixia. All rights reserved.</p>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/privacy" className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy <FaArrowRight className="w-2.5 h-2.5" />
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <a href="mailto:contact@aichixia.xyz" className="text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Contact</a>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
