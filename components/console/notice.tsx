'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiShield, FiArrowRight, FiX, FiZap, FiAlertTriangle } from 'react-icons/fi';

const NOTICE_KEY = 'aichixia_notice';

export default function Notice() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'security'>('maintenance');

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
          background: 'rgba(0,0,0,0.55)',
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
          background: 'linear-gradient(160deg, #0f0f10 0%, #141416 60%, #0c0c0e 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
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
            background: 'linear-gradient(90deg, transparent 0%, rgba(250,204,21,0.5) 30%, rgba(234,179,8,0.9) 50%, rgba(250,204,21,0.5) 70%, transparent 100%)',
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
                  background: 'rgba(250,204,21,0.08)',
                  border: '1px solid rgba(250,204,21,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(250,204,21,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(250,204,21,0.6)', marginBottom: 1 }}>
                  Aichixia Platform
                </p>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  Platform Notices
                </h2>
              </div>
            </div>
            <button
              onClick={dismiss}
              style={{
                padding: '6px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
              }}
            >
              <FiX size={14} />
            </button>
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
                  border: activeTab === tab ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  background: activeTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: activeTab === tab ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
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
                    <FiAlertTriangle size={11} style={{ color: activeTab === tab ? 'rgba(250,204,21,0.8)' : 'rgba(255,255,255,0.25)' }} />
                    Announcement
                  </>
                ) : (
                  <>
                    <FiShield size={11} style={{ color: activeTab === tab ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.25)' }} />
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
                  background: 'rgba(250,204,21,0.04)',
                  border: '1px solid rgba(250,204,21,0.12)',
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
                      background: 'rgba(250,204,21,0.1)',
                      border: '1px solid rgba(250,204,21,0.2)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'rgba(250,204,21,0.9)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'rgba(250,204,21,0.9)',
                        animation: 'pulse 2s infinite',
                        display: 'inline-block',
                      }}
                    />
                    In Progress
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 5, lineHeight: 1.4 }}>
                  Streaming is currently under maintenance
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  We're actively working to restore the streaming feature. Responses may appear slower or non-streamed during this period. We appreciate your patience.
                </p>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FiZap size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
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
                  background: 'rgba(129,140,248,0.04)',
                  border: '1px solid rgba(129,140,248,0.1)',
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
                      background: 'rgba(129,140,248,0.1)',
                      border: '1px solid rgba(129,140,248,0.2)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'rgba(129,140,248,0.9)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recommended
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 5, lineHeight: 1.4 }}>
                  Set a Display Name
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
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
                    border: '1px solid rgba(129,140,248,0.25)',
                    background: 'rgba(129,140,248,0.1)',
                    color: 'rgba(129,140,248,0.95)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129,140,248,0.15)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129,140,248,0.35)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129,140,248,0.1)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129,140,248,0.25)';
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
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
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
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="sm:px-6"
        >
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em' }}>
            This notice will not appear again once dismissed
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  );
}
