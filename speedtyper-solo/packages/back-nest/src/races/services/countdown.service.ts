import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RaceEvents } from './race-events.service';
import { Race } from './race.service';

@Injectable()
export class CountdownService {
  constructor(private raceEvents: RaceEvents) {}

  // SOLO MODE: Countdown now requires the socket to emit to
  async countdown(race: Race, socket: Socket) {
    race.countdown = true;
    const seconds = 5;
    for (let i = seconds; i > 0; i--) {
      const delay = seconds - i;
      const timeout = setTimeout(() => {
        this.raceEvents.countdown(socket, i);
      }, delay * 1000);
      race.timeouts.push(timeout);
    }
    const timeout = setTimeout(() => {
      race.start();
      this.raceEvents.raceStarted(socket, race.startTime);
      race.timeouts = [];
      race.countdown = false;
    }, seconds * 1000);
    race.timeouts.push(timeout);
  }
}