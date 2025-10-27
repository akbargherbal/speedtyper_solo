import { randomUUID } from 'crypto';
import { Result } from 'src/results/entities/result.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { generateRandomUsername } from '../utils/generateRandomUsername';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  username: string;
  
  // FIXED: Made nullable for guest users
  @Column({ unique: true, nullable: true })
  githubId: number;
  
  // FIXED: Made nullable for guest users
  @Column({ unique: true, nullable: true })
  githubUrl: string;
  
  // FIXED: Made nullable for guest users
  @Column({ nullable: true })
  avatarUrl: string;
  
  @Column({ unique: true, nullable: true })
  legacyId: string;
  
  @Column({ default: false, select: false })
  banned: boolean;
  
  @CreateDateColumn()
  public createdAt: Date;

  @OneToMany(() => Result, (result) => result.user)
  results: Result[];
  
  isAnonymous: boolean;
  
  static generateAnonymousUser() {
    const user = new User();
    user.id = randomUUID();
    user.username = generateRandomUsername();
    user.isAnonymous = true;
    return user;
  }
}