import { useState, useRef, useEffect } from 'react';
import {
  FiUser, FiMail, FiCamera, FiCheck, FiAlertCircle, FiGift, FiSave, FiZap,
  FiShield, FiLock, FiEye, FiEyeOff, FiRefreshCw, FiCopy, FiServer,
  FiDatabase, FiActivity, FiKey, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';

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
    name: 'Free', limit: '100', color: 'sky',
    gradient: 'from-sky-500 to-blue-500',
    features: ['100 requests/day', 'Basic models', 'Community support'],
  },
  pro: {
    name: 'Pro', limit: '400', color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    features: ['400 requests/day', 'All models', 'Priority support', 'Advanced features'],
  },
  enterprise: {
    name: 'Enterprise', limit: '800', color: 'rose',
    gradient: 'from-rose-500 to-red-500',
    features: ['800 requests/day', 'All models', 'Dedicated support', 'Custom solutions'],
  },
};

function AdminPanel() {
  const [pinVisible, setPinVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [pinStep, setPinStep] = useState<'idle' | 'new' | 'confirm'>('idle');
  const [pinMatch, setPinMatch] = useState<boolean | null>(null);
  const [pinSaved, setPinSaved] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [rateLimitOverride, setRateLimitOverride] = useState(false);
  const [apiKeyPrefix, setApiKeyPrefix] = useState('axia-');
  const [maxKeysPerUser, setMaxKeysPerUser] = useState('5');
  const [systemNote, setSystemNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const newPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const systemStats = {
    uptime: '99.98%',
    totalUsers: '—',
    apiVersion: 'v1.0',
    region: 'Global',
  };

  const handlePinDigit = (
    idx: number,
    val: string,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    isLast?: () => void
  ) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...arr];
    next[idx] = val;
    setArr(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
    if (val && idx === 5 && isLast) isLast();
  };

  const handlePinKey = (
    idx: number,
    e: React.KeyboardEvent,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !arr[idx] && idx > 0) {
      const next = [...arr];
      next[idx - 1] = '';
      setArr(next);
      refs.current[idx - 1]?.focus();
    }
  };

  const handleSavePin = async () => {
    const newFull = newPin.join('');
    const confirmFull = confirmPin.join('');
    if (newFull !== confirmFull) { setPinMatch(false); return; }
    if (newFull.length < 6) return;
    setPinMatch(true);
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setPinSaved(true);
    setPinStep('idle');
    setNewPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
    setTimeout(() => setPinSaved(false), 3000);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const copySystemInfo = () => {
    const info = `API Version: ${systemStats.apiVersion}\nRegion: ${systemStats.region}\nUptime: ${systemStats.uptime}`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        @keyframes adminFadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes adminOrbit { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes adminPulse { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        @keyframes successPop {
          0%{transform:scale(0.8);opacity:0;}
          60%{transform:scale(1.1);}
          100%{transform:scale(1);opacity:1;}
        }
        .admin-card {
          background: var(--acard-bg);
          border: 1px solid var(--acard-border);
          border-radius: 16px;
          animation: adminFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .admin-card:nth-child(1){animation-delay:0.05s;}
        .admin-card:nth-child(2){animation-delay:0.10s;}
        .admin-card:nth-child(3){animation-delay:0.15s;}
        .admin-card:nth-child(4){animation-delay:0.20s;}
        :root {
          --acard-bg: #ffffff;
          --acard-border: rgba(0,0,0,0.07);
          --atext: #0f0f10;
          --atext-sub: #52525b;
          --atext-muted: #a1a1aa;
          --ainput-bg: #f9f9fb;
          --ainput-border: rgba(0,0,0,0.1);
          --atag-bg: rgba(0,0,0,0.04);
          --adivider: rgba(0,0,0,0.06);
        }
        .dark {
          --acard-bg: #111113;
          --acard-border: rgba(255,255,255,0.07);
          --atext: rgba(255,255,255,0.92);
          --atext-sub: rgba(255,255,255,0.5);
          --atext-muted: rgba(255,255,255,0.28);
          --ainput-bg: rgba(255,255,255,0.04);
          --ainput-border: rgba(255,255,255,0.1);
          --atag-bg: rgba(255,255,255,0.05);
          --adivider: rgba(255,255,255,0.06);
        }
        .apin-cell {
          width: 42px; height: 50px; border-radius: 11px;
          background: var(--ainput-bg);
          border: 1.5px solid var(--ainput-border);
          font-size: 20px; font-weight: 800; color: var(--atext);
          text-align: center; outline: none; caret-color: transparent;
          -webkit-text-security: disc;
          transition: border-color 180ms, box-shadow 180ms, background 180ms, transform 120ms;
        }
        .apin-cell:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.18);
          background: rgba(167,139,250,0.06);
          transform: scale(1.06);
        }
        .apin-cell.filled { border-color: rgba(167,139,250,0.4); }
        .apin-cell.mismatch {
          border-color: rgba(248,113,113,0.6) !important;
          box-shadow: 0 0 0 3px rgba(248,113,113,0.14) !important;
          background: rgba(248,113,113,0.06) !important;
        }
        .atoggle {
          position: relative; width: 40px; height: 22px;
          border-radius: 99px; border: none; cursor: pointer;
          transition: background 220ms;
          flex-shrink: 0;
        }
        .atoggle-thumb {
          position: absolute; top: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff;
          transition: left 220ms cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .ainput {
          width: 100%; padding: 9px 12px;
          background: var(--ainput-bg);
          border: 1.5px solid var(--ainput-border);
          border-radius: 10px;
          font-size: 13px; color: var(--atext);
          outline: none; transition: border-color 180ms, box-shadow 180ms;
          box-sizing: border-box;
        }
        .ainput:focus { border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,0.15); }
        .asave-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 20px; border-radius: 11px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: opacity 150ms, transform 150ms, box-shadow 200ms;
          letter-spacing: -0.01em;
        }
        .asave-btn:hover:not(:disabled) { opacity:0.87; transform:translateY(-1px); }
        .asave-btn:active:not(:disabled) { transform:scale(0.98); }
        .asave-btn:disabled { opacity:0.35; cursor:not-allowed; }
        @media(max-width:380px){ .apin-cell{ width:36px; height:44px; font-size:17px; } }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(139,92,246,0.05))',
        border: '1px solid rgba(167,139,250,0.2)', borderRadius: 14,
        animation: 'adminFadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '1px dashed rgba(167,139,250,0.3)',
            animation: 'adminOrbit 12s linear infinite',
          }} />
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiShield style={{ fontSize: 16, color: '#a78bfa' }} />
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', margin: 0, letterSpacing: '-0.01em' }}>
            Admin Controls
          </p>
          <p style={{ fontSize: 11, color: 'var(--atext-muted)', margin: '2px 0 0' }}>
            These settings are only visible to administrators
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--adivider)' }}>
          <FiServer style={{ fontSize: 14, color: '#38bdf8' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--atext)', margin: 0, letterSpacing: '-0.01em' }}>System Status</p>
            <p style={{ fontSize: 11, color: 'var(--atext-muted)', margin: '2px 0 0' }}>Live platform metrics</p>
          </div>
          <button
            onClick={copySystemInfo}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, border: 'none',
              background: 'var(--atag-bg)', color: copied ? '#34d399' : 'var(--atext-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'color 200ms, background 200ms',
            }}
          >
            {copied ? <FiCheck style={{ fontSize: 11 }} /> : <FiCopy style={{ fontSize: 11 }} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
          {[
            { label: 'Uptime',     value: systemStats.uptime,   color: '#34d399', icon: FiActivity },
            { label: 'API Version',value: systemStats.apiVersion,color: '#38bdf8', icon: FiKey },
            { label: 'Region',     value: systemStats.region,   color: '#a78bfa', icon: FiDatabase },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{
              padding: '10px 12px', borderRadius: 11,
              background: 'var(--atag-bg)', border: '1px solid var(--acard-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <Icon style={{ fontSize: 11, color, flexShrink: 0 }} />
                <p style={{ fontSize: 10, color: 'var(--atext-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--atext)', margin: 0, letterSpacing: '-0.02em' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--adivider)' }}>
          <FiToggleRight style={{ fontSize: 14, color: '#fb923c' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--atext)', margin: 0, letterSpacing: '-0.01em' }}>Platform Toggles</p>
            <p style={{ fontSize: 11, color: 'var(--atext-muted)', margin: '2px 0 0' }}>Runtime feature flags</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            {
              label: 'Maintenance Mode',
              desc: 'Block all incoming API requests',
              value: maintenanceMode,
              set: setMaintenanceMode,
              color: '#f87171',
            },
            {
              label: 'Debug Logging',
              desc: 'Verbose logs for all requests',
              value: debugMode,
              set: setDebugMode,
              color: '#fbbf24',
            },
            {
              label: 'Rate Limit Override',
              desc: 'Bypass per-key rate limits globally',
              value: rateLimitOverride,
              set: setRateLimitOverride,
              color: '#34d399',
            },
          ].map(({ label, desc, value, set, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 12px', borderRadius: 11,
              transition: 'background 180ms',
              background: value ? `${color}08` : 'transparent',
            }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--atext)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--atext-muted)', margin: '2px 0 0' }}>{desc}</p>
              </div>
              <button
                className="atoggle"
                onClick={() => set(!value)}
                style={{ background: value ? color : 'rgba(128,128,128,0.2)' }}
              >
                <div className="atoggle-thumb" style={{ left: value ? 21 : 3 }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--adivider)' }}>
          <FiDatabase style={{ fontSize: 14, color: '#a78bfa' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--atext)', margin: 0, letterSpacing: '-0.01em' }}>API Configuration</p>
            <p style={{ fontSize: 11, color: 'var(--atext-muted)', margin: '2px 0 0' }}>Global API key settings</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--atext-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              API Key Prefix
            </label>
            <input
              className="ainput"
              value={apiKeyPrefix}
              onChange={e => setApiKeyPrefix(e.target.value)}
              placeholder="axia-"
              style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--atext-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Max Keys Per User
            </label>
            <input
              className="ainput"
              type="number"
              value={maxKeysPerUser}
              onChange={e => setMaxKeysPerUser(e.target.value)}
              min="1"
              max="50"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--atext-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              System Announcement
            </label>
            <textarea
              className="ainput"
              value={systemNote}
              onChange={e => setSystemNote(e.target.value)}
              placeholder="Optional message shown to all users..."
              rows={2}
              style={{ resize: 'none', lineHeight: 1.55 }}
            />
          </div>

          <button
            className="asave-btn"
            onClick={handleSaveConfig}
            disabled={saving}
            style={{
              width: '100%',
              background: saveSuccess
                ? 'linear-gradient(135deg,#34d399,#10b981)'
                : 'linear-gradient(135deg,#a78bfa,#8b5cf6)',
              color: '#fff',
              boxShadow: saveSuccess
                ? '0 4px 14px rgba(52,211,153,0.3)'
                : '0 4px 14px rgba(167,139,250,0.3)',
              transition: 'background 400ms, box-shadow 400ms',
            }}
          >
            {saving ? (
              <>
                <div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'adminOrbit 0.7s linear infinite' }} />
                Saving...
              </>
            ) : saveSuccess ? (
              <><FiCheck style={{ fontSize:13, animation:'successPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }} /> Saved!</>
            ) : (
              <><FiSave style={{ fontSize:13 }} /> Save Configuration</>
            )}
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '18px 20px', borderColor: 'rgba(167,139,250,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(167,139,250,0.12)' }}>
          <FiLock style={{ fontSize: 14, color: '#a78bfa' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--atext)', margin: 0, letterSpacing: '-0.01em' }}>Change Admin PIN</p>
            <p style={{ fontSize: 11, color: 'var(--atext-muted)', margin: '2px 0 0' }}>Update your 6-digit access PIN</p>
          </div>
          {pinSaved && (
            <div style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, color: '#34d399',
              animation: 'successPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              <FiCheck style={{ fontSize: 11 }} /> PIN Updated
            </div>
          )}
        </div>

        {pinStep === 'idle' && (
          <button
            onClick={() => setPinStep('new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '11px 14px', borderRadius: 11,
              background: 'rgba(167,139,250,0.07)', border: '1.5px dashed rgba(167,139,250,0.25)',
              color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 180ms, border-color 180ms',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.07)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; }}
          >
            <FiRefreshCw style={{ fontSize: 13 }} />
            Change PIN
          </button>
        )}

        {(pinStep === 'new' || pinStep === 'confirm') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--atext-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                New PIN
              </p>
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                {newPin.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { newPinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    className={`apin-cell${d ? ' filled' : ''}`}
                    autoFocus={i === 0 && pinStep === 'new'}
                    autoComplete="off"
                    onChange={e => handlePinDigit(i, e.target.value, newPin, setNewPin, newPinRefs, () => setPinStep('confirm'))}
                    onKeyDown={e => handlePinKey(i, e, newPin, setNewPin, newPinRefs)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--atext-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm PIN
              </p>
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                {confirmPin.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { confirmPinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    className={`apin-cell${d ? ' filled' : ''}${pinMatch === false ? ' mismatch' : ''}`}
                    autoFocus={i === 0 && pinStep === 'confirm'}
                    autoComplete="off"
                    onChange={e => handlePinDigit(i, e.target.value, confirmPin, setConfirmPin, confirmPinRefs)}
                    onKeyDown={e => handlePinKey(i, e, confirmPin, setConfirmPin, confirmPinRefs)}
                  />
                ))}
              </div>
              {pinMatch === false && (
                <p style={{ textAlign: 'center', fontSize: 11, color: '#f87171', marginTop: 8, animation: 'adminFadeUp 0.2s ease both' }}>
                  PINs do not match. Try again.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setPinStep('idle'); setNewPin(['','','','','','']); setConfirmPin(['','','','','','']); setPinMatch(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 11, border: '1px solid var(--acard-border)',
                  background: 'var(--atag-bg)', color: 'var(--atext-muted)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                Cancel
              </button>
              <button
                className="asave-btn"
                onClick={handleSavePin}
                disabled={saving || confirmPin.join('').length < 6}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg,#a78bfa,#8b5cf6)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(167,139,250,0.3)',
                }}
              >
                {saving ? (
                  <div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'adminOrbit 0.7s linear infinite' }} />
                ) : (
                  <><FiLock style={{ fontSize:12 }} /> Save New PIN</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settings({
  profile,
  settings,
  onUpdateProfile,
  onRedeemPromo,
  actionLoading,
}: SettingsProps) {
  const [editProfile, setEditProfile] = useState({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  const planConfig = PLAN_CONFIG[settings?.plan || 'free'];
  const isAdmin = settings?.is_admin ?? false;

  const handleUpdateProfile = () => onUpdateProfile(editProfile);
  const handleRedeemPromo = () => {
    if (!promoCode.trim()) return;
    onRedeemPromo(promoCode);
    setPromoCode('');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {isAdmin && (
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--card-bg, #f4f4f6)', borderRadius: 12, border: '1px solid var(--card-border, rgba(0,0,0,0.07))' }}
          className="dark:bg-zinc-900 dark:border-zinc-800"
        >
          <style>{`
            :root { --card-bg:#f4f4f6; --card-border:rgba(0,0,0,0.07); }
            .dark { --card-bg:#18181b; --card-border:rgba(255,255,255,0.07); }
            @keyframes tabSlide { from{opacity:0;transform:translateX(-4px);} to{opacity:1;transform:translateX(0);} }
          `}</style>
          {(['user', 'admin'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
                background: activeTab === tab
                  ? tab === 'admin' ? 'linear-gradient(135deg,#a78bfa,#8b5cf6)' : 'linear-gradient(135deg,#38bdf8,#3b82f6)'
                  : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--atext-muted, #a1a1aa)',
                boxShadow: activeTab === tab ? '0 2px 10px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {tab === 'admin' ? <FiShield style={{ fontSize: 12 }} /> : <FiUser style={{ fontSize: 12 }} />}
              {tab === 'admin' ? 'Admin Settings' : 'My Settings'}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'user' && (
        <>
          <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <FiUser className="text-sky-500 dark:text-sky-400 text-sm sm:text-base" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Profile Settings</h3>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">Display Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs sm:text-sm" />
                  <input
                    type="text"
                    value={editProfile.display_name}
                    onChange={(e) => setEditProfile({ ...editProfile, display_name: e.target.value })}
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">Avatar URL</label>
                <div className="relative">
                  <FiCamera className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs sm:text-sm" />
                  <input
                    type="text"
                    value={editProfile.avatar_url}
                    onChange={(e) => setEditProfile({ ...editProfile, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              {editProfile.avatar_url && (
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={editProfile.avatar_url}
                    alt="Avatar preview"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48'; }}
                  />
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-zinc-900 dark:text-white">Avatar Preview</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400">This is how your avatar will appear</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpdateProfile}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm disabled:opacity-50 shadow-lg"
              >
                {actionLoading ? (
                  <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                ) : (
                  <><FiSave className="text-sm sm:text-base" />Update Profile</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <FiMail className="text-purple-500 dark:text-purple-400 text-sm sm:text-base" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Account Information</h3>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Your account details</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs sm:text-sm" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">Current Plan</label>
                <style>{`
                  @keyframes planFadeIn { from{opacity:0;transform:translateY(6px) scale(0.99);} to{opacity:1;transform:translateY(0) scale(1);} }
                  .plan-card { animation: planFadeIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
                  .plan-feature { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.08); font-size:11px; color:rgba(255,255,255,0.82); }
                  .plan-feature:last-child { border-bottom:none; }
                  @keyframes pulseDot { 0%,100%{opacity:1;box-shadow:0 0 6px rgba(255,255,255,0.7);} 50%{opacity:0.5;box-shadow:0 0 2px rgba(255,255,255,0.3);} }
                  .plan-dot { animation: pulseDot 2s ease-in-out infinite; }
                `}</style>
                <div className={`plan-card bg-gradient-to-br ${planConfig.gradient} rounded-xl shadow-lg`} style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: -20, left: -12, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FiZap style={{ fontSize: 13, color: '#fff' }} />
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{planConfig.name} Plan</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div className="plan-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 12, position: 'relative' }}>{planConfig.limit} requests per day</p>
                  <div style={{ position: 'relative' }}>
                    {planConfig.features.map((f, i) => (
                      <div key={i} className="plan-feature">
                        <FiCheck style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  {settings?.plan_expires_at && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)', position: 'relative' }}>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                        Expires {new Date(settings.plan_expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <FiGift className="text-purple-500 dark:text-purple-400 text-sm sm:text-base mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1">Redeem Promo Code</h3>
                <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400">Upgrade your plan with a promotional code</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <FiGift className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 dark:text-purple-400 text-xs sm:text-sm" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO-CODE"
                  className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-2.5 bg-white dark:bg-zinc-900 border-2 border-purple-300 dark:border-purple-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-purple-500 font-mono uppercase"
                />
              </div>
              <button
                onClick={handleRedeemPromo}
                disabled={actionLoading || !promoCode.trim()}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
              >
                {actionLoading ? (
                  <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Redeeming...</>
                ) : 'Redeem'}
              </button>
            </div>
            <div className="mt-3 p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <FiAlertCircle className="text-purple-600 dark:text-purple-400 text-xs flex-shrink-0 mt-0.5" />
                <p className="text-[9px] sm:text-[10px] text-purple-700 dark:text-purple-300">
                  Enter a valid promo code to unlock premium features and extended rate limits
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border-2 border-red-200 dark:border-red-800 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <FiAlertCircle className="text-red-500 dark:text-red-400 text-sm sm:text-base mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-red-900 dark:text-red-100 mb-1">Danger Zone</h3>
                <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm shadow-lg">
              Delete Account
            </button>
          </div>
        </>
      )}

      {activeTab === 'admin' && isAdmin && <AdminPanel />}
    </div>
  );
}
