export class DashboardStatsDto {
  avgWpm: number;
  avgAccuracy: number;
  totalRaces: number;
  favoriteLanguage: string;
  totalTimeMinutes: number;
}

export class TrendDataDto {
  date: string;
  avgWpm: number;
  avgAccuracy: number;
  raceCount: number;
}

export class LanguageStatsDto {
  language: string;
  raceCount: number;
  avgWpm: number;
  avgAccuracy: number;
}

export class RecentRaceDto {
  id: string;
  wpm: number;
  accuracy: number;
  language: string;
  challengeTitle: string;
  createdAt: Date;
}