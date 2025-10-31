# Speedtyper Local - Feature Roadmap

**Version:** 1.2.0
**Last Updated:** October 31, 2025
**Status:** Living Document

---

## Roadmap Philosophy

This roadmap prioritizes **quality of life improvements** and **low-risk enhancements** that respect the core principle: **keep the typing experience excellent**.

Features are organized by:

- **Effort**: Time investment required
- **Risk**: Chance of breaking existing functionality
- **Impact**: Value delivered to the user

---

## ✅ Completed Features (v1.0.0 → v1.2.0)

### v1.2.0 (Stability & Polish)

- ✅ **Snippet Metadata Display** - The results page now shows the origin file of the snippet (e.g., "From: javascript/gm_01_013_01_string-methods.js"), providing better context.
- ✅ **Configurable Snippet Filters** - The backend parser now correctly loads and applies snippet quality filters from `packages/back-nest/parser.config.json` on startup.
- ✅ **Critical Bug Fixes:**
  - **Fixed Results Page Race Condition:** Added automatic retry logic to the results page data fetching. This prevents intermittent blank stats pages by giving the backend a few extra moments to save the result to the database before the frontend requests it.
  - **Robust Default Language:** The frontend now defaults to JavaScript if no language is selected in local storage. This prevents crashes on fresh installs or after clearing browser data when the previously selected language (e.g., Python) has no available snippets.

### v1.1.0 (Core Transformation)

- ✅ **SQLite Migration** - Replaced PostgreSQL with single-file database.
- ✅ **One-Command Startup** - `npm run dev` starts everything.
- ✅ **Local Snippet Import** - Practice your own code from `snippets/` folder.
- ✅ **Guest-Only Auth** - Removed GitHub OAuth friction.
- ✅ **Solo Mode** - Stubbed multiplayer broadcasting, preserved typing engine.
- ✅ **Browser Auto-Open** - App opens automatically at `localhost:3001`.
- ✅ **UI Cleanup** - Removed leaderboard, fake stats, and multiplayer UI.

---

## 🚧 Tier 1: High Priority (Release 1.3.0)

**Theme:** Stability and Keyboard-Centric Workflow

### 1. Backend Crash Resilience ✅

**Status:** **COMPLETED** (Session 24 - October 31, 2025)

**What It Was:**
Backend would log errors when no challenges existed for a language, but the frontend would show a blank screen with no user feedback.

**What We Fixed:**
- Added `listenForRaceError()` method to `Game.ts`
- Frontend now displays user-friendly alert when backend emits `race_error` event
- Alert includes actionable guidance: "Add code to snippets/ folder and run 'npm run reimport'"
- Connection state properly updated so user can recover by changing language

**Files Modified:**
- `packages/webapp-next/modules/play2/services/Game.ts`

**Implementation Time:** 15 minutes

**Risk:** 🟢 Low (Additive change, no breaking modifications)

### 2. Configurable Keyboard Shortcuts ⚠️

**Status:** Planned (Medium Effort)

**What It Is:**
A system allowing keyboard-centric control of the entire workflow, with user-configurable shortcuts via settings modal.

**Proposed Default Shortcuts:**

- `Enter` - Start next race after completion
- `Ctrl + L` - Focus language selector
- `Ctrl + R` - Refresh snippet (get new one)
- `Escape` - Return to home/reset race

**Why It's Important:**
Reduces friction for power users who prefer keyboard-only workflows.

**Implementation Complexity (Medium Effort, 4-6 hours):**

- **Frontend:** Rewrite `useKeyMap.ts` to support modifier keys, create a keybinding service, and add a configuration UI in `SettingsModal.tsx`.

**Risk:** 🟡 Medium

- Current `useKeyMap` is tightly coupled to typing input. Must ensure shortcuts don't conflict with typing characters.

---

### 3. Enhanced User Feedback

**Status:** Proposed (Low Effort)

**What It Is:**
Improve UI feedback for key application states.

**Proposed Changes (2-3 hours total):**

