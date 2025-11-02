import { Challenge } from 'src/challenges/entities/challenge.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  raceId: string;

  @Column()
  timeMS: number;

  @Column()
  cpm: number;

  @Column()
  mistakes: number;

  @Column()
  accuracy: number;

  @Column({ unique: true, nullable: true, default: null })
  legacyId: string;

  // FIXED: Removed explicit type, let TypeORM handle it per database
  @CreateDateColumn()
  public createdAt: Date;

  @ManyToOne(() => Challenge, (challenge) => challenge.results, {
    onDelete: 'SET NULL',
  })
  challenge: Challenge;

@ManyToOne(() => User, (user) => user.results, {
    onDelete: 'SET NULL',
  })
  user: User;

  // FIXED: Added @Column decorator and made nullable for migration compatibility
  @Column({ nullable: true })
  userId: string;

  percentile?: number;
}