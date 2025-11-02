# Speedtyper Local - Architecture Documentation

**Version:** 1.4.0  
**Last Updated:** November 2, 2025  
**Audience:** Developers modifying the codebase

---

## Overview

Speedtyper Local is a **monorepo** containing two TypeScript applications that communicate via REST API and WebSockets. This document explains how the pieces fit together.

---

## System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                    │
│  (http://localhost:3001)                           │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │   Next.js Frontend (webapp-next)            │  │
│  │   - React UI Components                     │  │
│  │   - Zustand State Management                │  │
│  │   - Socket.IO Client                        │  │
│  └─────────────────────────────────────────────┘  │
└──────────────┬──────────────────┬─────────────────┘
               │                  │
               │ HTTP (REST)      │ WebSocket
               │ Port 1337        │ Port 1337
               ▼                  ▼
┌─────────────────────────────────────────────────────┐
│         NestJS Backend (back-nest)                  │
│         (http://localhost:1337)                     │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ REST APIs    │  │ WebSocket    │               │
│  │ (races,      │  │ Gateway      │               │
│  │  challenges) │  │ (race.gateway)│              │
│  └──────────────┘  └──────────────┘               │
│           │              │                         │
│           └──────┬───────┘                         │
│                  ▼                                  │
│         ┌────────────────┐                         │
│         │  TypeORM       │                         │
│         └────────┬───────┘                         │
└──────────────────┼─────────────────────────────────┘
                   ▼
         ┌──────────────────┐
         │ SQLite Database  │
         │ (speedtyper-     │
         │  local.db)       │
         └──────────────────┘
```

---

## Technology Stack

### Backend (packages/back-nest)

| Component       | Version | Purpose                           |
| --------------- | ------- | --------------------------------- |
| **NestJS**      | 9.0.0   | Application framework             |
| **TypeScript**  | 4.7+    | Type-safe backend code            |
| **Socket.IO**   | 4.5.2   | Real-time WebSocket communication |
| **TypeORM**     | 0.3.x   | Database ORM                      |
| **SQLite3**     | 5.x     | Embedded database                 |
| **Tree-sitter** | 0.20.0  | Code parsing (AST-based)          |

### Frontend (packages/webapp-next)

| Component            | Version | Purpose                   |
| -------------------- | ------- | ------------------------- |
| **Next.js**          | 12.2.5  | React framework (SSR/SSG) |
| **React**            | 18.2.0  | UI library                |
| **TypeScript**       | 4.7+    | Type-safe frontend code   |
| **Socket.IO Client** | 4.x     | WebSocket client          |
| **Zustand**          | 3.7.2   | State management          |
| **Tailwind CSS**     | 3.x     | Utility-first styling     |

### Notable Dependencies

- **Tree-sitter language parsers**: Pre-installed for 15+ languages (Python, TypeScript, JavaScript, Go, Rust, etc.)
- **concurrently**: Runs backend + frontend simultaneously via `npm run dev`
- **open-cli**: Auto-opens browser after server startup

---

## Project Structure

### Root Level

```
speedtyper-solo/
├── package.json           # Root scripts (dev, reimport, etc.)
├── node_modules/          # Shared dependencies
├── packages/              # Monorepo packages
│   ├── back-nest/         # Backend application
│   └── webapp-next/       # Frontend application
├── snippets/              # User's code for practice
├── docs/                  # Documentation
└── scripts/               # Utility scripts (reset-db, etc.)
```

### Backend Structure (packages/back-nest/src)

```
src/
├── main.ts                      # App bootstrap (port 1337)
├── app.module.ts                # Root module
│
├── races/                       # 🎯 CORE: Typing gameplay logic
│   ├── race.gateway.ts          # WebSocket handlers (key file)
│   ├── race.controllers.ts      # REST endpoints
│   └── services/
│       ├── race.service.ts      # Race state management
│       ├── race-manager.service.ts  # Race orchestration
│       ├── race-events.service.ts   # Socket event emitters
│       ├── race-player.service.ts   # Player progress tracking
│       ├── progress.service.ts      # WPM/accuracy calculation
│       ├── keystroke-validator.service.ts
│       └── add-keystroke.service.ts
│
├── challenges/                  # 🎯 CORE: Snippet management
│   ├── challenges.module.ts
│   ├── entities/
│   │   └── challenge.entity.ts  # Database model for snippets
│   ├── commands/
│   │   ├── local-import-runner.ts   # Import from snippets/ folder
│   │   └── challenge-import-runner.ts  # (Original GitHub import)
│   └── services/
│       ├── challenge.service.ts     # CRUD operations
│       ├── parser.service.ts        # Tree-sitter parsing
│       └── ts-parser.factory.ts     # Language-specific parsers
│
├── users/                       # User management (guest system)
├── sessions/                    # Session middleware (Socket auth)
├── results/                     # Race results storage
├── middlewares/
│   └── guest-user.ts            # Auto-creates guest users
│
├── config/
│   └── postgres.ts              # Database config (misleading name, uses SQLite)
└── database.module.ts           # TypeORM setup
```

### Frontend Structure (packages/webapp-next)

```
webapp-next/
├── pages/                       # Next.js routes
│   ├── _app.tsx                 # App wrapper (global ESC handler)
│   ├── index.tsx                # Home/practice page
│   └── results/[id].tsx         # Results page (post-race)
│
├── modules/play2/               # 🎯 CORE: Typing UI & logic
│   ├── services/
│   │   └── Game.ts              # Main game controller (key file)
│   │
│   ├── state/                   # Zustand stores
│   │   ├── game-store.ts        # Race state (id, members, countdown)
│   │   ├── code-store.ts        # Typing state (input, progress)
│   │   ├── settings-store.ts    # User preferences + modal state (NEW v1.4.0)
│   │   └── connection-store.ts  # WebSocket connection status
│   │
│   ├── components/
│   │   ├── CodeArea.tsx         # Main typing interface (key file)
│   │   ├── HiddenCodeInput.tsx  # Invisible input field
│   │   ├── PlayHeader/          # WPM/accuracy display
│   │   ├── play-footer/         # Language selector
│   │   └── race-settings/       # Settings panel
│   │
│   ├── containers/
│   │   ├── CodeTypingContainer.tsx  # Typing page wrapper
│   │   └── ResultsContainer.tsx     # Results page wrapper
│   │
│   └── hooks/
│       ├── useGame.ts           # Game instance hook
│       ├── useChallenge.ts      # Current snippet hook
│       └── useIsCompleted.ts    # Completion status
│
├── common/                      # Shared frontend code
│   ├── components/
│   │   ├── NewNavbar.tsx        # Top navigation
│   │   ├── Layout.tsx           # Page wrapper
│   │   ├── modals/              # NEW v1.4.0
│   │   │   ├── InfoModal.tsx    # Keyboard shortcuts documentation
│   │   │   ├── SettingsModal.tsx
│   │   │   └── ProfileModal.tsx
│   │   └── overlays/
│   │       └── SettingsOverlay.tsx  # Settings content (improved v1.4.0)
│   ├── services/
│   │   └── Socket.ts            # Socket.IO client wrapper
│   └── api/                     # REST API calls
│
├── hooks/
│   └── useKeyMap.ts             # Keyboard shortcut handler
│
└── styles/
    └── globals.css              # Global styles + utility classes
```

---

## Data Flow

### 1. Snippet Import Flow

```
User adds code to snippets/
        ↓
User runs: npm run reimport
        ↓
Backend: local-import-runner.ts
        ↓
Scans snippets/ directory recursively
        ↓
For each file:
  - Read file content
  - Detect language from extension
  - Parse with tree-sitter (parser.service.ts)
  - Extract functions/classes (100-300 char chunks)
  - Filter by quality (max 11 lines, max 55 chars/line)
        ↓
Save snippets to database (challenge table)
        ↓
Log: "Imported X snippets"
```

**Key Files:**

- `packages/back-nest/src/challenges/commands/local-import-runner.ts`
- `packages/back-nest/src/challenges/services/parser.service.ts`

---

### 2. Typing Workflow (Step-by-Step)

#### Phase 1: Race Initialization

```
User clicks "Practice" button
        ↓
Frontend: Game.play() emits 'play' event
        ↓
Backend: race.gateway.ts @SubscribeMessage('play')
        ↓
Backend: race-manager.service.ts creates Race
        ↓
Backend: Selects random challenge from database
        ↓
Backend: Emits 'race_joined' + 'challenge_selected'
        ↓
Frontend: Updates game-store and code-store
        ↓
Frontend: CodeArea.tsx renders code snippet
```

#### Phase 2: Typing Loop

```
User types a character
        ↓
Frontend: HiddenCodeInput captures keystroke
        ↓
Frontend: Game.ts emits 'key_stroke' event via WebSocket
        ↓
Backend: race.gateway.ts @SubscribeMessage('key_stroke')
        ↓
Backend: keystroke-validator.service.ts validates
        ↓
Backend: add-keystroke.service.ts adds to player state
        ↓
Backend: progress.service.ts recalculates WPM/accuracy
        ↓
Backend: Emits 'progress_updated' back to frontend
        ↓
Frontend: Updates game-store (WPM, accuracy, position)
        ↓
Frontend: CodeArea.tsx re-renders with new colors
        ↓
(Loop continues until snippet complete)
```

#### Phase 3: Race Completion

```
User types last character correctly
        ↓
Backend: Detects completion (progress === 100%)
        ↓
Backend: result-factory.service.ts creates Result
        ↓
Backend: Saves Result to database
        ↓
Backend: Emits 'race_completed' event
        ↓
Frontend: Navigates to /results/[raceId]
        ↓
Frontend: ResultsContainer.tsx fetches result via REST API
        ↓
Frontend: Displays WPM, accuracy, chart, etc.
```

---

### 3. WebSocket Contract (Critical)

The frontend and backend communicate via **12 core events** (updated v1.3.0):

#### Frontend → Backend (Emits)

| Event               | Payload           | Purpose                             |
| ------------------- | ----------------- | ----------------------------------- |
| `play`              | `RaceSettingsDTO` | Request new race                    |
| `join`              | `raceId: string`  | Join existing race (unused in solo) |
| `start_race`        | None              | Start countdown (solo: instant)     |
| `key_stroke`        | `KeystrokeDTO`    | Send typed character                |
| `refresh_challenge` | `RaceSettingsDTO` | Get new snippet without restarting  |

#### Backend → Frontend (Emits)

| Event                | Payload      | Purpose                                |
| -------------------- | ------------ | -------------------------------------- |
| `race_joined`        | `Race`       | Race created/joined successfully       |
| `challenge_selected` | `Challenge`  | Snippet to type                        |
| `countdown`          | `number`     | Countdown timer (solo: always instant) |
| `race_started`       | `Date`       | Race officially began (timer start)    |
| `progress_updated`   | `RacePlayer` | Updated WPM/accuracy/position          |
| `race_completed`     | `Result`     | Typing finished, results ready         |
| `race_error`         | `{ error: string }` | **NEW v1.3.0**: No challenges available |

**CRITICAL**: Do not modify this contract without updating both sides.

**v1.3.0 Addition**: The `race_error` event provides user-friendly error messages when backend cannot provide a challenge (e.g., no snippets for selected language). Frontend displays alert with actionable guidance.

---

## Database Schema

### Tables

**challenge** (Snippets to type)

```sql
- id: UUID (primary key)
- content: TEXT (the code to type)
- language: VARCHAR (e.g., "python", "typescript")
- path: VARCHAR (file path, e.g., "snippets/python/my_script.py")
- url: VARCHAR (for GitHub imports, empty for local)
- sha: VARCHAR (Git SHA, unused for local imports)
- treeSha: VARCHAR (Git tree SHA, unused for local imports)
- projectId: UUID (foreign key to project table)
```

**user** (Guest users)

```sql
- id: UUID (primary key)
- username: VARCHAR (auto-generated, e.g., "guest-abc123")
- isAnonymous: BOOLEAN (always true for local version)
- githubId: VARCHAR (null for guests)
- legacyId: VARCHAR (nullable, indexed) -- NEW: For stable user identity
```

**result** (Completed races)

```sql
- id: UUID (primary key)
- userId: UUID (foreign key to user)
- challengeId: UUID (foreign key to challenge)
- wpm: FLOAT (words per minute)
- accuracy: FLOAT (percentage)
- createdAt: TIMESTAMP
- completedAt: TIMESTAMP
```

**session** (WebSocket sessions)

```sql
- id: VARCHAR (session ID)
- userId: UUID (foreign key to user)
- json: TEXT (session data as JSON)
- expiredAt: TIMESTAMP
```

**project** (For GitHub imports, minimal use in local mode)

```sql
- id: UUID (primary key)
- fullName: VARCHAR (e.g., "user/repo")
- url: VARCHAR
```

### Database Location

`packages/back-nest/speedtyper-local.db`

**Reset database:**

```bash
npm run reset
# Or manually:
rm packages/back-nest/speedtyper-local.db
npm run dev  # Auto-recreates with empty schema
npm run reimport  # Re-import snippets
```

---

## Key Design Decisions

### 1. Why Keep WebSockets for Solo Mode?

**Question**: If there's no multiplayer, why not just use REST?

**Answer**: The typing loop requires **real-time validation** and **server-side WPM calculation**. A REST API would add latency:

- WebSocket: ~10-20ms round-trip per keystroke
- REST: ~50-100ms + HTTP overhead

The existing Socket.IO infrastructure is fast and reliable. Ripping it out for marginal simplification isn't worth the risk.

### 2. Why SQLite Instead of PostgreSQL?

**Tradeoffs:**

| PostgreSQL               | SQLite                           |
| ------------------------ | -------------------------------- |
| ✅ Production-grade      | ✅ Zero setup                    |
| ✅ Better for multi-user | ✅ Single file (easy backup)     |
| ❌ Requires Docker       | ✅ Portable                      |
| ❌ Overkill for solo use | ✅ Fast for read-heavy workloads |

Since this is a **local dev tool** with a **single user**, SQLite is the right choice.

### 3. Why Comment Out Multiplayer Instead of Deleting?

**Reasoning:**

1. **Future-proofing**: User might want to re-enable it later
2. **Learning**: Commented code serves as documentation
3. **Safety**: Easier to verify what was removed

**Example** (race-events.service.ts):

```typescript
// SOLO MODE: No room joining needed
createdRace(socket: Socket, race: Race) {
  // REMOVED: socket.join(race.id);  // ← Kept as comment
  socket.emit('race_joined', race);
}
```

### 4. Why Keep Tree-sitter?

**Question**: Why not just use regex to extract functions?

**Answer**: Tree-sitter is a **production-grade parser** that:

- Handles edge cases (nested functions, decorators, etc.)
- Works across 15+ languages with identical API
- Filters by quality (avoids imports, one-liners, etc.)

Building custom heuristics would take weeks and produce inferior results.

### 5. Settings Store as Central Modal State Manager (NEW v1.4.0)

**Decision**: Use `settings-store.ts` to manage all modal open/close states (Settings, Profile, Info, Language, etc.)

**Reasoning:**

- **Single source of truth**: All modals controlled from one store
- **Global ESC handler**: Close any modal with single `closeModals()` call
- **Consistent UX**: Prevents multiple modals open simultaneously
- **Simple integration**: New modals just add boolean to store

**Implementation Pattern:**

```typescript
// settings-store.ts
interface SettingsState {
  settingsModalIsOpen: boolean;
  profileModalIsOpen: boolean;
  infoModalIsOpen: boolean;     // NEW v1.4.0
  // ... other modal states
}

export const closeModals = () => {
  useSettingsStore.setState((s) => ({
    ...s,
    settingsModalIsOpen: false,
    profileModalIsOpen: false,
    infoModalIsOpen: false,
    // ... close all modals
  }));
};
```

**Global ESC Handler** (`_app.tsx`):

```typescript
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModals(); // Closes ALL modals
    }
  };
  window.addEventListener("keydown", handleEscape);
  return () => window.removeEventListener("keydown", handleEscape);
}, []);
```

**Benefits:**
- ✅ Consistent modal behavior across entire app
- ✅ Easy to add new modals (just add boolean to store)
- ✅ Global keyboard shortcuts work automatically
- ✅ No prop drilling for modal state

### 6. InfoModal for Keyboard Shortcuts Documentation (NEW v1.4.0)

**Decision**: Create dedicated modal for keyboard shortcuts instead of Settings bloat

**Reasoning:**

- **Separation of concerns**: Settings = toggles/actions, Info = documentation
- **Discoverability**: Keyboard icon in navbar opens shortcuts reference
- **Concise content**: Only working shortcuts documented, no verbosity
- **Scannable layout**: Visual `<kbd>` elements, organized sections

**Current Keyboard Shortcuts:**
- **Tab** - Next snippet (refresh challenge)
- **Enter** - Continue from results page
- **Alt + ←** - Previous language
- **Alt + →** - Next language
- **ESC** - Close any modal
- **Click anywhere** - Focus typing area

---

## Critical Files (Modify With Care)

### Backend

| File                      | Why It's Critical        | Modification Risk          |
| ------------------------- | ------------------------ | -------------------------- |
| `race.gateway.ts`         | WebSocket event handlers | 🔴 HIGH (breaks typing)    |
| `race-manager.service.ts` | Race state machine       | 🔴 HIGH (logic errors)     |
| `progress.service.ts`     | WPM calculation          | 🟡 MEDIUM (wrong metrics)  |
| `parser.service.ts`       | Snippet extraction       | 🟡 MEDIUM (quality issues) |
| `challenge.entity.ts`     | Database schema          | 🟢 LOW (just a model)      |

### Frontend

| File                | Why It's Critical    | Modification Risk           |
| ------------------- | -------------------- | --------------------------- |
| `Game.ts`           | Main game controller | 🔴 HIGH (breaks everything) |
| `CodeArea.tsx`      | Typing interface     | 🔴 HIGH (breaks input)      |
| `game-store.ts`     | Race state           | 🟡 MEDIUM (state bugs)      |
| `code-store.ts`     | Typing state         | 🟡 MEDIUM (state bugs)      |
| `settings-store.ts` | User preferences + modal state | 🟡 MEDIUM (v1.4.0: manages all modals) |
| `useKeyMap.ts`      | Keyboard shortcuts   | 🟢 LOW (isolated)           |

**Rule of thumb**: If you're touching files in `races/` or `modules/play2/`, test extensively.

---

## Development Workflow

### Running the App

```bash
# Start both backend and frontend
npm run dev

