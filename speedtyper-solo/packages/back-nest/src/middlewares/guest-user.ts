import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LocalUserService } from 'src/users/services/local-user.service';

@Injectable()
export class GuestUserMiddleware implements NestMiddleware {
  constructor(private localUserService: LocalUserService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    if (req.session) {
      // CRITICAL FIX: ALWAYS assign local user, don't check if user exists
      // This overwrites any old ghost users from previous sessions
      const localUser = await this.localUserService.getLocalUser();
      req.session.user = localUser;
      req.session.user.isAnonymous = false;
      console.log('[GuestUserMiddleware] ✅ Assigned LOCAL_SUPER_USER to session:', localUser.id, localUser.username);
    }
    next();
  }
}