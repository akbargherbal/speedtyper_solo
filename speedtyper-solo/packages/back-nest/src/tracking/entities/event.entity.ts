import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TrackingEventType {
  LegacyRaceStarted = 'legacy_race_started',
  RaceStarted = 'race_started',
  RaceCompleted = 'race_completed',
}

@Entity()
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // FIXED: Changed from 'enum' to 'simple-enum' for SQLite compatibility
  @Column({
    unique: true,
    type: 'simple-enum',
    enum: TrackingEventType,
  })
  event: TrackingEventType;
  
  @Column({
    default: 0,
  })
  count: number;
}