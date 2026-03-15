import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FiShield, FiArrowLeft, FiChevronRight, FiDatabase, FiEye,
  FiLock, FiUserCheck, FiGlobe, FiMail, FiArrowRight,
  FiCheck, FiZap
} from 'react-icons/fi';

const LAST_UPDATED = 'March 2025';

const SECTIONS = [
  {
    id: 'collection',
    icon: FiDatabase,
    accent: '#38bdf8',
    label: '01',
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
    icon: FiEye,
    accent: '#a78bfa',
    label: '02',
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
    icon: FiLock,
    accent: '#34d399',
    label: '03',
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
    icon: FiUserCheck,
    accent: '#fbbf24',
    label: '04',
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
    icon: FiGlobe,
    accent: '#fb923c',
    label: '05',
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

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return progress;
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);
  return scrolled;
}

function useInView(ref: React.RefObject<HTMLElement>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SectionCard({ sec, index }: { sec: typeof SECTIONS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);
  const Icon = sec.icon;

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms`,
      }}
    >
      <div
        className="privacy-card"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: open ? `1px solid ${sec.accent}28` : '1px solid var(--pc-border)',
          transition: 'border-color 300ms, box-shadow 300ms',
          boxShadow: open ? `0 8px 32px ${sec.accent}0d` : 'none',
        }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: `${sec.accent}14`,
            border: `1px solid ${sec.accent}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 250ms cubic-bezier(0.34,1.56,0.64,1), background 250ms',
            transform: open ? 'scale(1.08) rotate(-3deg)' : 'scale(1)',
          }}>
            <Icon style={{ fontSize: 17, color: sec.accent }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: sec.accent, letterSpacing: '0.08em', opacity: 0.7 }}>
                {sec.label}
              </span>
              <span
                className="privacy-title"
                style={{
                  fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                  color: open ? sec.accent : 'var(--pc-text)',
                  transition: 'color 250ms',
                }}
              >
                {sec.title}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--pc-muted)', margin: 0, lineHeight: 1.4 }}>
              {sec.summary}
            </p>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: open ? `${sec.accent}18` : 'var(--pc-tag)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 250ms, transform 350ms cubic-bezier(0.34,1.56,0.64,1)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}>
            <FiChevronRight style={{ fontSize: 13, color: open ? sec.accent : 'var(--pc-muted)' }} />
          </div>
        </button>

        {open && (
          <div
            style={{
              padding: '0 18px 18px',
              animation: 'pcExpand 0.3s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <div style={{ height: 1, background: `linear-gradient(90deg, ${sec.accent}30, transparent)`, marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sec.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    background: `${sec.accent}14`, border: `1px solid ${sec.accent}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiCheck style={{ fontSize: 10, color: sec.accent }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: sec.accent, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.heading}
                    </p>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--pc-sub)', margin: 0 }}>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const router = useRouter();
  const scrolled = useScrolled();
  const progress = useScrollProgress();

  return (
    <div className="privacy-root" style={{ minHeight: '100vh' }}>
      <style>{`
        .privacy-root {
          background: var(--pc-bg);
          color: var(--pc-text);
          transition: background 300ms, color 300ms;
        }
        :root {
          --pc-bg: #fafafa;
          --pc-surface: #ffffff;
          --pc-border: rgba(0,0,0,0.08);
          --pc-text: #0f0f10;
          --pc-sub: #3f3f46;
          --pc-muted: #a1a1aa;
          --pc-tag: rgba(0,0,0,0.05);
          --pc-header: rgba(250,250,250,0.88);
        }
        .dark .privacy-root, .dark.privacy-root {
          --pc-bg: #08090d;
          --pc-surface: #111116;
          --pc-border: rgba(255,255,255,0.08);
          --pc-text: rgba(255,255,255,0.92);
          --pc-sub: rgba(255,255,255,0.6);
          --pc-muted: rgba(255,255,255,0.3);
          --pc-tag: rgba(255,255,255,0.06);
          --pc-header: rgba(8,9,13,0.88);
        }
        @keyframes pcExpand {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pcHeroIn {
          from { opacity:0; transform:translateY(20px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pcOrbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pcGlow {
          0%,100% { opacity:.35; transform:scale(1); }
          50%     { opacity:.7;  transform:scale(1.1); }
        }
        @keyframes pcProgress {
          from { opacity:0; }
          to   { opacity:1; }
        }
        .pc-hero { animation: pcHeroIn 0.6s cubic-bezier(0.22,1,0.36,1) both 0.05s; }
        .pc-orbit { animation: pcOrbit 14s linear infinite; }
        .pc-glow  { animation: pcGlow 3.5s ease-in-out infinite; }
        .pc-progress-bar { animation: pcProgress 0.3s ease both; }
        .privacy-card { background: var(--pc-surface); }
        .pc-back {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 11px; border-radius: 9px; border: none;
          background: transparent; cursor: pointer;
          font-size: 13px; font-weight: 600;
          color: var(--pc-muted);
          transition: color 180ms, background 180ms;
        }
        .pc-back:hover { color: var(--pc-text); background: var(--pc-tag); }
        .pc-contact-link {
          color: #38bdf8; text-decoration: none; font-weight: 600;
          transition: opacity 150ms;
        }
        .pc-contact-link:hover { opacity: 0.75; }
        @media (max-width: 480px) {
          .pc-hero h1 { font-size: 26px !important; }
        }
      `}</style>

      <div
        className="pc-progress-bar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 60,
          background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
          width: `${progress}%`,
          transition: 'width 60ms linear',
          transformOrigin: 'left',
        }}
      />

      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        backgroundColor: scrolled ? 'var(--pc-header)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--pc-border)' : '1px solid transparent',
        transition: 'background-color 300ms, border-color 300ms, backdrop-filter 300ms',
        padding: '11px 20px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="pc-back" onClick={() => router.back()}>
            <FiArrowLeft style={{ fontSize: 13 }} />
            Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pc-muted)' }}>Aichixia</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px 80px' }}>

        <div className="pc-hero" style={{ padding: '44px 0 36px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{ position: 'relative', width: 60, height: 60 }}>
              <div className="pc-glow" style={{
                position: 'absolute', inset: -12, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div className="pc-orbit" style={{
                position: 'absolute', inset: -5, borderRadius: '50%',
                border: '1px dashed rgba(56,189,248,0.22)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(56,189,248,0.09)',
                border: '1.5px solid rgba(56,189,248,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiShield style={{ fontSize: 24, color: '#38bdf8' }} />
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: 'var(--pc-muted)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 18px' }}>
            How Aichixia collects, uses, and protects your data — no legalese.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 99, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.16)' }}>
            <FiZap style={{ fontSize: 10, color: '#38bdf8' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8' }}>Updated {LAST_UPDATED}</span>
          </div>
        </div>

        <AnimatedSection delay={0}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 8, marginBottom: 28,
          }}>
            {[
              { label: 'Data sold?', value: 'Never', color: '#34d399' },
              { label: 'Log retention', value: '90 days', color: '#38bdf8' },
              { label: 'Encryption', value: 'TLS 1.3', color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--pc-surface)',
                border: '1px solid var(--pc-border)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: stat.color, margin: '0 0 3px', letterSpacing: '-0.02em' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 11, color: 'var(--pc-muted)', margin: 0, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {SECTIONS.map((sec, i) => (
            <SectionCard key={sec.id} sec={sec} index={i} />
          ))}
        </div>

        <AnimatedSection delay={80}>
          <div style={{
            padding: '20px 22px', borderRadius: 16,
            background: 'var(--pc-surface)',
            border: '1px solid var(--pc-border)',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiMail style={{ fontSize: 15, color: '#38bdf8' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: 'var(--pc-text)' }}>
                Privacy questions?
              </p>
              <p style={{ fontSize: 12, color: 'var(--pc-muted)', margin: 0, lineHeight: 1.6 }}>
                Reach us at{' '}
                <a href="mailto:contact@aichixia.xyz" className="pc-contact-link">
                  contact@aichixia.xyz
                </a>
                {' '}— we respond within 48 hours on business days.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={120}>
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--pc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--pc-muted)', margin: 0 }}>
              © {new Date().getFullYear()} Aichixia. All rights reserved.
            </p>
            <Link href="/terms" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#38bdf8', textDecoration: 'none', opacity: 0.85, transition: 'opacity 150ms' }}>
              Terms of Service
              <FiArrowRight style={{ fontSize: 11 }} />
            </Link>
          </div>
        </AnimatedSection>

      </main>
    </div>
  );
}
