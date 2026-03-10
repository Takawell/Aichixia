import { useState, useRef } from 'react';
import { FiUser, FiMail, FiCamera, FiCheck, FiAlertCircle, FiGift, FiCreditCard, FiShield, FiSave, FiZap, FiStar } from 'react-icons/fi';

type UserProfile = {
  email: string;
  display_name: string | null;
  avatar_url: string | null;
};

type UserSettings = {
  plan: 'free' | 'pro' | 'enterprise';
  plan_expires_at: string | null;
  is_admin: boolean;
};

type SettingsProps = {
  profile: UserProfile | null;
  settings: UserSettings | null;
  onUpdateProfile: (data: { display_name: string; avatar_url: string }) => void;
  onRedeemPromo: (code: string) => void;
  actionLoading: boolean;
};

const PLAN_CONFIG = {
  free: {
    name: 'Free',
    limit: '100',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    features: ['100 requests/day', 'Basic models', 'Community support'],
  },
  pro: {
    name: 'Pro',
    limit: '400',
    color: 'purple',
    gradient: 'from-violet-500 to-purple-600',
    features: ['400 requests/day', 'All models', 'Priority support', 'Advanced features'],
  },
  enterprise: {
    name: 'Enterprise',
    limit: '800',
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    features: ['800 requests/day', 'All models', 'Dedicated support', 'Custom solutions'],
  },
};

const planAccent: Record<string, { ring: string; text: string; bg: string }> = {
  sky:    { ring: 'rgba(56,189,248,0.25)',  text: '#38bdf8', bg: 'rgba(56,189,248,0.06)'  },
  purple: { ring: 'rgba(139,92,246,0.25)', text: '#a78bfa', bg: 'rgba(139,92,246,0.06)' },
  rose:   { ring: 'rgba(244,63,94,0.25)',  text: '#fb7185', bg: 'rgba(244,63,94,0.06)'  },
};

