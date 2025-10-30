# Speedtyper Local - Feature Roadmap

**Version:** 1.1.0  
**Last Updated:** October 30, 2025  
**Status:** Living Document

---

## Roadmap Philosophy

This roadmap prioritizes **quality of life improvements** and **low-risk enhancements** that respect the core principle: **keep the typing experience excellent**.

Features are organized by:
- **Effort**: Time investment required
- **Risk**: Chance of breaking existing functionality
- **Impact**: Value delivered to the user

---

## ✅ Completed Features (v1.0.0 → v1.1.0)

### Core Transformation

- ✅ **SQLite Migration** - Replaced PostgreSQL with single-file database
- ✅ **One-Command Startup** - `npm run dev` starts everything
- ✅ **Local Snippet Import** - Practice your own code from `snippets/` folder
- ✅ **Guest-Only Auth** - Removed GitHub OAuth friction
- ✅ **Solo Mode** - Stubbed multiplayer broadcasting, preserved typing engine
- ✅ **Browser Auto-Open** - App opens automatically at `localhost:3001`
- ✅ **Cross-Platform Support** - WSL + Windows workflows established

### UI Cleanup

- ✅ **Removed Leaderboard Button** - Eliminated crash point
- ✅ **Removed Fake Stats Panels** - Cleaned up results page (TrendsWPM, DailyStreak)
- ✅ **Hidden Multiplayer UI** - Battle matcher, public race toggles

### Already-Implemented (Discovered During Audit)

- ✅ **Language Selection Persistence** - Settings stored in localStorage
- ✅ **Smooth Caret Option** - User preference persists across sessions
- ✅ **Syntax Highlighting Toggle** - Basic highlighting already available

---

## 🚧 Tier 1: High Priority (Release 1.2.0)

**Target:** Next 2-4 weeks  
**Theme:** Polish and quality-of-life improvements

### 1. Configurable Keyboard Shortcuts ⚠️

**Status:** Planned (Medium Effort - upgraded from "Low")

**What It Is:**  
A system allowing keyboard-centric control of the entire workflow, with user-configurable shortcuts via settings modal.

**Proposed Default Shortcuts:**
- `Enter` - Start next race after completion
- `Ctrl + L` - Focus language selector
- `Ctrl + R` - Refresh snippet (get new one)
- `Escape` - Return to home/reset race

**Why It's Important:**  
Reduces friction for power users who prefer keyboard-only workflows.

**Implementation Complexity:**

**Backend:** None (frontend-only feature)

**Frontend (Medium Effort, 4-6 hours):**
1. **Rewrite `useKeyMap.ts`** to support modifier keys (Ctrl, Alt, Shift)
   - Current implementation only handles single keys
   - Needs combo parsing: "Ctrl+L" → `{ctrlKey: true, key: "L"}`
   
2. **Create keybinding service** (`keybinding.service.ts`)
   - Load defaults from config object
   - Load custom overrides from localStorage
   - Provide hook: `useKeybinding(action: string)`

3. **Add configuration UI** in `SettingsModal.tsx`
   - Simple `<textarea>` for JSON input
   - Validation with error messages
   - Persist to localStorage on save

**Risk:** 🟡 Medium
- Current `useKeyMap` is tightly coupled to typing input
- Must ensure shortcuts don't conflict with typing characters
- Edge case: Handling Ctrl+R without triggering browser refresh

**Effort Correction:**  
Original report said "Low-to-Medium." After code review, **this is solid Medium effort** due to `useKeyMap` rewrite requirements.

**Verification:**
1. Default shortcuts work out-of-box
2. Custom JSON overrides load correctly
3. Shortcuts persist after browser refresh
4. No conflicts with typing workflow

---

### 2. Enhanced Error Handling & User Feedback

**Status:** Proposed (Low Effort)

**What It Is:**  
Improve error messages and add loading indicators for better user experience.

