import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LeaderboardHeader from '@/components/leaderboard/headers';
import YourStats from '@/components/leaderboard/yourstats';
import TopUsers from '@/components/leaderboard/topusers';
import ModelGrid from '@/components/leaderboard/modelgrid';
import ModelDetailModal from '@/components/leaderboard/details';

type User = {
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

type UserRankData = {
  user: User | null;
  total_users: number;
  most_used_model: string | null;
};

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly');
  const [users, setUsers] = useState<User[]>([]);
  const [models, setModels] = useState<ModelStats[]>([]);
  const [userRank, setUserRank] = useState<UserRankData | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [modelDetail, setModelDetail] = useState<ModelDetailStats | null>(null);
  const [detailTimeRange, setDetailTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modelDetailLoading, setModelDetailLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  useEffect(() => {
    if (selectedModelId) {
      fetchModelDetail(selectedModelId, detailTimeRange);
    }
  }, [selectedModelId, detailTimeRange]);

  const fetchAllData = async (force = false) => {
    if (force) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const [usersRes, modelsRes, rankRes] = await Promise.all([
        fetch(`/api/leaderboard?type=users&range=${timeRange}`),
        fetch(`/api/leaderboard?type=models`),
        token 
          ? fetch(`/api/leaderboard?type=my-rank&range=${timeRange}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          : Promise.resolve(null)
      ]);

      const usersData = await usersRes.json();
      const modelsData = await modelsRes.json();
      const rankData = rankRes ? await rankRes.json() : null;

      setUsers(usersData.users || []);
      setModels(modelsData.models || []);
      setUserRank(rankData);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchModelDetail = async (modelId: string, range: 'daily' | 'weekly' | 'monthly') => {
    setModelDetailLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=model-detail&modelId=${modelId}&range=${range}`);
      const data = await res.json();
      setModelDetail(data);
    } catch (error) {
      console.error('Failed to fetch model detail:', error);
      setModelDetail(null);
    } finally {
      setModelDetailLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData(true);
  };

  const handleTimeRangeChange = (range: 'daily' | 'weekly' | 'monthly' | 'all') => {
    setTimeRange(range);
  };

  const handleModelClick = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleCloseModal = () => {
    setSelectedModelId(null);
    setModelDetail(null);
  };

  const handleDetailTimeRangeChange = (range: 'daily' | 'weekly' | 'monthly') => {
    setDetailTimeRange(range);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <LeaderboardHeader
        onRefresh={handleRefresh}
        refreshing={refreshing}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        lastUpdated={lastUpdated || undefined}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        <YourStats rankData={userRank} loading={loading} />

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Top 10 Users</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Most active contributors</p>
            </div>
          </div>
          <TopUsers users={users} loading={loading} />
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Model Statistics</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">All time usage across all models</p>
            </div>
          </div>
          <ModelGrid
            models={models}
            onModelClick={handleModelClick}
            loading={loading}
          />
        </div>
      </main>

      <ModelDetailModal
        isOpen={selectedModelId !== null}
        onClose={handleCloseModal}
        modelStats={modelDetail}
        loading={modelDetailLoading}
        timeRange={detailTimeRange}
        onTimeRangeChange={handleDetailTimeRangeChange}
      />
    </div>
  );
}
