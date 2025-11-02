import React from 'react';
import { LanguageStats } from '../../api/dashboard';

interface Props {
  languageStats: LanguageStats[];
}

export function LanguageBreakdown({ languageStats }: Props) {
  if (languageStats.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Statistics by Language</h2>
        <div className="text-gray-400 text-center py-8">No language data available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Statistics by Language</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 pr-4 text-gray-400 font-medium">Language</th>
              <th className="pb-3 px-4 text-gray-400 font-medium text-right">Races</th>
              <th className="pb-3 px-4 text-gray-400 font-medium text-right">Avg WPM</th>
              <th className="pb-3 pl-4 text-gray-400 font-medium text-right">Avg Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {languageStats.map((stat, index) => (
              <tr 
                key={stat.language} 
                className={`border-b border-gray-700 ${index === languageStats.length - 1 ? 'border-b-0' : ''}`}
              >
                <td className="py-3 pr-4 text-white font-medium capitalize">{stat.language}</td>
                <td className="py-3 px-4 text-gray-300 text-right">{stat.raceCount}</td>
                <td className="py-3 px-4 text-blue-400 text-right">{stat.avgWpm.toFixed(1)}</td>
                <td className="py-3 pl-4 text-green-400 text-right">{stat.avgAccuracy.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}