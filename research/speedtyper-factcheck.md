# speedtyper.dev - Technical Architecture (Verified)

## Overview

speedtyper.dev is a real-time typing competition platform for programmers. Users type code snippets from real open-source projects and can compete in multiplayer races.

## Verified Technology Stack

### Frontend (`packages/webapp-next/`)

- **Framework**: Next.js 12.2.5
- **Language**: TypeScript 4.8.2
- **Styling**: Tailwind CSS 3.1.8
- **State Management**: Zustand 4.1.1
- **Real-time Communication**: Socket.IO Client v2.x (with additional latest version alias)
- **Data Fetching**: SWR 2.0.3, ky 0.31.3
- **Charting**: Chart.js 3.9.1
- **Animation**: Framer Motion 7.5.1
- **Syntax Highlighting**: Highlight.js 11.6.0
- **Icons**: FontAwesome 6.3.0 (alongside custom icon components)
- **UI Components**: Headless UI 1.7.11

### Backend (`packages/back-nest/`)

- **Framework**: NestJS 9.0.0
- **Language**: TypeScript 4.7.4
- **Database**: PostgreSQL (via pg 8.8.0)
- **ORM**: TypeORM 0.3.10 with @nestjs/typeorm
- **Real-time Communication**: Socket.IO 4.5.2 with @nestjs/websockets and @nestjs/platform-socket.io
- **Authentication**: Passport 0.6.0 with passport-github 1.1.0
- **Session Management**: express-session 1.17.3 with connect-typeorm 2.0.0 (sessions stored in PostgreSQL)
- **Validation**: class-validator 0.13.2, class-transformer 0.5.1
- **CLI Commands**: nest-commander 3.1.0
- **Error Tracking**: Sentry Node 7.37.2
- **Containerization**: Docker (Dockerfile and docker-compose.yml present)

### Code Parsing

Tree-sitter 0.20.0 with language parsers for:

- JavaScript, TypeScript (0.19.0)
- Python (0.19.0)
- Rust (0.19.1)
- Go (0.19.1)
- Java (0.19.1)
- C, C++, C# (0.19.0)
- PHP, Ruby (0.19.0)
- Lua (1.6.2)
- OCaml, Scala (0.19.0)
- CSS (0.19.0)

### External Services

- **GitHub API**: OAuth authentication and code repository access
- **GitHub OAuth**: User authentication via passport-github

## Verified Project Structure

```
speedtyper.dev/
├── packages/
│   ├── back-nest/          # NestJS backend
│   └── webapp-next/        # Next.js frontend
└── README.md
```

## Backend Architecture (`back-nest/`)

### Confirmed Module Structure

The backend is organized into the following NestJS modules:

**Authentication** (`auth/`)

- `auth.module.ts`
- `github/` - GitHub OAuth integration
  - `github.controller.ts`
  - `github.guard.ts`
  - `github.strategy.ts`

**Challenges** (`challenges/`)

- `challenges.module.ts`
- `entities/` - Challenge and Language data models
- `services/` - Challenge management, parsing, and import services
- `commands/` - CLI runners for challenge import and processing

**Races** (`races/`)

- `races.module.ts`
- `race.gateway.ts` - WebSocket gateway for real-time races
- `race.controllers.ts` - REST endpoints
- `services/` - Race management services including:
  - `race.service.ts`
  - `race-manager.service.ts`
  - `race-player.service.ts`
  - `countdown.service.ts`
  - `keystroke-validator.service.ts`
  - `progress.service.ts`
  - And others

**Results** (`results/`)

- `results.module.ts`
- `results.controller.ts`
- `entities/` - Result data models
- `services/` - Result calculation and retrieval

**Projects** (`projects/`)

- `projects.module.ts`
- `project.controller.ts`
- `entities/` - Project tracking entities
- `services/` - Project import and sync services

**Users** (`users/`)

- `users.module.ts`
- `controllers/user.controller.ts`
- `entities/user.entity.ts`
- `services/user.service.ts`
- `utils/generateRandomUsername.ts` (uses unique-names-generator 4.7.1)

**Tracking** (`tracking/`)

- `tracking.module.ts`
- `tracking.service.ts`
- `entities/event.entity.ts`

**Sessions** (`sessions/`)

- `session.adapter.ts` - TypeORM-based session storage
- `session.entity.ts`
- `session.middleware.ts`

**GitHub Connector** (`connectors/github/`)

- `github.module.ts`
- `services/github-api.ts`
- `schemas/` - GitHub API DTOs

**Database** (`database.module.ts`)

- TypeORM configuration and entity registration

**Other Infrastructure**

- `config/` - CORS and PostgreSQL configuration
- `filters/exception.filter.ts`
- `middlewares/guest-user.ts`
- `seeder/` - Database seeding module

## Frontend Architecture (`webapp-next/`)

### Confirmed Page Structure

**Pages** (`pages/`)

- `index.tsx` - Homepage
- `_app.tsx` - Next.js app wrapper
- `_document.tsx` - Custom document
- `404.tsx` - Error page
- `results/[id].tsx` - Dynamic results page

### Confirmed Component Structure

**Common Components** (`common/`)