# Backend: http://localhost:1337
# Frontend: http://localhost:3001 (auto-opens in browser)
```

### Importing Snippets

```bash
# Add files to snippets/ folder first
npm run reimport

# Or manually:
cd packages/back-nest
npm run command import-local-snippets
```

### Resetting Database

```bash
# Via script
npm run reset

# Manual
rm packages/back-nest/speedtyper-local.db
npm run dev  # Recreates schema
npm run reimport  # Re-import snippets
```

### Inspecting Database

```bash
cd packages/back-nest
sqlite3 speedtyper-local.db

sqlite> .tables
sqlite> SELECT COUNT(*) FROM challenge;
sqlite> SELECT id, language, LEFT(content, 50) FROM challenge LIMIT 5;
sqlite> .exit
```

### Debugging WebSocket Events

**Backend (NestJS logs):**

- Check terminal running `npm run dev`
- Look for `[RaceGateway]` logs
- Add `console.log()` in `race.gateway.ts` handlers

**Frontend (Browser console):**

- Open DevTools → Console
- Look for Socket.IO connection messages
- Add `console.log()` in `Game.ts` event listeners

---

## Common Modification Patterns

### Adding a New WebSocket Event

1. **Backend**: Add `@SubscribeMessage('new_event')` in `race.gateway.ts`
2. **Backend**: Create emitter method in `race-events.service.ts`
3. **Frontend**: Add `this.socket.subscribe('new_event', ...)` in `Game.ts`
4. **Frontend**: Update relevant store (game-store, code-store, etc.)

### Adding a New REST Endpoint

1. **Backend**: Create method in `race.controllers.ts` or `challenges/languages.controller.ts`
2. **Backend**: Add route decorator (`@Get()`, `@Post()`, etc.)
3. **Frontend**: Create API function in `common/api/`
4. **Frontend**: Call from component or service

### Adding a New Modal (NEW v1.4.0 Pattern)

1. **Create Component**: Add to `common/components/modals/YourModal.tsx`
2. **Add to Store**: Update `settings-store.ts`:
   ```typescript
   interface SettingsState {
     // ... existing
     yourModalIsOpen: boolean;  // ADD THIS
   }
   
   // Initial state
   yourModalIsOpen: false,
   
   // Add open function
   export const openYourModal = () => {
     useSettingsStore.setState((s) => ({ ...s, yourModalIsOpen: true }));
   };
   
   // Update closeModals
   export const closeModals = () => {
     useSettingsStore.setState((s) => ({
       ...s,
       yourModalIsOpen: false,  // ADD THIS
       // ... other modals
     }));
   };
   ```
3. **Integrate**: Use in component:
   ```typescript
   const yourModalOpen = useSettingsStore((s) => s.yourModalIsOpen);
   {yourModalOpen && <YourModal closeModal={closeModals} />}
   ```
4. **Trigger**: Call `openYourModal()` from buttons/handlers
5. **ESC Works**: Global handler automatically closes it

### Modifying Snippet Filtering

**New in v1.2.0:** Snippet filters are now configurable via `parser.config.json`!

**Quick method (recommended):**

1. **Edit**: `packages/back-nest/parser.config.json`
2. **Modify**: Filter values

```json
{
  "filters": {
    "maxNodeLength": 500, // Was 800
    "minNodeLength": 150, // Was 100
    "maxNumLines": 15, // Was 25
    "maxLineLength": 80 // Was 100
  }
}
```

3. **Test**: Run `npm run reimport`, check snippet quality
4. **Revert**: If too strict/loose, adjust values and re-import

**Advanced method (code-level customization):**

1. **Edit**: `packages/back-nest/src/challenges/services/parser.service.ts`
2. **Find**: `loadConfig()` method
3. **Modify**: Add custom validation logic or filter behavior
4. **Test**: Run `npm run reimport`, check snippet quality

**Available filter parameters:**

| Parameter        | Default | Purpose                                     |
| ---------------- | ------- | ------------------------------------------- |
| `maxNodeLength`  | 800     | Maximum characters per snippet              |
| `minNodeLength`  | 100     | Minimum characters (avoid trivial snippets) |
| `maxNumLines`    | 25      | Maximum lines per snippet                   |
| `maxLineLength`  | 100     | Maximum characters per line                 |
| `removeComments` | true    | Strip comments during import                |

**Validation rules:**

- `minNodeLength` must be less than `maxNodeLength`
- All values must be positive integers
- Invalid config triggers console warning and uses defaults

**Example configurations:**

_For longer, complex snippets:_

```json
{
  "filters": {
    "maxNodeLength": 1200,
    "minNodeLength": 200,
    "maxNumLines": 40,
    "maxLineLength": 120
  }
}
```

_For shorter, beginner-friendly snippets:_

```json
{
  "filters": {
    "maxNodeLength": 400,
    "minNodeLength": 80,
    "maxNumLines": 12,
    "maxLineLength": 70
  }
}
```

### Adding a New Language

1. **Install parser**: `cd packages/back-nest && npm install tree-sitter-<language>`
2. **Register**: Add to `ts-parser.factory.ts` switch statement
3. **Test**: Add sample file to `snippets/<language>/`, run `npm run reimport`

---

## Environment Variables

### Backend (.env in packages/back-nest/)

```bash
# Database connection string
DATABASE_PRIVATE_URL=sqlite://./speedtyper-local.db

