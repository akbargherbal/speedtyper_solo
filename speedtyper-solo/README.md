# SpeedTyper Solo

> A local-first typing practice tool for developers. Type your own code, track your progress, improve your speed.

**Version:** 1.4.0  
**Status:** ✅ Stable for daily use

---

## Quick Start

### 1. Install

```bash
git clone <your-repo-url> speedtyper-solo
cd speedtyper-solo
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

# Check your progress
# Navigate to Dashboard in the navbar

# Evening: Stop app
# Ctrl+C in terminal
```

### Windows Convenience (Optional)

If on Windows, create `C:\Users\<YourName>\scripts\speedtyper.bat`:

```batch
@echo off
wsl bash -c "cd ~/path/to/speedtyper-solo && npm run dev"
```

Add `C:\Users\<YourName>\scripts\` to your PATH.

Now run from any terminal:

```cmd
speedtyper
```

---

## Commands Reference

| Command            | Purpose                          | When to Use                |
| ------------------ | -------------------------------- | -------------------------- |
| `npm run dev`      | Start app (backend + frontend)   | Every session              |
| `npm run reimport` | Re-import snippets               | After adding/changing code |
| `npm run reset`    | Reset database (delete all data) | When starting fresh        |

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

### ✅ Current (v1.4.0)

**Core Features:**

- **Local snippets**: Practice your own code
- **Tree-sitter parsing**: Smart extraction of functions/classes
- **Real-time metrics**: WPM, accuracy, completion time
- **Language selection**: Filter by Python, TypeScript, JavaScript, etc.
- **SQLite storage**: Single-file database, easy backup
- **Auto-browser open**: Launches automatically on startup

**Progress Tracking:**

- **Progress dashboard**: View your typing statistics at `/dashboard`
  - Average WPM and accuracy across all races
  - Performance trends over time (visual charts)
  - Language-specific breakdown (races, WPM, accuracy per language)
  - Recent race history with quick access to results
- **Stable user identity**: All your results tracked under one persistent user
  - No more ephemeral guest users
  - Consistent data across sessions

**User Experience:**

- **Keyboard shortcuts**: Tab (next snippet), Enter (continue), Alt+←/→ (change language), Esc (close modals)
- **Keyboard shortcuts reference**: Click keyboard icon in navbar to view all shortcuts
- **Connection indicator**: Visual WebSocket status in navbar
- **Debug Mode**: Lock focus for screenshots and testing (toggle in settings)
- **Enhanced error handling**: Clear feedback when no snippets available
- **Clean UI**: Solo-focused, professional appearance
- **Settings modal**: Clean, concise settings with actual toggles

**Customization:**

- **Configurable filters**: Customize snippet length, complexity via `parser.config.json`
- **Debug Mode toggle**: Control focus lock behavior
- **Language cycling**: Quickly switch between languages with Alt+Arrow keys

### 🚧 Coming Soon (v1.5.0+)

- **Smart skipping**: Automatically skip over comments and whitespace
- **Advanced analytics**: More detailed performance insights
- **Custom snippet collections**: Group snippets by project or topic

---

## Keyboard Shortcuts

**New in v1.4.0!** Click the ⌨️ keyboard icon in the navbar to view all shortcuts.

### Typing

- **Tab** - Next snippet (new code to type)
- **Enter** - Continue (from results page)

### Language Selection

- **Alt + ←** - Previous language
- **Alt + →** - Next language

### Interface

- **Esc** - Close any open modal
- **Click anywhere** - Focus typing area

---

## Dashboard

**New in v1.4.0!** Access your progress dashboard by clicking the 📊 Dashboard icon in the navbar or navigating to `/dashboard`.

**What you'll see:**

- **Stats Cards**: Average WPM, accuracy, total races, favorite language
- **Trends Chart**: WPM and accuracy over time (last 30 days)
- **Language Breakdown**: Performance statistics by programming language
- **Recent History**: Your most recent typing races (clickable to view details)

**Use cases:**

- Track improvement over time
- Identify which languages need more practice
- Review past performances
- Set personal goals (e.g., reach 60 WPM average)

---

## Settings

Click ⚙️ (gear icon) in top-right navbar:

**Available Settings:**

- **Debug Mode**: Lock focus for screenshots and testing (keeps typing area focused even when clicking outside)
- **Language**: Select programming language on home page or use Alt+←/→ keys
- **Syntax Highlighting**: Currently disabled for optimal cursor behavior

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

**Problem:** Practice page shows "No challenges available"

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
5. Try different language: Use Alt+←/→ to cycle through available languages

### Typing Input Not Working

**Problem:** Can't type in the code area

**Solutions:**

1. Click on the code area (must be focused)
2. Refresh page (Ctrl+Shift+R)
3. Check browser console for errors (F12 → Console)
4. Restart app: Ctrl+C, then `npm run dev`
5. If Debug Mode is on, try toggling it off in settings

### WebSocket Disconnects

**Problem:** "Reconnecting..." or red indicator appears in navbar

**Solutions:**

1. Check backend is running (terminal should show logs)
2. Verify port 1337 is accessible: `curl http://localhost:1337`
3. Restart app
4. Check for firewall/antivirus blocking localhost connections

