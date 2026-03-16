import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FaTerminal, FaShieldAlt, FaBars, FaTimes, FaDatabase,
  FaEye, FaLock, FaUserCheck, FaGlobe, FaEnvelope,
  FaCheck, FaBolt, FaChevronRight, FaArrowRight
} from 'react-icons/fa';

const LAST_UPDATED = 'March 2025';

const SECTIONS = [
  {
    id: 'collection',
    num: '01',
    icon: FaDatabase,
    accent: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-950/20',
    accentBorder: 'border-blue-200 dark:border-blue-900/40',
    accentDot: 'bg-blue-500',
    title: 'Information We Collect',
    summary: 'What data we gather when you use Aichixia.',
    items: [
      {
        heading: 'Account Data',
        body: 'When you register, we collect your email address, display name, and optional avatar URL. This is stored securely and used solely to identify your account and personalize your experience on the platform.',
      },
      {
        heading: 'API Usage Metadata',
        body: 'We log metadata about your API requests — model used, endpoint, HTTP status, latency, token count, and IP address. This data powers rate limiting, billing, abuse prevention, and the activity dashboard.',
      },
      {
        heading: 'Technical Data',
        body: 'We automatically collect browser user agent strings, request timestamps, and session tokens to debug issues and maintain the security and reliability of the platform.',
      },
    ],
  },
  {
    id: 'usage',
    num: '02',
    icon: FaEye,
    accent: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-50 dark:bg-purple-950/20',
    accentBorder: 'border-purple-200 dark:border-purple-900/40',
    accentDot: 'bg-purple-500',
    title: 'How We Use Your Data',
    summary: 'The purposes behind every data point we process.',
    items: [
      {
        heading: 'Service Operation',
        body: 'Your data authenticates requests, enforces plan-based rate limits, populates your analytics dashboard, and maintains the integrity of the API console.',
      },
      {
        heading: 'Communication',
        body: 'We use your email for critical service notifications and security alerts only. We do not send marketing emails without your explicit consent.',
      },
      {
        heading: 'Platform Improvement',
        body: 'Aggregated, anonymized usage data helps us understand performance and improve our models and infrastructure. Individual data is never sold to third parties.',
      },
    ],
  },
  {
    id: 'storage',
    num: '03',
    icon: FaLock,
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    accentBorder: 'border-emerald-200 dark:border-emerald-900/40',
    accentDot: 'bg-emerald-500',
    title: 'Storage & Security',
    summary: 'How we keep your data safe and for how long.',
    items: [
      {
        heading: 'Infrastructure',
        body: 'All data lives on Supabase infrastructure with PostgreSQL databases. Data is encrypted at rest and in transit using TLS 1.3 protocols.',
      },
      {
        heading: 'API Key Hashing',
        body: 'API keys are hashed before storage. The full key is only shown once at creation and cannot be retrieved. We store only a short prefix for identification.',
      },
      {
        heading: 'Retention Policy',
        body: 'Request logs are kept for 90 days. Account data is retained for the lifetime of your account. Upon deletion, all personal data is purged within 30 days.',
      },
    ],
  },
  {
    id: 'rights',
    num: '04',
    icon: FaUserCheck,
    accent: 'text-yellow-600 dark:text-yellow-400',
    accentBg: 'bg-yellow-50 dark:bg-yellow-950/20',
    accentBorder: 'border-yellow-200 dark:border-yellow-900/40',
    accentDot: 'bg-yellow-500',
    title: 'Your Rights',
    summary: 'Access, correct, or delete your data at any time.',
    items: [
      {
        heading: 'Access & Portability',
        body: 'Request a full export of your account data through Settings. We provide it in machine-readable JSON format within 7 business days.',
      },
      {
        heading: 'Correction & Deletion',
        body: 'Update your profile at any time from Settings. You may request complete account deletion, which permanently removes all associated data from our systems.',
      },
      {
        heading: 'Right to Object',
        body: 'You may object to any processing of your personal data. Contact us and we will address your concern promptly and transparently.',
      },
    ],
  },
  {
    id: 'sharing',
    num: '05',
    icon: FaGlobe,
    accent: 'text-orange-600 dark:text-orange-400',
    accentBg: 'bg-orange-50 dark:bg-orange-950/20',
    accentBorder: 'border-orange-200 dark:border-orange-900/40',
    accentDot: 'bg-orange-500',
    title: 'Data Sharing',
    summary: 'We never sell data. Period.',
    items: [
      {
        heading: 'No Sale of Data',
        body: 'We never sell, rent, or trade your personal information to third parties for commercial purposes. Your data is your data.',
      },
      {
        heading: 'Service Providers',
        body: 'We use Supabase for databases and Vercel for hosting. These providers process data on our behalf under strict data processing agreements.',
      },
      {
        heading: 'Legal Requirements',
        body: 'We may disclose information if required by law or court order. We will notify affected users to the extent permitted by law.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('collection');
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
        @keyframes fadeInLeft {
          from { opacity:0; transform:translateX(-12px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes progressGrow {
          from { opacity:0; }
          to   { opacity:1; }
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
        .prv-hero { animation: heroIn 0.55s cubic-bezier(0.22,1,0.36,1) both 0.05s; }
        .prv-orbit { animation: orbitSpin 14s linear infinite; }
        .prv-glow { animation: glowPulse 3s ease-in-out infinite; }
        .prv-expand { animation: expandDown 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .prv-fade {
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .prv-fade.visible { opacity:1; transform:translateY(0); }
        .stat-card {
          transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
        .dark .stat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .acc-icon {
          transition: transform 280ms cubic-bezier(0.34,1.56,0.64,1);
        }
        .acc-chevron {
          transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1);
        }
        .acc-chevron.open { transform: rotate(90deg); }
        .section-card {
          transition: border-color 250ms, box-shadow 250ms;
        }
        .section-btn { transition: background 180ms; }
        .section-btn:hover { background: rgba(0,0,0,0.02); }
        .dark .section-btn:hover { background: rgba(255,255,255,0.03); }
      `}} />

      <Head>
        <title>Privacy Policy — Aichixia</title>
        <meta name="description" content="Aichixia Privacy Policy — how we collect, use, and protect your data." />
      </Head>

      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 60,
          background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #a855f7)',
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
                <Link href="/" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  Home
                </Link>
                <Link href="/docs" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  Docs
                </Link>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <Link href="/console" className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all duration-200">
                  Console
                </Link>
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

        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-black dark:to-cyan-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%)]" />
          <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
            <div className="text-center space-y-4 prv-hero">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="prv-glow absolute inset-0 -m-4 rounded-full bg-blue-400/10 dark:bg-blue-500/10 pointer-events-none" />
                  <div className="prv-orbit absolute inset-0 -m-3 rounded-full border border-dashed border-blue-400/20 dark:border-blue-500/20 pointer-events-none" />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <FaShieldAlt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <FaBolt className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Updated {LAST_UPDATED}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                Privacy <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Policy</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                How Aichixia collects, uses, and protects your data — transparent and plain language, no legalese.
              </p>

              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
                {[
                  { dot: 'bg-emerald-500', label: 'Data Never Sold' },
                  { dot: 'bg-blue-500', label: 'TLS 1.3 Encrypted' },
                  { dot: 'bg-purple-500', label: '90-Day Log Retention' },
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

          <div
            ref={setRef('stats')}
            className={`prv-fade grid grid-cols-3 gap-2 sm:gap-3 mb-8 sm:mb-10 ${visible['stats'] ? 'visible' : ''}`}
          >
            {[
              { value: 'Never', label: 'Data sold', color: 'text-emerald-600 dark:text-emerald-400' },
              { value: 'TLS 1.3', label: 'Encryption', color: 'text-blue-600 dark:text-blue-400' },
              { value: '90 days', label: 'Log retention', color: 'text-purple-600 dark:text-purple-400' },
            ].map(s => (
              <div key={s.label} className="stat-card p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center">
                <p className={`text-base sm:text-xl font-black tracking-tight mb-1 ${s.color}`}>{s.value}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-8 sm:mb-10">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              const isOpen = expandedSection === sec.id;
              return (
                <div
                  key={sec.id}
                  ref={setRef(sec.id)}
                  className={`prv-fade section-card rounded-xl border overflow-hidden bg-white dark:bg-zinc-950 ${
                    isOpen ? 'border-zinc-300 dark:border-zinc-700 shadow-sm' : 'border-zinc-200 dark:border-zinc-800'
                  } ${visible[sec.id] ? 'visible' : ''}`}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <button
                    className="section-btn w-full flex items-center gap-3 p-3.5 sm:p-4 text-left"
                    onClick={() => setExpandedSection(isOpen ? null : sec.id)}
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${sec.accentBg} ${sec.accentBorder}`}
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
                    <div className="prv-expand px-3.5 sm:px-4 pb-4">
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-3.5" />
                      <div className="space-y-3.5">
                        {sec.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center border ${sec.accentBg} ${sec.accentBorder}`}>
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

          <div ref={setRef('contact')} className={`prv-fade ${visible['contact'] ? 'visible' : ''}`} style={{ transitionDelay: '80ms' }}>
            <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 flex items-start gap-3 sm:gap-4 mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1">Privacy questions?</p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Reach us at{' '}
                  <a href="mailto:contact@aichixia.xyz" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    contact@aichixia.xyz
                  </a>
                  {' '}— we respond within 48 hours on business days.
                </p>
              </div>
            </div>
          </div>

          <div ref={setRef('footer')} className={`prv-fade pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 ${visible['footer'] ? 'visible' : ''}`} style={{ transitionDelay: '120ms' }}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} Aichixia. All rights reserved.</p>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/terms" className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service <FaArrowRight className="w-2.5 h-2.5" />
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
