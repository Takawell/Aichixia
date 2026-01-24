import { useState } from 'react';
import { FiUser, FiMail, FiCamera, FiCheck, FiAlertCircle, FiGift, FiCreditCard, FiShield, FiSave } from 'react-icons/fi';

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
    limit: '200',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-500',
    features: ['200 requests/day', 'Basic models', 'Community support'],
  },
  pro: {
    name: 'Pro',
    limit: '600',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    features: ['600 requests/day', 'All models', 'Priority support', 'Advanced features'],
  },
  enterprise: {
    name: 'Enterprise',
    limit: '1,000',
    color: 'rose',
    gradient: 'from-rose-500 to-red-500',
    features: ['1,000 requests/day', 'All models', 'Dedicated support', 'Custom solutions'],
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

  const planConfig = PLAN_CONFIG[settings?.plan || 'free'];

  const handleUpdateProfile = () => {
    onUpdateProfile(editProfile);
  };

  const handleRedeemPromo = () => {
    if (!promoCode.trim()) return;
    onRedeemPromo(promoCode);
    setPromoCode('');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-lg">
            <FiUser className="text-white text-sm sm:text-base" />
          </div>
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
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48';
                }}
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
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
            <FiMail className="text-white text-sm sm:text-base" />
          </div>
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
            <div className={`p-3 sm:p-4 bg-gradient-to-br ${planConfig.gradient} rounded-lg shadow-lg`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <FiCreditCard className="text-white text-sm sm:text-base" />
                  <span className="text-sm sm:text-base font-bold text-white">{planConfig.name} Plan</span>
                </div>
                <FiShield className="text-white/80 text-sm sm:text-base" />
              </div>
              <p className="text-[10px] sm:text-xs text-white/90 mb-2 sm:mb-3">
                {planConfig.limit} requests per day
              </p>
              <div className="space-y-1 sm:space-y-1.5">
                {planConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
                    <FiCheck className="text-white/90 text-xs flex-shrink-0" />
                    <span className="text-[9px] sm:text-[10px] text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              {settings?.plan_expires_at && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
                  <p className="text-[9px] sm:text-[10px] text-white/80">
                    Expires: {new Date(settings.plan_expires_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
            <FiGift className="text-white text-sm sm:text-base" />
          </div>
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
            ) : (
              'Redeem'
            )}
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
          <div className="p-1.5 sm:p-2 bg-red-500 rounded-lg">
            <FiAlertCircle className="text-white text-sm sm:text-base" />
          </div>
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
