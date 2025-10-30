# Speedtyper Local: Implementation Plan

**7-Day Roadmap | Conservative Estimates | Incremental Testing**

---

## Phase 0: Pre-Implementation (30 minutes)

### Verification Checkpoint

Before starting Day 1, verify current state:

```bash
# Clone and explore
git clone https://github.com/codicocodes/speedtyper.dev.git speedtyper-solo
cd speedtyper-solo
code .

# Verify structure
ls packages/back-nest/src/
ls packages/webapp-next/modules/play2/
```

**Deliverable:** Confirmed repository structure matches documentation

---

## Phase 1: Database Simplification (Day 1, 2-4 hours)

### Goal

Eliminate PostgreSQL dependency, enable single-file database.

### Tasks

**1.1: Install SQLite** (10 min)

```bash
cd packages/back-nest
npm install sqlite3
```

**1.2: Create Local Environment File** (10 min)

```bash
# packages/back-nest/.env
DATABASE_PRIVATE_URL=sqlite://./speedtyper-local.db
SESSION_SECRET=local-dev-secret-key-change-me-123
NODE_ENV=development
PORT=1337
```

**1.3: Verify TypeORM Config** (15 min)

- Check `src/config/postgres.ts` uses `DATABASE_PRIVATE_URL` env var
- Confirm no hardcoded PostgreSQL-specific settings
- File already uses URL format → should work with SQLite URL

**1.4: Test Backend Startup** (30 min)

```bash
npm run start:dev
```

**Expected Output:**

```
[Nest] Websocket Server Started
[Nest] Application Started
```

**1.5: Verify Database Creation** (15 min)

- Check `speedtyper-local.db` file created
- Use SQLite browser or CLI to inspect: `sqlite3 speedtyper-local.db ".tables"`
- Should see: `challenge`, `user`, `session`, `race`, `result`, etc.

**1.6: Test Basic CRUD** (30 min)

- Start backend
- Use Postman/curl to hit health check endpoint
- Verify sessions table populated on connection

### Success Criteria

- ✅ Backend starts without PostgreSQL
- ✅ SQLite DB file created with schema
- ✅ No TypeORM errors in console

### Rollback Plan