# Session secret (any random string)
SESSION_SECRET=local-dev-secret-key-change-me-123

# Node environment
NODE_ENV=development

# Server port
PORT=1337
```

### Frontend (.env.local in packages/webapp-next/)

```bash
# Backend URL (for REST API calls)
NEXT_PUBLIC_SERVER_URL=http://localhost:1337

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:1337
```

---

## Configuration Files

### Parser Configuration

**File:** `packages/back-nest/parser.config.json`

**Purpose:** Controls snippet quality filters and parsing behavior

**Structure:**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "description": "Configuration for code snippet parser and quality filters",
  "version": "1.0.0",
  "filters": {
    "maxNodeLength": 800,
    "minNodeLength": 100,
    "maxNumLines": 25,
    "maxLineLength": 100
  },
  "parsing": {
    "removeComments": true,
    "enableCommentSkipping": false
  },
  "notes": {
    "maxNodeLength": "Maximum character count for a single snippet",
    "minNodeLength": "Minimum character count to avoid trivial snippets",
    "maxNumLines": "Maximum number of lines in a snippet",
    "maxLineLength": "Maximum characters per line to avoid horizontal scrolling",
    "removeComments": "Strip comments from snippets during import",
    "enableCommentSkipping": "Future: Make comments visible but not typable"
  }
}
```