**Current Pain Points:**
- No feedback when snippet import fails
- Silent failures if WebSocket disconnects
- No indication when database is empty

**Proposed Changes:**

1. **Connection Status Indicator** (1 hour)
   - Add visual indicator in navbar: "Connected" / "Reconnecting..."
   - Use existing `connection-store.ts`

2. **Import Feedback** (1 hour)
   - Show toast notification after `npm run reimport`
   - Display: "Imported X snippets from Y files"
   - Error case: "No valid snippets found. Check file syntax."

3. **Empty Database State** (30 min)
   - If no challenges exist, show helpful message:
     - "No snippets found. Add code to `snippets/` and run `npm run reimport`"

**Risk:** 🟢 Low (cosmetic changes)

**Effort:** 2-3 hours total

---

### 3. Snippet Metadata Display

**Status:** Proposed (Low Effort)

**What It Is:**  
Show snippet origin (filename, language) during typing.

**Current State:**  
You're typing code, but don't know which file it came from.

**Proposed UI:**  
Add small label below snippet: "From: `snippets/python/my_script.py` (Python)"

**Implementation (2 hours):**
1. `Challenge` entity already has `path` field
2. Display in `PlayFooter` component
3. Style with muted color (non-distracting)

**Risk:** 🟢 Low (display-only change)

**User Value:** High (helps track which files need more practice)

---

## 🔮 Tier 2: Medium Priority (Release 1.3.0)

**Target:** 1-2 months  
**Theme:** Data and insights

### 4. User Progress Tracking Dashboard ⚠️

**Status:** Needs Architecture Review (High Effort)

**What It Is:**  
A dashboard showing WPM trends over time, accuracy improvements, and language-specific stats.

**Current Limitations:**
- Guest users are ephemeral (new ID per session)
- Results stored, but not aggregated by user
- No frontend for historical data

**Architectural Concerns:**

The feature report suggested "making guest user permanent via localStorage." This is **architecturally questionable** and needs clarification:

**Option A: Persistent Guest ID (Simpler)**
```typescript
// Store single userId in localStorage
localStorage.setItem('userId', guestUserId);

// Backend: On socket connect, check localStorage
// If exists: Load existing guest user
// If not: Create new guest, send ID back to frontend
```

**Pros:** Minimal backend changes, preserves guest system  
**Cons:** User loses history if localStorage cleared

**Option B: Local User Profile (More Robust)**
- Create `UserProfile` entity (name, creation date)
- Store profileId in localStorage
- Link results to profile, not ephemeral guest
- Add profile management UI

**Pros:** Better data integrity, explicit user ownership  
**Cons:** More complex, requires new database table

**Recommendation:** Start with Option A, upgrade to Option B if needed.

**Frontend Work (High Effort, 4-6 hours):**
1. Create `ProgressDashboard.tsx` page
2. Create `/api/progress` endpoint (fetch aggregated results)
3. Add chart library (Recharts already available)
4. Display:
   - WPM over time (line chart)
   - Accuracy trends
   - Per-language breakdown
   - Total races completed

**Risk:** 🟡 Medium
- Option A has data persistence risk
- Chart rendering can be finicky
- Backend aggregation queries need optimization

**Effort:** 6-10 hours total (backend + frontend)

**Status:** Deferred until architecture decided

---

### 5. Smart Snippets (Visible but Skippable Comments) 🔍

**Status:** Architecture Verified, Implementation Planned (High Effort)

**What It Is:**  
Display code comments visually but automatically skip over them during typing, focusing practice on logic.

**Example:**
```python
# This comment is visible but not typed
def calculate_sum(a, b):  # ← Cursor jumps from 'b' to 'return'
    # Another skipped comment
    return a + b  # ← User types this
```

**Verified Architecture:**

After reviewing `challenge.entity.ts` and `race-events.service.ts`, the approach is:

