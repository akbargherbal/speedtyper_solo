import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';
import { LocalUserService } from 'src/users/services/local-user.service';

type SocketIOCompatibleMiddleware = (
  req: any,
  res: any,
  next: (err?: any) => void,
) => void;

type NextFunction = (err?: Error) => void;

const makeSocketIOReadMiddleware =
  (middleware: SocketIOCompatibleMiddleware) =>
  (socket: Socket, next: NextFunction) => {
    middleware(socket.request, {}, next);
  };

const denyWithoutUserInSession = (socket: Socket, next: NextFunction) => {
  if (!socket.request.session?.user) {
    console.log(
      'WebSocket connection denied: no user in session',
      socket.id,
    );
    socket.request.session?.destroy(() => {
      /* noop */
    });
    return socket.disconnect(true);
  }
  next();
};

export class SessionAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    private sessionMiddleware: SocketIOCompatibleMiddleware,
    private localUserService: LocalUserService,
  ) {
    super(app);
  }

  createIOServer(port: number, opt?: any): any {
    const server: Server = super.createIOServer(port, opt);
    
    server.use(makeSocketIOReadMiddleware(this.sessionMiddleware));
    
    // Ensure local user is in session for WebSocket connections
    server.use(async (socket: Socket, next: NextFunction) => {
      if (!socket.request.session?.user) {
        try {
          const localUser = await this.localUserService.getLocalUser();
          socket.request.session.user = localUser;
          socket.request.session.user.isAnonymous = false;
          console.log('[SessionAdapter] ✅ Assigned LOCAL_SUPER_USER to WebSocket session');
        } catch (error) {
          console.error('[SessionAdapter] Failed to get local user:', error);
          return next(error);
        }
      }
      next();
    });
    
    server.use(denyWithoutUserInSession);
    
    return server;
  }
}