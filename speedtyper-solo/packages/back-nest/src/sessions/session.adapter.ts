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
      '[SessionAdapter] ❌ WebSocket connection denied: no user in session',
      socket.id,
    );
    socket.request.session?.destroy(() => {
      /* noop */
    });
    return socket.disconnect(true);
  }
  
  console.log(
    '[SessionAdapter] ✅ WebSocket has user:',
    socket.request.session.user.username,
    socket.request.session.user.id,
  );
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

    // Step 1: Load session from cookie
    server.use(makeSocketIOReadMiddleware(this.sessionMiddleware));
    
    console.log('[SessionAdapter] Middleware chain registered');

    // Step 2: Ensure local user is in session for WebSocket connections
    server.use(async (socket: Socket, next: NextFunction) => {
      console.log('[SessionAdapter] Checking session for socket:', socket.id);
      console.log('[SessionAdapter] Session ID:', socket.request.session?.id);
      console.log('[SessionAdapter] Existing user in session:', socket.request.session?.user?.id, socket.request.session?.user?.username);
      
      if (!socket.request.session?.user) {
        console.log('[SessionAdapter] No user in session, assigning LOCAL_SUPER_USER');
        try {
          const localUser = await this.localUserService.getLocalUser();
          socket.request.session.user = localUser;
          socket.request.session.user.isAnonymous = false;
          
          // CRITICAL: Save the session immediately
          await new Promise<void>((resolve, reject) => {
            socket.request.session.save((err: any) => {
              if (err) {
                console.error('[SessionAdapter] Failed to save session:', err);
                reject(err);
              } else {
                console.log('[SessionAdapter] ✅ Session saved with LOCAL_SUPER_USER');
                resolve();
              }
            });
          });
          
          console.log('[SessionAdapter] ✅ Assigned LOCAL_SUPER_USER to WebSocket session:', localUser.id);
        } catch (error) {
          console.error('[SessionAdapter] Failed to get/save local user:', error);
          return next(error);
        }
      } else {
        console.log('[SessionAdapter] Session already has user:', socket.request.session.user.username, socket.request.session.user.id);
      }
      next();
    });

    // Step 3: Final check - deny if still no user
    server.use(denyWithoutUserInSession);

    return server;
  }
}