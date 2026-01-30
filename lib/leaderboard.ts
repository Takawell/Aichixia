import { getServiceSupabase } from './supabase';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'all';

type LeaderboardUser = {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  total_requests: number;
  total_tokens: number;
  rank: number;
};

type ModelStats = {
  model_id: string;
  model_name: string;
  total_requests: number;
  total_tokens: number;
  success_rate: number;
  avg_latency: number;
};

type ModelDetailStats = {
  model: ModelStats;
  dailyTrends: Array<{ date: string; requests: number; tokens: number }>;
  topUsers: Array<{
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    plan: string;
    requests: number;
    tokens: number;
  }>;
  peakHours: Array<{ hour: number; requests: number }>;
};

type UserRank = {
  user: LeaderboardUser;
  total_users: number;
};

const AVAILABLE_MODELS = [
  { id: 'aichixia-thinking', name: 'Aichixia 411B' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2' },
  { id: 'deepseek-v3.1', name: 'DeepSeek V3.1' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini' },
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'kimi-k2', name: 'Kimi K2' },
  { id: 'glm-4.7', name: 'GLM 4.7' },
  { id: 'mistral-3.1', name: 'Mistral 3.1' },
  { id: 'qwen3-235b', name: 'Qwen3 235B' },
  { id: 'qwen3-coder-480b', name: 'Qwen3 Coder 480B' },
  { id: 'minimax-m2.1', name: 'MiniMax M2.1' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B' },
  { id: 'mimo-v2-flash', name: 'MiMo V2 Flash' },
  { id: 'groq-compound', name: 'Groq Compound' },
  { id: 'cohere-command-a', name: 'Cohere Command A' },
  { id: 'grok-3', name: 'Grok 3' },
  { id: 'flux-2', name: 'Flux 2' },
  { id: 'lucid-origin', name: 'Lucid Origin' },
  { id: 'phoenix-1.0', name: 'Phoenix 1.0' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro' },
  { id: 'starling-tts', name: 'Starling TTS' },
  { id: 'lindsay-tts', name: 'Lindsay TTS' },
];

function getDateFilter(range: TimeRange): string | null {
  const now = new Date();
  
  if (range === 'daily') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  } else if (range === 'weekly') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return weekAgo.toISOString();
  } else if (range === 'monthly') {
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    return monthAgo.toISOString();
  }
  
  return null;
}

export async function getLeaderboardUsers(range: TimeRange = 'monthly'): Promise<LeaderboardUser[]> {
  const supabaseAdmin = getServiceSupabase();
  const dateFilter = getDateFilter(range);

  let query = supabaseAdmin
    .from('request_logs')
    .select('user_id, tokens_used');

  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  const { data: logs, error: logsError } = await query;

  if (logsError || !logs) {
    console.error('Error fetching request logs:', logsError);
    return [];
  }

  const userStatsMap = new Map<string, { requests: number; tokens: number }>();

  logs.forEach(log => {
    const existing = userStatsMap.get(log.user_id) || { requests: 0, tokens: 0 };
    userStatsMap.set(log.user_id, {
      requests: existing.requests + 1,
      tokens: existing.tokens + (log.tokens_used || 0),
    });
  });

  const userIds = Array.from(userStatsMap.keys());

  if (userIds.length === 0) return [];

  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('user_id, email, display_name, avatar_url')
    .in('user_id', userIds);

  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('user_settings')
    .select('user_id, plan')
    .in('user_id', userIds);

  if (usersError || settingsError || !users || !settings) {
    console.error('Error fetching users or settings:', usersError, settingsError);
    return [];
  }

  const userMap = new Map(users.map(u => [u.user_id, u]));
  const settingsMap = new Map(settings.map(s => [s.user_id, s]));

  const leaderboard: LeaderboardUser[] = [];

  userStatsMap.forEach((stats, userId) => {
    const user = userMap.get(userId);
    const userSettings = settingsMap.get(userId);

    if (user && userSettings) {
      leaderboard.push({
        user_id: userId,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        plan: userSettings.plan,
        total_requests: stats.requests,
        total_tokens: stats.tokens,
        rank: 0,
      });
    }
  });

  leaderboard.sort((a, b) => b.total_requests - a.total_requests);

  leaderboard.forEach((user, index) => {
    user.rank = index + 1;
  });

  return leaderboard.slice(0, 10);
}

export async function getModelsLeaderboard(): Promise<ModelStats[]> {
  const supabaseAdmin = getServiceSupabase();

  const { data: logs, error } = await supabaseAdmin
    .from('request_logs')
    .select('model, tokens_used, status, latency_ms');

  if (error || !logs) {
    console.error('Error fetching model logs:', error);
    return AVAILABLE_MODELS.map(model => ({
      model_id: model.id,
      model_name: model.name,
      total_requests: 0,
      total_tokens: 0,
      success_rate: 0,
      avg_latency: 0,
    }));
  }

  const modelStatsMap = new Map<string, {
    requests: number;
    tokens: number;
    successes: number;
    latencies: number[];
  }>();

  logs.forEach(log => {
    const existing = modelStatsMap.get(log.model) || {
      requests: 0,
      tokens: 0,
      successes: 0,
      latencies: [],
    };

    existing.requests += 1;
    existing.tokens += log.tokens_used || 0;
    if (log.status >= 200 && log.status < 300) {
      existing.successes += 1;
    }
    if (log.latency_ms) {
      existing.latencies.push(log.latency_ms);
    }

    modelStatsMap.set(log.model, existing);
  });

  const modelStats: ModelStats[] = AVAILABLE_MODELS.map(model => {
    const stats = modelStatsMap.get(model.id);

    if (!stats) {
      return {
        model_id: model.id,
        model_name: model.name,
        total_requests: 0,
        total_tokens: 0,
        success_rate: 0,
        avg_latency: 0,
      };
    }

    const successRate = stats.requests > 0 ? (stats.successes / stats.requests) * 100 : 0;
    const avgLatency = stats.latencies.length > 0
      ? stats.latencies.reduce((sum, lat) => sum + lat, 0) / stats.latencies.length
      : 0;

    return {
      model_id: model.id,
      model_name: model.name,
      total_requests: stats.requests,
      total_tokens: stats.tokens,
      success_rate: Math.round(successRate * 10) / 10,
      avg_latency: Math.round(avgLatency),
    };
  });

  return modelStats;
}

export async function getModelDetailStats(
  modelId: string,
  range: TimeRange = 'monthly'
): Promise<ModelDetailStats | null> {
  const supabaseAdmin = getServiceSupabase();
  const dateFilter = getDateFilter(range);

  let query = supabaseAdmin
    .from('request_logs')
    .select('user_id, tokens_used, status, latency_ms, created_at')
    .eq('model', modelId);

  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  const { data: logs, error } = await query;

  if (error || !logs) {
    console.error('Error fetching model detail logs:', error);
    return null;
  }

  const modelInfo = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!modelInfo) return null;

  const totalRequests = logs.length;
  const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
  const successes = logs.filter(log => log.status >= 200 && log.status < 300).length;
  const successRate = totalRequests > 0 ? (successes / totalRequests) * 100 : 0;
  const latencies = logs.filter(log => log.latency_ms).map(log => log.latency_ms!);
  const avgLatency = latencies.length > 0
    ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
    : 0;

  const dailyMap = new Map<string, { requests: number; tokens: number }>();
  logs.forEach(log => {
    const date = log.created_at.split('T')[0];
    const existing = dailyMap.get(date) || { requests: 0, tokens: 0 };
    dailyMap.set(date, {
      requests: existing.requests + 1,
      tokens: existing.tokens + (log.tokens_used || 0),
    });
  });

  const dailyTrends = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, requests: stats.requests, tokens: stats.tokens }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const userStatsMap = new Map<string, { requests: number; tokens: number }>();
  logs.forEach(log => {
    const existing = userStatsMap.get(log.user_id) || { requests: 0, tokens: 0 };
    userStatsMap.set(log.user_id, {
      requests: existing.requests + 1,
      tokens: existing.tokens + (log.tokens_used || 0),
    });
  });

  const topUserIds = Array.from(userStatsMap.entries())
    .sort((a, b) => b[1].requests - a[1].requests)
    .slice(0, 5)
    .map(([userId]) => userId);

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('user_id, display_name, avatar_url')
    .in('user_id', topUserIds);

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('user_id, plan')
    .in('user_id', topUserIds);

  const userMap = new Map(users?.map(u => [u.user_id, u]) || []);
  const settingsMap = new Map(settings?.map(s => [s.user_id, s]) || []);

  const topUsers = topUserIds.map(userId => {
    const user = userMap.get(userId);
    const userSettings = settingsMap.get(userId);
    const stats = userStatsMap.get(userId)!;

    return {
      user_id: userId,
      display_name: user?.display_name || null,
      avatar_url: user?.avatar_url || null,
      plan: userSettings?.plan || 'free',
      requests: stats.requests,
      tokens: stats.tokens,
    };
  });

  const hourMap = new Map<number, number>();
  logs.forEach(log => {
    const hour = new Date(log.created_at).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  const peakHours = Array.from(hourMap.entries())
    .map(([hour, requests]) => ({ hour, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);

  return {
    model: {
      model_id: modelId,
      model_name: modelInfo.name,
      total_requests: totalRequests,
      total_tokens: totalTokens,
      success_rate: Math.round(successRate * 10) / 10,
      avg_latency: Math.round(avgLatency),
    },
    dailyTrends,
    topUsers,
    peakHours,
  };
}

export async function getUserRank(userId: string, range: TimeRange = 'monthly'): Promise<UserRank | null> {
  const supabaseAdmin = getServiceSupabase();
  const dateFilter = getDateFilter(range);

  let query = supabaseAdmin
    .from('request_logs')
    .select('user_id, tokens_used');

  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  const { data: logs, error } = await query;

  if (error || !logs) {
    console.error('Error fetching user rank logs:', error);
    return null;
  }

  const userStatsMap = new Map<string, { requests: number; tokens: number }>();

  logs.forEach(log => {
    const existing = userStatsMap.get(log.user_id) || { requests: 0, tokens: 0 };
    userStatsMap.set(log.user_id, {
      requests: existing.requests + 1,
      tokens: existing.tokens + (log.tokens_used || 0),
    });
  });

  const allUsers = Array.from(userStatsMap.entries())
    .map(([uid, stats]) => ({ user_id: uid, ...stats }))
    .sort((a, b) => b.requests - a.requests);

  const userIndex = allUsers.findIndex(u => u.user_id === userId);

  if (userIndex === -1) {
    return null;
  }

  const userStats = allUsers[userIndex];

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, display_name, avatar_url')
    .eq('user_id', userId)
    .single();

  const { data: userSettings } = await supabaseAdmin
    .from('user_settings')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (!user || !userSettings) {
    return null;
  }

  return {
    user: {
      user_id: userId,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      plan: userSettings.plan,
      total_requests: userStats.requests,
      total_tokens: userStats.tokens,
      rank: userIndex + 1,
    },
    total_users: allUsers.length,
  };
}

export async function getUserMostUsedModel(userId: string, range: TimeRange = 'monthly'): Promise<string | null> {
  const supabaseAdmin = getServiceSupabase();
  const dateFilter = getDateFilter(range);

  let query = supabaseAdmin
    .from('request_logs')
    .select('model')
    .eq('user_id', userId);

  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  const { data: logs, error } = await query;

  if (error || !logs || logs.length === 0) {
    return null;
  }

  const modelCounts = new Map<string, number>();

  logs.forEach(log => {
    modelCounts.set(log.model, (modelCounts.get(log.model) || 0) + 1);
  });

  const sortedModels = Array.from(modelCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  return sortedModels[0]?.[0] || null;
}
