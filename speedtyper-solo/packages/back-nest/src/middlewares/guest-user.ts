import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LocalUserService } from 'src/users/services/local-user.service';

@Injectable()
export class GuestUserMiddleware implements NestMiddleware {
  constructor(private localUserService: LocalUserService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    if (req.session && !req.session?.user) {
      // Assign the full local user object to the session
      const localUser = await this.localUserService.getLocalUser();
      req.session.user = localUser;
      req.session.user.isAnonymous = false; // Override to ensure results save
      console.log('[GuestUserMiddleware] ✅ Assigned LOCAL_SUPER_USER to session');
    }
    next();
  }
}