**Backend (Medium Effort, 2-3 hours):**
1. Create `comment-parser.service.ts`
   - Use tree-sitter to identify comment nodes
   - Output: `nonTypableRanges: Array<{start: number, end: number}>`
   
2. Modify `race-events.service.ts`
   - Before emitting `challenge_selected`, enrich challenge object:
   ```typescript
   const enrichedChallenge = {
     ...race.challenge,
     nonTypableRanges: this.commentParser.findComments(race.challenge.content)
   };
   socket.emit('challenge_selected', enrichedChallenge);
   ```

3. Update TypeScript interface
   - Add `nonTypableRanges?` to `Challenge` DTO

**Frontend (High Effort, HIGH RISK, 4-6 hours):**
1. Modify `Game.ts` to store ranges in `code-store`
2. **Rewrite `CodeArea.tsx` cursor logic**
   - Check if current position is in a skippable range
   - If yes: Auto-advance cursor to next typable character
   - Update visual rendering (dim comments)
   
3. Update `progress.service.ts`
   - Exclude skipped characters from WPM calculation
   - Adjust accuracy formula

**Risk:** 🔴 HIGH
- Core typing engine modification
- Cursor jump logic is complex (edge cases abound)
- Performance impact: O(n) range check per keystroke
- Breaking changes to payload contract

**Mitigation Strategy:**
1. Implement behind feature flag (`smartSnippets: boolean` in settings)
2. Create fallback: If parsing fails, show full code as normal
3. Extensive testing with edge cases:
   - Multi-line comments
   - Nested comments (e.g., docstrings)
   - Inline comments mid-line

**Effort:** 6-9 hours total

**Decision:** High value, but high risk. **Recommend deferring until v1.4.0** after other features are stable.

---

### 6. Configurable Snippet Filters (Backend)

**Status:** Proposed (Low Effort)

**What It Is:**  
Allow user to control snippet characteristics via `parser.config.json` file.

**Current Hardcoded Filters** (in `parser.service.ts`):
```typescript
minCharCount: 100
maxCharCount: 300
maxLines: 11
maxLineLength: 55
```

**Proposed:**  
Create `packages/back-nest/parser.config.json`:
```json
{
  "filters": {
    "minCharCount": 80,
    "maxCharCount": 400,
    "maxLines": 15,
    "maxLineLength": 60
  }
}
```

**Implementation (2 hours):**
1. Create config file with defaults
2. Modify `parser.service.ts` to read config
3. Document in README-LOCAL.md

**Risk:** 🟢 Low (backend-only, no frontend impact)

**User Value:** Medium (power users can tune snippet quality)

---

## 🌟 Tier 3: Low Priority / Future Exploration

**Target:** 3+ months or "when bored"  
**Theme:** Polish and experiments

### 7. Language-Aware Syntax Highlighting ⚠️

**Status:** High Risk, High Reward (Very High Effort)

**What It Is:**  
IDE-style syntax highlighting (keywords, strings, comments in different colors) underneath the typing progress overlay.

**Why It's Valuable:**  
Massive visual upgrade, makes the app feel professional and polished.

**Why It's Dangerous:**

The current `CodeArea.tsx` uses a **custom character-by-character rendering system**:
- Each character is a `<span>` with color based on typing state (correct/incorrect)
- Cursor position tracked manually
- Performance optimized for this exact pattern

**To add syntax highlighting, we'd need to:**
1. Integrate Prism.js or Monaco Editor (or similar)
2. Merge two color layers:
   - Base layer: Syntax colors (blue keywords, green strings, etc.)
   - Overlay layer: Typing progress (green correct, red incorrect)
3. Maintain cursor accuracy
4. Ensure performance doesn't degrade

**Risk:** 🔴 VERY HIGH
- Fundamental rewrite of `CodeArea.tsx`
- High chance of introducing bugs
- Performance concerns (re-highlighting on every keystroke?)

**Effort:** 10-15 hours (basically rebuilding the core component)

