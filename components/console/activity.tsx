import { FiActivity, FiCheck, FiAlertCircle, FiClock, FiZap, FiTrendingUp, FiRefreshCw, FiFilter, FiX } from 'react-icons/fi';
import { useState } from 'react';

type RequestLog = {
  id: string;
  api_key_id: string;
  user_id: string;
  model: string;
  endpoint: string;
  status: number;
  latency_ms: number | null;
  tokens_used: number;
  error_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type ActivityProps = {
  logs: RequestLog[];
  loading: boolean;
  onRefresh: () => void;
};

const STATUS_CONFIG = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: FiCheck,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    icon: FiAlertCircle,
  },
};

export default function Activity({ logs, loading, onRefresh }: ActivityProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getStatusConfig = (status: number) => {
    return status >= 200 && status < 300 ? STATUS_CONFIG.success : STATUS_CONFIG.error;
  };

  const filteredLogs = logs.filter(log => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'success') return log.status >= 200 && log.status < 300;
    if (filterStatus === 'error') return log.status >= 400;
    return true;
  });

  const successCount = logs.filter(l => l.status >= 200 && l.status < 300).length;
  const errorCount = logs.filter(l => l.status >= 400).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FiActivity className="text-sky-500 dark:text-sky-400" />
                Recent Requests
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Last {logs.length} API requests • {successCount} success • {errorCount} errors
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                    filterStatus === 'all'
                      ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/30'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('success')}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                    filterStatus === 'success'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  Success
                </button>
                <button
                  onClick={() => setFilterStatus('error')}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                    filterStatus === 'error'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  Errors
                </button>
              </div>

              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw className={`text-sm sm:text-base text-zinc-600 dark:text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiActivity className="text-xl sm:text-3xl text-zinc-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1 sm:mb-2">No Activity Yet</h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {filterStatus === 'all' 
                ? 'Your API requests will appear here'
                : `No ${filterStatus} requests found`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredLogs.map((log) => {
              const config = getStatusConfig(log.status);
              const Icon = config.icon;
              const isExpanded = expandedLog === log.id;

              return (
                <div
                  key={log.id}
                  className="p-3 sm:p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-start sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${config.dot} flex-shrink-0 mt-1 sm:mt-0 animate-pulse`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
                              {log.model}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${config.bg} ${config.border} ${config.text} border`}>
                              {log.status}
                            </span>
                          </div>
                          
                          <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 mb-1 sm:mb-1.5 truncate">
                            {log.endpoint}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1">
                              <FiClock className="text-[10px] sm:text-xs flex-shrink-0" />
                              <span>{new Date(log.created_at).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                            
                            {log.latency_ms && (
                              <div className="flex items-center gap-1">
                                <FiZap className="text-[10px] sm:text-xs flex-shrink-0" />
                                <span>{log.latency_ms}ms</span>
                              </div>
                            )}
                            
                            {log.tokens_used > 0 && (
                              <div className="flex items-center gap-1">
                                <FiTrendingUp className="text-[10px] sm:text-xs flex-shrink-0" />
                                <span>{log.tokens_used.toLocaleString()} tokens</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <div className={`p-1 sm:p-1.5 ${config.bg} rounded-md sm:rounded-lg border ${config.border}`}>
                          <Icon className={`${config.text} text-xs sm:text-sm`} />
                        </div>
                        
                        {(log.error_message || log.ip_address) && (
                          <button
                            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                            className="p-1 sm:p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                          >
                            {isExpanded ? (
                              <FiX className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400" />
                            ) : (
                              <FiFilter className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 pl-4 sm:pl-5 animate-in slide-in-from-top-2 duration-200">
                        {log.error_message && (
                          <div className={`p-2 sm:p-2.5 ${config.bg} rounded-lg border ${config.border}`}>
                            <div className="flex items-start gap-1.5 sm:gap-2">
                              <FiAlertCircle className={`${config.text} text-xs sm:text-sm flex-shrink-0 mt-0.5`} />
                              <div>
                                <p className={`text-[9px] sm:text-[10px] font-semibold ${config.text} mb-0.5`}>Error Details</p>
                                <p className="text-[10px] sm:text-xs text-zinc-700 dark:text-zinc-300 break-words">
                                  {log.error_message}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {log.ip_address && (
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                              <p className="text-[9px] sm:text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">IP Address</p>
                              <p className="text-[10px] sm:text-xs font-mono text-zinc-900 dark:text-white">{log.ip_address}</p>
                            </div>
                          )}

                          {log.user_agent && (
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                              <p className="text-[9px] sm:text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">User Agent</p>
                              <p className="text-[10px] sm:text-xs text-zinc-900 dark:text-white truncate">{log.user_agent}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <FiCheck className="text-sm sm:text-base text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Success Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0}%
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${logs.length > 0 ? (successCount / logs.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
              <FiZap className="text-sm sm:text-base text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Avg Latency</p>
              <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {logs.filter(l => l.latency_ms).length > 0
                  ? Math.round(logs.filter(l => l.latency_ms).reduce((acc, l) => acc + (l.latency_ms || 0), 0) / logs.filter(l => l.latency_ms).length)
                  : 0}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FiTrendingUp className="text-sm sm:text-base text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Tokens</p>
              <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {logs.reduce((acc, l) => acc + l.tokens_used, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
