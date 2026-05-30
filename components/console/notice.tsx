'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiShield, FiArrowRight, FiX, FiZap, FiAlertTriangle } from 'react-icons/fi';
import { FaTelegram } from 'react-icons/fa';

const NOTICE_KEY = 'aichixia_notice';

export default function Notice() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'security'>('maintenance');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dismissed = localStorage.getItem(NOTICE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(NOTICE_KEY, '1');
      setVisible(false);
      setClosing(false);
    }, 320);
  };

  const handleSettings = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(NOTICE_KEY, '1');
      setVisible(false);
      setClosing(false);
      router.push('/console?tab=settings');
    }, 320);
  };

  if (!visible) return null;

  const bg = isDark
    ? 'linear-gradient(160deg, #0f0f10 0%, #141416 60%, #0c0c0e 100%)'
    : 'linear-gradient(160deg, #ffffff 0%, #f8f9fa 60%, #f1f3f5 100%)';

  const border = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)';
  const boxShadow = isDark
    ? '0 -4px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset'
    : '0 -4px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03) inset';

  const titleColor = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)';
  const subtitleColor = isDark ? 'rgba(56,189,248,0.6)' : 'rgba(14,120,165,0.7)';
  const closeColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  const tabActiveBg = isDark ? 'rgba(56,189,248,0.07)' : 'rgba(14,165,233,0.08)';
  const tabActiveBorder = isDark ? '1px solid rgba(56,189,248,0.2)' : '1px solid rgba(14,165,233,0.25)';
  const tabActiveColor = isDark ? 'rgba(125,211,252,0.9)' : 'rgba(3,105,161,0.9)';
  const tabInactiveColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  const cardBg = isDark ? 'rgba(56,189,248,0.04)' : 'rgba(14,165,233,0.04)';
  const cardBorder = isDark ? '1px solid rgba(56,189,248,0.12)' : '1px solid rgba(14,165,233,0.15)';
  const badgeBg = isDark ? 'rgba(56,189,248,0.1)' : 'rgba(14,165,233,0.1)';
  const badgeBorder = isDark ? '1px solid rgba(56,189,248,0.22)' : '1px solid rgba(14,165,233,0.25)';
  const badgeColor = isDark ? 'rgba(125,211,252,0.9)' : 'rgba(3,105,161,0.9)';
  const headingColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.82)';
  const bodyColor = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.44)';

  const noteCardBg = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)';
  const noteCardBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)';
  const noteColor = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.34)';
  const zapColor = isDark ? 'rgba(56,189,248,0.4)' : 'rgba(14,165,233,0.5)';

  const btnPrimaryBg = isDark ? 'rgba(56,189,248,0.1)' : 'rgba(14,165,233,0.1)';
  const btnPrimaryBorder = isDark ? '1px solid rgba(56,189,248,0.25)' : '1px solid rgba(14,165,233,0.3)';
  const btnPrimaryColor = isDark ? 'rgba(125,211,252,0.95)' : 'rgba(3,105,161,0.95)';
  const btnSecBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const btnSecBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)';
  const btnSecColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)';

  const footerBorder = isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)';
  const footerColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.22)';

  const overlayBg = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
        transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1)',
        opacity: closing ? 0 : 1,
      }}
      className="sm:items-center sm:p-4"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayBg,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: 'opacity 320ms',
          opacity: closing ? 0 : 1,
        }}
        onClick={dismiss}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          background: bg,
          border,
          borderRadius: '20px 20px 0 0',
          boxShadow,
          transition: 'transform 320ms cubic-bezier(0.34,1.56,0.64,1), opacity 320ms ease',
          transform: closing ? 'translateY(16px) scale(0.98)' : 'translateY(0) scale(1)',
          opacity: closing ? 0 : 1,
          overflow: 'hidden',
        }}
        className="sm:rounded-2xl"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.4) 30%, rgba(125,211,252,0.9) 50%, rgba(56,189,248,0.4) 70%, transparent 100%)',
          }}
        />

        <div style={{ padding: '20px 20px 0' }} className="sm:px-6 sm:pt-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: isDark ? 'rgba(56,189,248,0.08)' : 'rgba(14,165,233,0.08)',
                  border: isDark ? '1px solid rgba(56,189,248,0.18)' : '1px solid rgba(14,165,233,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={isDark ? 'rgba(125,211,252,0.9)' : 'rgba(3,105,161,0.85)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: subtitleColor, marginBottom: 1 }}>
                  Aichixia Platform
                </p>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: titleColor, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  Platform Notices
                </h2>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <a
                href="https://t.me/AichixiaAPI"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '6px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: isDark ? 'rgba(125,211,252,0.5)' : 'rgba(14,165,233,0.55)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms',
                  flexShrink: 0,
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = isDark ? 'rgba(56,189,248,0.08)' : 'rgba(14,165,233,0.08)';
                  (e.currentTarget as HTMLAnchorElement).style.color = isDark ? 'rgba(125,211,252,0.9)' : 'rgba(3,105,161,0.9)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = isDark ? 'rgba(125,211,252,0.5)' : 'rgba(14,165,233,0.55)';
                }}
              >
                <FaTelegram size={16} />
              </a>
              <button
                onClick={dismiss}
                style={{
                  padding: '6px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: closeColor,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(56,189,248,0.06)' : 'rgba(14,165,233,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(125,211,252,0.8)' : 'rgba(3,105,161,0.8)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = closeColor;
                }}
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {(['maintenance', 'security'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 9,
                  border: activeTab === tab ? tabActiveBorder : '1px solid transparent',
                  background: activeTab === tab ? tabActiveBg : 'transparent',
                  color: activeTab === tab ? tabActiveColor : tabInactiveColor,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  letterSpacing: '0.01em',
                }}
              >
                {tab === 'maintenance' ? (
                  <>
                    <FiAlertTriangle size={11} style={{ color: activeTab === tab ? tabActiveColor : tabInactiveColor }} />
                    Announcement
                  </>
                ) : (
                  <>
                    <FiShield size={11} style={{ color: activeTab === tab ? tabActiveColor : tabInactiveColor }} />
                    Security
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px 20px' }} className="sm:px-6 sm:pb-6">
          {activeTab === 'maintenance' && (
            <div>
              <div
                style={{
                  borderRadius: 12,
                  background: cardBg,
                  border: cardBorder,
                  padding: '12px 14px',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: badgeBg,
                      border: badgeBorder,
                      fontSize: 9,
                      fontWeight: 700,
                      color: badgeColor,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: badgeColor,
                        animation: 'noticePulse 2s infinite',
                        display: 'inline-block',
                      }}
                    />
                    In Progress
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: headingColor, marginBottom: 5, lineHeight: 1.4 }}>
                  Streaming is currently under maintenance
                </p>
                <p style={{ fontSize: 11, color: bodyColor, lineHeight: 1.65 }}>
                  We're actively working to restore the streaming feature. Responses may appear slower or non-streamed during this period. We appreciate your patience.
                </p>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  background: noteCardBg,
                  border: noteCardBorder,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FiZap size={12} style={{ color: zapColor, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: noteColor, lineHeight: 1.55 }}>
                  All other features remain fully operational. Follow our updates for restoration status.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div
                style={{
                  borderRadius: 12,
                  background: cardBg,
                  border: cardBorder,
                  padding: '12px 14px',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: badgeBg,
                      border: badgeBorder,
                      fontSize: 9,
                      fontWeight: 700,
                      color: badgeColor,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recommended
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: headingColor, marginBottom: 5, lineHeight: 1.4 }}>
                  Set a Display Name
                </p>
                <p style={{ fontSize: 11, color: bodyColor, lineHeight: 1.65 }}>
                  We recommend setting a display name to better protect your personal data. Your display name replaces your email in shared sessions and activity logs.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleSettings}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '10px 16px',
                    borderRadius: 11,
                    border: btnPrimaryBorder,
                    background: btnPrimaryBg,
                    color: btnPrimaryColor,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(56,189,248,0.16)' : 'rgba(14,165,233,0.16)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? 'rgba(56,189,248,0.38)' : 'rgba(14,165,233,0.42)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = btnPrimaryBg;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? 'rgba(56,189,248,0.25)' : 'rgba(14,165,233,0.3)';
                  }}
                >
                  Go to Settings
                  <FiArrowRight size={13} />
                </button>
                <button
                  onClick={dismiss}
                  style={{
                    width: '100%',
                    padding: '9px 16px',
                    borderRadius: 11,
                    border: btnSecBorder,
                    background: btnSecBg,
                    color: btnSecColor,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.48)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = btnSecBg;
                    (e.currentTarget as HTMLButtonElement).style.color = btnSecColor;
                  }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '10px 20px 14px',
            borderTop: footerBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="sm:px-6"
        >
          <p style={{ fontSize: 10, color: footerColor, letterSpacing: '0.02em' }}>
            This notice will not appear again once dismissed
          </p>
        </div>

        <style>{`
          @keyframes noticePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }
        `}</style>
      </div>
    </div>
  );
}