**Loading behavior:**

- Read once on parser service initialization (backend startup)
- Validates structure and values
- Falls back to hardcoded defaults if missing or invalid
- Logs configuration to console on successful load

**Error handling:**

```typescript
// Invalid config scenarios:
// 1. File doesn't exist → Use defaults
// 2. Invalid JSON → Use defaults, log error
// 3. minNodeLength >= maxNodeLength → Use defaults, log warning
// 4. Negative/zero values → Use defaults, log warning
```

**To apply changes:**

```bash
# Edit config file
code packages/back-nest/parser.config.json

# Restart backend (config loads on startup)
npm run dev

# Re-import snippets with new filters
npm run reimport
```

**Implementation details:**

- **Location**: `packages/back-nest/src/challenges/services/parser-config.interface.ts`
- **Interface**: `ParserConfig` (TypeScript type definition)
- **Defaults**: `DEFAULT_PARSER_CONFIG` constant
- **Loader**: `Parser.loadConfig()` method in `parser.service.ts`

## Testing Strategy

### Current Approach

**Manual smoke testing** after each change:

1. Start app: `npm run dev`
2. Type a snippet (verify input works)
3. Complete snippet (verify WPM calculation)
4. Check results page (verify data display)

### No Automated Tests (Yet)

The original codebase has minimal test coverage. Adding comprehensive tests is a **future enhancement** (see FEATURES.md).