1. **Connection Status Indicator:** Add a visual indicator in the navbar ("Connected" / "Reconnecting...") using the existing `connection-store.ts`.
2. **Empty Database State:** If no challenges exist for a selected language, show a helpful message: "No snippets found for [Language]. Add code to `snippets/` and run `npm run reimport`."

**Risk:** 🟢 Low (Cosmetic changes).

---

## 🔮 Tier 2: Medium Priority (Release 1.4.0)

**Theme:** Data and Insights

### 4. User Progress Tracking Dashboard ⚠️

**Status:** Needs Architecture Review (High Effort)

**What It Is:**
A dashboard showing WPM trends over time, accuracy improvements, and language-specific stats.

**Architectural Concerns:**
Requires a decision between a simple **Persistent Guest ID** (via localStorage) or a more robust **Local User Profile** system. The former is recommended to start.

**Risk:** 🟡 Medium (Data persistence risk with localStorage; backend aggregation queries need optimization).

---

### 5. Smart Snippets (Visible but Skippable Comments) 🔍

**Status:** Architecture Verified, Implementation Planned (High Effort)

**What It Is:**
Display code comments visually but automatically skip over them during typing, focusing practice on logic.

**Risk:** 🔴 HIGH

- Core typing engine modification. Cursor jump logic is complex. Breaking changes to payload contract.
- **Decision:** Defer until core stability and QoL features are complete. Implement behind a feature flag.

---

## 🌟 Tier 3: Low Priority / Future Exploration

(Sections below are preserved from the original document with no changes)

### 6. Language-Aware Syntax Highlighting ⚠️

**Status:** High Risk, High Reward (Very High Effort)
**Risk:** 🔴 VERY HIGH - Fundamental rewrite of `CodeArea.tsx`.

### 7. Custom Snippet Collections

**Status:** Brainstorming (Medium Effort)

### 8. Import from GitHub Gist / Pastebin

**Status:** Idea (Low-Medium Effort)

### 9. Export Progress / Backup

**Status:** Proposed (Low Effort)

---

## 📊 Feature Priority Matrix

| Feature                  | Impact    | Effort        | Risk          | Priority  |
| ------------------------ | --------- | ------------- | ------------- | --------- |
| Backend Crash Resilience | High      | Low           | Low           | Tier 1 ✅ |
| Keyboard Shortcuts       | High      | Medium        | Medium        | Tier 1 🟡 |
| Enhanced User Feedback   | Medium    | Low           | Low           | Tier 1 ✅ |
| Progress Dashboard       | High      | High          | Medium        | Tier 2 🟡 |
| Smart Snippets           | Very High | High          | **High**      | Tier 2 🔴 |
| Syntax Highlighting      | Very High | **Very High** | **Very High** | Tier 3 🔴 |
| Custom Collections       | Medium    | Medium        | Medium        | Tier 3 🟡 |

---

## 🚀 Next Steps

### For v1.3.0 (Next Session)

- **Phase 1: Stability First**
  - ✅ Fix the backend crash in the exception filter.
- **Phase 2: Quality of Life**
  - ✅ Begin implementation of configurable keyboard shortcuts.
  - ✅ Implement the enhanced user feedback items (Connection Status, Empty DB State).
- **Phase 3: Planning**
  - ✅ Finalize the architecture for the Progress Tracking Dashboard.

---

## 💡 Suggesting New Features

If you have ideas not on this roadmap:

1. **Check alignment** with project philosophy (solo, local, friction-free)
2. **Estimate effort** (hours) and risk (low/medium/high)
3. **Explain impact** (how it improves the practice experience)
4. **Open a discussion** (document or issue)

**Good fit:** Improves typing practice, low risk, respects local-first principle  
**Bad fit:** Requires external services, high complexity, multiplayer-oriented

---

## 📝 Changelog Template (For Future Releases)

```markdown
## v1.2.0 (YYYY-MM-DD)

### Added

- Keyboard shortcuts (Ctrl+L, Ctrl+R, Enter)
- Connection status indicator
- Snippet filename display

### Fixed

- [Bug fixes]

### Changed

- [Breaking changes, if any]
```

---

**Next**: See `ARCHITECTURE.md` for technical implementation details of any feature above.
