import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';

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

// REMOVED: ensureGuestUser - now handled by GuestUserMiddleware

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
  ) {
    super(app);
  }

  createIOServer(port: number, opt?: any): any {
    const server: Server = super.createIOServer(port, opt);
    server.use(makeSocketIOReadMiddleware(this.sessionMiddleware));
    // REMOVED: server.use(ensureGuestUser);
    server.use(denyWithoutUserInSession);
    return server;
  }
}