# Speedtyper Local - Project Overview

**Version:** 1.1.0  
**Status:** Active Development  
**Last Updated:** October 30, 2025

---

## What Is This?

Speedtyper Local is a **solo typing practice tool** for developers, forked from [speedtyper.dev](https://speedtyper.dev). It transforms the original multiplayer web app into a **local-first, zero-friction practice environment** where you type your own code snippets.

### The Core Idea

Practice typing the code patterns you actually use in your daily work, with real-time WPM/accuracy feedback, using a professional-grade typing interface.

---

## Why This Fork Exists

### The Original Problem

The upstream `speedtyper.dev` is excellent but designed for a different use case:
- **Multiplayer focus**: Race against other developers online
- **Random snippets**: Practice code from popular GitHub repositories
- **Heavy dependencies**: Requires PostgreSQL, Docker, complex setup
- **Startup friction**: 10+ minutes from "clone" to "typing"

### What We Changed

**Speedtyper Local** optimizes for solo practice:
- ✅ **Solo experience**: No multiplayer coordination needed
- ✅ **Your code**: Practice Python/TypeScript/JavaScript files you write
- ✅ **One command**: `npm run dev` → typing in <90 seconds
- ✅ **SQLite database**: Single-file storage, no Docker
- ✅ **Guest-only auth**: No GitHub login required

---

## Key Features (v1.1.0)

### ✅ Implemented

1. **Local Snippet Import**
   - Place your code files in `snippets/python/`, `snippets/typescript/`, etc.
   - Run `npm run reimport` to parse and load them
   - Tree-sitter automatically extracts functions/classes (100-300 char chunks)

2. **One-Command Startup**
   - `npm run dev` starts both backend (NestJS) and frontend (Next.js)
   - Browser auto-opens to `localhost:3001`
   - Hot-reload enabled for both services

3. **Zero-Auth Experience**
   - Guest user created automatically on first connection
   - No GitHub OAuth prompts
   - Immediate practice access

4. **Clean Solo UI**
   - Removed multiplayer UI elements (leaderboard, battle matcher)
   - Removed broken/empty stats panels
   - Focus on typing interface only

5. **SQLite Storage**
   - Single `speedtyper-local.db` file
   - No PostgreSQL dependency
   - Easy backup/reset via file operations

### 🚧 Planned (See FEATURES.md)

- Configurable keyboard shortcuts
- User progress tracking dashboard
- Smart snippets (skip comments while typing)
- Syntax highlighting improvements

---

## Who Is This For?

### Primary Audience

**Backend/full-stack developers** who want to:
- Improve typing speed on real code patterns
- Practice unfamiliar language syntax
- Build muscle memory for common idioms
- Track personal progress over time

### Technical Prerequisites

- **Comfort with terminal**: You'll run commands like `npm run dev`
- **Basic file management**: Add code to `snippets/` folder
- **Optional**: Git for version control, VS Code for editing

### Not For

- Beginners learning to type (try TypeRacer or Monkeytype instead)
- Production deployment (this is a dev tool)
- Multiplayer competition (use upstream speedtyper.dev)

---

## Philosophy & Design Principles

### 1. **Friction Minimization**
Every extra step between "I want to practice" and "I'm typing" is a failure. The app should start instantly and stay out of your way.

### 2. **Code Quality Over Completeness**
We inherited an excellent codebase. When modifying it, we:
- Preserve existing quality (especially the typing engine)
- Stub rather than delete (multiplayer code commented, not removed)
- Test incrementally (small changes, verify after each)

### 3. **Local-First, Forever**
This tool should work:
- Offline (after initial setup)
- Without external services
- From a USB stick if needed

### 4. **Your Code, Your Rules**
You control:
- What code you practice (via `snippets/` folder)
- How snippets are filtered (parser config)
- What metrics matter (via settings)

---

## Project Status

### Current Milestone: v1.1.0

**Completed:**
- ✅ Core transformation from multiplayer → solo
- ✅ SQLite migration
- ✅ Local snippet import system
- ✅ One-command startup
- ✅ UI cleanup (removed multiplayer elements)
- ✅ Cross-platform compatibility (WSL + Windows)

**In Progress:**
- 🚧 Documentation overhaul (this file!)
- 🚧 Feature roadmap prioritization

**Next Up:**
- [ ] Configurable keyboard shortcuts
- [ ] Progress tracking dashboard
- [ ] Smart snippet features

### Known Limitations

1. **No mobile support**: Desktop/laptop only
2. **Limited language support**: Python, TypeScript, JavaScript, React (15 total parsers available)
3. **No cloud sync**: All data stored locally
4. **Single user**: No multi-user scenarios

### Stability

**Current state**: ✅ **Stable for daily use**

The core typing workflow is solid. You can:
- Import snippets reliably
- Type without crashes
- See accurate WPM/accuracy
- Complete races and view results

Edge cases and advanced features are still being refined.

---

## How It Works (High-Level)

### Architecture in 4 Steps

1. **You add code** → `snippets/python/my_script.py`
2. **Backend parses it** → Tree-sitter extracts functions/classes
3. **Database stores snippets** → SQLite `challenge` table
4. **Frontend displays them** → Type the code, see real-time metrics

### The Typing Loop

```
User clicks "Practice"
  ↓
Backend sends random snippet (from your code)
  ↓
Frontend renders code in <CodeArea>
  ↓
User types character
  ↓
Backend validates keystroke
  ↓
Backend recalculates WPM/accuracy
  ↓
Frontend updates display
  ↓
(Repeat until snippet complete)
  ↓
Backend saves result to database
  ↓
Frontend shows results page
```

### Key Technologies

- **NestJS**: Backend framework (TypeScript, WebSocket support)
- **Next.js**: Frontend framework (React, server-side rendering)
- **Socket.IO**: Real-time communication (typing events, progress updates)
- **Tree-sitter**: Code parsing (AST-based snippet extraction)
- **TypeORM**: Database ORM (SQLite dialect)
- **Zustand**: Frontend state management

---

## Quick Start (For New Users)

If you're reading this for the first time:

1. **Clone the repo**
   ```bash
   git clone <your-fork-url> speedtyper-local
   cd speedtyper-local
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your code**
   ```bash
   # Place files in snippets/ folder
   cp ~/my-project/*.py snippets/python/
   ```

4. **Import snippets**
   ```bash
   npm run reimport
   ```

5. **Start typing**
   ```bash
   npm run dev
   # Browser opens automatically → http://localhost:3001
   ```

See `README-LOCAL.md` for detailed setup instructions.

---

## Project Structure

```
speedtyper-solo/
├── packages/
│   ├── back-nest/          # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── races/      # Core typing logic
│   │   │   ├── challenges/ # Snippet management
│   │   │   └── ...
│   │   └── speedtyper-local.db
│   │
│   └── webapp-next/        # Frontend (Next.js)
│       ├── modules/play2/  # Typing UI
│       └── ...
│
├── snippets/               # Your code goes here
│   ├── python/
│   ├── typescript/
│   └── javascript/
│
├── docs/                   # Documentation
│   ├── PROJECT_OVERVIEW.md (this file)
│   ├── ARCHITECTURE.md
│   └── FEATURES.md
│
└── README-LOCAL.md         # User quick-start guide
```

---

## Getting Help

### Documentation Priority

1. **Quick start?** → `README-LOCAL.md`
2. **How it works?** → `ARCHITECTURE.md`
3. **What's next?** → `FEATURES.md`
4. **Context/philosophy?** → This file

### Troubleshooting Common Issues

**App won't start:**
- Check Node.js version (requires v16+)
- Run `npm install` in root directory
- Check for port conflicts (1337, 3001)

**No snippets appear:**
- Verify files exist in `snippets/` folder
- Run `npm run reimport`
- Check database: `sqlite3 packages/back-nest/speedtyper-local.db "SELECT COUNT(*) FROM challenge;"`

**Typing feels broken:**
- Refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Restart backend: `npm run dev`

---

## Contributing

This is a personal fork optimized for solo use. If you want to:

- **Report bugs**: Open an issue with reproduction steps
- **Suggest features**: See `FEATURES.md` for roadmap, propose additions
- **Submit code**: PRs welcome, but please discuss first (feature alignment)

### Development Workflow

1. Make changes in a feature branch
2. Test with `npm run dev` (verify typing works)
3. Commit with descriptive messages
4. Open PR with explanation

---

## Relationship to Upstream

This fork **intentionally diverges** from `speedtyper.dev`:

- **No upstream sync planned**: We've removed core multiplayer features
- **Different goals**: Upstream = competition, Local = practice
- **Credit preserved**: Original authors acknowledged, license maintained

If you want multiplayer racing, use the [original project](https://github.com/codicocodes/speedtyper.dev).

---

## License

Same as upstream: [Check LICENSE file]

Original project by [@codicocodes](https://github.com/codicocodes)

---

**Next:** Read `ARCHITECTURE.md` for technical deep-dive, or `FEATURES.md` for roadmap.