**Why not now?**

- Time-intensive (would delay features)
- Typing engine is stable (works in production upstream)
- Manual testing catches regressions effectively for solo use

---

## Performance Considerations

### Database Queries

- **Challenge selection**: Random query with language filter

  - Optimized via index on `language` column
  - Typical: <5ms query time

- **Result insertion**: Single INSERT after race completion
  - No performance concerns

### WebSocket Overhead

- **Keystroke events**: 40-60 events per minute (average typing speed)
- **Payload size**: ~100 bytes per event
- **Network usage**: Negligible (~6KB/min)

### Frontend Rendering

- **CodeArea.tsx**: Re-renders on every keystroke
- **Optimization**: React.memo() on child components
- **Bottleneck**: None detected for snippets <500 chars

---

## Security Notes

### Authentication

**Current**: Guest-only (no passwords, no GitHub OAuth)

**Implications**:

- ✅ Zero friction for local use
- ❌ No user isolation (single-user assumption)
- ❌ Not suitable for multi-user deployment

### Database Access

**Current**: SQLite file with no access control

**Implications**:

- Anyone with filesystem access can read/modify database
- Fine for local dev tool
- **Do not** deploy this to a public server

### Cross-Origin Requests

**Current**: CORS configured for `localhost` only

**Location**: `packages/back-nest/src/config/cors.ts`

