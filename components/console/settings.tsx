import { useState } from 'react';
import { FiUser, FiMail, FiCamera, FiCheck, FiAlertCircle, FiGift, FiSave, FiZap, FiShield, FiArrowRight, FiStar } from 'react-icons/fi';
import { useRouter } from 'next/router';

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

export default function Settings({ profile, settings, onUpdateProfile, onRedeemPromo, actionLoading }: SettingsProps) {
  const router = useRouter();
  const [editProfile, setEditProfile] = useState({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [adminHover, setAdminHover] = useState(false);

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
      <style>{`
        @keyframes adminCardIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes adminOrbit { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes adminShimmer {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(200%); }
        }
        @keyframes adminPulse {
          0%,100% { opacity:.6; transform:scale(1); }
          50%     { opacity:1; transform:scale(1.06); }
        }
        .admin-banner {
          animation: adminCardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
          position: relative; overflow: hidden;
          cursor: pointer;
          transition: transform 200ms, box-shadow 200ms;
        }
        .admin-banner:hover { transform: translateY(-2px); }
        .admin-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 99px;
          background: rgba(167,139,250,0.15);
          border: 1px solid rgba(167,139,250,0.3);
          font-size: 10px; font-weight: 700; color: #a78bfa;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .admin-orbit {
          animation: adminOrbit 10s linear infinite;
        }
        .admin-shimmer {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.06) 50%, transparent 100%);
          animation: adminShimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        .admin-arrow {
          transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1);
        }
        .admin-banner:hover .admin-arrow {
          transform: translateX(4px);
        }
        .admin-glow {
          animation: adminPulse 3s ease-in-out infinite;
        }
      `}</style>

      {isAdmin && (
        <div
          className="admin-banner"
          onClick={() => router.push('/console/admin')}
          style={{
            background: adminHover
              ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.08))'
              : 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(167,139,250,0.05))',
            border: `1px solid ${adminHover ? 'rgba(167,139,250,0.35)' : 'rgba(167,139,250,0.2)'}`,
            borderRadius: 16,
            padding: '16px 18px',
            transition: 'background 200ms, border-color 200ms',
          }}
          onMouseEnter={() => setAdminHover(true)}
          onMouseLeave={() => setAdminHover(false)}
        >
          <div className="admin-shimmer" />

          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="admin-glow" style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                background: 'rgba(139,92,246,0.1)',
              }} />
              <div className="admin-orbit" style={{
                position: 'absolute', inset: -4, borderRadius: '50%',
                border: '1px dashed rgba(167,139,250,0.3)',
              }} />
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(139,92,246,0.12)',
                border: '1.5px solid rgba(167,139,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FiShield style={{ fontSize: 17, color: '#a78bfa' }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', letterSpacing: '-0.01em' }}>
                  Admin Dashboard
                </span>
                <span className="admin-badge">
                  <FiStar style={{ fontSize: 8 }} />
                  Administrator
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(167,139,250,0.6)', margin: 0, lineHeight: 1.5 }}>
                Manage users, promo codes, analytics & system
              </p>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(167,139,250,0.25)',
            }}>
              <FiArrowRight className="admin-arrow" style={{ fontSize: 14, color: '#a78bfa' }} />
            </div>
          </div>
        </div>
      )}

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
            <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Display Name
            </label>
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
            <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Avatar URL
            </label>
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
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FiSave className="text-sm sm:text-base" />
                Update Profile
              </>
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
            <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Email Address
            </label>
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
            <label className="block text-[10px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Current Plan
            </label>
            <style>{`
              @keyframes planFadeIn { from{opacity:0;transform:translateY(6px) scale(0.99);} to{opacity:1;transform:translateY(0) scale(1);} }
              .plan-card { animation: planFadeIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
              .plan-feature { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.08); font-size:11px; color:rgba(255,255,255,0.82); }
              .plan-feature:last-child { border-bottom:none; }
              @keyframes pulseDot { 0%,100%{opacity:1;box-shadow:0 0 6px rgba(255,255,255,0.7);} 50%{opacity:0.5;box-shadow:0 0 2px rgba(255,255,255,0.3);} }
              .plan-dot { animation: pulseDot 2s ease-in-out infinite; }
            `}</style>
            <div
              className={`plan-card bg-gradient-to-br ${planConfig.gradient} rounded-xl shadow-lg`}
              style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}
            >
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
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 12, position: 'relative' }}>
                {planConfig.limit} requests per day
              </p>
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
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redeeming...
              </>
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
            <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm shadow-lg">
          Delete Account
        </button>
      </div>
    </div>
  );
}
