import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { getUsageStats, getRecentLogs, getTotalStats, getAllUsersStats } from "@/lib/console-utils";
import { getServiceSupabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { type, days, limit, admin } = req.query;
  const isAdminRequest = admin === 'true';

  if (isAdminRequest) {
    const supabaseAdmin = getServiceSupabase();
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!settings?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
  }

  if (type === 'usage') {
    const daysCount = days ? parseInt(days as string) : 7;
    const usageData = await getUsageStats(user.id, daysCount, isAdminRequest);
    return res.status(200).json({ usage: usageData });
  }

  if (type === 'logs') {
    const logsLimit = limit ? parseInt(limit as string) : 20;
    const logs = await getRecentLogs(user.id, logsLimit, isAdminRequest);
    return res.status(200).json({ logs });
  }

  if (type === 'total') {
    if (isAdminRequest) {
      const stats = await getAllUsersStats();
      return res.status(200).json({ stats });
    } else {
      const stats = await getTotalStats(user.id);
      return res.status(200).json({ stats });
    }
  }

  return res.status(400).json({ error: 'Invalid type parameter. Use: usage, logs, or total' });
}
