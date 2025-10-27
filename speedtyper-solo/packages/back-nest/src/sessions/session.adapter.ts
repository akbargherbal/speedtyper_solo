import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';
import { User } from '../users/entities/user.entity';

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

// NEW: Add guest user if session exists but has no user
const ensureGuestUser = (socket: Socket, next: NextFunction) => {
  if (socket.request.session && !socket.request.session.user) {
    console.log('Creating guest user for WebSocket connection:', socket.id);
    socket.request.session.user = User.generateAnonymousUser();
  }
  next();
};

const denyWithoutUserInSession = (
  socket: Socket,
  next: NextFunction,
) => {
  if (!socket.request.session?.user) {
    console.log(
      'disconnect because there is no user in the session',
      socket.id,
    );
    socket.request.session?.destroy(() => {
      /* **/
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
    server.use(ensureGuestUser); // NEW: Add this line
    server.use(denyWithoutUserInSession);
    return server;
  }
}