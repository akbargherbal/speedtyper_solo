# 🚀 Speedtyper Solo - Local Code Practice

A streamlined, solo-focused fork of speedtyper.dev for practicing typing with your own code snippets.

## ✨ What's Different?

- **⚡ One-command startup** - No Docker, no complex setup
- **📁 Your own code** - Practice with your Python/TypeScript/JavaScript files
- **🎯 Solo focus** - No multiplayer, no auth, just practice
- **💾 SQLite database** - Single file, no PostgreSQL needed
- **🔄 Auto guest users** - Start typing immediately, no login required

---

## 🎯 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url> speedtyper-solo
cd speedtyper-solo
npm install
```

### 2. Add Your Code Snippets

Place your code files in the `snippets/` folder, organized by language:

```bash
mkdir -p snippets/python snippets/typescript snippets/javascript
cp ~/your-project/*.py snippets/python/
cp ~/your-project/*.ts snippets/typescript/
```

### 3. Start the App

```bash
npm run dev
```

The app will:

- Start the backend on `http://localhost:1337`
- Start the frontend on `http://localhost:3001`
- Auto-open your browser
- **You can start typing immediately!**

---

## 📖 Usage Guide

### Adding More Snippets

1. Add files to `snippets/<language>/`
2. Run the import command:
   ```bash
   cd packages/back-nest
   npm run command import-local-snippets
   ```
3. Refresh your browser (or press Tab in the app)

### Supported Languages

The following languages are supported out of the box:

- Python (`.py`)
- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- And 12+ more via tree-sitter

### How Snippet Selection Works

The backend uses **tree-sitter** to intelligently extract:

- Functions (100-300 characters)
- Classes and methods
- Code blocks that fit typing practice criteria

Not all code gets imported - the parser filters for:

- ✅ Appropriate length (not too short/long)
- ✅ Reasonable line count (max 11 lines)
- ✅ Good line length (max 55 chars/line)

---

## 🔧 Troubleshooting

### Backend won't start?

Check the `.env` file in `packages/back-nest/`:

```bash
cat packages/back-nest/.env
```

Should contain:

```
DATABASE_PRIVATE_URL=sqlite://./speedtyper-local.db
SESSION_SECRET=local-dev-secret-key-change-me-123
NODE_ENV=development
PORT=1337
```

### No snippets appearing?

1. Check if files exist: `ls snippets/python/`
2. Run import: `cd packages/back-nest && npm run command import-local-snippets`
3. Check database: `sqlite3 packages/back-nest/speedtyper-local.db "SELECT COUNT(*) FROM challenge;"`
4. Refresh browser or press Tab in the app

### Want to reset everything?

```bash
rm packages/back-nest/speedtyper-local.db
npm run dev
# Database will be recreated automatically
```

### Port conflicts?

If port 1337 or 3001 are in use, edit:

- Backend: `packages/back-nest/.env` (change `PORT=1337`)
- Frontend: `packages/webapp-next/package.json` (change `-p 3001`)

---

## 🏗️ Project Structure

```
speedtyper-solo/
├── snippets/              # Your code goes here!
│   ├── python/
│   ├── typescript/
│   └── javascript/
├── packages/
│   ├── back-nest/        # NestJS backend
│   │   ├── speedtyper-local.db  # SQLite database
│   │   └── src/
│   └── webapp-next/      # Next.js frontend
│       └── modules/play2/  # Main typing UI
└── package.json          # Root orchestration
```

---

## 🎨 Features

### What Works

- ✅ Real-time WPM calculation
- ✅ Accuracy tracking
- ✅ Syntax highlighting
- ✅ Smooth auto-scrolling
- ✅ Results history
- ✅ Multiple languages
- ✅ Keyboard shortcuts (Tab=refresh, Enter=start)

### What's Removed

- ❌ GitHub authentication
- ❌ Multiplayer races
- ❌ Social features
- ❌ Global leaderboards

---

## 🛠️ Development

### Running Backend Only

```bash
cd packages/back-nest
npm run start:dev
```

### Running Frontend Only

```bash
cd packages/webapp-next
npm run dev
```

### Checking Database

```bash
cd packages/back-nest
sqlite3 speedtyper-local.db
sqlite> .tables
sqlite> SELECT COUNT(*) FROM challenge;
sqlite> .quit
```

### Importing Snippets Manually

```bash
cd packages/back-nest
npm run command import-local-snippets
```

---

## 📝 Tips for Best Practice Experience

1. **Use real project code** - Practice typing the code you actually write
2. **Mix languages** - Add Python, TypeScript, and JavaScript for variety
3. **Quality over quantity** - 20-30 good snippets is better than 200 random ones
4. **Regular updates** - Reimport after adding new project files
5. **Track progress** - Watch your WPM improve over time!

---

## 🐛 Known Issues

- Console warnings about Zustand deprecation (non-breaking, cosmetic only)
- Some React warnings in dev mode (pre-existing, doesn't affect functionality)

---

## 🤝 Contributing

This is a personal fork optimized for solo practice. Feel free to fork and customize further!

Original project: [speedtyper.dev](https://github.com/codicocodes/speedtyper.dev)

---

## 📄 License

Same as original project (check LICENSE file)

---

## 🎯 Success Metrics

After using this for a week, you should see:

- ⬆️ Increased typing speed on real code
- ⬆️ Fewer syntax errors in daily coding
- ⬆️ Better muscle memory for language-specific patterns
- ⬆️ Improved confidence with complex syntax

**Happy typing! 🚀**
