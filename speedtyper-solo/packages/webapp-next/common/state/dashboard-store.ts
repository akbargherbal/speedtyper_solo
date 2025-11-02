import { create } from 'zustand';
import {
  DashboardStats,
  TrendData,
  LanguageStats,
  RecentRace,
  fetchDashboardStats,
  fetchDashboardTrends,
  fetchLanguageStats,
  fetchRecentRaces,
} from '../api/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  trends: TrendData[];
  languageStats: LanguageStats[];
  recentRaces: RecentRace[];
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTrends: (days?: number) => Promise<void>;
  fetchLanguageStats: () => Promise<void>;
  fetchRecentRaces: (limit?: number) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  trends: [],
  languageStats: [],
  recentRaces: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await fetchDashboardStats();
      set({ stats, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTrends: async (days = 30) => {
    try {
      const trends = await fetchDashboardTrends(days);
      set({ trends });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchLanguageStats: async () => {
    try {
      const languageStats = await fetchLanguageStats();
      set({ languageStats });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchRecentRaces: async (limit = 10) => {
    try {
      const recentRaces = await fetchRecentRaces(limit);
      set({ recentRaces });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { fetchStats, fetchTrends, fetchLanguageStats, fetchRecentRaces } = get();
      await Promise.all([
        fetchStats(),
        fetchTrends(),
        fetchLanguageStats(),
        fetchRecentRaces(),
      ]);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));