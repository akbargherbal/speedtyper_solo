import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData } from '../../api/dashboard';

interface Props {
  trends: TrendData[];
}

export function TrendsChart({ trends }: Props) {
  if (trends.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Performance Trends</h2>
        <div className="text-gray-400 text-center py-8">No trend data available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Performance Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: '#E5E7EB' }}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="avgWpm"
            stroke="#3B82F6"
            name="WPM"
            strokeWidth={2}
            dot={{ fill: '#3B82F6' }}
          />
          <Line
            type="monotone"
            dataKey="avgAccuracy"
            stroke="#10B981"
            name="Accuracy %"
            strokeWidth={2}
            dot={{ fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}