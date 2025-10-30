# Speedtyper Local: Project Context

**Last Updated:** Based on architectural analysis and codebase verification (Session 2)

## Problem Statement

**Transform speedtyper.dev from multiplayer typing competition → personal typing practice tool**

**Current Pain:**

- 10-minute startup (Docker + multiple terminals)
- Random GitHub snippets (not user's own code)
- Multiplayer/auth complexity user doesn't need

**Desired State:**

- One command → typing in <1 minute
- Practice user's own Python/TypeScript code
- Solo experience, preserve excellent typing UI

**Timeline:** 7 days max | **Risk Tolerance:** LOW for frontend, MEDIUM for backend

---

## Architecture Overview

### Verified Tech Stack

### Verified Tech Stack

**Frontend:** Next.js 12.2.5 + TypeScript + Zustand + Socket.IO v2.x
**Backend:** NestJS 9.0.0 + TypeScript + PostgreSQL + TypeORM + Socket.IO v4.5.2
**Parsing:** Tree-sitter 0.20.0 with 15+ language parsers (already installed)

### Critical Verified Facts

1. **Socket.IO Contract is Simple** (11 events total)
   - Frontend emits: `play`, `join`, `start_race`, `key_stroke`, `refresh_challenge`
   - Backend emits: `race_joined`, `countdown`, `race_started`, `progress_updated`, `race_completed`, etc.
   - **WPM calculated server-side** (not client-side) → must keep backend logic

2. **Auth Has Guest User System** (already exists!)
   - `src/middlewares/guest-user.ts` creates temp users automatically
   - Session middleware attaches user to every socket: `this.session.getUser(socket)`
   - No need to build auth stubbing—just disable GitHub OAuth routes

3. **Tree-sitter Already Working**
   - `parser.service.ts` filters snippets (100-300 chars, max 11 lines, max 55 chars/line)
   - Extracts functions/classes using AST parsing
   - All 15 language parsers installed in package.json

4. **Database Uses URL-Based Config**
   - `DATABASE_PRIVATE_URL` env var (connection string format)
   - **Zero raw SQL found** (all TypeORM entities)
   - SQLite migration = 2-line change

5. **No Next.js API Routes**
   - Backend is separate NestJS app
   - Frontend → Backend via REST (`/api/*`) + WebSocket (`ws://`)

---

## Strategic Approach: Minimal Viable Fork

After comprehensive analysis, we chose the **Minimal Viable Fork** approach:

**Why This Approach:**

- Preserves frontend quality (low breakage risk)
- Leverages existing tree-sitter investment
- Achievable in 7-day timeline
- Aligns with user's Python-first skills

**Rejected Alternatives:**

- ❌ Backend rewrite (Python/Flask): TypeScript monorepo coupling too tight, 3-4 week effort
- ❌ Full simplification: Frontend/backend entanglement high-risk for timeline
- ❌ Alternative tools (monaco-editor, code-typing-game): Don't match feature quality

### Implementation Strategy

1. **Database:** Migrate to SQLite (simplifies deployment)
2. **Startup:** Use npm concurrently (one command, no Docker)
3. **Snippets:** Modify tree-sitter import to read local files (not GitHub API)
4. **Auth:** Leverage existing guest user system, disable GitHub OAuth
5. **WebSocket:** Keep Socket.IO, stub multiplayer broadcasting
6. **Multiplayer:** Comment out (don't delete) for potential future reuse

---

## Verified Architectural Decisions

Based on actual codebase verification:

### ✅ Decision 1: SQLite Migration

**Chosen:** Migrate to SQLite
**Rationale:**

- No raw SQL = zero risk
- URL-based config = trivial change
- Eliminates Docker entirely
- Aligns with user's "reduce friction" goal

### ✅ Decision 2: npm concurrently Startup

**Chosen:** No Docker
**Rationale:**

- SQLite removes need for Docker database
- Native hot-reload (no volume issues)
- User is Python-first, Docker-averse

### ✅ Decision 3: Keep Tree-sitter

**Chosen:** Modify import source
**Rationale:**

- Already working, tested, sophisticated
- Just change WHERE it reads files (local `snippets/` vs GitHub API)
- Building heuristics = reinventing wheel

### ✅ Decision 4: Use Existing Guest System

**Chosen:** Disable GitHub OAuth only
**Rationale:**

- Guest middleware already exists
- Session system already handles temporary users
- Zero stubbing needed

### ✅ Decision 5: Stub Multiplayer, Keep Socket.IO

**Chosen:** Remove broadcasting logic
**Rationale:**

- Server-side WPM calculation requires WebSocket
- Socket contract simple (11 events)
- Change `server.to().emit()` → `socket.emit()`

---

## Critical File Locations

**Frontend Socket.IO:**

- `packages/webapp-next/modules/play2/services/Game.ts` - Main game logic
- `packages/webapp-next/modules/play2/state/game-store.ts` - Zustand store
- `packages/webapp-next/common/services/Socket.ts` - Socket client

**Backend Race System:**

- `packages/back-nest/src/races/race.gateway.ts` - WebSocket handlers (**key file**)
- `packages/back-nest/src/races/services/race-manager.service.ts` - Race orchestration

**Backend Auth:**

- `packages/back-nest/src/auth/auth.module.ts` - Module to modify
- `packages/back-nest/src/middlewares/guest-user.ts` - Already supports guests!
- `packages/back-nest/src/sessions/session.middleware.ts` - Session setup

**Backend Snippets:**

- `packages/back-nest/src/challenges/commands/challenge-import-runner.ts` - **Modify this**
- `packages/back-nest/src/challenges/services/parser.service.ts` - Parsing logic (keep)
- `packages/back-nest/src/challenges/services/challenge.service.ts` - Challenge management

**Backend Config:**

- `packages/back-nest/src/database.module.ts` - TypeORM config
- `packages/back-nest/src/config/postgres.ts` - Database URL (rename misleading)
- `packages/back-nest/src/main.ts` - App bootstrap

---

## Known Risks & Mitigations

### High Risk

1. **Frontend TypeScript Errors After Backend Changes**
   - Mitigation: Run `npm run build` in frontend after every backend API change
   - Check: Any changes to DTOs or response shapes

2. **Session/Socket Integration**
   - Risk: Guest middleware must run before WebSocket adapter initializes
   - Mitigation: Verify middleware order in `main.ts`

### Medium Risk

3. **Race Service Dependencies**
   - Risk: `RaceManager`, `RaceEvents` services may expect multi-player context
   - Mitigation: Stub methods that broadcast, keep single-socket methods

4. **Tree-sitter Import Modification**
   - Risk: Existing import logic tightly coupled to GitHub API
   - Mitigation: Create filesystem adapter, test incrementally

### Low Risk

5. **SQLite Migration**
   - Risk: Hidden raw SQL or PostgreSQL-specific queries
   - Mitigation: Already verified no raw SQL exists, TypeORM handles dialects

---

## Out of Scope (Explicitly NOT Doing)

1. ❌ Rewriting backend in Python/Flask
2. ❌ Replacing React/Next.js frontend
3. ❌ Building new typing UI from scratch
4. ❌ Deleting multiplayer code (commenting out only)
5. ❌ Advanced features (leaderboards, trends, analytics)
6. ❌ Production deployment optimization
7. ❌ Comprehensive test suite (smoke tests only)
8. ❌ Mobile/responsive optimization

---

## Success Criteria

### Must Have (P0)

- ✅ One command startup (<1 min to typing)
- ✅ Practice user's own code (from `snippets/` folder)
- ✅ WPM/accuracy/completion metrics working
- ✅ Syntax highlighting preserved
- ✅ Results displayed after completion

### Should Have (P1)

- ✅ No Docker requirement
- ✅ No GitHub auth friction
- ✅ SQLite database (single file)
- ✅ Tree-sitter parsing quality maintained

### Nice to Have (P2)

- Multiple language support (already exists)
- Snippet refresh without restart
- Custom settings persistence

---

## Key Constraints

**User Profile:**

- Python-first (6+ years backend)
- React/Next.js (1/10 knowledge) → treat as black box
- TypeScript/Node (C-level) → can modify but not rewrite
- Docker (D-level, avoidance preference)
- Timeline: 7 days maximum
- Budget: $0 (open source only)

**Technical Constraints:**

- Must preserve frontend quality (it works, don't break it)
- Zero breaking changes to Socket.IO contract
- TypeScript compilation must succeed
- Hot-reload must work (dev experience)

---

## Environment Setup Notes

**User's Dev Environment:**

- Windows + ConEmu terminal
- VS Code primary IDE
- Dual monitor setup
- Prefers file-based workflows

**Required Tools:**

- Node.js (already installed via NestJS/Next.js)
- SQLite3 (npm package)
- concurrently (npm package)

---

## Next Session Handoff

When resuming, user will provide:

1. This context document
2. The implementation plan document
3. Specific files being worked on (not entire codebase)

Focus on:

- Implementation details for current phase
- Code-level changes
- Testing/verification steps
- Debugging specific issues
