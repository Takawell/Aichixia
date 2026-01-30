import { NextApiRequest, NextApiResponse } from 'next';
import { getLeaderboardUsers, getModelsLeaderboard, getModelDetailStats, getUserRank, getUserMostUsedModel } from '@/lib/leaderboard';
import { getUserFromToken } from '@/lib/console-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, range = 'monthly', modelId } = req.query;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Type parameter is required' });
    }

    if (range && !['daily', 'weekly', 'monthly', 'all'].includes(range as string)) {
      return res.status(400).json({ error: 'Invalid time range' });
    }

    const timeRange = range as 'daily' | 'weekly' | 'monthly' | 'all';

    if (type === 'users') {
      const users = await getLeaderboardUsers(timeRange);
      return res.status(200).json({
        users,
        timeRange: range,
        total: users.length,
      });
    }

    if (type === 'models') {
      const models = await getModelsLeaderboard();
      return res.status(200).json({
        models,
        total: models.length,
      });
    }

    if (type === 'model-detail') {
      if (!modelId || typeof modelId !== 'string') {
        return res.status(400).json({ error: 'Model ID is required' });
      }

      const modelDetail = await getModelDetailStats(modelId, timeRange);

      if (!modelDetail) {
        return res.status(404).json({ error: 'Model not found' });
      }

      return res.status(200).json(modelDetail);
    }

    if (type === 'my-rank') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      const user = await getUserFromToken(token);

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const userRank = await getUserRank(user.id, timeRange);
      const mostUsedModel = await getUserMostUsedModel(user.id, timeRange);

      if (!userRank) {
        return res.status(200).json({
          user: null,
          total_users: 0,
          most_used_model: null,
          message: 'No activity in this time range',
        });
      }

      return res.status(200).json({
        ...userRank,
        most_used_model: mostUsedModel,
      });
    }

    return res.status(400).json({ error: 'Invalid type parameter' });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
