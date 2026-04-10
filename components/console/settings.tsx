import { useState } from 'react';
import { FiUser, FiMail, FiCamera, FiCheck, FiAlertCircle, FiGift, FiSave, FiZap, FiShield } from 'react-icons/fi';

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
    gradient: 'from-sky-500 to-blue-500',
    features: ['100 requests/day', 'Basic models', 'Community support'],
  },
  pro: {
    name: 'Pro',
    limit: '400',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    features: ['400 requests/day', 'All models', 'Priority support', 'Advanced features'],
  },
  enterprise: {
    name: 'Enterprise',
    limit: '800',
    color: 'rose',
    gradient: 'from-rose-500 to-red-500',
    features: ['800 requests/day', 'All models', 'Dedicated support', 'Custom solutions'],
  },
};

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
  const [avatarError, setAvatarError] = useState(false);

  const planConfig = PLAN_CONFIG[settings?.plan || 'free'];

  const handleUpdateProfile = () => onUpdateProfile(editProfile);
  const handleRedeemPromo = () => {
    if (!promoCode.trim()) return;
    onRedeemPromo(promoCode);
    setPromoCode('');
  };

  const initials = (editProfile.display_name || profile?.email || 'U')[0].toUpperCase();

  return (
    <div className="space-y-4 sm:space-y-5 max-w-2xl mx-auto">
      <style>{`
        @keyframes settingsFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes planFadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(255,255,255,0.7); }
          50% { opacity: 0.5; box-shadow: 0 0 2px rgba(255,255,255,0.3); }
        }
        @keyframes adminPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.7); }
        }
        @keyframes shimmerPass {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(280%) skewX(-15deg); }
        }
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.35); }
          50% { box-shadow: 0 0 0 7px rgba(56,189,248,0); }
        }
        .s-card { animation: settingsFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .s-card:nth-child(1) { animation-delay: 0.04s; }
        .s-card:nth-child(2) { animation-delay: 0.10s; }
        .s-card:nth-child(3) { animation-delay: 0.16s; }
        .s-card:nth-child(4) { animation-delay: 0.22s; }
        .plan-card { animation: planFadeIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .plan-feature {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 11px;
          color: rgba(255,255,255,0.82);
        }
        .plan-feature:last-child { border-bottom: none; }
        .plan-dot { animation: pulseDot 2s ease-in-out infinite; }
        .admin-pulse-ring { animation: adminPulse 2s ease-in-out infinite; }
        .shimmer-pass { animation: shimmerPass 3s ease-in-out infinite; }
        .avatar-pulse { animation: avatarPulse 2.5s ease-in-out infinite; }
        .settings-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: inherit;
          padding: 0;
        }
        .settings-input::placeholder { color: rgba(161,161,170,0.7); }
      `}</style>

      <div className="s-card bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="relative px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-500/5 via-blue-500/3 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex items-center gap-2.5 mb-5 sm:mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md" style={{ boxShadow: '0 2px 10px rgba(14,165,233,0.4)' }}>
              <FiUser className="text-white" style={{ fontSize: 13 }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight">Profile Settings</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Update your personal information</p>
            </div>
          </div>

          <div className="relative flex items-center gap-4 sm:gap-5 mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
            <div className="relative flex-shrink-0">
              {(editProfile.avatar_url && !avatarError) ? (
                <img
                  src={editProfile.avatar_url}
                  alt="Avatar"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-sky-400/40 avatar-pulse"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl avatar-pulse"
                  style={{ boxShadow: '0 4px 20px rgba(56,189,248,0.3)' }}
                >
                  {initials}
                </div>
              )}
              {settings?.is_admin && (
                <div className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center">
                  <span className="absolute w-5 h-5 rounded-full bg-sky-400/40 admin-pulse-ring" />
                  <div
                    className="relative w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center border-[2.5px] border-white dark:border-zinc-950"
                    style={{ boxShadow: '0 0 0 1px rgba(14,165,233,0.3), 0 0 12px rgba(14,165,233,0.8)' }}
                  >
                    <FiCheck className="text-white" style={{ fontSize: 8.5, strokeWidth: 3.5 }} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm sm:text-base font-black text-zinc-900 dark:text-white truncate leading-tight">
                  {editProfile.display_name || profile?.email || 'Your Name'}
                </p>
                {settings?.is_admin && (
                  <span className="relative flex-shrink-0 flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(14,165,233,0.35)', boxShadow: '0 0 12px rgba(14,165,233,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-pass pointer-events-none" />
                    <span className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(14,165,233,0.8)' }}>
                      <FiCheck className="text-white" style={{ fontSize: 7, strokeWidth: 3.5 }} />
                    </span>
                    <span className="text-[9px] font-black tracking-wide leading-none bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">ADMIN</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{profile?.email}</p>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                planConfig.color === 'sky' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50' :
                planConfig.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50' :
                'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
              }`}>
                {planConfig.name} Plan
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="group">
              <label className="block text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <div className="flex items-center gap-2.5 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus-within:border-sky-400 dark:focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all duration-200" style={{ focusWithin: { boxShadow: '0 0 0 3px rgba(14,165,233,0.12)' } }}>
                <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center flex-shrink-0 group-focus-within:bg-sky-500 transition-colors duration-200">
                  <FiUser className="text-sky-600 dark:text-sky-400 group-focus-within:text-white transition-colors duration-200" style={{ fontSize: 11 }} />
                </div>
                <input
                  type="text"
                  value={editProfile.display_name}
                  onChange={(e) => setEditProfile({ ...editProfile, display_name: e.target.value })}
                  placeholder="Your name"
                  className="settings-input text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Avatar URL
              </label>
              <div className="flex items-center gap-2.5 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus-within:border-sky-400 dark:focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all duration-200">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-focus-within:bg-blue-500 transition-colors duration-200">
                  <FiCamera className="text-blue-600 dark:text-blue-400 group-focus-within:text-white transition-colors duration-200" style={{ fontSize: 11 }} />
                </div>
                <input
                  type="text"
                  value={editProfile.avatar_url}
                  onChange={(e) => { setEditProfile({ ...editProfile, avatar_url: e.target.value }); setAvatarError(false); }}
                  placeholder="https://example.com/avatar.jpg"
                  className="settings-input text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={actionLoading}
              className="relative w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm disabled:opacity-50 overflow-hidden transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', boxShadow: '0 4px 16px rgba(14,165,233,0.35)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent shimmer-pass pointer-events-none" />
              {actionLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiSave style={{ fontSize: 13 }} />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="s-card bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="relative px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

          <div className="relative flex items-center gap-2.5 mb-5 sm:mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-md" style={{ boxShadow: '0 2px 10px rgba(168,85,247,0.4)' }}>
              <FiMail className="text-white" style={{ fontSize: 13 }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight">Account Information</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Your account details</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2.5 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 opacity-70 cursor-not-allowed">
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 11 }} />
                </div>
                <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 truncate font-medium">{profile?.email || ''}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Current Plan
              </label>

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
                  {planConfig.features.map((feature, idx) => (
                    <div key={idx} className="plan-feature">
                      <FiCheck style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }} />
                      {feature}
                    </div>
                  ))}
                </div>

                {settings?.plan_expires_at && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)', position: 'relative' }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                      Expires {new Date(settings.plan_expires_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="s-card relative rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-800/70 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50/50 to-white dark:from-purple-950/25 dark:via-pink-950/15 dark:to-zinc-950 pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/8 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6">
          <div className="flex items-start gap-2.5 mb-4 sm:mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0 mt-0.5" style={{ boxShadow: '0 2px 10px rgba(168,85,247,0.4)' }}>
              <FiGift className="text-white" style={{ fontSize: 13 }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight mb-0.5">Redeem Promo Code</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Upgrade your plan with a promotional code</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex items-center gap-2.5 flex-1 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-zinc-900 border-2 border-purple-200 dark:border-purple-700/60 focus-within:border-purple-500 transition-all duration-200" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <FiGift className="text-purple-500 dark:text-purple-400" style={{ fontSize: 11 }} />
              </div>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="PROMO-CODE"
                className="settings-input text-zinc-900 dark:text-white font-mono uppercase tracking-widest"
              />
            </div>
            <button
              onClick={handleRedeemPromo}
              disabled={actionLoading || !promoCode.trim()}
              className="relative px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm disabled:opacity-50 overflow-hidden transition-all duration-200 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', boxShadow: '0 4px 16px rgba(168,85,247,0.35)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent shimmer-pass pointer-events-none" />
              {actionLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Redeeming...</span>
                </>
              ) : (
                'Redeem'
              )}
            </button>
          </div>

          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-purple-100/70 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50">
            <FiAlertCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" style={{ fontSize: 11 }} />
            <p className="text-[9px] sm:text-[10px] text-purple-700 dark:text-purple-300 leading-relaxed">
              Enter a valid promo code to unlock premium features and extended rate limits
            </p>
          </div>
        </div>
      </div>

      <div className="s-card relative rounded-2xl overflow-hidden border border-red-200 dark:border-red-800/70 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-red-50/50 to-white dark:from-red-950/25 dark:via-red-950/10 dark:to-zinc-950 pointer-events-none" />

        <div className="relative px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6">
          <div className="flex items-start gap-2.5 mb-4 sm:mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-md flex-shrink-0 mt-0.5" style={{ boxShadow: '0 2px 10px rgba(239,68,68,0.35)' }}>
              <FiAlertCircle className="text-white" style={{ fontSize: 13 }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-red-900 dark:text-red-100 tracking-tight mb-0.5">Danger Zone</h3>
              <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
          </div>
          <button className="relative w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm overflow-hidden transition-all duration-200 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-pass pointer-events-none" />
            <FiAlertCircle style={{ fontSize: 13 }} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
