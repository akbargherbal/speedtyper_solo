import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderBoardResult } from '../entities/leaderboard-result.dto';
import { Result } from '../entities/result.entity';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(Result)
    private resultsRepository: Repository<Result>,
  ) {}

  async create(result: Result): Promise<Result> {
    return await this.resultsRepository.save(result);
  }

  async upsertByLegacyId(results: Result[]): Promise<void> {
    await this.resultsRepository.upsert(results, ['legacyId']);
  }

  async getByID(id: string) {
    const result = await this.resultsRepository.findOneOrFail({
      where: {
        id,
        // filter out legacy results
        legacyId: null,
      },
      relations: ['user', 'challenge', 'challenge.project'],
    });
    result.percentile = await this.getResultPercentile(result.cpm);
    return result;
  }

  async getLeaderboard(): Promise<LeaderBoardResult[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const resultsTodayStream = await this.resultsRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .where(
        `u.banned=false AND
        r.createdAt BETWEEN '${oneDayAgo.toISOString()}' AND '${new Date().toISOString()}'`,
      )
      .orderBy('r.cpm')
      .orderBy('r.createdAt', 'DESC')
      .stream();

    const resultsToday: Record<string, any> = {};

    for await (const r of resultsTodayStream) {
      if (!resultsToday[r.u_id]) {
        r.racesPlayed = 1;
        resultsToday[r.u_id] = r;
        continue;
      }
      const prevResult = resultsToday[r.u_id];
      if (r.r_cpm > prevResult.r_cpm) {
        r.racesPlayed = prevResult.racesPlayed;
        resultsToday[r.u_id] = r;
      }
      resultsToday[r.u_id].racesPlayed++;
    }

    const results = Object.values(resultsToday)
      .map((r) => {
        return {
          username: r.u_username,
          avatarUrl: r.u_avatarUrl,
          cpm: r.r_cpm,
          accuracy: r.r_accuracy,
          createdAt: r.r_createdAt,
          racesPlayed: r.racesPlayed,
          resultId: r.r_id,
        };
      })
      .sort((a, b) => b.cpm - a.cpm);
    return results;
  }
  async getAverageCPM(userId: string, take: number): Promise<number> {
    const results = await this.resultsRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
      take,
    });
    const total = results.reduce((prev, curr) => {
      return prev + curr.cpm;
    }, 0);
    const average = total / results.length;
    return parseInt(average.toString(), 10);
  }
  async getAverageCPMSince(userId: string, since: Date): Promise<number> {
    const { avg } = await this.resultsRepository
      .createQueryBuilder('r')
      .where('r.userId=:userId AND r.createdAt > :startOfToday', {
        userId,
        startOfToday: since.toISOString(),
      })
      .select('AVG(r.cpm)', 'avg')
      .getRawOne();
    return parseInt(avg, 10);
  }

  async getResultPercentile(cpm: number): Promise<number> {
    const { countBetterThan } = await this.resultsRepository
      .createQueryBuilder('r')
      .where('r.cpm < :cpm', {
        cpm,
      })
      .select('COUNT(r.cpm)', 'countBetterThan')
      .getRawOne();

    const totalCount = await this.resultsRepository.count();

    const percentile = (
      (parseInt(countBetterThan, 10) / totalCount) *
      100
    ).toFixed(0);
    return parseInt(percentile, 10);
  }
}
