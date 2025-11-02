# Documentation Review: Outdated Sections

Here are the sections that need updates based on v1.4.0 changes:

---

## ARCHITECTURE.md

### ❌ Outdated Sections:

1. **"Technology Stack" → Frontend table**
   - **Issue:** Still lists Socket.IO Client as "2.x" (should verify actual version)
   - **Why:** May have been updated during project evolution

2. **"Frontend Structure" → `common/components/`**
   - **Missing:** `InfoModal.tsx` (new in v1.4.0)
   - **Missing:** `overlays/SettingsOverlay.tsx` restructure
   - **Why:** Session 36-37 added new components

3. **"WebSocket Contract (Critical)" section**
   - **Missing:** `race_error` event (added in Session 24)
   - **Why:** Backend now emits error events when no challenges available

4. **"Database Schema" → user table**
   - **Issue:** Doesn't mention `legacyId` field (used for LocalUserService)
   - **Why:** Feature 3.1 added stable user identity via legacyId

5. **"Key Design Decisions" section**
   - **Missing:** Decision to add InfoModal (keyboard shortcuts documentation)
   - **Missing:** Global ESC handler pattern
   - **Missing:** Settings store as central modal state manager
   - **Why:** Session 37 established new architectural patterns

6. **"Critical Files" tables**
   - **Missing:** `settings-store.ts` as MEDIUM risk (now manages all modal states)
   - **Missing:** `InfoModal.tsx` as LOW risk
   - **Why:** Session 37 added new critical components

---

## FEATURES.md

### ❌ Outdated Sections:

1. **"✅ Completed Features (v1.0.0 → v1.2.0)"**
   - **Missing:** v1.3.0 completion (Backend crash resilience)
   - **Missing:** v1.4.0 completion (UI cleanup + polish)
   - **Why:** Two full versions shipped since last update

2. **"🚧 Tier 1: High Priority (Release 1.3.0)"**
   - **Issue:** Backend Crash Resilience still marked as "Planned"
   - **Actual Status:** ✅ COMPLETED (Session 24)
   - **Why:** Feature was implemented months ago

3. **"2. Configurable Keyboard Shortcuts ⚠️"**
   - **Issue:** Status shows "Planned (Medium Effort)"
   - **Actual Status:** Partially implemented (Alt+Arrows, Tab, Enter, ESC)
   - **Missing:** Mention of InfoModal documenting existing shortcuts
   - **Why:** Session 37 added keyboard shortcuts documentation

4. **"3. Enhanced User Feedback"**
   - **Issue:** Status shows "Proposed (Low Effort)"
   - **Actual Status:** ✅ COMPLETED (Connection status, empty state, modals)
   - **Why:** Sessions 24, 36, 37 implemented these features

5. **"🔮 Tier 2: Medium Priority (Release 1.4.0)"**
   - **Issue:** Section title suggests v1.4.0 not yet released
   - **Actual Status:** v1.4.0 is complete and tagged
   - **Why:** Just finished in Session 37

6. **"4. User Progress Tracking Dashboard ⚠️"**
   - **Issue:** Status shows "Needs Architecture Review (High Effort)"
   - **Actual Status:** ✅ COMPLETED (Dashboard backend + frontend implemented)
   - **Why:** Feature 3.2 was implemented in Sessions 33-34

7. **"📊 Feature Priority Matrix" table**
   - **Issue:** All features marked as Tier 1/2/3 don't reflect completion status
   - **Missing:** v1.4.0 completed features (UI cleanup, InfoModal, Debug Mode toggle)
   - **Why:** Table hasn't been updated since v1.2.0

8. **"🚀 Next Steps → For v1.3.0 (Next Session)"**
   - **Issue:** Section still says "Next Session" for v1.3.0
   - **Actual Status:** v1.3.0 complete, v1.4.0 complete, now moving to v1.5.0
   - **Why:** Multiple versions behind current state

---

## PROJECT_OVERVIEW.md

### ❌ Outdated Sections:

1. **Header metadata**
   - **Issue:** "Version: 1.1.0" and "Last Updated: October 30, 2025"
   - **Actual:** Should be v1.4.0 and November 2, 2025
   - **Why:** Document version not updated

2. **"Key Features (v1.1.0)" → "✅ Implemented" list**
   - **Missing:** v1.4.0 features (Dashboard, UI cleanup, InfoModal, Debug Mode)
   - **Missing:** v1.3.0 features (Backend error handling, keyboard shortcuts)
   - **Why:** Only lists features up to v1.1.0

3. **"🚧 Planned (See FEATURES.md)"**
   - **Issue:** Lists features already completed (keyboard shortcuts, progress dashboard)
   - **Actual:** Should reference v1.5.0+ roadmap
   - **Why:** Outdated planned features list

4. **"Project Status → Current Milestone: v1.1.0"**
   - **Issue:** Shows v1.1.0 as current
   - **Actual:** v1.4.0 is current, v1.5.0 is next
   - **Why:** Not updated after multiple releases

5. **"Project Status → Completed" checklist**
   - **Missing:** Dashboard implementation
   - **Missing:** UI polish work (Sessions 36-37)
   - **Missing:** Backend error handling
   - **Why:** Checklist frozen at v1.1.0

6. **"Project Status → In Progress"**
   - **Issue:** Lists "Documentation overhaul" and "Feature roadmap prioritization"
   - **Actual:** These are done, now working on v1.5.0 planning
   - **Why:** Status not updated

7. **"Project Status → Next Up" checklist**
   - **Issue:** Lists items that are now completed
   - **Actual:** Should show v1.5.0 roadmap items
   - **Why:** Checklist not synced with actual progress

8. **"Known Limitations" list**
   - **Potentially outdated:** May need review for accuracy
   - **Why:** Written months ago, some may no longer apply

---

## Summary

### High Priority Updates Needed:

1. **FEATURES.md** - Most critical (roadmap completely out of sync)
   - Move v1.3.0 and v1.4.0 to "Completed" section
   - Update priority matrix
   - Rewrite "Next Steps" for v1.5.0

2. **PROJECT_OVERVIEW.md** - Version metadata and status
   - Update version to v1.4.0
   - Update milestone status
   - Update completed features list

3. **ARCHITECTURE.md** - Technical details
   - Add new components to structure diagrams
   - Update WebSocket contract with `race_error`
   - Document new architectural patterns (InfoModal, ESC handler)

### Recommended Approach:

**Session 38 or 39:** Allocate 1-2 hours for documentation cleanup before starting v1.5.0 implementation. This ensures:
- Clear starting point for v1.5.0
- Accurate historical record
- Correct reference for future development

---

**Note:** None of these issues affect functionality - they're purely documentation debt. The code is accurate; the docs just need to catch up.