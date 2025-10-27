import { Exclude, instanceToPlain } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { User } from 'src/users/entities/user.entity';
import { RacePlayer } from './race-player.service';

export interface PublicRace {
  id: string;
  ownerName: string;
  memberCount: number;
}

export class Race {
  id: string;
  challenge: Challenge;
  owner: string;
  members: Record<string, RacePlayer>;
  @Exclude()
  literals: string[];

  @Exclude()
  timeouts: NodeJS.Timeout[];

  startTime?: Date;

  @Exclude()
  countdown: boolean;

  isPublic: boolean;

  togglePublic(): boolean {
    this.isPublic = !this.isPublic;
    return this.isPublic;
  }
  toPublic(): PublicRace {
    const ownerName = this.members[this.owner].username;
    const memberCount = Object.keys(this.members).length;
    return {
      id: this.id,
      ownerName,
      memberCount,
    };
  }

  isMultiplayer(): boolean {
    return Object.keys(this.members).length > 1;
  }

  toJSON() {
    return instanceToPlain(this);
  }

  constructor(owner: User, challenge: Challenge, literals: string[]) {
    this.id = randomUUID().replaceAll('-', '');
    this.members = {};
    this.owner = owner.id;
    this.challenge = challenge;
    this.literals = literals;
    this.timeouts = [];
    this.countdown = false;
    this.addMember(owner);
    this.isPublic = false;
  }

  start() {
    this.startTime = new Date();
  }

  canStartRace(userID: string): boolean {
    return !this.countdown && !this.startTime && this.owner === userID;
  }

  getPlayer(id: string) {
    return this.members[id];
  }

  resetProgress() {
    Object.values(this.members).forEach((player) => {
      player.reset(this.literals);
    });
    this.startTime = undefined;
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
    this.timeouts = [];
    this.countdown = false;
  }

  addMember(user: User) {
    this.members[user.id] = RacePlayer.fromUser(this.id, user, this.literals);
  }

  removeMember(user: User) {
    delete this.members[user.id];
  }
}