function Card({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${className}`}
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function InputField({
  label, icon: Icon, value, onChange, placeholder, type = 'text', disabled = false,
}: {
  label: string; icon: any; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: focused ? '#38bdf8' : 'var(--text-muted)',
            transition: 'color 200ms',
            pointerEvents: 'none',
          }}
        />
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            paddingLeft: 36,
            paddingRight: 14,
            paddingTop: 10,
            paddingBottom: 10,
            background: disabled ? 'var(--input-disabled)' : 'var(--input-bg)',
            border: `1px solid ${focused ? '#38bdf8' : 'var(--card-border)'}`,
            borderRadius: 10,
            fontSize: 13,
            color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'text',
            transition: 'border-color 200ms, box-shadow 200ms',
            boxShadow: focused ? '0 0 0 3px rgba(56,189,248,0.12)' : 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}

export default function Settings({ profile, settings, onUpdateProfile, onRedeemPromo, actionLoading }: SettingsProps) {
  const [editProfile, setEditProfile] = useState({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [imgError, setImgError] = useState(false);

  const planConfig = PLAN_CONFIG[settings?.plan || 'free'];
  const accent = planAccent[planConfig.color];

  const handleUpdateProfile = () => onUpdateProfile(editProfile);
  const handleRedeemPromo = () => {
    if (!promoCode.trim()) return;
    onRedeemPromo(promoCode);
    setPromoCode('');
  };

  return (
    <>
      <style>{`
        :root {
          --card-bg: #ffffff;
          --card-border: rgba(0,0,0,0.07);
          --text-primary: #0f0f10;
          --text-sub: #52525b;
          --text-muted: #a1a1aa;
          --input-bg: #f9f9fb;
          --input-disabled: #f4f4f6;
          --section-label: #71717a;
        }
        .dark {
          --card-bg: #111113;
          --card-border: rgba(255,255,255,0.07);
          --text-primary: rgba(255,255,255,0.92);
          --text-sub: rgba(255,255,255,0.5);
          --text-muted: rgba(255,255,255,0.28);
          --input-bg: rgba(255,255,255,0.04);
          --input-disabled: rgba(255,255,255,0.03);
          --section-label: rgba(255,255,255,0.35);
        }
        @keyframes settingsFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .settings-card { animation: settingsFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .settings-card:nth-child(1) { animation-delay: 0.04s; }
        .settings-card:nth-child(2) { animation-delay: 0.10s; }
        .settings-card:nth-child(3) { animation-delay: 0.16s; }
        .settings-card:nth-child(4) { animation-delay: 0.22s; }
        .settings-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 10px 20px; border-radius: 10px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: opacity 150ms, transform 150ms, box-shadow 200ms;
        }
        .settings-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .settings-btn:active:not(:disabled) { transform: scale(0.98); }
        .settings-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .feature-row {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 12px;
          color: rgba(255,255,255,0.85);
        }
        .feature-row:last-child { border-bottom: none; }
        .promo-input:focus { outline: none; }
        .danger-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px; border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.08); color: #f87171;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 200ms;
        }
        .danger-btn:hover { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.5); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>

        <Card className="settings-card" style={{ padding: '22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--card-border)' }}>
            <FiUser style={{ fontSize: 15, color: '#38bdf8' }} />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Profile Settings</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Update your personal information</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField
              label="Display Name"
              icon={FiUser}
              value={editProfile.display_name}
              onChange={(v) => setEditProfile({ ...editProfile, display_name: v })}
              placeholder="Your name"
            />

            <InputField
              label="Avatar URL"
              icon={FiCamera}
              value={editProfile.avatar_url}
              onChange={(v) => { setEditProfile({ ...editProfile, avatar_url: v }); setImgError(false); }}
              placeholder="https://example.com/avatar.jpg"
            />

            {editProfile.avatar_url && !imgError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                animation: 'settingsFadeUp 0.3s cubic-bezier(0.22,1,0.36,1)',
              }}>
                <img
                  src={editProfile.avatar_url}
                  alt="Avatar preview"
                  onError={() => setImgError(true)}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--card-border)', flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Avatar Preview</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>This is how your avatar will appear</p>
                </div>
              </div>
            )}

            <button
              onClick={handleUpdateProfile}
              disabled={actionLoading}
              className="settings-btn"
              style={{
                background: 'linear-gradient(135deg, #38bdf8, #3b82f6)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(56,189,248,0.25)',
              }}
            >
              {actionLoading ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Updating...
                </>
              ) : (
                <>
                  <FiSave style={{ fontSize: 13 }} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </Card>

        <Card className="settings-card" style={{ padding: '22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--card-border)' }}>
            <FiMail style={{ fontSize: 15, color: '#a78bfa' }} />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Account Information</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Your account details</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputField
              label="Email Address"
              icon={FiMail}
              value={profile?.email || ''}
              disabled
              placeholder=""
            />

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                Current Plan
              </label>
              <div style={{
                borderRadius: 14,
                background: `linear-gradient(135deg, var(--g1), var(--g2))`,
                padding: '18px 18px',
                position: 'relative',
                overflow: 'hidden',
              }}
                className={`bg-gradient-to-br ${planConfig.gradient}`}
              >
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiZap style={{ fontSize: 14, color: '#fff' }} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{planConfig.name} Plan</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 8px', borderRadius: 20 }}>
                    Active
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 12, position: 'relative' }}>
                  {planConfig.limit} requests per day
                </p>

                <div style={{ position: 'relative' }}>
                  {planConfig.features.map((f, i) => (
                    <div key={i} className="feature-row">
                      <FiCheck style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>

                {settings?.plan_expires_at && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)', position: 'relative' }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                      Expires {new Date(settings.plan_expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card" style={{ padding: '22px 22px', borderColor: 'rgba(139,92,246,0.18)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
            <FiGift style={{ fontSize: 15, color: '#a78bfa' }} />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Redeem Promo Code</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Upgrade your plan with a promotional code</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiStar style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#a78bfa', pointerEvents: 'none' }} />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
                placeholder="PROMO-CODE"
                className="promo-input"
                style={{
                  width: '100%',
                  paddingLeft: 36,
                  paddingRight: 14,
                  paddingTop: 10,
                  paddingBottom: 10,
                  background: 'var(--input-bg)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.25)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              onClick={handleRedeemPromo}
              disabled={actionLoading || !promoCode.trim()}
              className="settings-btn"
              style={{
                width: 'auto',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
                flexShrink: 0,
              }}
            >
              {actionLoading ? (
                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : 'Redeem'}
            </button>
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 12px', borderRadius: 9,
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.12)',
          }}>
            <FiAlertCircle style={{ fontSize: 12, color: '#a78bfa', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: '#a78bfa', margin: 0, lineHeight: 1.55 }}>
              Enter a valid promo code to unlock premium features and extended rate limits
            </p>
          </div>
        </Card>

        <Card className="settings-card" style={{ padding: '22px 22px', borderColor: 'rgba(239,68,68,0.15)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
            <FiAlertCircle style={{ fontSize: 15, color: '#f87171' }} />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f87171', margin: 0, letterSpacing: '-0.01em' }}>Danger Zone</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Once you delete your account, there is no going back</p>
            </div>
          </div>
          <button className="danger-btn">
            <FiAlertCircle style={{ fontSize: 12 }} />
            Delete Account
          </button>
        </Card>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}