- `api/` - API client functions (auth.ts, races.ts, user.ts, types.ts)
- `components/` - Shared UI components
  - `Avatar.tsx`
  - `BattleMatcher.tsx`
  - `Button.tsx`
  - `Footer.tsx`
  - `Layout.tsx`
  - `NewNavbar.tsx`
  - `Overlay.tsx`
  - `buttons/` - Specialized buttons
  - `modals/` - Modal components
  - `overlays/` - Overlay components
- `hooks/` - Custom React hooks
  - `useIsPlaying.ts`
  - `useSocket.ts`
- `services/Socket.ts` - WebSocket service
- `state/user-store.ts` - Zustand store for user state
- `utils/` - Utility functions

**Play Module** (`modules/play2/`)

- `components/` - Play-specific components including:
  - `CodeArea.tsx`
  - `HiddenCodeInput.tsx`
  - `SmoothCaret.tsx`
  - `leaderboard/`
  - `play-footer/`
  - `play-header/`
  - `race-settings/`
  - And others
- `containers/` - Container components
- `hooks/` - Play-specific hooks
- `services/Game.ts` - Game logic
- `state/` - Zustand stores:
  - `code-store.ts`
  - `connection-store.ts`
  - `game-store.ts`
  - `settings-store.ts`
  - `trends-store.ts`

**Global Components** (`components/`)

- `Countdown.tsx`
- `Navbar.tsx`
- `Stream.tsx`

**Custom Icons** (`assets/icons/`)
Multiple custom icon components including BattleIcon, CrownIcon, GithubLogo, DiscordLogo, etc.

## Verified Features

Based on the README and file structure:

1. **Practice Mode** - Type code snippets from real open-source projects
2. **Battle Mode** - Real-time multiplayer races (private and public)
3. **Leaderboard** - Global competition rankings
4. **GitHub Authentication** - Login via GitHub OAuth
5. **Multiple Programming Languages** - Support for 15+ languages via tree-sitter parsers
6. **Real-time Updates** - WebSocket communication for live race updates
7. **Results Tracking** - Performance metrics and history

## Database

**Confirmed**: PostgreSQL database accessed via TypeORM

**Session Storage**: Sessions are stored in PostgreSQL using the `connect-typeorm` adapter, not a separate session store.

**Entities confirmed from file structure**:

- Challenge
- User
- Race (or race-related entities)
- Result
- Project
- UntrackedProject
- UnsyncedFile
- Event (tracking)
- Session

## Real-time Communication

**WebSocket Implementation**: Socket.IO is used for real-time features, with the gateway defined in `race.gateway.ts`.

**Note**: The frontend uses Socket.IO client v2.x alongside an aliased latest version (`socketio-latest`), suggesting potential version compatibility considerations with the v4.5.2 backend.

## CLI Commands (Backend)

Based on the README and file structure, the following commands are available:

```bash
yarn command seed-challenges        # Seed test challenges
yarn command import-projects        # Import projects from GitHub
yarn command sync-projects          # Sync tracked projects
yarn command import-files           # Import code files
yarn command import-challenges      # Generate challenges from files
```

Additional command runners exist in:

- `challenges/commands/`
- `projects/commands/`
- `seeder/commands/`

## Development Setup

**Frontend** (`webapp-next/`):

```bash
yarn dev          # Run on port 3001
yarn build        # Production build
yarn start        # Start production server
```

**Backend** (`back-nest/`):

```bash
yarn start:dev    # Development with watch mode
yarn build        # Production build
yarn start:prod   # Start production server
```

## Deployment

**Containerization**: Docker support confirmed with `Dockerfile` and `docker-compose.yml` in the backend package.

## Configuration Files

**Backend**:

- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json`, `tsconfig.build.json` - TypeScript configuration
- `tracked-projects.txt` - List of GitHub projects to import

**Frontend**:

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration

## License

MIT License (confirmed from README)

Note: The logo is created by astrocanyounaut and is NOT covered under MIT.

## Community

- Discord server: Available
- Twitch: codico
- GitHub: Open to contributions

## Important Notes

1. **No API Routes**: This project does NOT use Next.js API routes. The backend is a completely separate NestJS application, not integrated into the Next.js pages/api directory.

2. **Session Storage**: Sessions are stored in PostgreSQL via TypeORM's `connect-typeorm` adapter, not in a separate key-value store.

3. **Monorepo**: The project is structured as a monorepo with separate frontend and backend packages, managed with Yarn.

4. **Tree-sitter**: The backend uses tree-sitter parsers to analyze code from real GitHub repositories and extract typing challenges, supporting 15+ programming languages.

5. **Socket.IO Version**: Note the version mismatch between backend (v4.5.2) and frontend (v2.x with latest alias) - this may be relevant for development.

## What This Report Does NOT Include

This report focuses only on verified facts from the file structure, package.json files, and README documentation. It does not include:

- Specific implementation details of services and components (would require source code review)
- API endpoint specifications (would require examining controller code)
- WebSocket event names and payloads (would require examining gateway code)
- Database schema details (would require examining entity files)
- Race lifecycle implementation (would require examining service code)
- Calculation formulas for metrics (would require examining calculation services)
- Security implementation details (would require code review)
- Performance optimization strategies (would require code review)

These aspects likely exist based on the module structure, but cannot be confirmed without examining the actual source code.