**Recommendation:** **Only attempt if:**
1. All Tier 1 & Tier 2 features are complete
2. You're willing to accept potential regressions
3. You have time for extensive testing

**Alternative:** Use Monaco Editor (VSCode's editor component) as a complete replacement for `CodeArea.tsx`. This is a **different project** essentially.

---

### 8. Custom Snippet Collections

**Status:** Brainstorming (Medium Effort)

**What It Is:**  
Organize snippets into named collections (e.g., "Python OOP", "React Hooks", "Go Concurrency").

**Proposed UI:**
- Collection selector in language dropdown
- Create collections via `snippets/collections.json`:
```json
{
  "collections": [
    {
      "name": "Python OOP",
      "files": ["snippets/python/classes.py", "snippets/python/inheritance.py"]
    }
  ]
}
```

**Implementation:**
1. Backend: Parse collections.json
2. Backend: Tag challenges with collection ID
3. Frontend: Add filter in race settings

**Risk:** 🟡 Medium (new feature, moderate complexity)

**Effort:** 4-6 hours

---

### 9. Import from GitHub Gist / Pastebin

**Status:** Idea (Low-Medium Effort)

**What It Is:**  
Add URL input to import snippets directly from web sources.

**Use Case:**  
Found a great code example online? Paste URL → Practice immediately.

**Implementation:**
1. Add input field in settings
2. Fetch content via REST API
3. Parse and save like local imports

**Risk:** 🟡 Medium (external API dependency)

**Effort:** 3-4 hours

---

### 10. Export Progress / Backup

**Status:** Proposed (Low Effort)

**What It Is:**  
Allow user to export their database (results, snippets) as JSON backup.

**Implementation:**
1. Add "Export Data" button in settings
2. Query all user results + snippets
3. Download as `speedtyper-backup-YYYY-MM-DD.json`
4. Optional: Import functionality to restore

**Risk:** 🟢 Low (read-only feature)

**Effort:** 2-3 hours

---

## 📊 Feature Priority Matrix

| Feature | Impact | Effort | Risk | Priority |
|---------|--------|--------|------|----------|
| Keyboard Shortcuts | High | Medium | Medium | Tier 1 🟡 |
| Error Handling | Medium | Low | Low | Tier 1 ✅ |
| Snippet Metadata | Medium | Low | Low | Tier 1 ✅ |
| Progress Dashboard | High | High | Medium | Tier 2 🟡 |
| Smart Snippets | Very High | High | **Very High** | Tier 2 🔴 |
| Snippet Filters | Medium | Low | Low | Tier 2 ✅ |
| Syntax Highlighting | Very High | **Very High** | **Very High** | Tier 3 🔴 |
| Custom Collections | Medium | Medium | Medium | Tier 3 🟡 |

---

## 🚀 Next Steps

### For v1.2.0 (This Month)

**Phase 1: Quick Wins (Week 1-2)**
- ✅ Keyboard shortcuts (with revised effort estimate)
- ✅ Error handling improvements
- ✅ Snippet metadata display

**Phase 2: Decide on Progress Tracking (Week 3-4)**
- Review architecture options (Persistent Guest vs User Profile)
- Design database schema
- Prototype dashboard UI

### For v1.3.0 (Next Month)

**Implement Progress Tracking**
- Backend: User persistence
- Frontend: Dashboard page
- Testing: Data integrity

**Backend Quality**
- Snippet filters config
- Logging improvements
- Error boundary setup

### For v1.4.0+ (Future)

**High-Risk Features**
- Smart Snippets (behind feature flag)
- Syntax Highlighting (separate branch, experimental)

---

## 🛑 Out of Scope

These features will **NOT** be implemented:

1. **Multiplayer Mode** - Antithetical to solo-practice goal
2. **Cloud Sync** - Local-first philosophy
3. **Mobile App** - Desktop-only tool
4. **AI Code Generation** - Not a learning tool
5. **Social Features** - No leaderboards, sharing, etc.

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