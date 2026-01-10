import { supabase } from './supabase';
import crypto from 'crypto';

export function generateApiKey(): { key: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `acv-${randomBytes}`;
  const prefix = `acv-${randomBytes.slice(0, 8)}...`;
  return { key, prefix };
}

export async function getUserFromToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function verifyApiKey(apiKey: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  
  if (data.requests_used >= data.rate_limit) {
    return { error: 'Rate limit exceeded', key: data };
  }

  return { key: data };
}

export async function incrementUsage(apiKeyId: string) {
  const { error } = await supabase.rpc('increment_request_count', {
    api_key_text: apiKeyId
  });
  
  if (error) console.error('Failed to increment usage:', error);
}

export async function logRequest(data: {
  api_key_id: string;
  user_id: string;
  model: string;
  endpoint: string;
  status: number;
  latency_ms?: number;
  tokens_used?: number;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
}) {
  const { error } = await supabase
    .from('request_logs')
    .insert(data);

  if (error) console.error('Failed to log request:', error);
}

export async function updateDailyUsage(apiKeyId: string, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existing } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('api_key_id', apiKeyId)
    .eq('date', today)
    .single();

  if (existing) {
    await supabase
      .from('daily_usage')
      .update({
        requests_count: existing.requests_count + 1,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('daily_usage')
      .insert({
        api_key_id: apiKeyId,
        user_id: userId,
        date: today,
        requests_count: 1,
        tokens_used: 0,
        success_count: 0,
        error_count: 0,
      });
  }
}

export async function getUsageStats(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getRecentLogs(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('request_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

export async function getUserKeys(userId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function createApiKey(userId: string, name: string) {
  const { key, prefix } = generateApiKey();

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      key,
      name,
      prefix,
    })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function revokeApiKey(userId: string, keyId: string) {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', userId);

  return !error;
}

export async function updateApiKeyName(userId: string, keyId: string, newName: string) {
  const { error } = await supabase
    .from('api_keys')
    .update({ name: newName })
    .eq('id', keyId)
    .eq('user_id', userId);

  return !error;
}

export async function getTotalStats(userId: string) {
  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, requests_used, rate_limit, is_active')
    .eq('user_id', userId);

  if (!keys) return { totalRequests: 0, activeKeys: 0, rateLimitUsage: 0 };

  const totalRequests = keys.reduce((sum, k) => sum + k.requests_used, 0);
  const activeKeys = keys.filter(k => k.is_active).length;
  const totalLimit = keys.reduce((sum, k) => sum + k.rate_limit, 0);
  const rateLimitUsage = totalLimit > 0 ? (totalRequests / totalLimit) * 100 : 0;

  return {
    totalRequests,
    activeKeys,
    rateLimitUsage: Math.round(rateLimitUsage),
  };
}
