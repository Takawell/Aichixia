import { getServiceSupabase } from './supabase';

type TopUser = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  total_requests: number;
  total_tokens: number;
  rank: number;
};

type ModelStat = {
  model_id: string;
  total_requests: number;
  total_tokens: number;
  success_count: number;
  error_count: number;
  success_rate: number;
  popularity_percent: number;
};

type GlobalStats = {
  totalUsers: number;
  totalRequests: number;
  requestsToday: number;
  topModel: string;
  activeUsersToday: number;
};

export async function getTopUsers(limit: number = 10): Promise<TopUser[]> {
  const supabaseAdmin = getServiceSupabase();
  
  const { data: aggregated } = await supabaseAdmin
    .from('daily_usage')
    .select('user_id, requests_count, tokens_used');
  
  if (!aggregated || aggregated.length === 0) return [];
  
  const userTotals: Record<string, { total_requests: number; total_tokens: number }> = {};
  
  aggregated.forEach(row => {
    if (!userTotals[row.user_id]) {
      userTotals[row.user_id] = { total_requests: 0, total_tokens: 0 };
    }
    userTotals[row.user_id].total_requests += row.requests_count || 0;
    userTotals[row.user_id].total_tokens += row.tokens_used || 0;
  });
  
  const sortedUsers = Object.entries(userTotals)
    .sort((a, b) => b[1].total_requests - a[1].total_requests)
    .slice(0, limit);
  
  if (sortedUsers.length === 0) return [];
  
  const topUserIds = sortedUsers.map(([user_id]) => user_id);
  
  const [profilesResult, settingsResult] = await Promise.all([
    supabaseAdmin
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', topUserIds),
    supabaseAdmin
      .from('user_settings')
      .select('user_id, plan')
      .in('user_id', topUserIds)
  ]);
  
  const profiles = profilesResult.data || [];
  const settings = settingsResult.data || [];
  
  return sortedUsers.map(([user_id, totals], index) => {
    const profile = profiles.find(p => p.user_id === user_id);
    const setting = settings.find(s => s.user_id === user_id);
    
    return {
      user_id,
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      plan: setting?.plan || 'free',
      total_requests: totals.total_requests,
      total_tokens: totals.total_tokens,
      rank: index + 1,
    };
  });
}

export async function getAllModelsStats(): Promise<ModelStat[]> {
  const supabaseAdmin = getServiceSupabase();
  
  const { data: logs } = await supabaseAdmin
    .from('request_logs')
    .select('model, tokens_used, status');
  
  if (!logs || logs.length === 0) return [];
  
  const modelStats: Record<string, {
    total_requests: number;
    total_tokens: number;
    success_count: number;
    error_count: number;
  }> = {};
  
  logs.forEach(log => {
    if (!modelStats[log.model]) {
      modelStats[log.model] = {
        total_requests: 0,
        total_tokens: 0,
        success_count: 0,
        error_count: 0,
      };
    }
    modelStats[log.model].total_requests += 1;
    modelStats[log.model].total_tokens += log.tokens_used || 0;
    if (log.status >= 200 && log.status < 300) {
      modelStats[log.model].success_count += 1;
    } else {
      modelStats[log.model].error_count += 1;
    }
  });
  
  const maxRequests = Math.max(...Object.values(modelStats).map(s => s.total_requests), 1);
  
  return Object.entries(modelStats).map(([model_id, stats]) => ({
    model_id,
    total_requests: stats.total_requests,
    total_tokens: stats.total_tokens,
    success_count: stats.success_count,
    error_count: stats.error_count,
    success_rate: stats.total_requests > 0 
      ? (stats.success_count / stats.total_requests) * 100 
      : 0,
    popularity_percent: (stats.total_requests / maxRequests) * 100,
  }));
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabaseAdmin = getServiceSupabase();
  
  const [usersResult, allUsageResult] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('daily_usage').select('requests_count, user_id, date')
  ]);
  
  const totalUsers = usersResult.count || 0;
  const allUsage = allUsageResult.data || [];
  const totalRequests = allUsage.reduce((sum, row) => sum + (row.requests_count || 0), 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayUsage = allUsage.filter(row => row.date === today);
  const requestsToday = todayUsage.reduce((sum, row) => sum + (row.requests_count || 0), 0);
  const activeUsersToday = new Set(todayUsage.map(r => r.user_id)).size;
  
  const modelStats = await getAllModelsStats();
  const topModel = modelStats.length > 0 
    ? modelStats.sort((a, b) => b.total_requests - a.total_requests)[0].model_id 
    : 'N/A';
  
  return {
    totalUsers,
    totalRequests,
    requestsToday,
    topModel,
    activeUsersToday,
  };
}
