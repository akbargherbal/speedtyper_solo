import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { LocalUserService } from './services/local-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    LocalUserService, // ADD THIS
  ],
  exports: [
    UserService,
    LocalUserService, // ADD THIS
  ],
  controllers: [UserController],
})
export class UsersModule {}