---

## Known Technical Debt

1. **Misleading file names**: `postgres.ts` actually configures SQLite
2. **Unused multiplayer code**: Commented out, not removed
3. **No TypeScript strict mode**: Inherited from upstream
4. **Minimal error handling**: Happy-path focus
5. **No logging framework**: Console.log() only

**These are acceptable tradeoffs** for a local dev tool. Future versions may address them.

---

## Architectural Patterns Established

### v1.4.0 Patterns (NEW)

#### 1. Modal State Management Pattern

**Established**: Central modal state in `settings-store.ts`

**When to use**: Any new modal component

**Benefits**:
- Single source of truth for all modal states
- Global keyboard shortcuts work automatically
- Consistent UX (only one modal open at a time)

**Example**:
```typescript
// 1. Add to store
interface SettingsState {
  yourModalIsOpen: boolean;
}

// 2. Create open function
export const openYourModal = () => {
  useSettingsStore.setState((s) => ({ ...s, yourModalIsOpen: true }));
};

// 3. Update closeModals
export const closeModals = () => {
  useSettingsStore.setState((s) => ({
    ...s,
    yourModalIsOpen: false,
  }));
};

// 4. Use in component
const yourModalOpen = useSettingsStore((s) => s.yourModalIsOpen);
{yourModalOpen && <YourModal />}
```

