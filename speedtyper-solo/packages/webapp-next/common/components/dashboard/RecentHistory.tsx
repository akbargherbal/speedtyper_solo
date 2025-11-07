import React from 'react';
import { useRouter } from 'next/router';
import { RecentRace } from '../../api/dashboard';

interface Props {
  recentRaces: RecentRace[];
}

export function RecentHistory({ recentRaces }: Props) {
  const router = useRouter();

  if (recentRaces.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Races</h2>
        <div className="text-gray-400 text-center py-8">No recent races</div>
      </div>
    );
  }

  const handleRaceClick = (raceId: string) => {
    router.push(`/results/${raceId}`);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Recent Races</h2>
      <div className="space-y-3">
        {recentRaces.map((race) => (
          <div
            key={race.id}
            className="bg-gray-700 p-4 rounded cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500"
            onClick={() => handleRaceClick(race.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium capitalize">{race.language}</span>
                <div className="text-gray-400 text-sm mt-1 truncate">
                  {race.challengeTitle}
                </div>
              </div>
              <div className="text-gray-400 text-sm ml-4 flex-shrink-0">
                {new Date(race.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-blue-400 font-medium">{race.wpm.toFixed(1)} WPM</span>
              <span className="text-green-400 font-medium">{race.accuracy.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}