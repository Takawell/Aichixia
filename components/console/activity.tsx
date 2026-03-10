import { FiActivity, FiCheck, FiAlertCircle, FiClock, FiZap, FiTrendingUp, FiRefreshCw, FiChevronDown, FiGlobe, FiMonitor } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

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

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + diff * ease));
      if (t < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function StatCard({ icon: Icon, label, value, unit = '', color, bar, barValue }: {
  icon: any; label: string; value: number; unit?: string; color: string; bar?: boolean; barValue?: number;
}) {
  const animated = useCountUp(value);
  const colors: Record<string, { icon: string; glow: string; bar: string }> = {
    emerald: { icon: '#34d399', glow: 'rgba(52,211,153,0.15)', bar: 'linear-gradient(90deg,#34d399,#10b981)' },
    sky:     { icon: '#38bdf8', glow: 'rgba(56,189,248,0.15)', bar: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' },
    violet:  { icon: '#a78bfa', glow: 'rgba(167,139,250,0.15)', bar: 'linear-gradient(90deg,#a78bfa,#8b5cf6)' },
  };
  const c = colors[color];
  return (
    <div className="stat-card" style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: 14, padding: '16px 18px', flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: bar ? 12 : 0 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.03em' }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {animated.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
          </p>
        </div>
        <div style={{ padding: 8, borderRadius: 10, background: c.glow }}>
          <Icon style={{ fontSize: 16, color: c.icon }} />
        </div>
      </div>
      {bar && (
        <div style={{ height: 4, background: 'var(--bar-track)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: c.bar,
            width: `${barValue ?? 0}%`,
            transition: 'width 900ms cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
      )}
    </div>
  );
}

export default function Activity({ logs, loading, onRefresh }: ActivityProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const isSuccess = (s: number) => s >= 200 && s < 300;
  const filteredLogs = logs.filter(log => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'success') return isSuccess(log.status);
    return log.status >= 400;
  });

  const successCount = logs.filter(l => isSuccess(l.status)).length;
  const errorCount   = logs.filter(l => l.status >= 400).length;
  const successRate  = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0;
  const avgLatency   = (() => {
    const valid = logs.filter(l => l.latency_ms);
    return valid.length > 0 ? Math.round(valid.reduce((a, l) => a + (l.latency_ms || 0), 0) / valid.length) : 0;
  })();
  const totalTokens  = logs.reduce((a, l) => a + l.tokens_used, 0);

  return (
    <>
      <style>{`
        :root {
          --card-bg: #ffffff;
          --card-border: rgba(0,0,0,0.07);
          --card-hover: rgba(0,0,0,0.02);
          --text-primary: #0f0f10;
          --text-sub: #52525b;
          --text-muted: #a1a1aa;
          --divider: rgba(0,0,0,0.06);
          --bar-track: rgba(0,0,0,0.07);
          --tag-bg: rgba(0,0,0,0.04);
          --expand-bg: rgba(0,0,0,0.02);
        }
        .dark {
          --card-bg: #111113;
          --card-border: rgba(255,255,255,0.07);
          --card-hover: rgba(255,255,255,0.03);
          --text-primary: rgba(255,255,255,0.92);
          --text-sub: rgba(255,255,255,0.5);
          --text-muted: rgba(255,255,255,0.28);
          --divider: rgba(255,255,255,0.06);
          --bar-track: rgba(255,255,255,0.07);
          --tag-bg: rgba(255,255,255,0.06);
          --expand-bg: rgba(255,255,255,0.02);
        }
        @keyframes actFadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes rowIn {
          from { opacity:0; transform:translateX(-6px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes expandDown {
          from { opacity:0; transform:translateY(-6px); max-height:0; }
          to   { opacity:1; transform:translateY(0); max-height:400px; }
        }
        @keyframes dotPulse {
          0%,100% { transform:scale(1); opacity:1; }
          50% { transform:scale(1.6); opacity:0.6; }
        }
        .act-header { animation: actFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both 0.04s; }
        .stat-card  { animation: actFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .stat-card:nth-child(1) { animation-delay:0.08s; }
        .stat-card:nth-child(2) { animation-delay:0.13s; }
        .stat-card:nth-child(3) { animation-delay:0.18s; }
        .log-row { animation: rowIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .expand-panel { animation: expandDown 0.28s cubic-bezier(0.22,1,0.36,1) both; overflow:hidden; }
        .filter-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;
          border: none; cursor: pointer; transition: all 180ms cubic-bezier(0.22,1,0.36,1);
          background: transparent; color: var(--text-muted);
        }
        .filter-btn:hover { color: var(--text-primary); background: var(--card-hover); }
        .filter-btn.active-all    { background: linear-gradient(135deg,#38bdf8,#3b82f6); color:#fff; box-shadow:0 3px 10px rgba(56,189,248,0.3); }
        .filter-btn.active-success { background: #10b981; color:#fff; box-shadow:0 3px 10px rgba(16,185,129,0.3); }
        .filter-btn.active-error   { background: #ef4444; color:#fff; box-shadow:0 3px 10px rgba(239,68,68,0.3); }
        .log-row-inner {
          display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px;
          border-bottom: 1px solid var(--divider);
          transition: background 180ms;
          cursor: pointer;
        }
        .log-row-inner:hover { background: var(--card-hover); }
        .log-row-inner:last-child { border-bottom: none; }
        .chevron { transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1); }
        .chevron.open { transform: rotate(180deg); }
        .refresh-btn {
          width:32px; height:32px; display:flex; align-items:center; justify-content:center;
          border-radius:9px; border:none; background:transparent;
          color:var(--text-muted); cursor:pointer; transition:all 180ms;
        }
        .refresh-btn:hover { background:var(--tag-bg); color:var(--text-primary); }
        .refresh-btn:disabled { opacity:0.4; cursor:not-allowed; }
        @media (max-width:640px) {
          .log-row-inner { padding: 12px 14px; gap:10px; }
          .stats-row { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

        <div className="act-header" style={{
          background:'var(--card-bg)', border:'1px solid var(--card-border)',
          borderRadius:16, overflow:'hidden',
        }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--divider)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <FiActivity style={{ fontSize:14, color:'#38bdf8' }} />
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:0, letterSpacing:'-0.01em' }}>Recent Requests</h3>
              </div>
              <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>
                {logs.length} requests &nbsp;·&nbsp;
                <span style={{ color:'#34d399' }}>{successCount} success</span>
                &nbsp;·&nbsp;
                <span style={{ color:'#f87171' }}>{errorCount} errors</span>
              </p>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:2, background:'var(--tag-bg)', borderRadius:10, padding:3 }}>
                {(['all','success','error'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`filter-btn ${filterStatus === f ? `active-${f}` : ''}`}
                  >
                    {f === 'all' ? 'All' : f === 'success' ? 'Success' : 'Errors'}
                  </button>
                ))}
              </div>
              <button
                onClick={onRefresh}
                disabled={loading}
                className="refresh-btn"
                title="Refresh"
              >
                <FiRefreshCw style={{ fontSize:14, transition:'transform 600ms', transform: loading ? 'rotate(360deg)' : 'none', animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
              </button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ padding:'56px 24px', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <FiActivity style={{ fontSize:22, color:'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:5 }}>No Activity Yet</p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                {filterStatus === 'all' ? 'Your API requests will appear here' : `No ${filterStatus} requests found`}
              </p>
            </div>
          ) : (
            <div>
              {filteredLogs.map((log, idx) => {
                const ok = isSuccess(log.status);
                const isExpanded = expandedLog === log.id;
                const hasDetails = !!(log.error_message || log.ip_address || log.user_agent);
                return (
                  <div key={log.id} className="log-row" style={{ animationDelay:`${idx * 0.04}s` }}>
                    <div
                      className="log-row-inner"
                      onClick={() => hasDetails && setExpandedLog(isExpanded ? null : log.id)}
                      style={{ cursor: hasDetails ? 'pointer' : 'default' }}
                    >
                      <div style={{ marginTop:3, flexShrink:0 }}>
                        <div style={{
                          width:8, height:8, borderRadius:'50%',
                          background: ok ? '#34d399' : '#f87171',
                          boxShadow: ok ? '0 0 0 3px rgba(52,211,153,0.2)' : '0 0 0 3px rgba(248,113,113,0.2)',
                          animation:'dotPulse 2.5s ease-in-out infinite',
                          animationDelay:`${idx * 0.15}s`,
                        }} />
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, marginBottom:5 }}>
                          <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                            {log.model}
                          </span>
                          <span style={{
                            fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6,
                            background: ok ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                            color: ok ? '#34d399' : '#f87171',
                            border: `1px solid ${ok ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                          }}>
                            {log.status}
                          </span>
                        </div>

                        <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:7, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
                          {log.endpoint}
                        </p>

                        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--text-muted)' }}>
                            <FiClock style={{ fontSize:10 }} />
                            {new Date(log.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </div>
                          {log.latency_ms && (
                            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color: log.latency_ms > 2000 ? '#fbbf24' : '#38bdf8' }}>
                              <FiZap style={{ fontSize:10 }} />
                              {log.latency_ms}ms
                            </div>
                          )}
                          {log.tokens_used > 0 && (
                            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#a78bfa' }}>
                              <FiTrendingUp style={{ fontSize:10 }} />
                              {log.tokens_used.toLocaleString()} tokens
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        <div style={{
                          width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                          background: ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        }}>
                          {ok
                            ? <FiCheck style={{ fontSize:13, color:'#34d399' }} />
                            : <FiAlertCircle style={{ fontSize:13, color:'#f87171' }} />
                          }
                        </div>
                        {hasDetails && (
                          <FiChevronDown
                            className={`chevron ${isExpanded ? 'open' : ''}`}
                            style={{ fontSize:14, color:'var(--text-muted)' }}
                          />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="expand-panel" style={{ padding:'10px 18px 14px', background:'var(--expand-bg)', borderBottom:'1px solid var(--divider)' }}>
                        {log.error_message && (
                          <div style={{
                            padding:'10px 12px', borderRadius:10, marginBottom:8,
                            background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)',
                          }}>
                            <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                              <FiAlertCircle style={{ fontSize:12, color:'#f87171', flexShrink:0, marginTop:1 }} />
                              <div>
                                <p style={{ fontSize:10, fontWeight:700, color:'#f87171', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>Error Details</p>
                                <p style={{ fontSize:12, color:'var(--text-sub)', margin:0, lineHeight:1.5 }}>{log.error_message}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8 }}>
                          {log.ip_address && (
                            <div style={{ padding:'8px 12px', borderRadius:9, background:'var(--tag-bg)', border:'1px solid var(--card-border)' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                                <FiGlobe style={{ fontSize:11, color:'var(--text-muted)' }} />
                                <p style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', margin:0, textTransform:'uppercase', letterSpacing:'0.04em' }}>IP Address</p>
                              </div>
                              <p style={{ fontSize:12, fontFamily:'monospace', color:'var(--text-primary)', margin:0 }}>{log.ip_address}</p>
                            </div>
                          )}
                          {log.user_agent && (
                            <div style={{ padding:'8px 12px', borderRadius:9, background:'var(--tag-bg)', border:'1px solid var(--card-border)' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                                <FiMonitor style={{ fontSize:11, color:'var(--text-muted)' }} />
                                <p style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', margin:0, textTransform:'uppercase', letterSpacing:'0.04em' }}>User Agent</p>
                              </div>
                              <p style={{ fontSize:12, color:'var(--text-primary)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.user_agent}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="stats-row" style={{ display:'flex', gap:10 }}>
          <StatCard icon={FiCheck}      label="Success Rate" value={successRate} unit="%" color="emerald" bar barValue={successRate} />
          <StatCard icon={FiZap}        label="Avg Latency"  value={avgLatency}  unit="ms" color="sky" />
          <StatCard icon={FiTrendingUp} label="Total Tokens" value={totalTokens} color="violet" />
        </div>

        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    </>
  );
}
