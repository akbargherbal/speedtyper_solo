import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { LanguageDTO } from '../entities/language.dto';

@Injectable()
export class ChallengeService {
  private static UpsertOptions = {
    conflictPaths: ['content'],
    skipUpdateIfNoValuesChanged: true,
  };
  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  async upsert(challenges: Challenge[]): Promise<void> {
    await this.challengeRepository.upsert(
      challenges,
      ChallengeService.UpsertOptions,
    );
  }

  async getRandom(language?: string): Promise<Challenge> {
    let query = this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.project', 'project');
    if (language) {
      query = query.where('challenge.language = :language', {
        language,
      });
    }
    const randomChallenge = await query.orderBy('RANDOM()').getOne();
    if (!randomChallenge) {
      // Throw proper error with helpful message
      const message = language
        ? `No challenges found for language: ${language}`
        : 'No challenges found. Add code to snippets/ folder and run: npm run reimport';
      throw new BadRequestException(message);
    }
    return randomChallenge;
  }

  async getLanguages(): Promise<LanguageDTO[]> {
    const selectedLanguages = await this.challengeRepository
      .createQueryBuilder()
      .select('language')
      .distinct()
      .execute();

    const languages = selectedLanguages.map(
      ({ language }: { language: string }) => ({
        language,
        name: this.getLanguageName(language),
      }),
    );

    languages.sort((a, b) => a.name.localeCompare(b.name));

    return languages;
  }
  private getLanguageName(language: string): string {
    const allLanguages = {
      // Short codes (original speedtyper.dev format)
      js: 'JavaScript',
      ts: 'TypeScript',
      rs: 'Rust',
      c: 'C',
      java: 'Java',
      cpp: 'C++',
      go: 'Go',
      lua: 'Lua',
      php: 'PHP',
      py: 'Python',
      rb: 'Ruby',
      cs: 'C-Sharp',
      scala: 'Scala',
      // Long codes (your local import format)
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      rust: 'Rust',
      ruby: 'Ruby',
      csharp: 'C-Sharp',
    };
    return allLanguages[language] || language; // Fallback to original code if not mapped
  }
}
