import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ThemeToggle from '@/components/ThemeToggle';
import { FiShield, FiArrowLeft, FiChevronDown, FiLock, FiEye, FiDatabase, FiUserCheck, FiMail, FiRefreshCw, FiGlobe } from 'react-icons/fi';

const SECTIONS = [
  {
    id: 'collection',
    icon: FiDatabase,
    title: 'Information We Collect',
    color: '#38bdf8',
    content: [
      {
        subtitle: 'Account Data',
        text: 'When you register, we collect your email address, display name, and optional avatar URL. This information is stored securely and used solely to identify your account and personalize your experience.',
      },
      {
        subtitle: 'API Usage Data',
        text: 'We log metadata about your API requests including model used, endpoint, HTTP status code, latency, token count, and IP address. This data is used for rate limiting, billing, abuse prevention, and service improvement.',
      },
      {
        subtitle: 'Technical Data',
        text: 'We automatically collect browser user agent strings, request timestamps, and session tokens. This helps us debug issues and maintain the security and reliability of the platform.',
      },
    ],
  },
  {
    id: 'usage',
    icon: FiEye,
    title: 'How We Use Your Data',
    color: '#a78bfa',
    content: [
      {
        subtitle: 'Service Operation',
        text: 'Your data is used to authenticate your requests, enforce rate limits based on your plan, display usage analytics in your dashboard, and maintain the integrity of the API console.',
      },
      {
        subtitle: 'Communication',
        text: 'We may use your email to send critical service notifications, security alerts, or updates about your account. We do not send marketing emails without your explicit consent.',
      },
      {
        subtitle: 'Improvement',
        text: 'Aggregated and anonymized usage data helps us understand platform performance and improve our models and infrastructure. Individual data is never sold to third parties.',
      },
    ],
  },
  {
    id: 'storage',
    icon: FiLock,
    title: 'Data Storage & Security',
    color: '#34d399',
    content: [
      {
        subtitle: 'Infrastructure',
        text: 'All data is stored on Supabase infrastructure with PostgreSQL databases. Data is encrypted at rest and in transit using industry-standard TLS 1.3 protocols.',
      },
      {
        subtitle: 'API Keys',
        text: 'API keys are hashed before storage. The full key is only shown once at creation time and cannot be retrieved afterwards. We store only a short prefix for identification purposes.',
      },
      {
        subtitle: 'Retention',
        text: 'Request logs are retained for 90 days for debugging and analytics. Account data is retained for the lifetime of your account. Upon deletion, all personal data is purged within 30 days.',
      },
    ],
  },
  {
    id: 'rights',
    icon: FiUserCheck,
    title: 'Your Rights',
    color: '#fbbf24',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You may request a complete export of your account data at any time through the Settings page. Your data will be provided in a machine-readable JSON format within 7 business days.',
      },
      {
        subtitle: 'Correction & Deletion',
        text: 'You can update your profile information at any time from the Settings page. You may also request complete account deletion, which permanently removes all associated data from our systems.',
      },
      {
        subtitle: 'Objection',
        text: 'You have the right to object to any processing of your personal data. Contact us at the address below and we will address your concern promptly and transparently.',
      },
    ],
  },
  {
    id: 'sharing',
    icon: FiGlobe,
    title: 'Data Sharing',
    color: '#f87171',
    content: [
      {
        subtitle: 'No Sale of Data',
        text: 'We never sell, rent, or trade your personal information to third parties for commercial purposes. Your data is your data.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We use Supabase as our database provider and Vercel for hosting. These providers process data on our behalf under strict data processing agreements and are bound by this privacy policy.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose information if required by law, court order, or to protect the safety and rights of our users and platform. We will notify affected users to the extent permitted by law.',
      },
    ],
  },
  {
    id: 'contact',
    icon: FiMail,
    title: 'Contact & Updates',
    color: '#38bdf8',
    content: [
      {
        subtitle: 'Get in Touch',
        text: 'For privacy-related questions, data requests, or concerns, contact us at privacy@aichixia.xyz. We aim to respond within 48 hours on business days.',
      },
      {
        subtitle: 'Policy Updates',
        text: 'We may update this policy as our platform evolves. Significant changes will be communicated via email or a prominent notice in the console. Continued use of the service constitutes acceptance of the updated terms.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>('collection');
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090f] text-zinc-900 dark:text-white transition-colors duration-300">
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes headerIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes orbitSlow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes glowPulse { 0%,100%{opacity:.4;} 50%{opacity:.8;} }
        @keyframes expandDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .page-header { animation: headerIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-section { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both 0.05s; }
        .section-card { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .expand-body { animation: expandDown 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .orbit-ring { animation: orbitSlow 18s linear infinite; }
        .glow-ring { animation: glowPulse 3s ease-in-out infinite; }
        .section-card:nth-child(1){animation-delay:0.08s;}
        .section-card:nth-child(2){animation-delay:0.12s;}
        .section-card:nth-child(3){animation-delay:0.16s;}
        .section-card:nth-child(4){animation-delay:0.20s;}
        .section-card:nth-child(5){animation-delay:0.24s;}
        .section-card:nth-child(6){animation-delay:0.28s;}
        .acc-btn {
          width:100%; display:flex; align-items:center; gap:12px;
          padding:16px 18px; background:none; border:none; cursor:pointer;
          text-align:left; transition:background 180ms;
          border-radius: 14px;
        }
        .acc-btn:hover { background: rgba(56,189,248,0.04); }
        .dark .acc-btn:hover { background: rgba(56,189,248,0.05); }
        .chevron { transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1); }
        .chevron.open { transform: rotate(180deg); }
        .back-btn {
          display:flex; align-items:center; gap:6px;
          padding:7px 12px; border-radius:10px; border:none;
          background:transparent; cursor:pointer; font-size:13px; font-weight:600;
          color: rgba(0,0,0,0.45); transition:color 180ms, background 180ms;
        }
        .back-btn:hover { background:rgba(0,0,0,0.05); color:rgba(0,0,0,0.8); }
        .dark .back-btn { color:rgba(255,255,255,0.35); }
        .dark .back-btn:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.75); }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
        transition: 'all 300ms',
        padding: '12px 20px',
      }} className="dark:[background:scrolled?rgba(7,9,15,0.85):transparent]">
        <style>{`.dark header { background: ${scrolled ? 'rgba(7,9,15,0.88)' : 'transparent'} !important; border-bottom-color: ${scrolled ? 'rgba(255,255,255,0.07)' : 'transparent'} !important; }`}</style>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={() => router.back()}>
            <FiArrowLeft style={{ fontSize: 14 }} />
            Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.4)' }} className="dark:text-white/30">Aichixia</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 80px' }}>
        <div className="hero-section" style={{ paddingTop: 48, paddingBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <div className="glow-ring" style={{
                position: 'absolute', inset: -10, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
              }} />
              <div className="orbit-ring" style={{
                position: 'absolute', inset: -4, borderRadius: '50%',
                border: '1px dashed rgba(56,189,248,0.25)',
              }} />
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(56,189,248,0.08)',
                border: '1.5px solid rgba(56,189,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiShield style={{ fontSize: 26, color: '#38bdf8' }} />
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 16px' }} className="dark:text-white/40">
            We believe in radical transparency. Here's exactly how Aichixia handles your data — no legalese, no hidden clauses.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <FiRefreshCw style={{ fontSize: 10, color: '#38bdf8' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8' }}>Last updated March 2025</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isOpen = expanded === sec.id;
            return (
              <div
                key={sec.id}
                className="section-card"
                style={{
                  borderRadius: 16,
                  border: isOpen
                    ? `1px solid ${sec.color}25`
                    : '1px solid rgba(0,0,0,0.07)',
                  background: isOpen
                    ? `${sec.color}05`
                    : 'rgba(0,0,0,0.01)',
                  transition: 'border-color 250ms, background 250ms',
                  overflow: 'hidden',
                }}
              >
                <style>{`.dark .sc-${sec.id} { border-color: ${isOpen ? sec.color + '20' : 'rgba(255,255,255,0.07)'} !important; background: ${isOpen ? sec.color + '08' : 'rgba(255,255,255,0.02)'} !important; }`}</style>
                <button
                  className={`acc-btn sc-${sec.id}`}
                  onClick={() => setExpanded(isOpen ? null : sec.id)}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${sec.color}12`,
                    border: `1px solid ${sec.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 200ms',
                    transform: isOpen ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    <Icon style={{ fontSize: 15, color: sec.color }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: isOpen ? sec.color : 'inherit', transition: 'color 200ms' }}>
                    {sec.title}
                  </span>
                  <FiChevronDown
                    className={`chevron ${isOpen ? 'open' : ''}`}
                    style={{ fontSize: 16, color: 'rgba(0,0,0,0.3)', flexShrink: 0 }}
                  />
                </button>

                {isOpen && (
                  <div className="expand-body" style={{ padding: '0 18px 18px' }}>
                    <div style={{ height: 1, background: `linear-gradient(90deg, ${sec.color}30, transparent)`, marginBottom: 16 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {sec.content.map((item, i) => (
                        <div key={i}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: sec.color, marginBottom: 5, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                            {item.subtitle}
                          </p>
                          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(0,0,0,0.6)', margin: 0 }} className="dark:text-white/55">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 40, padding: '20px 22px', borderRadius: 16,
          background: 'rgba(56,189,248,0.04)',
          border: '1px solid rgba(56,189,248,0.12)',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <FiMail style={{ fontSize: 16, color: '#38bdf8', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Questions about your privacy?</p>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', margin: 0, lineHeight: 1.6 }} className="dark:text-white/40">
              Reach us at{' '}
              <a href="mailto:privacy@aichixia.xyz" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                privacy@aichixia.xyz
              </a>
              {' '}— we respond within 48 hours.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
