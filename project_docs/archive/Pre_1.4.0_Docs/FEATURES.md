# Speedtyper Local - Feature Roadmap

**Version:** 1.4.0
**Last Updated:** November 2, 2025
**Status:** Living Document

---

## Roadmap Philosophy

This roadmap prioritizes **quality of life improvements** and **low-risk enhancements** that respect the core principle: **keep the typing experience excellent**.

Features are organized by:

- **Effort**: Time investment required
- **Risk**: Chance of breaking existing functionality
- **Impact**: Value delivered to the user

---

## ✅ Completed Features (v1.0.0 → v1.4.0)

### v1.4.0 (UI Polish & Foundation) - November 2, 2025

**Theme:** Professional UI, Foundation for Smart Features

- ✅ **InfoModal with Keyboard Shortcuts** - Added comprehensive keyboard shortcuts documentation accessible via keyboard icon in navbar
- ✅ **Global ESC Key Handler** - Universal ESC key now closes all modals (Settings, Profile, Info, Language) for consistent UX
- ✅ **Debug Mode Toggle in Settings** - Users can now enable/disable Debug Mode via Settings modal (previously code-only toggle)
- ✅ **Settings Modal Improvements** - Better typography, concise content, dark theme integration, removed broken toggles
- ✅ **UI Cleanup Phase 2** - Removed multiplayer UI remnants (user count, public races modal), updated branding to "SpeedTyper Solo"
- ✅ **Avatar Rendering Fix** - Fixed critical crash when ProfileModal displayed users with null avatarUrl

**Files Modified:**
- `packages/webapp-next/common/components/modals/InfoModal.tsx` (new)
- `packages/webapp-next/common/components/NewNavbar.tsx`
- `packages/webapp-next/modules/play2/state/settings-store.ts`
- `packages/webapp-next/pages/_app.tsx`
- `packages/webapp-next/common/components/overlays/SettingsOverlay.tsx`

**Implementation Time:** ~3 hours across Sessions 36-37

**Risk:** 🟢 Low (UI-only changes, no core functionality affected)

### v1.3.0 (Stability & Error Handling) - October 31, 2025

**Theme:** Crash Resilience and User Feedback

- ✅ **Backend Crash Resilience** - Added `race_error` WebSocket event when no challenges available for selected language
- ✅ **Frontend Error Display** - User-friendly alerts with actionable guidance ("Add code to snippets/ folder")
- ✅ **Connection State Recovery** - Proper state cleanup allowing users to recover by changing language
- ✅ **Working Keyboard Shortcuts** - Tab (next snippet), Enter (continue), Alt+← (prev language), Alt+→ (next language)

**Files Modified:**
- `packages/webapp-next/modules/play2/services/Game.ts`
- `packages/back-nest/src/races/race.gateway.ts`
- `packages/webapp-next/pages/index.tsx`

**Implementation Time:** ~1 hour (Session 24)

**Risk:** 🟢 Low (Additive change, no breaking modifications)

### v1.2.0 (Stability & Polish) - October 30, 2025

- ✅ **Snippet Metadata Display** - Results page shows origin file (e.g., "From: javascript/gm_01_013_01_string-methods.js")
- ✅ **Configurable Snippet Filters** - Backend parser loads quality filters from `parser.config.json`
- ✅ **Critical Bug Fixes:**
  - Fixed Results Page Race Condition (automatic retry logic)
  - Robust Default Language (prevents crashes on fresh installs)

### v1.1.0 (Core Transformation) - October 2025

- ✅ **SQLite Migration** - Replaced PostgreSQL with single-file database
- ✅ **One-Command Startup** - `npm run dev` starts everything
- ✅ **Local Snippet Import** - Practice your own code from `snippets/` folder
- ✅ **Guest-Only Auth** - Removed GitHub OAuth friction
- ✅ **Solo Mode** - Stubbed multiplayer broadcasting, preserved typing engine
- ✅ **Browser Auto-Open** - App opens automatically at `localhost:3001`
- ✅ **UI Cleanup Phase 1** - Removed leaderboard, fake stats, and initial multiplayer UI

---

## 🚧 In Progress (v1.5.0 - Next Release)

**Target:** Mid-November 2025  
**Theme:** Smart Skipping Foundation

### Feature 3.3A: Character-Based Skip Ranges

**Status:** Planned (High Priority)

**What It Is:**
Automatically skip leading whitespace and indentation during typing, allowing users to focus on actual code logic rather than spacing.

**Implementation Plan:**

1. **Backend Skip Range Calculation** (Day 1-2)
   - Add `skipRanges: [number, number][]` to Challenge entity
   - Calculate ranges during snippet import (character-based: spaces/tabs)
   - Store in database for fast retrieval

2. **Backend Skip Configuration** (Day 2-3)
   - Create `skip-config.json` for skip rules
   - SkipConfigService to manage rules
   - Integration with existing keystroke validator

3. **Frontend Cursor Auto-Advancement** (Day 3-4)
   - Auto-advance cursor over skipped ranges on keypress
   - Visual indicator of skipped ranges (optional)
   - Settings toggle to enable/disable feature

4. **User Preferences** (Day 4-5)
   - Use LocalUserService for userId (requires Feature 3.1)
   - Store skip preferences per user
   - Dashboard integration (skip statistics)

