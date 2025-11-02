import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class LocalUserService {
  private readonly logger = new Logger(LocalUserService.name);
  private cachedUser: User | null = null;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Ensures the local super user exists in the database.
   * Creates it if it doesn't exist, caches it for performance.
   */
  async ensureLocalUser(): Promise<User> {
    // 1. Check cache first
    if (this.cachedUser) {
      this.logger.debug('Returning cached local user');
      return this.cachedUser;
    }

    // 2. Query database for LOCAL_SUPER_USER
    let user = await this.userRepo.findOne({
      where: { legacyId: 'LOCAL_SUPER_USER' },
    });

    // 3. Create if doesn't exist
    if (!user) {
      this.logger.log('LOCAL_SUPER_USER not found, creating...');
      user = this.userRepo.create({
        username: 'local-user',
        legacyId: 'LOCAL_SUPER_USER',
        // Note: isAnonymous is not a database column, it's a runtime property
        // We'll handle this in the entity
      });
      user = await this.userRepo.save(user);
      this.logger.log(`Created LOCAL_SUPER_USER with id: ${user.id}`);
    } else {
      this.logger.debug(`Found existing LOCAL_SUPER_USER: ${user.id}`);
    }

    // 4. Cache and return
    this.cachedUser = user;
    return user;
  }

  /**
   * Get the local user (alias for ensureLocalUser for convenience)
   */
  async getLocalUser(): Promise<User> {
    return this.ensureLocalUser();
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cachedUser = null;
    this.logger.debug('Local user cache cleared');
  }
}