import { useState } from 'react';
import { FiKey, FiCopy, FiCheck, FiTrash2, FiEdit2, FiSave, FiX, FiPlus, FiAlertCircle, FiActivity, FiClock } from 'react-icons/fi';

type ApiKey = {
  id: string;
  user_id: string;
  key: string;
  name: string;
  prefix: string;
  is_active: boolean;
  rate_limit: number;
  requests_used: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
};

type ApiKeysProps = {
  keys: ApiKey[];
  onCopy: (text: string, id: string) => void;
  copiedKey: string | null;
  onCreateKey: () => void;
  onRevokeKey: (key: ApiKey) => void;
  onUpdateKeyName: (keyId: string, name: string) => void;
  actionLoading: boolean;
};

export default function ApiKeys({
  keys,
  onCopy,
  copiedKey,
  onCreateKey,
  onRevokeKey,
  onUpdateKeyName,
  actionLoading,
}: ApiKeysProps) {
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeKeys = keys.filter(k => k.is_active);
  const maxKeys = 2;
  const canCreateMoreKeys = activeKeys.length < maxKeys;
  
  let cooldownInfo: { hoursRemaining: number; canCreate: boolean } | null = null;
  
  if (keys.length > 0) {
    const sortedKeys = [...keys].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastCreatedKey = sortedKeys[0];
    const lastCreated = new Date(lastCreatedKey.created_at);
    const now = new Date();
    const hoursSinceLastCreate = (now.getTime() - lastCreated.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastCreate < 24) {
      const hoursRemaining = Math.ceil(24 - hoursSinceLastCreate);
      cooldownInfo = {
        hoursRemaining,
        canCreate: false
      };
    }
  }

  const canCreateKey = canCreateMoreKeys && (!cooldownInfo || cooldownInfo.canCreate);
  const handleSaveEdit = (keyId: string) => {
    if (!editingName.trim()) return;
    onUpdateKeyName(keyId, editingName);
    setEditingKeyId(null);
    setEditingName('');
  };

  const handleCreateClick = () => {
    if (!canCreateKey) {
      return;
    }
    onCreateKey();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-2">
        {cooldownInfo && !cooldownInfo.canCreate && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <FiClock className="text-amber-600 dark:text-amber-400 text-sm flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Cooldown Active</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Wait {cooldownInfo.hoursRemaining} hour{cooldownInfo.hoursRemaining > 1 ? 's' : ''} before creating another key. You can create 1 key every 24 hours.
              </p>
            </div>
          </div>
        )}
        
        {activeKeys.length >= maxKeys && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <FiAlertCircle className="text-red-600 dark:text-red-400 text-sm flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold">Maximum Keys Reached</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                You have {maxKeys} active keys (maximum allowed). Revoke one to create a new key.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white">{activeKeys.length}</span> / {maxKeys} active keys
          </div>
          <button
            onClick={handleCreateClick}
            disabled={!canCreateKey || actionLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:from-zinc-400 disabled:to-zinc-500"
            title={!canCreateKey ? (
              activeKeys.length >= maxKeys 
                ? 'Maximum keys reached. Revoke a key first.' 
                : `Wait ${cooldownInfo?.hoursRemaining || 0} hours`
            ) : 'Create new API key'}
          >
            <FiPlus className="text-sm sm:text-base" />
            Create New Key
          </button>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {keys.length === 0 ? (
          <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiKey className="text-xl sm:text-3xl text-zinc-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1 sm:mb-2">No API Keys Yet</h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">Create your first API key to get started</p>
            <button
              onClick={onCreateKey}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm shadow-lg"
            >
              Create API Key
            </button>
          </div>
        ) : (
          keys.map((key) => {
            const usagePercentage = (key.requests_used / key.rate_limit) * 100;
            const isLowUsage = usagePercentage < 50;
            const isMediumUsage = usagePercentage >= 50 && usagePercentage < 80;
            const isHighUsage = usagePercentage >= 80;

            return (
              <div
                key={key.id}
                className="group bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:shadow-xl hover:shadow-sky-400/10 dark:hover:shadow-sky-400/20 transition-all hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                        key.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        {editingKeyId === key.id ? (
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(key.id)}
                              disabled={actionLoading}
                              className="p-1 sm:p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FiSave className="text-xs sm:text-sm" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingKeyId(null);
                                setEditingName('');
                              }}
                              className="p-1 sm:p-1.5 bg-zinc-500 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                              <FiX className="text-xs sm:text-sm" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                              {key.name}
                            </h3>
                            <button
                              onClick={() => {
                                setEditingKeyId(key.id);
                                setEditingName(key.name);
                              }}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <FiEdit2 className="text-xs text-zinc-400" />
                            </button>
                            <span className={`ml-auto px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold ${
                              key.is_active
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                            }`}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
                          <code className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg font-mono text-[10px] sm:text-xs text-zinc-900 dark:text-white truncate border border-zinc-200 dark:border-zinc-800">
                            {key.prefix}
                          </code>
                          <button
                            onClick={() => onCopy(key.key, key.id)}
                            className="p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                          >
                            {copiedKey === key.id ? (
                              <FiCheck className="text-emerald-500 text-xs sm:text-sm" />
                            ) : (
                              <FiCopy className="text-zinc-400 text-xs sm:text-sm" />
                            )}
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] sm:text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                              <FiActivity className="text-[10px]" />
                              Usage
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {key.requests_used.toLocaleString()} / {key.rate_limit.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="relative h-1.5 sm:h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHighUsage
                                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                  : isMediumUsage
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                  : 'bg-gradient-to-r from-emerald-500 to-green-500'
                              }`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                          </div>

                          {usagePercentage >= 80 && (
                            <div className="flex items-start gap-1.5 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                              <FiAlertCircle className="text-orange-600 dark:text-orange-400 text-xs flex-shrink-0 mt-0.5" />
                              <p className="text-[9px] sm:text-[10px] text-orange-700 dark:text-orange-400 font-medium">
                                {usagePercentage >= 100 ? 'Rate limit reached' : 'Approaching rate limit'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span>Created {new Date(key.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                          <span>Reset {new Date(key.last_reset_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onRevokeKey(key)}
                      disabled={!key.is_active || actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm border border-red-200 dark:border-red-800"
                    >
                      <FiTrash2 className="text-xs sm:text-sm" />
                      <span>Revoke Key</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {keys.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                <FiKey className="text-sm sm:text-base text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Keys</p>
                <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  {keys.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <FiCheck className="text-sm sm:text-base text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Keys</p>
                <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  {keys.filter(k => k.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <FiActivity className="text-sm sm:text-base text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Requests</p>
                <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  {keys.reduce((acc, k) => acc + k.requests_used, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