### Import Fails with Parser Error

**Problem:** `npm run reimport` shows parsing errors

**Cause:** Code files have syntax errors or unusual formatting

**Solutions:**

1. Verify code compiles/runs in its original environment
2. Check file encoding (UTF-8 required)
3. Simplify complex files (tree-sitter has limits)
4. Check error messages for specific files, fix or remove them

### Dashboard Shows No Data

**Problem:** Dashboard displays "No races completed yet"

**Solutions:**

1. Complete at least one typing race first
2. Refresh the dashboard page
3. Check database has results:
   ```bash
   cd packages/back-nest
   sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM result;"
   ```

### Modal Won't Close

**Problem:** Settings or other modal stuck open

**Solutions:**

1. Press **Esc** key (universal close shortcut)
2. Click outside the modal
3. Refresh page if modal is unresponsive

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
    ↓
View results page or dashboard
```

### The Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js (React framework)
- **Database**: SQLite (single file)
- **Parsing**: Tree-sitter (AST-based code analysis)
- **Communication**: Socket.IO (WebSockets)
- **State**: Zustand (frontend state management)
- **Charts**: Recharts (dashboard visualizations)
- **Styling**: Tailwind CSS (utility-first styling)

---

## Customization

### Snippet Quality Filters

**Filters are configurable via `parser.config.json`!**

**Location:** `packages/back-nest/parser.config.json`

**Default configuration:**

```json
{
  "filters": {
    "maxNodeLength": 800,
    "minNodeLength": 100,
    "maxNumLines": 25,
    "maxLineLength": 100
  },
  "parsing": {
    "removeComments": true,
    "enableCommentSkipping": false
  }
}
```

**Filter parameters explained:**

| Parameter               | Default | Purpose                                                          |
| ----------------------- | ------- | ---------------------------------------------------------------- |
| `maxNodeLength`         | 800     | Maximum characters in a snippet (prevents overwhelming snippets) |
| `minNodeLength`         | 100     | Minimum characters (filters out trivial one-liners)              |
| `maxNumLines`           | 25      | Maximum lines per snippet (keeps it on-screen)                   |
| `maxLineLength`         | 100     | Maximum characters per line (prevents horizontal scrolling)      |
| `removeComments`        | true    | Strip comments during import (focus on code)                     |
| `enableCommentSkipping` | false   | Future: Make comments visible but not typable                    |

**To customize:**

1. Edit `packages/back-nest/parser.config.json`
2. Modify values (example: stricter filters)

```json
{
  "filters": {
    "maxNodeLength": 500,
    "minNodeLength": 150,
    "maxNumLines": 15,
    "maxLineLength": 80
  }
}
```

3. Re-import snippets:

```bash
npm run reimport
```

4. Shorter, more focused snippets will be imported

**Validation:**

- Config is validated on load
- Invalid values (e.g., `min > max`) trigger warning and use defaults
- Missing config file uses defaults automatically

**Examples:**

**For longer, more complex snippets:**

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

**For shorter, beginner-friendly snippets:**

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

**Toggle comment removal:**

```json
{
  "parsing": {
    "removeComments": false
  }
}
```

(Keep comments in snippets if you want to practice typing them)

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

**A:** Yes, if tree-sitter has a parser for it. Check documentation for adding new languages.

### Q: How is WPM calculated?

**A:** Server-side via `progress.service.ts`:

```
WPM = (characters typed / 5) / (time in minutes)
```

Standard typing metric (5 chars = 1 word).

### Q: Can I export my results?

**A:** Not yet (planned for future release). Current workaround:

```bash
sqlite3 packages/back-nest/speedtyper-local.db ".dump result" > my-results.sql
```

### Q: How do I reset my progress?

**A:** To start fresh with a clean database:

```bash
npm run reset
npm run reimport
```

This will delete all race results and statistics. Your code snippets will be re-imported.

### Q: What are all the keyboard shortcuts?

**A:** Click the ⌨️ keyboard icon in the navbar to see the complete list, or press Esc to close any modal.

### Q: What is Debug Mode?

**A:** A setting that locks focus to the typing area, useful for taking screenshots or testing. The typing area stays focused even when you click outside it. Toggle it in Settings (⚙️ icon).

---

## Project Status

### Current Milestone

**v1.4.0** - UI Cleanup and Polish Complete ✅

**What works:**

- ✅ Importing snippets
- ✅ Typing with real-time feedback
- ✅ Viewing results
- ✅ Language selection with keyboard shortcuts
- ✅ Settings persistence
- ✅ Progress tracking dashboard
- ✅ Stable user identity
- ✅ Performance analytics
- ✅ Keyboard shortcuts documentation
- ✅ Enhanced error handling
- ✅ Professional UI with no multiplayer remnants

**Next milestone:** v1.5.0 (smart skipping, advanced features)

### Stability

This tool is **stable and ready for daily use**. The core typing workflow is solid, progress tracking provides meaningful insights, and the UI is polished and professional.

---

## Version History

### v1.4.0 (November 2, 2025) - UI Cleanup and Polish

**UI/UX Improvements:**

- ✅ **InfoModal**: Keyboard shortcuts reference accessible from navbar
- ✅ **Global ESC handler**: Close any modal with Escape key
- ✅ **Debug Mode toggle**: Added to Settings modal for user control
- ✅ **Settings improvements**: Better typography, concise content
- ✅ **Branding update**: "SpeedTyper Solo" identity
- ✅ **Navbar cleanup**: Removed multiplayer elements (user count, public races)

**Bug Fixes:**

- ✅ Fixed avatar rendering crash (null avatarUrl handling)
- ✅ Removed broken Settings toggles (syntax highlighting, public races)

**Foundation Features:**

- ✅ **Stable user identity**: All results consolidated under single persistent user
- ✅ **Progress dashboard**: WPM trends, accuracy stats, language breakdown
- ✅ **Recent race history**: Quick access to past performances
- ✅ **Data migration**: Tool to consolidate old guest users

### v1.3.x (October-November 2025) - Stability & Polish

- ✅ **Backend crash resilience**: Graceful error handling with user feedback
- ✅ **Enhanced UI feedback**: Connection status, empty state messages
- ✅ **Keyboard shortcuts**: Alt+Arrows (language), Tab (next snippet), Enter (continue)
- ✅ **Bug fixes**: Results page race condition, default language handling

### v1.2.0 (October 2025) - Configuration & Metadata

- ✅ **Configurable filters**: `parser.config.json` for snippet quality
- ✅ **Snippet metadata**: Display source file path
- ✅ **Critical bug fixes**: Results page, default language

### v1.1.0 (October 2025) - Core Transformation

- ✅ **SQLite migration**: Replaced PostgreSQL
- ✅ **One-command startup**: `npm run dev`
- ✅ **Local snippet import**: Practice your own code
- ✅ **Guest-only auth**: Removed GitHub OAuth
- ✅ **Solo mode**: Stubbed multiplayer, preserved typing engine

---

## Getting Help

### Documentation

1. **Quick start?** → This file (README.md)
2. **Dashboard usage?** → Navigate to `/dashboard` in the app
3. **Keyboard shortcuts?** → Click ⌨️ icon in navbar
4. **Customizing filters?** → See "Customization" section above

### Reporting Issues

1. Check troubleshooting section above
2. Verify you're on the latest version: v1.4.0
3. Include:
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

**This fork:** Transformed for local, solo practice

**License:** [Same as upstream - see LICENSE file]

---

## What's Next?

Now that you're set up:

1. **Add your code** to `snippets/`
2. **Run `npm run reimport`**
3. **Start typing** with `npm run dev`
4. **Learn shortcuts** - Click ⌨️ icon in navbar
5. **Track progress** at `/dashboard`
6. **Set goals** (e.g., reach 60 WPM, 95% accuracy)
7. **Practice regularly** to see improvement over time

**Happy typing! 🚀**
