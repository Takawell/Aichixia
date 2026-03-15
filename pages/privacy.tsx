import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FaTerminal, FaShieldAlt, FaArrowLeft, FaChevronDown, FaChevronRight,
  FaDatabase, FaEye, FaLock, FaUserCheck, FaGlobe, FaEnvelope,
  FaCheck, FaBolt, FaExternalLinkAlt, FaArrowRight
} from 'react-icons/fa';

const LAST_UPDATED = 'March 16, 2025';

const SECTIONS = [
  {
    id: 'collection',
    num: '01',
    icon: FaDatabase,
    color: 'from-blue-500 to-cyan-500',
    accent: '#3b82f6',
    title: 'Information We Collect',
    summary: 'What data we gather and why.',
    items: [
      {
        title: 'Account Data',
        body: 'When you register, we collect your email address, display name, and optional avatar URL. This is stored securely and used solely to identify your account and personalize your experience.',
      },
      {
        title: 'API Usage Metadata',
        body: 'We log metadata about your API requests — model used, endpoint, HTTP status, latency, token count, and IP address. This data powers rate limiting, billing, abuse prevention, and your activity dashboard.',
      },
      {
        title: 'Technical Data',
        body: 'We automatically collect browser user agent strings, request timestamps, and session tokens to debug issues and maintain platform security and reliability.',
      },
    ],
  },
  {
    id: 'usage',
    num: '02',
    icon: FaEye,
    color: 'from-purple-500 to-pink-500',
    accent: '#a855f7',
    title: 'How We Use Your Data',
    summary: 'The purpose behind every data point.',
    items: [
      {
        title: 'Service Operation',
        body: 'Your data authenticates requests, enforces plan-based rate limits, populates your analytics dashboard, and maintains console integrity.',
      },
      {
        title: 'Communication',
        body: 'We use your email for critical service notifications and security alerts only. We never send marketing emails without your explicit consent.',
      },
      {
        title: 'Platform Improvement',
        body: 'Aggregated, anonymized usage data helps us understand performance and improve models and infrastructure. Individual data is never sold.',
      },
    ],
  },
  {
    id: 'storage',
    num: '03',
    icon: FaLock,
    color: 'from-green-500 to-emerald-500',
    accent: '#22c55e',
    title: 'Storage & Security',
    summary: 'How we keep your data safe.',
    items: [
      {
        title: 'Infrastructure',
        body: 'All data lives on Supabase with PostgreSQL databases. Data is encrypted at rest and in transit using TLS 1.3 protocols.',
      },
      {
        title: 'API Key Hashing',
        body: 'API keys are hashed before storage. The full key is shown only once at creation. We store only a short prefix for identification purposes.',
      },
      {
        title: 'Retention Policy',
        body: 'Request logs are kept for 90 days. Account data is retained for the lifetime of your account. Upon deletion, all personal data is purged within 30 days.',
      },
    ],
  },
  {
    id: 'rights',
    num: '04',
    icon: FaUserCheck,
    color: 'from-yellow-500 to-orange-500',
    accent: '#f59e0b',
    title: 'Your Rights',
    summary: 'Access, correct, or delete your data.',
    items: [
      {
        title: 'Access & Portability',
        body: 'Request a full export of your account data through Settings. We provide machine-readable JSON within 7 business days.',
      },
      {
        title: 'Correction & Deletion',
        body: 'Update your profile at any time from Settings. You may request complete account deletion — all data is permanently removed.',
      },
      {
        title: 'Right to Object',
        body: 'You may object to any processing of your personal data. Contact us and we will address your concern promptly and transparently.',
      },
    ],
  },
  {
    id: 'sharing',
    num: '05',
    icon: FaGlobe,
    color: 'from-red-500 to-rose-500',
    accent: '#ef4444',
    title: 'Data Sharing',
    summary: 'We never sell data. Period.',
    items: [
      {
        title: 'No Sale of Data',
        body: 'We never sell, rent, or trade your personal information to third parties for commercial purposes. Your data is your data.',
      },
      {
        title: 'Service Providers',
        body: 'We use Supabase for databases and Vercel for hosting. These providers process data under strict data processing agreements.',
      },
      {
        title: 'Legal Requirements',
        body: 'We may disclose information if required by law or court order. We will notify affected users to the extent permitted by law.',
      },
    ],
  },
];

const HIGHLIGHTS = [
  { icon: FaBolt, label: 'Data sold', value: 'Never', color: 'text-green-500' },
  { icon: FaLock, label: 'Encryption', value: 'TLS 1.3', color: 'text-blue-500' },
  { icon: FaDatabase, label: 'Log retention', value: '90 days', color: 'text-purple-500' },
];

