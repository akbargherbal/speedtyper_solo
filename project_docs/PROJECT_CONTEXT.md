# Speedtyper Local: Project Context Reference

**Version:** 1.3.0 → 1.6.0 (Active Development)  
**Last Updated:** November 1, 2025  
**Purpose:** Quick reference for LLM collaboration sessions  
**Token Budget:** ~3,000 tokens (replaces 22,000 token documentation set)

---

## 1. Project Identity (30 seconds to read)

**What:** Solo typing practice tool for developers - fork of speedtyper.dev  
**Core Value:** Practice YOUR code (not random GitHub snippets), zero friction, local-first  
**Tech Stack:** NestJS (backend) + Next.js (frontend) + SQLite + Socket.IO + Tree-sitter  
**Status:** Stable core (v1.3.0), adding analytics & smart features (v1.4.0-v1.6.0)

### Key Transformations (v1.0 → v1.3)
- PostgreSQL → SQLite (single file database)
- GitHub OAuth → Guest users (no auth friction)
- Multiplayer → Solo (preserved typing engine, stubbed broadcasting)
- GitHub imports → Local snippets (`snippets/` folder)
- Complex setup → One command (`npm run dev`)

---

## 2. Critical Architecture Facts

### File Locations (When You Need To Ask)

**Backend Core:**
```
packages/back-nest/src/
├── races/
│   ├── race.gateway.ts              # WebSocket event handlers (CRITICAL)
│   ├── services/
│   │   ├── race-manager.service.ts  # Race orchestration
│   │   ├── keystroke-validator.service.ts  # Validation logic
│   │   ├── progress.service.ts      # WPM/accuracy calculation
│   │   └── race-events.service.ts   # Socket emitters
│
├── challenges/
│   ├── commands/
│   │   └── local-import-runner.ts   # Snippet import from snippets/
│   ├── services/
│   │   ├── parser.service.ts        # Tree-sitter parsing
│   │   └── challenge.service.ts     # CRUD operations
│   └── entities/
│       └── challenge.entity.ts      # Database model
│
├── users/
│   ├── entities/user.entity.ts
│   └── services/user.service.ts
│
├── middlewares/
│   └── guest-user.ts                # Auto-creates guest users
│
└── main.ts                          # App bootstrap (port 1337)
```

**Frontend Core:**
```
packages/webapp-next/
├── modules/play2/                   # Main typing UI
│   ├── services/
│   │   └── Game.ts                  # Game controller (CRITICAL)
│   ├── state/
│   │   ├── game-store.ts            # Race state (Zustand)
│   │   ├── code-store.ts            # Typing state (Zustand)
│   │   └── settings-store.ts        # User preferences
│   ├── components/
│   │   ├── CodeArea.tsx             # Main typing interface (CRITICAL)
│   │   ├── HiddenCodeInput.tsx      # Invisible input field
│   │   └── SmoothCaret.tsx          # Caret animation (⚠️ HAS BUG)
│   └── containers/
│       └── CodeTypingContainer.tsx  # Typing page wrapper
│
├── common/
│   ├── services/
│   │   └── Socket.ts                # Socket.IO client wrapper
│   ├── components/
│   │   └── NewNavbar.tsx            # Top navigation
│   └── api/                         # REST API calls
│
└── pages/
    ├── index.tsx                    # Home/practice page
    └── results/[id].tsx             # Results page
```

**Database:**
```
packages/back-nest/speedtyper-local.db

Key Tables:
- challenge: Code snippets (content, language, path, tokens)
- user: Guest users (username, legacyId, isAnonymous)
- result: Completed races (userId, challengeId, wpm, accuracy)
- session: WebSocket sessions (session ID, user mapping)
```

**Configuration:**
```
packages/back-nest/parser.config.json  # Snippet quality filters
packages/back-nest/.env                # Database URL, secrets
```

### Data Flow (The 4-Step Loop)

```
1. User adds code → snippets/python/, snippets/typescript/, etc.
2. Backend parses → Tree-sitter extracts functions/classes (100-300 chars)
3. Database stores → SQLite challenge table
4. Typing loop:
   - Frontend emits key_stroke → Backend validates → Backend calculates WPM
   - Backend emits progress_updated → Frontend updates display
   - Repeat until complete → Backend saves result → Frontend shows results page
```

### WebSocket Contract (DON'T BREAK THIS)

**Frontend → Backend (Emits):**
- `play` (RaceSettingsDTO) - Request new race
- `key_stroke` (KeystrokeDTO) - Send typed character
- `refresh_challenge` (RaceSettingsDTO) - Get new snippet
- `join` (raceId) - Join race (unused in solo)
- `start_race` - Start countdown (instant in solo)