#### 2. Global Keyboard Handler Pattern

**Established**: App-wide keyboard event listener in `_app.tsx`

**When to use**: App-level keyboard shortcuts (ESC, global hotkeys)

**Benefits**:
- Consistent behavior across all pages
- No prop drilling
- Easy to extend with new shortcuts

**Example**:
```typescript
// _app.tsx
useEffect(() => {
  const handleKeyboard = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModals();
    }
    // Add more global shortcuts here
  };
  window.addEventListener("keydown", handleKeyboard);
  return () => window.removeEventListener("keydown", handleKeyboard);
}, []);
```

#### 3. InfoModal Documentation Pattern

**Established**: Separate documentation modal from settings/actions

**When to use**: Static reference content (keyboard shortcuts, help text)

**Benefits**:
- Clear separation: Settings = actions, Info = documentation
- Prevents settings bloat
- Easy to update documentation independently

**Example**:
```typescript
// InfoModal structure
<Modal>
  <Section title="Typing Shortcuts">
    <ShortcutRow keys="Tab" description="Next snippet" />
  </Section>
  <Section title="App Info">
    <AppVersion />
  </Section>
</Modal>
```

---

## Extending the Architecture

### Future Considerations

#### v1.5.0: Smart Skipping

**Architectural Impact**:
- Add `skipRanges: [number, number][]` to Challenge entity
- Modify keystroke validation to check skip ranges
- Frontend cursor auto-advancement logic
- User preference storage (requires stable user identity)

