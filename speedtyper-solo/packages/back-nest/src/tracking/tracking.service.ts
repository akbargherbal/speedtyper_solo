import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingEvent, TrackingEventType } from './entities/event.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingEvent)
    private repository: Repository<TrackingEvent>,
  ) {}

  async trackRaceStarted(): Promise<TrackingEvent> {
    return this.trackRaceEvent(TrackingEventType.RaceStarted);
  }

  async trackRaceCompleted(): Promise<TrackingEvent> {
    return this.trackRaceEvent(TrackingEventType.RaceCompleted);
  }

  private async trackRaceEvent(
    event: TrackingEventType,
  ): Promise<TrackingEvent> {
    return await this.repository.manager.transaction(async (transaction) => {
      let trackingEvent = new TrackingEvent();
      trackingEvent.event = event;
      await transaction.upsert(TrackingEvent, trackingEvent, {
        conflictPaths: ['event'],
        skipUpdateIfNoValuesChanged: true,
      });
      trackingEvent = await transaction.findOneBy(TrackingEvent, {
        event: trackingEvent.event,
      });
      trackingEvent.count++;
      trackingEvent = await transaction.save(TrackingEvent, trackingEvent);
      return trackingEvent;
    });
  }
}