If SQLite fails: Revert `.env`, use Docker Compose (fallback to GDR's approach)

---

## Phase 2: Startup Simplification (Day 2, 1-2 hours)

### Goal

Enable one-command startup for both frontend and backend.

### Tasks

**2.1: Create Root Package.json** (15 min)

```bash
# In repository root (speedtyper-solo/)
cat > package.json << 'EOF'
{
  "name": "speedtyper-local",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently -n backend,frontend -c blue,green \"npm run backend\" \"npm run frontend\"",
    "backend": "cd packages/back-nest && npm run start:dev",
    "frontend": "cd packages/webapp-next && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF
```

**2.2: Install Concurrently** (5 min)

```bash
npm install
```

**2.3: Test Single-Command Startup** (20 min)

```bash
npm run dev
```

**Expected Behavior:**

- Backend starts on `localhost:1337`
- Frontend starts on `localhost:3001`
- Browser auto-opens to `localhost:3001`
- Both watch modes active (file changes trigger reload)

**2.4: Document Startup Process** (10 min)
Update root README.md with new instructions

**2.5: Test Cold Start** (15 min)

- Kill all processes
- Run `npm run dev` from scratch
- Time from command → typing UI visible
- Target: <90 seconds

### Success Criteria

- ✅ Single command starts both services
- ✅ Hot reload works for both
- ✅ No manual steps required

### Rollback Plan

If concurrently has issues: Run services in separate terminals (fallback to current method)

---

## Phase 3: Custom Snippets System (Days 3-4, 6-8 hours)

### Goal

Import code from local `snippets/` folder instead of GitHub API.

### Day 3: Setup & Exploration (2-3 hours)

**3.1: Create Snippets Directory** (10 min)

```bash
mkdir -p snippets/python snippets/typescript snippets/react
```

**3.2: Add Sample Code** (20 min)

- Copy 5-10 of user's Python files → `snippets/python/`
- Copy 3-5 TypeScript/React files → `snippets/typescript/` and `snippets/react/`
- Files should be 100-500 lines (tree-sitter will extract snippets)

**3.3: Study Existing Import Logic** (60 min)

- Read `src/challenges/commands/challenge-import-runner.ts`
- Understand: How does it fetch GitHub files?
- Identify: Where does file content enter parser?
- Map: GitHub API response → Parser input format

**3.4: Study Parser Service** (30 min)

- Read `src/challenges/services/parser.service.ts`
- Understand: What format does `parseNodesFromContent()` expect?
- Note: Filtering rules (100-300 chars, max 11 lines, etc.)

**3.5: Plan Modification Strategy** (30 min)

- Decide: Modify `challenge-import-runner.ts` OR create new `local-import-runner.ts`?
- Recommendation: Create new file (preserve original)
- Sketch: Filesystem scan → parse → database insert flow

### Day 4: Implementation (4-5 hours)

**3.6: Create Local Import Runner** (90 min)

Create `src/challenges/commands/local-import-runner.ts`:

```typescript
// Pseudo-code structure (implement details in coding session)
@Command({
  command: "import-local-snippets",
  description: "Import code from local snippets/ folder",
})
export class LocalImportRunner {
  async run() {
    // 1. Scan snippets/ recursively
    const files = this.scanSnippetsDirectory();

    // 2. For each file:
    for (const file of files) {
      const content = readFileSync(file.path, "utf-8");
      const language = this.detectLanguage(file.extension);

      // 3. Parse using existing parser service
      const nodes = await this.parser.parseNodesFromContent(file.name, content);

      // 4. Save challenges using existing service
      await this.challengeService.createFromNodes(nodes, language);
    }
  }

  private scanSnippetsDirectory() {
    // Recursive filesystem scan
    // Return: [{path, name, extension}]
  }

  private detectLanguage(ext: string): Language {
    // Map .py → Python, .ts → TypeScript, etc.
  }
}
```

**3.7: Register New Command** (15 min)

- Add to `src/challenges/commands/index.ts`
- Update `challenges.module.ts` providers

**3.8: Test Import Command** (30 min)

```bash
cd packages/back-nest
npm run command import-local-snippets
```

**Expected Output:**

```
Scanning snippets/...
Found 15 files
Processing python/my_script.py...
  - Extracted 8 function snippets
  - Extracted 3 class snippets
Processing typescript/component.tsx...
  - Extracted 5 function snippets
...
Done. Imported 87 snippets.
```

**3.9: Verify Database Contents** (20 min)

```bash
sqlite3 packages/back-nest/speedtyper-local.db
sqlite> SELECT COUNT(*) FROM challenge;
sqlite> SELECT code, language FROM challenge LIMIT 3;
```

**3.10: Test in UI** (45 min)

- Start app: `npm run dev`
- Click "Practice"
- Verify: Your own code appears
- Type it, complete it
- Check: WPM calculated, results shown

**3.11: Iterate on Snippet Quality** (60 min)

- If snippets too long/short: Adjust parser filters
- If wrong language detection: Fix extension mapping
- If parsing errors: Debug tree-sitter invocation

### Success Criteria

- ✅ Import command runs without errors
- ✅ Database populated with user's code
- ✅ UI displays custom snippets
- ✅ Tree-sitter parsing quality maintained

### Rollback Plan

If filesystem import too complex: Manually insert snippets via SQL (temporary workaround)

---

## Phase 4: Multiplayer Removal (Days 5-6, 5-6 hours)

### Goal

Stub multiplayer broadcasting, preserve solo typing functionality.

### Day 5: Backend Modifications (3-4 hours)

**4.1: Study Race Gateway** (45 min)

- Read `src/races/race.gateway.ts`
- Map: Which handlers broadcast? Which are single-socket?
- Identify: `server.to(roomId).emit()` patterns

**4.2: Stub Broadcasting Logic** (90 min)

Modify `race.gateway.ts`:

```typescript
// BEFORE (multiplayer):
server.to(raceId).emit("progress_updated", allPlayersData);

// AFTER (solo):
socket.emit("progress_updated", currentPlayerData);

// BEFORE (multiplayer):
socket.join(raceId);
const room = server.sockets.adapter.rooms.get(raceId);

// AFTER (solo):
// Remove join logic, no rooms needed
```

**Key Changes:**

- `onPlay()`: Remove room join, emit only to requesting socket
- `onJoin()`: Simplify to single player
- `onKeyStroke()`: Remove broadcast, calculate for solo player only
- `onStartRace()`: Remove multi-player countdown coordination

**4.3: Stub Race Manager Service** (60 min)

- Check `src/races/services/race-manager.service.ts`
- If it manages multi-player state: Simplify to single player
- If it broadcasts events: Change to return data (caller emits)

**4.4: Test Backend Changes** (30 min)

```bash
npm run start:dev
# Check for TypeScript errors
# Verify app starts
```

### Day 6: Frontend Cleanup & Integration Testing (2-3 hours)

**4.5: Hide Multiplayer UI Elements** (30 min)

Add to `packages/webapp-next/styles/globals.css`:

```css
/* Hide multiplayer/auth UI */
.github-login-button,
[data-testid="battle-matcher"],
.leaderboard-link,
.profile-button,
nav .social-links {
  display: none !important;
}
```

Use browser inspector to find additional selectors if needed.

**4.6: Integration Test** (60 min)

- Start full app: `npm run dev`
- Test workflow:
  1. Navigate to practice page
  2. Select snippet (should be user's code)
  3. Start typing
  4. Verify WPM updates in real-time
  5. Complete snippet
  6. Verify results page shows stats
- Test edge cases:
  - Refresh during typing (should restart)
  - Multiple snippets in sequence
  - Errors in console?

**4.7: Smoke Test Checklist** (45 min)

Create `TESTING.md`:

```markdown
- [ ] Backend starts (<30 sec)
- [ ] Frontend starts (<60 sec)
- [ ] UI loads without errors
- [ ] Custom snippet appears
- [ ] Typing input works
- [ ] WPM calculates correctly
- [ ] Accuracy shows
- [ ] Can complete snippet
- [ ] Results page displays
- [ ] Can start new snippet
- [ ] No multiplayer UI visible
- [ ] No auth prompts
```

Run through entire checklist, document any failures.

### Success Criteria

- ✅ Can type snippets, see metrics, complete them
- ✅ No multiplayer UI visible
- ✅ No race broadcast errors in console
- ✅ Solo workflow feels natural

### Rollback Plan

If broadcasting removal breaks WPM: Revert `race.gateway.ts`, investigate client-side calculation

---

## Phase 5: Auth Simplification (Day 6, 1-2 hours)

### Goal

Disable GitHub OAuth, rely on guest user system.

### Tasks

**5.1: Verify Guest Middleware** (15 min)

- Check `src/middlewares/guest-user.ts` exists
- Verify it creates temporary users
- Check `src/main.ts` for middleware registration

**5.2: Disable GitHub Auth Routes** (20 min)

Modify `src/auth/auth.module.ts`:

```typescript
@Module({
  imports: [
    // COMMENTED OUT:
    // PassportModule.register({ session: true }),
    ConfigModule,
    UsersModule,
    RacesModule,
  ],
  controllers: [
    // COMMENTED OUT:
    // GithubAuthController,
    // AuthController,
  ],
  providers: [
    // COMMENTED OUT:
    // GithubStrategy,
  ],
})
export class AuthModule {}
```

**5.3: Test Guest User Creation** (30 min)

- Start backend
- Connect to `localhost:1337` via WebSocket (use tool like `websocat` or browser console)
- Verify: Guest user created in database
- Check: Session middleware runs before WebSocket adapter

**5.4: Test UI Without Auth** (20 min)

- Start full app
- Verify: No login prompts
- Verify: Can practice immediately
- Check: No auth errors in console

### Success Criteria

- ✅ No GitHub OAuth routes active
- ✅ Guest users created automatically
- ✅ Can practice without authentication

---

## Phase 6: Polish & Documentation (Day 7, 2-3 hours)

### Goal

Create reproducible setup, document usage, handle edge cases.

### Tasks

**6.1: Create Convenience Script** (20 min)

Create `start.sh` (Linux/Mac) or `start.bat` (Windows):

```bash
#!/bin/bash
echo "Importing snippets..."
cd packages/back-nest
npm run command import-local-snippets
cd ../..
echo "Starting app..."
npm run dev
```

**6.2: Update README** (30 min)

Create `README-LOCAL.md`:

```markdown
# Speedtyper Local

## Quick Start

1. Clone: `git clone ... speedtyper-solo`
2. Install: `npm install` (in root)
3. Add code: Place files in `snippets/python/`, `snippets/typescript/`, etc.
4. Run: `npm run dev`
5. Practice: Browser opens → start typing!

## Adding Snippets

- Place code in `snippets/` organized by language
- Run: `npm run reimport` (alias for import command)
- Refresh browser

## Troubleshooting

- Backend won't start? Check `.env` file in `packages/back-nest/`
- No snippets? Run `npm run reimport`
- UI errors? Check browser console, report issue
```

**6.3: Handle Edge Cases** (60 min)

Test and fix:

- What if `snippets/` folder empty? (graceful error)
- What if snippet has syntax errors? (parser should skip)
- What if database corrupted? (provide reset script)

Create `reset-db.sh`:

```bash
#!/bin/bash
rm packages/back-nest/speedtyper-local.db
echo "Database reset. Run 'npm run dev' to recreate."
```

**6.4: Final Smoke Test** (30 min)

- Delete `.db` file
- Delete `node_modules/`
- Fresh install: `npm install`
- Run: `npm run dev`
- Go through full typing workflow
- Time: From `npm run dev` to completing first snippet

Target: <2 minutes total

**6.5: Create Backup Plan Document** (20 min)

Create `ROLLBACK.md`:

```markdown
## If Something Breaks

### Revert to PostgreSQL

1. `cd packages/back-nest`
2. Edit `.env`: Change to `DATABASE_PRIVATE_URL=postgresql://...`
3. `docker-compose up -d postgres`

### Revert Multiplayer Changes

1. `git diff src/races/race.gateway.ts`
2. `git checkout src/races/race.gateway.ts`

### Use Original Import

1. Comment out local import command
2. Use original GitHub import
```

### Success Criteria

- ✅ Documentation clear and complete
- ✅ Fresh install works
- ✅ Edge cases handled gracefully
- ✅ Rollback plan documented

---

## Post-Implementation: Maintenance (Ongoing)

### Adding More Snippets

1. Place files in `snippets/`
2. Run `npm run reimport`
3. Refresh browser

### Updating Dependencies

- Backend: `cd packages/back-nest && npm update`
- Frontend: `cd packages/webapp-next && npm update`
- Test after updates: `npm run dev`

### Resetting State

- Database: `rm packages/back-nest/speedtyper-local.db`
- Cache: `rm -rf packages/*/node_modules/.cache`

---

## Risk Mitigation Summary

| Risk                                  | Likelihood | Impact | Mitigation                               |
| ------------------------------------- | ---------- | ------ | ---------------------------------------- |
| SQLite migration fails                | Low        | High   | Revert to PostgreSQL + Docker            |
| Frontend breaks after backend changes | Medium     | High   | Run `npm run build` after each change    |
| Tree-sitter parsing errors            | Medium     | Medium | Validate snippet quality, adjust filters |
| Race service expects multiplayer      | Medium     | Medium | Incremental testing, stub dependencies   |
| Session/auth integration issues       | Low        | Medium | Verify middleware order                  |

---

## Scope Boundaries (Reminder)

### In Scope

- ✅ Solo typing practice
- ✅ Custom snippets from local files
- ✅ One-command startup
- ✅ SQLite database
- ✅ Guest user system
- ✅ WPM/accuracy metrics

### Out of Scope

- ❌ Multiplayer races
- ❌ GitHub authentication
- ❌ Leaderboards
- ❌ Social features
- ❌ Production deployment
- ❌ Comprehensive testing
- ❌ Mobile optimization
- ❌ Backend rewrite

---

## Session Handoff Checklist

When starting next coding session, provide:

1. ✅ This implementation plan
2. ✅ Project context document
3. ✅ Current phase (e.g., "Starting Phase 3")
4. ✅ Specific files being modified / When in doubt or need further information, always explicitly ask for the file/files, don't make guesses and assumptions!
5. ✅ Any errors/blockers encountered

Don't re-explain architectural decisions—reference context doc instead.