**Key Decision**: Backend calculates and stores skip ranges during import vs. on-demand calculation

**Performance Concern**: Must maintain <25ms keystroke latency

#### v1.6.0: Syntax Highlighting (Optional)

**Architectural Impact**:
- Pre-tokenize snippets during import (Tree-sitter)
- Store tokens in database or calculate on-demand
- Rewrite `CodeArea.tsx` to render token-based spans
- Add feature toggle in settings

**Risk**: HIGH - Fundamental change to rendering system

**Validation Required**: User feedback + performance benchmarks before implementation

See `FEATURES.md` for detailed roadmap.

---

## Version History

### v1.4.0 (November 2, 2025)

**Major Changes**:
- Added InfoModal component for keyboard shortcuts documentation
- Implemented global ESC key handler in `_app.tsx`
- Enhanced settings-store to manage all modal states
- Improved Settings modal UI (typography, content, Debug Mode toggle)
- Removed multiplayer UI remnants (user count, public races)

**Architectural Patterns**:
- Established modal state management pattern
- Established global keyboard handler pattern
- Established documentation modal pattern

**Files Modified**:
- `packages/webapp-next/common/components/modals/InfoModal.tsx` (new)
- `packages/webapp-next/pages/_app.tsx`
- `packages/webapp-next/modules/play2/state/settings-store.ts`
- `packages/webapp-next/common/components/NewNavbar.tsx`
- `packages/webapp-next/common/components/overlays/SettingsOverlay.tsx`

### v1.3.0 (October 31, 2025)

**Major Changes**:
- Added `race_error` WebSocket event for error handling
- Frontend displays user-friendly alerts on backend errors
- Implemented keyboard shortcuts (Tab, Enter, Alt+Arrows)

**WebSocket Contract Update**:
- Added `race_error` event (backend → frontend)

**Files Modified**:
- `packages/webapp-next/modules/play2/services/Game.ts`
- `packages/back-nest/src/races/race.gateway.ts`

### v1.2.0 (October 30, 2025)

**Major Changes**:
- Configurable snippet filters via `parser.config.json`
- Snippet metadata display on results page
- Bug fixes (results page race condition, default language)

**Configuration System**:
- Established JSON-based configuration pattern
- Runtime config validation and fallback to defaults

### v1.1.0 (October 2025)

**Major Changes**:
- SQLite migration (replaced PostgreSQL)
- Local snippet import system
- Guest-only authentication
- Solo mode (multiplayer stubbed)

---

**Next**: See `FEATURES.md` for planned enhancements and implementation strategy.