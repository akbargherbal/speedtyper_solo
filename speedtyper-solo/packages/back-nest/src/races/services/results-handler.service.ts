import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ResultFactoryService } from 'src/results/services/result-factory.service';
import { ResultService } from 'src/results/services/results.service';
import { TrackingService } from 'src/tracking/tracking.service';
import { User } from 'src/users/entities/user.entity';
import { RaceEvents } from './race-events.service';
import { Race } from './race.service';

@Injectable()
export class ResultsHandlerService {
  constructor(
    private factory: ResultFactoryService,
    private events: RaceEvents,
    private results: ResultService,
    private tracker: TrackingService,
  ) {}

  // SOLO MODE: Added socket parameter to emit results to correct player
  async handleResult(race: Race, user: User, socket: Socket) {
    const player = race.getPlayer(user.id);
    if (player.hasCompletedRace()) {
      if (player.saved) {
        return;
      }
      player.saved = true;
      let result = this.factory.factory(race, player, user);
      if (!user.isAnonymous) {
        result = await this.results.create(result);
      }
      result.percentile = await this.results.getResultPercentile(result.cpm);
      this.tracker.trackRaceCompleted();
      // SOLO MODE: Emit to specific socket instead of broadcasting to room
      this.events.raceCompleted(socket, result);
    }
  }
}