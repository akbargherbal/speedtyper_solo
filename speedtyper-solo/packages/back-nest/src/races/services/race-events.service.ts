import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Result } from 'src/results/entities/result.entity';
import { User } from 'src/users/entities/user.entity';
import { RacePlayer } from './race-player.service';
import { Race } from './race.service';

@Injectable()
export class RaceEvents {
  server: Server;

  getPlayerCount() {
    return this.server.sockets.sockets.size;
  }

  // SOLO MODE: No room joining needed, emit directly to socket
  createdRace(socket: Socket, race: Race) {
    // REMOVED: socket.join(race.id);
    socket.emit('race_joined', race);
    socket.emit('challenge_selected', race.challenge);
  }

  // SOLO MODE: Emit error message to socket
  emitError(socket: Socket, error: string, details?: string) {
    socket.emit('race_error', {
      message: error,
      details:
        details || 'Please check the terminal logs for more information.',
    });
  }

  // SOLO MODE: Emit countdown only to single socket (stored in race context)
  // Note: In solo mode, countdown is instant since there's no coordination needed
  countdown(socket: Socket, i: number) {
    const event = 'countdown';
    socket.emit(event, i);
  }

  // SOLO MODE: Emit race start only to the player
  raceStarted(socket: Socket, startTime: Date) {
    socket.emit('race_started', startTime);
  }

  // SOLO MODE: Emit updated race only to requesting socket
  updatedRace(socket: Socket, race: Race) {
    socket.emit('race_joined', race);
    socket.emit('challenge_selected', race.challenge);
  }

  // SOLO MODE: No other members to notify, just emit to joining socket
  joinedRace(socket: Socket, race: Race, user: User) {
    // REMOVED: socket.join(race.id);
    socket.emit('race_joined', race);
    // REMOVED: socket.to(race.id).emit('member_joined', race.members[user.id]);
  }

  // SOLO MODE: No other members to notify about leaving
  leftRace(race: Race, user: User) {
    // REMOVED: this.server.to(race.id).emit('member_left', {...});
    // In solo mode, when you leave, the race is over anyway
  }

  // SOLO MODE: Only emit progress to the typing player
  progressUpdated(socket: Socket, raceId: string, player: RacePlayer) {
    // REMOVED: socket.to(raceId).emit('progress_updated', player);
    socket.emit('progress_updated', player);
  }

  // SOLO MODE: Emit completion only to the player who finished
  raceCompleted(socket: Socket, result: Result) {
    socket.emit('race_completed', result);
  }

  raceDoesNotExist(socket: Socket, id: string) {
    socket.emit('race_does_not_exist', id);
  }

  async logConnectedSockets() {
    const sockets = await this.server.fetchSockets();
    console.log('Connected sockets: ', sockets.length);
  }
}
