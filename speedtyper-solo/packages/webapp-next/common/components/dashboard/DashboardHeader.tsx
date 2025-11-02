import React from 'react';
import { DashboardStats } from '../../api/dashboard';

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
}

export function DashboardHeader({ stats, loading }: Props) {
  if (loading || !stats) {
    return <div className="text-center py-8 text-gray-400">Loading statistics...</div>;
  }

  if (stats.totalRaces === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No races completed yet. Start typing to see your stats!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Average WPM"
        value={stats.avgWpm.toFixed(1)}
        valueColor="text-blue-400"
      />
      <StatCard
        label="Average Accuracy"
        value={`${stats.avgAccuracy.toFixed(1)}%`}
        valueColor="text-green-400"
      />
      <StatCard
        label="Total Races"
        value={stats.totalRaces.toString()}
        valueColor="text-purple-400"
      />
      <StatCard
        label="Favorite Language"
        value={stats.favoriteLanguage}
        valueColor="text-yellow-400"
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
}

function StatCard({ label, value, valueColor = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{label}</div>
      <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}