**Backend → Frontend (Emits):**
- `race_joined` (Race) - Race created successfully
- `challenge_selected` (Challenge) - Snippet to type
- `countdown` (number) - Timer (always instant in solo)
- `race_started` (Date) - Race officially began
- `progress_updated` (RacePlayer) - Updated WPM/accuracy
- `race_completed` (Result) - Finished, results ready
- `race_error` (error) - No challenges available (v1.3.0)

**CRITICAL:** Frontend and backend must agree on this contract. Changes require updates to both sides.

---

## 3. Current Feature Status

### Completed (v1.0-1.2)
- ✅ SQLite migration (single-file database)
- ✅ Local snippet import (`npm run reimport`)
- ✅ One-command startup (`npm run dev`)
- ✅ Solo mode (multiplayer broadcasting stubbed)
- ✅ Guest-only auth (no GitHub OAuth)
- ✅ UI cleanup (removed multiplayer elements)
- ✅ Configurable snippet filters (`parser.config.json`)
- ✅ Backend crash resilience (error messages to frontend)

### Active Development (v1.3.0 - 67% Complete)
- ✅ Backend error handling (race_error event)
- 🟡 Keyboard shortcuts (Ctrl+L, Ctrl+R, Enter)
- 🟡 Enhanced user feedback (connection status, empty state)
- ⚠️ **BUG: Smooth caret offset** (see Known Issues below)

### Planned (v1.4.0-v1.6.0)
**v1.4.0 - Foundation Layer:**
- Feature 3.1: Stable user identity (Local Super User)
- Feature 3.2: Progress dashboard (WPM trends, language stats)

**v1.5.0 - Smart Skipping Phase 1:**
- Feature 3.3A: Character skipping (leading spaces)

**v1.5.1 - Smart Skipping Phase 2:**
- Feature 3.3B: AST-based node skipping (comments)

**v1.6.0 - Visual Enhancement (OPTIONAL):**
- Feature 3.4: Syntax highlighting (requires user validation first)

---

## 4. Key Design Principles

1. **Never break typing** - If feature adds latency >25ms or breaks validation, revert it
2. **Local-first forever** - No external services, works offline after initial setup
3. **Comment, don't delete** - Preserve multiplayer code as comments (learning/rollback)
4. **Backend is source of truth** - Validation and calculation server-side, frontend renders
5. **Incremental releases** - Git tag each version, test rollback before proceeding
6. **Feature toggles** - New features should be disableable via settings

---

## 5. Common Patterns (Copy-Paste Reference)

### File Inspection
```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file
```

### Grep Search
```bash
grep -r "searchTerm" --include="*.ts" ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/
```

### Database Query
```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest
sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM challenge;"
sqlite3 speedtyper-local.db "SELECT * FROM user LIMIT 5;"
```

### Start App
```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo
npm run dev
# Backend: http://localhost:1337
# Frontend: http://localhost:3001 (auto-opens)
```

### Reimport Snippets
```bash
npm run reimport
# Or manually:
cd packages/back-nest
npm run command import-local-snippets
```

### Reset Database
```bash
rm packages/back-nest/speedtyper-local.db
npm run dev  # Auto-recreates schema
npm run reimport  # Re-import snippets
```

### Check Line Endings (Debugging)
```bash
head -1 file.js | od -c              # Show character codes
file file.js                          # Check file encoding
hexdump -C file.js | head -3         # Show hex dump
```

---

## 6. When To Ask For Files

**Never guess file contents.** Always request specific files:

```bash
# Single file
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/[module]/src/[file]

# Multiple related files
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/races/race.gateway.ts
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/races/services/race-manager.service.ts

# Find file location
find ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo -name "filename.ts"
```

**When investigating a feature:**
1. Ask for the main file
2. Ask for related services/components
3. Ask for test files if they exist
4. Search for usage patterns with grep

---

## 7. Risk-Aware File Modification

**🔴 HIGH RISK (Test Extensively, Small Changes Only):**
- `race.gateway.ts` - WebSocket handlers (breaks typing if wrong)
- `race-manager.service.ts` - Race orchestration (state machine)
- `Game.ts` - Frontend game controller (event coordination)
- `CodeArea.tsx` - Typing interface (input handling)
- `keystroke-validator.service.ts` - Validation logic (accuracy depends on this)

**🟡 MEDIUM RISK (Incremental Testing Required):**
- `progress.service.ts` - WPM/accuracy calculation (wrong metrics)
- `parser.service.ts` - Snippet extraction (quality issues)
- `code-store.ts` - Typing state (cursor bugs)
- `game-store.ts` - Race state (synchronization issues)

