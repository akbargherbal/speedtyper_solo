import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../results/entities/result.entity';
import { LocalUserService } from '../users/services/local-user.service';
import {
  DashboardStatsDto,
  TrendDataDto,
  LanguageStatsDto,
  RecentRaceDto,
} from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Result)
    private resultRepo: Repository<Result>,
    private localUserService: LocalUserService,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const localUser = await this.localUserService.getLocalUser();

    const results = await this.resultRepo.find({
      where: { userId: localUser.id },
      relations: ['challenge'],
    });

    if (results.length === 0) {
      return {
        avgWpm: 0,
        avgAccuracy: 0,
        totalRaces: 0,
        favoriteLanguage: 'N/A',
        totalTimeMinutes: 0,
      };
    }

    // Convert CPM to WPM (divide by 5)
    const avgCpm = results.reduce((sum, r) => sum + r.cpm, 0) / results.length;
    const avgWpm = avgCpm / 5;

    const avgAccuracy =
      results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;

    // Find favorite language
    const languageCounts = results.reduce((acc, r) => {
      const lang = r.challenge?.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteLanguage =
      Object.entries(languageCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'N/A';

    const totalTimeMinutes =
      results.reduce((sum, r) => sum + r.timeMS, 0) / 60000;

    return {
      avgWpm: Math.round(avgWpm * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      totalRaces: results.length,
      favoriteLanguage,
      totalTimeMinutes: Math.round(totalTimeMinutes * 10) / 10,
    };
  }

  async getTrends(days: number = 30): Promise<TrendDataDto[]> {
    const localUser = await this.localUserService.getLocalUser();
    const startDate = new Date(Date.now() - days * 86400000);

    const trends = await this.resultRepo
      .createQueryBuilder('result')
      .where('result.userId = :userId', { userId: localUser.id })
      .andWhere('result.createdAt >= :startDate', { startDate })
      .groupBy('DATE(result.createdAt)')
      .select('DATE(result.createdAt)', 'date')
      .addSelect('AVG(result.cpm) / 5', 'avgWpm') // Convert CPM to WPM
      .addSelect('AVG(result.accuracy)', 'avgAccuracy')
      .addSelect('COUNT(*)', 'raceCount')
      .orderBy('date', 'ASC')
      .getRawMany();

    return trends.map((t) => ({
      date: t.date,
      avgWpm: Math.round(parseFloat(t.avgWpm) * 10) / 10,
      avgAccuracy: Math.round(parseFloat(t.avgAccuracy) * 10) / 10,
      raceCount: parseInt(t.raceCount),
    }));
  }

  async getByLanguage(): Promise<LanguageStatsDto[]> {
    const localUser = await this.localUserService.getLocalUser();

    const stats = await this.resultRepo
      .createQueryBuilder('result')
      .leftJoin('result.challenge', 'challenge')
      .where('result.userId = :userId', { userId: localUser.id })
      .groupBy('challenge.language')
      .select('challenge.language', 'language')
      .addSelect('COUNT(*)', 'raceCount')
      .addSelect('AVG(result.cpm) / 5', 'avgWpm') // Convert CPM to WPM
      .addSelect('AVG(result.accuracy)', 'avgAccuracy')
      .orderBy('raceCount', 'DESC')
      .getRawMany();

    return stats.map((s) => ({
      language: s.language || 'unknown',
      raceCount: parseInt(s.raceCount),
      avgWpm: Math.round(parseFloat(s.avgWpm) * 10) / 10,
      avgAccuracy: Math.round(parseFloat(s.avgAccuracy) * 10) / 10,
    }));
  }

  async getRecent(limit: number = 10): Promise<RecentRaceDto[]> {
    const localUser = await this.localUserService.getLocalUser();

    const results = await this.resultRepo.find({
      where: { userId: localUser.id },
      relations: ['challenge'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return results.map((r) => {
      // Extract filename from path (e.g., "src/utils/helpers.ts" -> "helpers.ts")
      const filename = r.challenge?.path
        ? r.challenge.path.split('/').pop() || r.challenge.path
        : 'Unknown File';

      return {
        id: r.id,
        wpm: Math.round((r.cpm / 5) * 10) / 10, // Convert CPM to WPM
        accuracy: r.accuracy,
        language: r.challenge?.language || 'unknown',
        challengeTitle: filename, // Use filename instead of name
        createdAt: r.createdAt,
      };
    });
  }
}
