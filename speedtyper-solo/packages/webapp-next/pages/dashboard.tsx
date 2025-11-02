import React, { useEffect } from 'react';
import { useDashboardStore } from '../common/state/dashboard-store';
import { DashboardHeader } from '../common/components/dashboard/DashboardHeader';
import { TrendsChart } from '../common/components/dashboard/TrendsChart';
import { LanguageBreakdown } from '../common/components/dashboard/LanguageBreakdown';
import { RecentHistory } from '../common/components/dashboard/RecentHistory';

export default function DashboardPage() {
  const {
    stats,
    trends,
    languageStats,
    recentRaces,
    loading,
    error,
    fetchAll
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg text-center">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your typing performance and progress</p>
      </div>

      <DashboardHeader stats={stats} loading={loading} />
      <TrendsChart trends={trends} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LanguageBreakdown languageStats={languageStats} />
        <RecentHistory recentRaces={recentRaces} />
      </div>
    </div>
  );
}