**🟢 LOW RISK (Isolated, Easy Rollback):**
- UI components (buttons, modals, navbars)
- API client functions (`common/api/`)
- Utility functions (`utils/`)
- Configuration files (`.json`, `.env`)

**Testing Protocol After Modifying High-Risk Files:**
1. Start app (`npm run dev`)
2. Select snippet
3. Type through entire snippet
4. Verify WPM/accuracy correct
5. Complete and check results page
6. Test edge cases (errors, refresh, etc.)

---

## 8. Known Issues

### ⚠️ **Bug: Smooth Caret Offset (Logged for v1.3.1)**

**Feature:** Smooth Line Caret Style  
**File:** `packages/webapp-next/modules/play2/components/SmoothCaret.tsx`

**Observed Behavior:**
- Caret visual position desynchronizes from actual character position after 1-2 lines
- Appears "offset," making it difficult to track typing location
- Only affects "Line (smooth)" caret style (other styles work correctly)

**Associated Symptom:**
- React Hydration Error sometimes observed after hard refresh (Ctrl+Shift+R)
- Suggests state mismatch between server and client render

**Recommendation:**
- Fix if straightforward (alignment calculation issue)
- Or remove feature if too complex (nice-to-have, not critical)

**Impact:** Low (users can switch to other caret styles)

---

## 9. Collaboration Protocol

### Command Patterns Claude Uses:

**File Operations:**
```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file
code ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file
```

**Testing:**
```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo
npm run dev
```

**Database:**
```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest
sqlite3 speedtyper-local.db "SQL_QUERY"
```

### Key Principles:
1. ✅ **Always use full absolute paths** from home directory
2. ✅ **Provide full code blocks** to copy-paste (not diffs)
3. ✅ **Only upload specific files** when Claude asks
4. ✅ **Terminal-based workflow** (cat, grep, code, npm)
5. ✅ **Never guess** - Always request files explicitly

---

## 10. Version History & Rollback Points

| Version | Status    | Features                              | Rollback Command         |
|---------|-----------|---------------------------------------|--------------------------|
| v1.0.0  | ✅ Stable | Initial fork transformation           | `git checkout v1.0.0`    |
| v1.1.0  | ✅ Stable | SQLite + local imports                | `git checkout v1.1.0`    |
| v1.2.0  | ✅ Stable | Configurable filters + bug fixes      | `git checkout v1.2.0`    |
| v1.3.0  | 🟡 Active | Error handling + keyboard shortcuts   | `git checkout v1.3.0`    |
| v1.4.0  | 📅 Planned | Stable identity + dashboard           | -                        |
| v1.5.0  | 📅 Planned | Character skipping                    | -                        |
| v1.5.1  | 📅 Planned | AST-based skipping                    | -                        |
| v1.6.0  | 📅 Planned | Syntax highlighting (optional)        | -                        |

**Before Each Release:**
- Complete smoke test checklist
- Test rollback to previous version
- Create git tag
- Update CHANGELOG.md

---

## 11. Quick Reference: Parser Configuration

**File:** `packages/back-nest/parser.config.json`

**Key Settings:**
```json
{
  "filters": {
    "maxNodeLength": 800,      // Max snippet chars
    "minNodeLength": 100,      // Min snippet chars
    "maxNumLines": 25,         // Max lines per snippet
    "maxLineLength": 100       // Max chars per line
  },
  "parsing": {
    "removeComments": true,    // Strip comments during import
    "enableCommentSkipping": false  // Future: skip while typing
  }
}
```

**To Apply Changes:**
1. Edit `parser.config.json`
2. Restart backend: `npm run dev`
3. Re-import: `npm run reimport`

---

## 12. When To Request Full Documentation

This condensed reference is sufficient for 95% of sessions. Request full docs when:

**ARCHITECTURE.md** (~12,000 tokens):
- Doing deep architectural work (e.g., adding new WebSocket events)
- Modifying database schema
- Understanding complex data flows in detail

**FEATURES.md** (~4,000 tokens):
- Planning features beyond v1.6.0
- Reviewing full feature roadmap and prioritization
- Understanding feature dependencies in depth

**Feasibility Report** (~8,000 tokens):
- Reconsidering feature complexity (e.g., "Should we really do syntax highlighting?")
- Reviewing technical risk analysis
- Planning alternative implementation approaches

**Original Implementation Plan** (~6,000 tokens):
- Historical reference (how v1.0-v1.1 transformation happened)
- Learning from past decisions

---

**Next:** See session summary for current status and next steps.