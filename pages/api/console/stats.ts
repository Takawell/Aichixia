import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { getUsageStats, getRecentLogs, getTotalStats } from "@/lib/console-utils";

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

  const { type, days, limit } = req.query;

  if (type === 'usage') {
    const daysCount = days ? parseInt(days as string) : 7;
    const usageData = await getUsageStats(user.id, daysCount);
    return res.status(200).json({ usage: usageData });
  }

  if (type === 'logs') {
    const logsLimit = limit ? parseInt(limit as string) : 20;
    const logs = await getRecentLogs(user.id, logsLimit);
    return res.status(200).json({ logs });
  }

  if (type === 'total') {
    const stats = await getTotalStats(user.id);
    return res.status(200).json({ stats });
  }

  return res.status(400).json({ error: 'Invalid type parameter. Use: usage, logs, or total' });
}
