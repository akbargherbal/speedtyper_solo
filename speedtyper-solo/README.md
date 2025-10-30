# Speedtyper Local

> A local-first typing practice tool for developers. Type your own code, track your progress, improve your speed.

**Version:** 1.1.0  
**Status:** ✅ Stable for daily use

---

## Quick Start

### 1. Install

```bash
git clone <your-repo-url> speedtyper-local
cd speedtyper-local
npm install
```

### 2. Add Your Code

Place code files in the `snippets/` folder organized by language:

```bash
snippets/
├── python/
│   ├── my_script.py
│   └── utils.py
├── typescript/
│   ├── component.tsx
│   └── types.ts
└── javascript/
    └── helpers.js
```

**Supported languages:** Python, TypeScript, JavaScript, React (TSX/JSX), Go, Rust, Java, C, C++, Ruby, PHP, Swift, Kotlin, Scala, Bash

### 3. Import Snippets

```bash
npm run reimport
```

This command:
- Scans `snippets/` recursively
- Parses code with tree-sitter (extracts functions/classes)
- Filters for quality (100-300 characters, readable)
- Saves to local SQLite database

**Expected output:**
```
Scanning snippets/...
Found 15 files
Processing python/my_script.py...
  - Extracted 8 function snippets
  - Extracted 3 class snippets
...
Done. Imported 87 snippets.
```

### 4. Start Typing

```bash
npm run dev
```

**What happens:**
- Backend starts (NestJS on port 1337)
- Frontend starts (Next.js on port 3001)
- Browser opens automatically → `http://localhost:3001`
- Click "Practice" → Start typing!

**Time from command to typing:** ~60 seconds

---

## Daily Usage

### Typical Workflow

```bash
# Morning: Start app
npm run dev

# Practice 5-10 snippets
# (App stays running, hot-reloads code changes)

# Afternoon: Add more code
cp ~/my-project/new_file.py snippets/python/

# Re-import (in new terminal, app keeps running)
npm run reimport

# Continue practicing new snippets
# (Refresh browser to see new code)

# Evening: Stop app
# Ctrl+C in terminal
```

### Windows Convenience (Optional)

If on Windows, create `C:\Users\<YourName>\scripts\speedtyper.bat`:

```batch
@echo off
wsl bash -c "cd ~/path/to/speedtyper-local && npm run dev"
```

Add `C:\Users\<YourName>\scripts\` to your PATH.

Now run from any terminal:
```cmd
speedtyper
```

---

## Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev` | Start app (backend + frontend) | Every session |
| `npm run reimport` | Re-import snippets | After adding/changing code |
| `npm run reset` | Reset database (delete all data) | When starting fresh |

### Advanced Commands

```bash
# Backend only (for debugging)
cd packages/back-nest
npm run start:dev

# Frontend only
cd packages/webapp-next
npm run dev

# Inspect database
cd packages/back-nest
sqlite3 speedtyper-local.db
sqlite> SELECT COUNT(*) FROM challenge;
sqlite> .exit
```

---

## Features

### ✅ Current (v1.1.0)

- **Local snippets**: Practice your own code
- **Tree-sitter parsing**: Smart extraction of functions/classes
- **Real-time metrics**: WPM, accuracy, completion time
- **Language selection**: Filter by Python, TypeScript, JavaScript, etc.
- **Smooth caret**: Toggle between block/smooth cursor
- **Syntax highlighting**: Basic highlighting (toggle in settings)
- **Clean UI**: Solo-focused, no multiplayer clutter
- **SQLite storage**: Single-file database, easy backup
- **Auto-browser open**: Launches automatically on startup

### 🚧 Coming Soon (v1.2.0)

- **Keyboard shortcuts**: Ctrl+L (language), Ctrl+R (refresh), Enter (next)
- **Connection indicator**: See when backend disconnects
- **Snippet metadata**: Know which file you're typing
- **Better error messages**: Helpful feedback when things break

### 🔮 Planned (v1.3.0+)

- **Progress dashboard**: WPM trends, accuracy over time
- **Smart snippets**: Skip comments, focus on logic
- **Snippet collections**: Organize by topic
- **Export data**: Backup your results

See [`docs/FEATURES.md`](docs/FEATURES.md) for full roadmap.

---

## Settings

Click ⚙️ (gear icon) in top-right corner:

- **Language**: Filter snippets by programming language
- **Smooth Caret**: Toggle cursor style (block vs smooth)
- **Syntax Highlighting**: Enable/disable code colors

Settings persist across sessions (localStorage).

---

## Troubleshooting

### App Won't Start

**Problem:** `npm run dev` fails

