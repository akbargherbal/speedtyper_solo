import { getExperimentalServerUrl } from '../utils/getServerUrl';

const serverUrl = getExperimentalServerUrl();

export interface DashboardStats {
  avgWpm: number;
  avgAccuracy: number;
  totalRaces: number;
  favoriteLanguage: string;
  totalTimeMinutes: number;
}

export interface TrendData {
  date: string;
  avgWpm: number;
  avgAccuracy: number;
  raceCount: number;
}

export interface LanguageStats {
  language: string;
  raceCount: number;
  avgWpm: number;
  avgAccuracy: number;
}

export interface RecentRace {
  id: string;
  wpm: number;
  accuracy: number;
  language: string;
  challengeTitle: string;
  createdAt: string;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${serverUrl}/api/dashboard/stats`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function fetchDashboardTrends(days: number = 30): Promise<TrendData[]> {
  const response = await fetch(`${serverUrl}/api/dashboard/trends?days=${days}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch trends');
  return response.json();
}

export async function fetchLanguageStats(): Promise<LanguageStats[]> {
  const response = await fetch(`${serverUrl}/api/dashboard/by-language`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch language stats');
  return response.json();
}

export async function fetchRecentRaces(limit: number = 10): Promise<RecentRace[]> {
  const response = await fetch(`${serverUrl}/api/dashboard/recent?limit=${limit}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch recent races');
  return response.json();
}