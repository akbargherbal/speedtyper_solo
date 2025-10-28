# Speedtyper Solo - Local Development Guide

**A personal typing practice tool for coding snippets**

This is a simplified fork of [speedtyper.dev](https://github.com/codicocodes/speedtyper.dev) optimized for solo practice with your own code snippets.

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url> speedtyper-solo
cd speedtyper-solo

# 2. Install dependencies
npm install

# 3. Add your code snippets
mkdir -p snippets/python snippets/typescript snippets/javascript
# Copy your .py, .ts, .tsx, .js files into the respective folders

# 4. Start the application
npm run dev
```

**That's it!** Your browser will open to `http://localhost:3001` and you can start practicing immediately.

---

## Project Structure

```
speedtyper-solo/
├── packages/
│   ├── back-nest/          # NestJS backend (WebSocket + REST API)
│   │   ├── speedtyper-local.db  # SQLite database (auto-created)
│   │   └── src/
│   └── webapp-next/        # Next.js frontend
├── snippets/               # YOUR CODE GOES HERE
│   ├── python/
│   ├── typescript/
│   ├── javascript/
│   └── react/
└── package.json            # Root workspace config
```

---

## Usage Guide

### Adding Snippets

1. **Place your code files in `snippets/` organized by language:**
   ```
   snippets/
   ├── python/
   │   ├── my_script.py
   │   └── data_processor.py
   ├── typescript/
   │   ├── utils.ts
   │   └── hooks.ts
   └── javascript/
       └── helpers.js
   ```

2. **Reimport snippets:**
   ```bash
   npm run reimport
   ```

3. **Refresh your browser** (or press Tab key in the app)

### Supported Languages

The app supports **15+ languages** via tree-sitter parsing:
- Python, TypeScript, JavaScript, TSX/JSX
- Go, Rust, C, C++, C#, Java
- Ruby, PHP, Bash, and more

### How It Works

- The backend scans your `snippets/` folder
- Tree-sitter parses each file and extracts functions/classes
- Snippets are filtered by quality (100-300 chars, max 11 lines, max 55 chars/line)
- You practice typing them with real-time WPM/accuracy tracking

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run backend` | Start only the backend (port 1337) |
| `npm run frontend` | Start only the frontend (port 3001) |
| `npm run reimport` | Reimport snippets from `snippets/` folder |
| `npm run reset-db` | Delete database (fresh start) |

---

## Configuration

### Backend Environment Variables

Located at `packages/back-nest/.env`:

```bash
DATABASE_PRIVATE_URL=sqlite://./speedtyper-local.db
SESSION_SECRET=local-dev-secret-key-change-me-123
NODE_ENV=development
PORT=1337
```

**No changes needed for local development!** These defaults work out of the box.

### Frontend Configuration

Located at `packages/webapp-next/next.config.js`:

```javascript
env: {
  NEXT_PUBLIC_BACKEND_URL: 'http://localhost:1337',
}
```

---

## Troubleshooting

### Backend won't start

**Symptom:** `npm run dev` fails with backend errors

**Solutions:**
1. Check if port 1337 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :1337
   
   # Linux/Mac
   lsof -i :1337
   ```

2. Verify `.env` file exists in `packages/back-nest/`

3. Try resetting the database:
   ```bash
   npm run reset-db
   npm run dev
   ```

### No snippets appearing

**Symptom:** The app loads but shows no typing challenges

**Solutions:**
1. Check if `snippets/` folder has files:
   ```bash
   ls -R snippets/
   ```

2. Manually reimport:
   ```bash
   npm run reimport
   ```

3. Check snippet quality:
   - Files should have extractable functions/classes
   - Avoid very short files (<100 chars)
   - Avoid very long files (>500 lines)

4. Check the database:
   ```bash
   cd packages/back-nest
   sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM challenge WHERE id LIKE 'local-%';"
   ```

### Frontend won't connect to backend

**Symptom:** UI loads but shows "Disconnected" or WebSocket errors

**Solutions:**
1. Verify backend is running (check terminal output)
2. Check browser console for errors
3. Ensure backend is on port 1337:
   ```bash
   curl http://localhost:1337/api/results/leaderboard
   ```

### TypeScript errors after modifications

**Symptom:** Red squiggly lines in VS Code or compilation errors

**Solutions:**
1. Rebuild TypeScript:
   ```bash
   cd packages/back-nest && npm run build
   cd ../webapp-next && npm run build
   ```

2. Clear cache:
   ```bash
   rm -rf packages/*/node_modules/.cache
   ```

### Database corruption

**Symptom:** Strange errors or incomplete data

**Solution:**
```bash
npm run reset-db
npm run dev
npm run reimport
```

---

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- **Backend:** Saves to `.ts` files automatically restart the server
- **Frontend:** Saves to `.tsx` files automatically refresh the browser

### Inspecting the Database

```bash
cd packages/back-nest
sqlite3 speedtyper-local.db

# Useful queries:
sqlite> .tables
sqlite> SELECT COUNT(*) FROM challenge;
sqlite> SELECT code, language FROM challenge LIMIT 5;
sqlite> .quit
```

### Checking Logs

- **Backend logs:** Check the terminal running `npm run dev` (blue text)
- **Frontend logs:** Check browser DevTools Console (F12)

### Adding Support for New Languages

1. Check if tree-sitter parser exists: [Tree-sitter parsers](https://tree-sitter.github.io/tree-sitter/)
2. Install parser: `npm install tree-sitter-<language>`
3. Add language mapping in `packages/back-nest/src/challenges/services/ts-parser.factory.ts`

---

## Architecture Overview

### Authentication
- **No login required!** Guest users are created automatically via session middleware
- Each browser session gets a random username (e.g., "FancyPython", "StaleTurtle")
- Sessions expire after 7 days

### How Typing Works
1. Frontend connects to backend via WebSocket (Socket.IO)
2. User selects a snippet → Backend sends challenge data
3. User types → Frontend emits keystrokes to backend
4. Backend validates each keystroke and calculates WPM/accuracy
5. On completion → Results are saved and displayed

### Database Schema
- `challenge` - Parsed code snippets
- `results` - Completed typing sessions
- `sessions` - User sessions (guest users)
- `project` - Metadata about snippet sources
- Other tables (unused in solo mode)

---

## Known Issues

### Non-Critical Warnings

You may see these in the console:
- **Zustand deprecation warnings** - Cosmetic, library version mismatch
- **React ref warnings** - Pre-existing, non-breaking
- **WebSocket reconnection messages** - Normal during development restarts

### Limitations

- **No persistent user accounts** - Results are session-only
- **No leaderboards** - Solo mode only
- **No multiplayer** - Race features disabled
- **Session data expires** - 7-day limit

---

## Maintenance

### Updating Dependencies

```bash
# Backend
cd packages/back-nest
npm update
npm audit fix

# Frontend
cd packages/webapp-next
npm update
npm audit fix
```

**Always test after updates:**
```bash
npm run dev
# Go through full typing workflow
```

### Backing Up Your Data

```bash
# Backup snippets
cp -r snippets/ snippets-backup/

# Backup database (optional, recreatable)
cp packages/back-nest/speedtyper-local.db speedtyper-backup.db
```

### Fresh Install

```bash
rm -rf node_modules packages/*/node_modules
npm install
npm run dev
```

---

## Contributing

This is a personal fork for solo practice. If you want to contribute:
1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request with clear description

**Original Project:** [speedtyper.dev](https://github.com/codicocodes/speedtyper.dev) by @codicocodes

---

## License

MIT License (same as original project)

---

## Support

**For issues with this fork:**
- Check the Troubleshooting section above
- Review the original [speedtyper.dev documentation](https://github.com/codicocodes/speedtyper.dev)
- Open an issue with detailed error messages and steps to reproduce

**For issues with the original project:**
- Visit the [original repository](https://github.com/codicocodes/speedtyper.dev)

---

**Happy Typing! 🚀**
