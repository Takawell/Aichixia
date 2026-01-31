import type { NextApiRequest, NextApiResponse } from 'next';
import { getTopUsers, getAllModelsStats, getGlobalStats } from '@/lib/leaderboard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [globalStats, topUsers, modelStats] = await Promise.all([
      getGlobalStats(),
      getTopUsers(10),
      getAllModelsStats(),
    ]);

    return res.status(200).json({
      globalStats,
      topUsers,
      modelStats,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
}