**Solutions:**
1. Check Node.js version: `node --version` (requires v16+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check ports: Kill processes on 1337 and 3001
   ```bash
   # Linux/Mac
   lsof -ti:1337 | xargs kill
   lsof -ti:3001 | xargs kill
   
   # Windows
   netstat -ano | findstr :1337
   taskkill /PID <PID> /F
   ```

### No Snippets Appear

**Problem:** Practice page is empty or shows "No challenges"

**Solutions:**
1. Verify files exist: `ls snippets/python/`
2. Run import: `npm run reimport`
3. Check database:
   ```bash
   cd packages/back-nest
   sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM challenge;"
   ```
   Should show number > 0
4. Check file syntax: Tree-sitter may skip malformed code

### Typing Input Not Working

**Problem:** Can't type in the code area

**Solutions:**
1. Click on the code area (must be focused)
2. Refresh page (Ctrl+Shift+R)
3. Check browser console for errors (F12 → Console)
4. Restart app: Ctrl+C, then `npm run dev`

### WebSocket Disconnects

**Problem:** "Reconnecting..." message appears

**Solutions:**
1. Check backend is running (terminal should show logs)
2. Verify port 1337 is accessible: `curl http://localhost:1337`
3. Restart app

### Import Fails with Parser Error

**Problem:** `npm run reimport` shows parsing errors

**Cause:** Code files have syntax errors or unusual formatting

**Solutions:**
1. Verify code compiles/runs in its original environment
2. Check file encoding (UTF-8 required)
3. Simplify complex files (tree-sitter has limits)
4. Check error messages for specific files, fix or remove them

---

## How It Works

### The Pipeline

```
Your Code
    ↓
Tree-sitter Parser (extracts functions/classes)
    ↓
Quality Filter (100-300 chars, readable)
    ↓
SQLite Database (stores snippets)
    ↓
Backend (NestJS) serves random snippet
    ↓
Frontend (React) displays code
    ↓
You type
    ↓
WebSocket sends keystroke to backend
    ↓
Backend validates, calculates WPM/accuracy
    ↓
Frontend updates display
    ↓
(Repeat until complete)
    ↓
Results saved to database
```

### The Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js (React framework)
- **Database**: SQLite (single file)
- **Parsing**: Tree-sitter (AST-based code analysis)
- **Communication**: Socket.IO (WebSockets)
- **State**: Zustand (frontend state management)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for deep dive.

---

## Customization

### Snippet Quality Filters

Currently hardcoded in `packages/back-nest/src/challenges/services/parser.service.ts`:

```typescript
minCharCount: 100    // Minimum snippet length
maxCharCount: 300    // Maximum snippet length
maxLines: 11         // Max lines per snippet
maxLineLength: 55    // Max characters per line
```

**To modify** (advanced):
1. Edit `parser.service.ts`
2. Restart backend
3. Run `npm run reimport`

**Coming in v1.2.0:** `parser.config.json` for easier customization.

### Database Location

`packages/back-nest/speedtyper-local.db`

**To backup:**
```bash
cp packages/back-nest/speedtyper-local.db ~/backups/speedtyper-$(date +%Y%m%d).db
```

**To reset:**
```bash
npm run reset
# Or manually:
rm packages/back-nest/speedtyper-local.db
npm run dev  # Recreates empty schema
npm run reimport  # Re-import snippets
```

---

## FAQ

### Q: Can I use this offline?

**A:** Yes, after initial setup. All data is local.

### Q: Does it send data to any server?

**A:** No. Everything runs on your machine (localhost).

### Q: Can I practice specific files?

**A:** Not yet. Snippets are randomly selected. Future feature: collections.

### Q: Why SQLite instead of PostgreSQL?

**A:** Simpler setup, perfect for single-user local tool. No Docker needed.

### Q: Can I add more languages?

**A:** Yes, if tree-sitter has a parser for it. See [`docs/ARCHITECTURE.md#adding-a-new-language`](docs/ARCHITECTURE.md).

### Q: How is WPM calculated?

**A:** Server-side via `progress.service.ts`:
```
WPM = (characters typed / 5) / (time in minutes)
```
Standard typing metric (5 chars = 1 word).

### Q: Can I export my results?

**A:** Not yet (planned for v1.3.0). Current workaround:
```bash
sqlite3 packages/back-nest/speedtyper-local.db ".dump result" > my-results.sql
```

---

## Project Status

### Current Milestone

**v1.1.0** - Stable for daily use

**What works:**
- ✅ Importing snippets
- ✅ Typing with real-time feedback
- ✅ Viewing results
- ✅ Language selection
- ✅ Settings persistence

**Known limitations:**
- No progress tracking (results stored but not visualized)
- No keyboard shortcuts (mouse required for some actions)
- No snippet metadata (don't know which file you're typing)

**Next milestone:** v1.2.0 (keyboard shortcuts, better UX)

### Stability

This tool is **stable enough for daily use**. The core typing workflow is solid.

Edge cases and advanced features are still being refined.

---

## Getting Help

### Documentation

1. **Quick start?** → This file (README-LOCAL.md)
2. **How it works?** → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. **What's next?** → [`docs/FEATURES.md`](docs/FEATURES.md)
4. **Philosophy?** → [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md)

### Reporting Issues

1. Check troubleshooting section above
2. Search existing issues (if using Git)
3. Open new issue with:
   - What you tried to do
   - What happened
   - Error messages (console logs)
   - Steps to reproduce

---

## Contributing

This is a personal fork optimized for solo use.

**Contributions welcome** for:
- Bug fixes
- Documentation improvements
- Feature implementations (aligned with roadmap)

**Please discuss first** before major changes (open issue or PR draft).

---

## Credits

**Original project:** [speedtyper.dev](https://speedtyper.dev) by [@codicocodes](https://github.com/codicocodes)

**This fork:** Transformed for local, solo practice by [your username]

**License:** [Same as upstream - see LICENSE file]

---

## What's Next?

Now that you're set up:

1. **Add your code** to `snippets/`
2. **Run `npm run reimport`**
3. **Start typing** with `npm run dev`
4. **Check roadmap** in [`docs/FEATURES.md`](docs/FEATURES.md)
5. **Read architecture** if you want to modify code: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

**Happy typing! 🚀**