**Why It's Important:**
Reduces tedious typing of repetitive whitespace, focuses practice on meaningful code patterns.

**Technical Constraints:**
- Must maintain <25ms keystroke latency
- Backend remains source of truth for validation
- Feature toggle required (users can disable)

**Risk:** 🟡 Medium (Touches validation system, requires extensive testing)

**Estimated Effort:** 2-3 weeks

**Dependencies:** Requires Feature 3.1 (Stable User Identity) - see v1.4.0-feature-3.1-complete tag

---

## 📋 Planned Features (v1.5.1+)

### Feature 3.3B: AST-Based Skip Ranges (v1.5.1)

**Status:** Architecture Verified, Implementation Deferred

**What It Is:**
Extend skip ranges to include comments and docstrings using Tree-sitter AST parsing.

**Why Deferred:**
- Requires Feature 3.3A to be stable first
- More complex than character-based skipping
- AST parsing adds latency risk

**Risk:** 🟡 Medium (AST parsing complexity)

**Estimated Effort:** 2-3 weeks (after v1.5.0 stable)

---

### Feature 3.4: Syntax Highlighting (v1.6.0 - OPTIONAL)

**Status:** Requires User Validation First ⚠️

**What It Is:**
Pre-tokenized syntax highlighting using Tree-sitter, with token-based rendering system.

**Why Optional:**
- Very high complexity (fundamental rewrite of `CodeArea.tsx`)
- Significant performance risk
- Purely visual enhancement (doesn't improve practice)

**Risk:** 🔴 VERY HIGH

**Decision Point:**
- Must pass Phase 0 validation (user feedback + performance benchmarks)
- Can skip entirely if validation fails
- Not critical for core functionality

**Estimated Effort:** 4-6 weeks (if pursued)

---

## 📊 Feature Priority Matrix

| Feature                        | Impact    | Effort        | Risk          | Status       |
| ------------------------------ | --------- | ------------- | ------------- | ------------ |
| Backend Crash Resilience       | High      | Low           | Low           | ✅ v1.3.0    |
| Keyboard Shortcuts             | High      | Low           | Low           | ✅ v1.3.0    |
| Enhanced User Feedback         | Medium    | Low           | Low           | ✅ v1.3.0    |
| UI Polish & Cleanup            | Medium    | Low           | Low           | ✅ v1.4.0    |
| InfoModal & ESC Handler        | Medium    | Low           | Low           | ✅ v1.4.0    |
| Character-Based Skip Ranges    | High      | Medium        | Medium        | 🟡 v1.5.0    |
| AST-Based Skip Ranges          | High      | High          | Medium        | 📅 v1.5.1    |
| Syntax Highlighting            | Very High | **Very High** | **Very High** | 📅 v1.6.0    |

---

## 🚀 Next Steps

### For v1.5.0 (Current Focus)

**Prerequisites:**
- ✅ v1.4.0 tagged and stable
- ✅ UI polish complete
- ✅ Documentation updated

**Implementation Phases:**

1. **Week 1: Backend Skip Ranges**
   - Add skipRanges to Challenge entity
   - Implement character-based calculation
   - Write tests for edge cases (all-whitespace lines, mixed tabs/spaces)

2. **Week 2: Frontend Integration**
   - Cursor auto-advancement logic
   - Settings toggle implementation
   - Integration with existing validation system

3. **Week 3: Testing & Polish**
   - Performance validation (<25ms latency maintained)
   - Edge case testing
   - User preference storage
   - Documentation updates

**Success Criteria:**
- Skip ranges work for all languages (JavaScript, TypeScript, Python)
- No typing latency degradation
- Feature toggleable via Settings
- All existing tests pass

---

### For v1.5.1 (Future)

**Depends on:** v1.5.0 stable for 1-2 weeks

**Focus:**
- AST-based comment detection
- Tree-sitter integration for docstring skipping
- Merged character + AST skip ranges

---

### For v1.6.0 (Optional - TBD)

**Depends on:** User validation results

**Decision Criteria:**
- Must pass performance benchmarks (no latency increase)
- User feedback must be positive
- Implementation complexity acceptable

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

## 📝 Recent Changelog

### v1.4.0 (November 2, 2025)

**Added:**
- InfoModal with keyboard shortcuts documentation
- Global ESC key handler for all modals
- Debug Mode toggle in Settings UI
- Improved Settings modal typography and content

**Fixed:**
- Avatar rendering crash with null avatarUrl
- Settings modal broken toggles removed

**Changed:**
- Updated branding to "SpeedTyper Solo"
- Removed multiplayer UI remnants

### v1.3.0 (October 31, 2025)

**Added:**
- Backend race_error event for empty challenge states
- Frontend error display with actionable guidance
- Working keyboard shortcuts (Tab, Enter, Alt+Arrows)

**Fixed:**
- Backend crash when no challenges available
- Connection state recovery flow

### v1.2.0 (October 30, 2025)

**Added:**
- Snippet metadata display on results page
- Configurable snippet filters via parser.config.json

**Fixed:**
- Results page race condition (added retry logic)
- Default language crash on fresh installs

---

**Next**: See `ARCHITECTURE.md` for technical implementation details of any feature above.
