import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnsyncedFile } from '../entities/unsynced-file.entity';

@Injectable()
export class UnsyncedFileService {
  private static UpsertOptions = {
    conflictPaths: ['path', 'project'],
    skipUpdateIfNoValuesChanged: true,
  };
  constructor(
    @InjectRepository(UnsyncedFile)
    private filesRepository: Repository<UnsyncedFile>,
  ) {}

  async bulkUpsert(files: UnsyncedFile[]): Promise<void> {
    await this.filesRepository.upsert(files, UnsyncedFileService.UpsertOptions);
  }

  async findAllWithProject(): Promise<UnsyncedFile[]> {
    const files = await this.filesRepository.find({
      relations: {
        project: true,
      },
    });
    return files;
  }

  async remove(files: UnsyncedFile[]): Promise<void> {
    await this.filesRepository.remove(files);
  }
}
