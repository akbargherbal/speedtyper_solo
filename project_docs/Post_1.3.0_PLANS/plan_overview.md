# Speedtyper Local: Implementation Roadmap

**Current Status:** v1.3.0 → Planning v1.4.0  
**Total Timeline:** 11-16 weeks  
**Philosophy:** Never break existing typing functionality

---

## Version Milestones

| Version | Focus                 | Duration | Risk | Rollback | Status |
| ------- | --------------------- | -------- | ---- | -------- | ------ |
| v1.4.0  | Foundation Layer      | 3-4 wks  | 🟢   | v1.3.0   | ⏳     |
| v1.5.0  | Smart Skip (Basic)    | 2-3 wks  | 🟡   | v1.4.0   | ⏳     |
| v1.5.1  | Smart Skip (Advanced) | 2-3 wks  | 🟡   | v1.5.0   | ⏳     |
| v1.6.0  | Visual Enhancement    | 4-6 wks  | 🔴   | v1.5.1   | ⏳     |

---

## What Each Version Delivers

### v1.4.0: Foundation Layer

**Deliverables:**

- Stable user identity (LocalUserService) - single user replaces ephemeral guests
- Progress dashboard - WPM trends, accuracy stats, language breakdown
- Data migration script - consolidates old guest users

**Critical for:** v1.5.0+ need consistent userId for skip preferences

### v1.5.0: Smart Skipping (Basic)

**Deliverables:**

- Skip range calculation (character-based: spaces)
- Backend skip config system (`skip-config.json`)
- Frontend cursor auto-advancement over skipped ranges

**Critical for:** v1.5.1 extends this with AST-based skipping

### v1.5.1: Smart Skipping (Advanced)

**Deliverables:**

- AST-based skip ranges (comments, docstrings)
- Tree-sitter integration for comment detection
- Merged character + AST skip ranges

**Critical for:** Full smart skipping feature complete

### v1.6.0: Visual Enhancement (OPTIONAL)

**Deliverables:**

- Pre-tokenized syntax highlighting (Tree-sitter)
- Token-based rendering system
- Feature toggle (can disable if performance issues)

**Critical for:** Nothing - this is purely visual enhancement

---

## Core Dependencies

```
v1.3.0 (baseline)
    ↓
v1.4.0 (LocalUserService + Dashboard)
    ↓ [requires stable userId]
v1.5.0 (Character skip ranges)
    ↓ [proves skip concept]
v1.5.1 (AST skip ranges)
    ↓ [optional path]
v1.6.0 (Syntax highlighting - requires Phase 0 validation)
```

**Critical Rules:**

- Each version must be independently stable
- Can skip v1.6.0 entirely if validation fails
- Never break typing functionality (latency <25ms, validation works)

---

## Pre-Flight Checklist (Before ANY Phase)

```bash
# 1. Tag current stable state
git status
git tag vX.X.X  # Current version

# 2. Verify database health
cd packages/back-nest
sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM result;"

# 3. Backup database
cp speedtyper-local.db speedtyper-local.db.backup

# 4. Verify app works
npm run dev
# Test: Type snippet → Complete → Verify result saves
```

---

## Universal Rollback Procedure

```bash
# Rollback to previous version
git checkout vX.X.X  # Previous stable tag
npm install  # Reinstall dependencies if needed
npm run dev

# Verify: Complete one full typing workflow
# If database issues: Restore from backup
cp speedtyper-local.db.backup speedtyper-local.db
```

---

## Risk Mitigation Strategy

| Risk Type                    | Mitigation                                            |
| ---------------------------- | ----------------------------------------------------- |
| Data migration breaks        | Test migration script, provide rollback SQL           |
| Skip logic breaks validation | Backend is source of truth, extensive edge case tests |
| AST parsing fails            | Language-specific test suite, graceful fallback       |
| Performance degradation      | Profile at each step, feature toggle, defer if >25ms  |

---

## Success Metrics (Post-v1.6.0)

- ✅ Stable user identity (predictable data)
- ✅ Progress tracking (meaningful analytics)
- ✅ Smart skipping (better practice focus)
- ✅ Optional highlighting (visual enhancement)
- ✅ All features toggleable (user control)
- ✅ Performance maintained (<25ms keystroke latency)

---

## Phase Document Usage

Each phase document is self-contained with:

- Context (how this phase fits)
- Complete implementation steps
- Testing procedures
- Success criteria
- Rollback instructions

Always use in conjunction with this overview.
