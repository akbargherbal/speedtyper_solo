import { Module } from '@nestjs/common';
// SOLO MODE: PassportModule disabled - no OAuth needed
// import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
// SOLO MODE: Auth controllers disabled - guest users only
// import {
//   AuthController,
//   GithubAuthController,
// } from './github/github.controller';
// import { GithubStrategy } from './github/github.strategy';
import { UsersModule } from 'src/users/users.module';
import { RacesModule } from 'src/races/races.module';

@Module({
  imports: [
    // SOLO MODE: PassportModule disabled
    // PassportModule.register({
    //   session: true,
    // }),
    ConfigModule,
    UsersModule,
    RacesModule,
  ],
  controllers: [
    // SOLO MODE: Auth controllers disabled
    // GithubAuthController,
    // AuthController
  ],
  providers: [
    // SOLO MODE: Github strategy disabled
    // GithubStrategy
  ],
})
export class AuthModule {}