export default function PrivacyPage() {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>('collection');
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('data-id') || '';
            setVisible(prev => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.08 }
    );
    Object.values(refs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
    if (el && !el.getAttribute('data-id')) el.setAttribute('data-id', id);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-50px) scale(1.1); }
          66%      { transform: translate(-20px,20px) scale(0.9); }
        }
        @keyframes orbitSpin {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity:.3; transform:scale(1); }
          50%     { opacity:.7; transform:scale(1.12); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes expandSection {
          from { opacity:0; transform:translateY(-6px); max-height:0; }
          to   { opacity:1; transform:translateY(0); max-height:800px; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .orbit-spin { animation: orbitSpin 16s linear infinite; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
        .section-expand { animation: expandSection 0.35s cubic-bezier(0.22,1,0.36,1) both; overflow:hidden; }
        .prv-fade { opacity:0; transform:translateY(20px); transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1); }
        .prv-fade.in { opacity:1; transform:translateY(0); }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #06b6d4, #a855f7);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .acc-chevron { transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1); }
        .acc-chevron.open { transform: rotate(180deg); }
        .section-icon-wrap { transition: transform 280ms cubic-bezier(0.34,1.56,0.64,1); }
        .section-icon-wrap.open { transform: scale(1.1) rotate(-5deg); }
        .prv-card {
          transition: border-color 250ms, box-shadow 250ms;
        }
        .prv-card:hover {
          border-color: rgba(59,130,246,0.25) !important;
        }
        .prv-btn {
          transition: background 180ms, transform 150ms;
        }
        .prv-btn:hover { background: rgba(59,130,246,0.06); }
        .prv-btn:active { transform: scale(0.99); }
        .highlight-card {
          transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms;
        }
        .highlight-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }
        .dark .highlight-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        .progress-bar {
          position: fixed; top:0; left:0; right:0; height:2px; z-index:60;
          background: linear-gradient(90deg, #3b82f6, #06b6d4, #a855f7);
          transform-origin: left;
          transition: transform 80ms linear;
        }
      `}} />

      <Head>
        <title>Privacy Policy — Aichixia</title>
        <meta name="description" content="Aichixia Privacy Policy — how we collect, use, and protect your data." />
        <meta name="robots" content="index, follow" />
      </Head>

      <div
        className="progress-bar"
        style={{ transform: `scaleX(${Math.min(scrollY / (typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1), 1)})` }}
      />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-15 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-15 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 dark:bg-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-15 animate-blob animation-delay-4000" />
      </div>

      <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">

        <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrollY > 20
            ? 'border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-black/85 backdrop-blur-xl shadow-sm'
            : 'border-transparent bg-transparent'
        }`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>

              <Link href="/" className="flex items-center gap-1.5">
                <FaTerminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Aichixia</span>
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">

          <div
            ref={setRef('hero')}
            className={`prv-fade pt-10 sm:pt-14 pb-8 sm:pb-10 text-center ${visible['hero'] ? 'in' : ''}`}
          >
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="glow-pulse absolute inset-0 -m-4 rounded-full bg-blue-500/10 dark:bg-blue-400/10" />
                <div className="orbit-spin absolute inset-0 -m-3 rounded-full border border-dashed border-blue-400/25 dark:border-blue-500/20" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <FaShieldAlt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 mb-4">
              <FaBolt className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300">Updated {LAST_UPDATED}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3 leading-tight">
              Privacy{' '}
              <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              How Aichixia collects, uses, and protects your data — transparent and plain language.
            </p>
          </div>

          <div
            ref={setRef('highlights')}
            className={`prv-fade grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 ${visible['highlights'] ? 'in' : ''}`}
            style={{ transitionDelay: '60ms' }}
          >
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.label}
                className="highlight-card bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 text-center"
              >
                <h.icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 ${h.color}`} />
                <p className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{h.value}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">{h.label}</p>
              </div>
            ))}
          </div>

          <div
            ref={setRef('sections')}
            className={`prv-fade space-y-2 mb-8 ${visible['sections'] ? 'in' : ''}`}
            style={{ transitionDelay: '100ms' }}
          >
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              const isOpen = openSection === sec.id;
              return (
                <div
                  key={sec.id}
                  className={`prv-card bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden ${
                    isOpen
                      ? 'border-zinc-200 dark:border-zinc-700 shadow-lg dark:shadow-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  <button
                    className="prv-btn w-full flex items-center gap-3 p-3.5 sm:p-4 text-left"
                    onClick={() => setOpenSection(isOpen ? null : sec.id)}
                  >
                    <div className={`section-icon-wrap w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${sec.color} flex items-center justify-center flex-shrink-0 shadow-sm ${isOpen ? 'open' : ''}`}>
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">{sec.num}</span>
                        <span className={`text-sm sm:text-base font-bold tracking-tight transition-colors duration-200 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-white'}`}>
                          {sec.title}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{sec.summary}</p>
                    </div>

                    <FaChevronDown className={`acc-chevron w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 ${isOpen ? 'open' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="section-expand px-3.5 sm:px-4 pb-4">
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-3.5" />
                      <div className="space-y-3.5">
                        {sec.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <div
                              className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                              style={{ background: `${sec.accent}18`, border: `1px solid ${sec.accent}35` }}
                            >
                              <FaCheck className="w-2 h-2" style={{ color: sec.accent }} />
                            </div>
                            <div>
                              <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: sec.accent }}>
                                {item.title}
                              </p>
                              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {item.body}
                              </p>
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

          <div
            ref={setRef('contact')}
            className={`prv-fade ${visible['contact'] ? 'in' : ''}`}
            style={{ transitionDelay: '120ms' }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FaEnvelope className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1">Privacy questions?</p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Reach us at{' '}
                  <a
                    href="mailto:contact@aichixia.xyz"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    contact@aichixia.xyz
                  </a>
                  {' '}— we respond within 48 hours on business days.
                </p>
              </div>
            </div>
          </div>

          <div
            ref={setRef('footer')}
            className={`prv-fade pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400 ${visible['footer'] ? 'in' : ''}`}
            style={{ transitionDelay: '140ms' }}
          >
            <p>© {new Date().getFullYear()} Aichixia. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link
                href="/terms"
                className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Terms of Service
                <FaArrowRight className="w-2.5 h-2.5" />
              </Link>
              <span>·</span>
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                Home
                <FaExternalLinkAlt className="w-2 h-2" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
