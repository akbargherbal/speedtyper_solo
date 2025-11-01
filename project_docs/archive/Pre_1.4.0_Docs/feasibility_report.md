# Technical Feasibility Report: Speedtyper Local v1.3.0-next

**Prepared by:** Technical Feasibility Consultant  
**Date:** November 1, 2025  
**Project:** Speedtyper Local Evolution Features

---

## Executive Summary

| Feature                           | Feasibility | Complexity | Risk        | Priority             |
| --------------------------------- | ----------- | ---------- | ----------- | -------------------- |
| **3.1: Stable User Identity**     | 🟢 Green    | Low        | Low         | P0 (Foundation)      |
| **3.2: Progress Dashboard**       | 🟢 Green    | Medium     | Low         | P2 (Depends on 3.1)  |
| **3.3A: Character Skipping**      | 🟡 Yellow   | Medium     | Medium      | P1 (High Value)      |
| **3.3B: AST-Based Node Skipping** | 🟡 Yellow   | High       | Medium-High | P3 (Advanced)        |
| **3.4: Syntax Highlighting**      | 🔴 Red      | High       | High        | P4 (Requires Rework) |

### Critical Dependencies

1. **Feature 3.1 MUST be implemented first** - All other features depend on stable user identity for meaningful data
2. **Feature 3.3A is a prerequisite for 3.3B** - Character skipping logic must be proven before AST extension
3. **Feature 3.4 requires architectural changes** - Current Highlight.js approach is fundamentally flawed

### Overall Assessment

**The project is feasible with phased implementation.** Features 3.1, 3.2, and 3.3A are straightforward with manageable risks. Features 3.3B and 3.4 require careful architectural planning and represent higher technical complexity.

---

## Feature 3.1: Stable User Identity

**Feasibility Rating**: 🟢 **Green**  
**Complexity**: **Low**  
**Estimated Risk**: **Low**

### Technical Approach

**Recommended Pattern: Application Bootstrap Initialization**

The cleanest approach is to create or retrieve the "Local Super User" during application startup, **before** any middleware runs:

1. **Database Seeding on First Launch**

   - Add a `LocalUserService` that checks for existence of a user with a special identifier (e.g., `username: 'local-user'` or `legacyId: 'LOCAL_SUPER_USER'`)
   - If not found, create it during app bootstrap in `main.ts` using `app.get(LocalUserService).ensureLocalUser()`
   - Store the user ID in a singleton service for fast lookup

2. **Modify Guest Middleware**

   - Replace `User.generateAnonymousUser()` with `LocalUserService.getLocalUser()`
   - Remove UUID generation - always return the same persistent user entity
   - Session management remains unchanged (still stored via `TypeormStore`)

3. **Integration Point**
   - Modify `src/middlewares/guest-user.ts` to inject `LocalUserService`
   - Update `src/main.ts` bootstrap sequence to call initialization

**Key Libraries/Patterns:**

- **NestJS Lifecycle Hooks**: Use `OnModuleInit` interface for initialization
- **TypeORM Repository Pattern**: Standard `findOneBy()` and `save()` operations
- **Singleton Pattern**: Cache the local user entity to avoid repeated DB queries

### Primary Risks

**Risk 1: Database Migration Impact**

- **Description**: If the user table schema changes, existing local user might become orphaned
- **Mitigation**: Use the `legacyId` column (already nullable and indexed) as the stable identifier. It's designed for exactly this purpose.

**Risk 2: Multi-Environment Conflicts**

- **Description**: Running multiple instances (dev/prod) might create identity confusion
- **Mitigation**: Not applicable - this is explicitly a local-only tool. Each SQLite database is isolated.

### Unknown Factors

- ✅ None - the architecture is straightforward and well-supported by existing patterns

### Dependencies

- **None** - This is the foundational feature

### Implementation Notes

```typescript
// Recommended approach structure (NOT implementation code):
// 1. Create LocalUserService with ensureLocalUser() method
// 2. Call during bootstrap: await app.get(LocalUserService).ensureLocalUser()
// 3. Modify guestUserMiddleware to use: req.session.user = await localUserService.getLocalUser()
```

---

## Feature 3.2: User Progress Dashboard

**Feasibility Rating**: 🟢 **Green**  
**Complexity**: **Medium**  
**Estimated Risk**: **Low**

### Technical Approach

**Recommended Pattern: REST API + Client-Side Aggregation**

This is a standard data visualization feature with no architectural surprises:

1. **Backend API Endpoints**

   - Create `DashboardController` with endpoints:
     - `GET /api/dashboard/stats` → High-level KPIs (avg WPM, accuracy, total races)
     - `GET /api/dashboard/trends` → Time-series data for charts
     - `GET /api/dashboard/by-language` → Language breakdown
     - `GET /api/dashboard/recent` → Last N race results
   - Implement in `DashboardService` using TypeORM query builder for aggregations

2. **Frontend Dashboard Page**

   - Create new route: `/pages/dashboard.tsx`
   - Use existing state management pattern (Zustand store)
   - Leverage existing `ResultsChart.tsx` component as foundation

3. **Data Visualization**
   - **Recharts** (already in dependencies) for performance-over-time charts
   - Simple table components for language breakdown and recent history
   - Use existing styling patterns (Tailwind utility classes)

**Key Libraries/Patterns:**

- **TypeORM Query Builder**: For efficient aggregations (`groupBy`, `select AVG()`)
- **Recharts**: Already available - use `LineChart` for trends
- **React Query (if available) or standard fetch**: For data loading patterns
- **Zustand**: For dashboard state management (follow existing `game-store.ts` pattern)

### Primary Risks

**Risk 1: Performance with Large Datasets**

- **Description**: If a user has thousands of races, aggregation queries might be slow
- **Mitigation**:
  - Add database indexes on `result.userId` and `result.createdAt`
  - Implement pagination for recent history
  - Use SQLite's built-in aggregation functions (they're fast for single-user queries)

**Risk 2: Data Accuracy During Transition**

- **Description**: Historical data might be associated with ephemeral guest users
- **Mitigation**:
  - Provide a one-time migration script to reassign old results to the local user
  - Use a SQL script: `UPDATE result SET userId = 'LOCAL_USER_ID' WHERE userId IN (SELECT id FROM users WHERE isAnonymous = true)`

### Unknown Factors

**Question 1**: Should the dashboard be accessible during an active race, or only from a dedicated route?

- **Investigation**: Check if there are performance implications of loading dashboard data while WebSocket is active
- **Recommendation**: Make it a separate route initially for simplicity

### Dependencies

- **Requires Feature 3.1**: Absolutely critical - without stable identity, dashboard data is meaningless

---

## Feature 3.3A: Configurable Character Skipping

**Feasibility Rating**: 🟡 **Yellow** (Moderate Confidence)  
**Complexity**: **Medium**  
**Estimated Risk**: **Medium**

### Technical Approach

**Recommended Pattern: Preprocessing + Skip Range Communication**

The core challenge is **synchronizing skip logic between frontend and backend** without introducing race conditions:

1. **Configuration Layer**

   - Create `skip-config.json` in project root:
     ```json
     {
       "skipLeadingSpaces": true,
       "skipTrailingSpaces": false,
       "customSkipPatterns": []
     }
     ```
   - Load via `ConfigModule` in NestJS (follow existing `parser.config.json` pattern)

2. **Backend: Preprocessing Service**

   - Create `SkipRangeCalculator` service that analyzes challenge code
   - Generate array of "skip ranges": `[{start: 10, end: 15, reason: "leading-spaces"}]`
   - **Critical**: Attach skip ranges to the race entity when race is created
   - Emit skip ranges to frontend via WebSocket in `createdRace` event

3. **Frontend: Enhanced Index Management**

   - Modify `code-store.ts` to store skip ranges: `skipRanges: SkipRange[]`
   - Enhance `_getForwardOffset()` to check if `currentIndex` is in a skip range
   - If in skip range, jump to `range.end + 1` instead of incrementing by 1
   - **Critical**: Frontend uses backend-provided ranges, doesn't calculate independently

4. **Backend: Validation Adjustment**
   - Modify `KeystrokeValidationService.getStrippedCode()` to apply same skip logic
   - Use the race's stored skip ranges to strip skipped characters
   - Validation continues to work as-is (compares user input to stripped code)

**Key Libraries/Patterns:**

- **NestJS ConfigModule**: For loading configuration file
- **Array-based Skip Ranges**: Simple `{start, end}` objects - efficient for lookup
- **Binary Search (optional)**: If skip ranges become numerous, use binary search for O(log n) lookup

### Primary Risks

**Risk 1: Frontend-Backend Desynchronization**

- **Description**: If frontend and backend calculate skip ranges differently, validation will fail
- **Mitigation**:
  - Backend is **single source of truth** - frontend receives pre-calculated ranges
  - Add extensive logging to detect mismatches during development
  - Include skip ranges in WebSocket payload for `createdRace` event

**Risk 2: Caret Position UX Confusion**

- **Description**: User might be confused when caret "jumps" over skipped characters
- **Mitigation**:
  - Visual indicator: render skipped characters in a distinct style (e.g., very faint gray)
  - Smooth caret animation (leverage existing `SmoothCaret.tsx` component)
  - User testing to validate UX

**Risk 3: Edge Cases in Skip Logic**

- **Description**: Mixed tabs/spaces, unusual whitespace patterns might break skip detection
- **Mitigation**:
  - Reuse existing `getFormattedText()` normalization from `parser.service.ts`
  - Comprehensive test suite for edge cases (already exists for parser service)

### Unknown Factors

**Question 1**: Should skip ranges be recalculated on challenge refresh, or cached?

- **Investigation**: Check if `onRefreshChallenge` in `race.gateway.ts` generates a new challenge or reuses
- **Recommendation**: Recalculate on each new challenge to ensure consistency

**Question 2**: What happens if user manually positions cursor (via mouse) in a skip range?

- **Investigation**: Test if `HiddenCodeInput.tsx` allows cursor repositioning
- **Recommendation**: Disable mouse cursor positioning (keep keyboard-only UX)

### Dependencies

- **None** - This can be implemented independently
- **Synergy with 3.1**: Better to implement after stable identity for meaningful testing data

---

## Feature 3.3B: AST-Based Skippable Nodes (Comments)

**Feasibility Rating**: 🟡 **Yellow** (Moderate Confidence)  
**Complexity**: **High**  
**Estimated Risk**: **Medium-High**

### Technical Approach

**Recommended Pattern: Tree-sitter Integration with Skip Range Extension**

This builds directly on Feature 3.3A's architecture but adds AST analysis:

1. **Parser Service Enhancement**

   - Extend `parser.service.ts` with new method: `calculateSkipRanges(code: string, config: SkipConfig)`
   - Use existing `findCommentNodes()` method (already implemented for comment removal)
   - Instead of removing comments, convert comment node positions to skip ranges
   - Add configuration for node types: `skipComments: true, skipStringLiterals: false`

2. **Configuration Extension**

   - Extend `skip-config.json`:
     ```json
     {
       "skipLeadingSpaces": true,
       "skipASTNodes": {
         "comments": true,
         "stringLiterals": false,
         "docstrings": true
       }
     }
     ```

3. **Integration with 3.3A**

   - `SkipRangeCalculator` calls both:
     - Character-based skip detection (spaces)
     - AST-based skip detection (comments)
   - Merge and sort skip ranges (handle overlaps)
   - Emit unified skip range array to frontend

4. **Rendering Enhancement**
   - Comments still **visible** in `CodeArea.tsx` but styled differently
   - Apply CSS class to skipped nodes: `opacity-40 italic` (visual context)
   - Caret jumps over them seamlessly

**Key Libraries/Patterns:**

- **Tree-sitter**: Already deeply integrated - leverage existing parsing infrastructure
- **Range Merging Algorithm**: Use interval merging to handle overlapping skip ranges
- **Configuration-Driven**: Feature can be toggled without code changes

### Primary Risks

**Risk 1: Language-Specific Comment Syntax**

- **Description**: Different languages have different comment node types (`comment` vs `line_comment` vs `block_comment`)
- **Mitigation**:
  - Leverage existing `NodeTypes` enum pattern in `parser.service.ts`
  - Map comment types per language (follow existing language parser factory pattern)
  - Test with JavaScript, Python, TypeScript (the three main languages in snippets)

**Risk 2: Inline Comments Breaking Line Flow**

- **Description**: `const x = 5; // comment` - skipping the comment might confuse users
- **Mitigation**:
  - Only skip comments that are on their own line (check `node.startPosition.column === 0`)
  - Inline comments remain typeable (or make this configurable)

**Risk 3: AST Parsing Errors**

- **Description**: If code has syntax errors, Tree-sitter might misidentify comment boundaries
- **Mitigation**:
  - Parser already handles errors gracefully (existing error handling in `parseTrackedNodes`)
  - Fall back to no skipping if AST parsing fails
  - Log errors for debugging

**Risk 4: Performance with Large Files**

- **Description**: Re-parsing AST for every challenge might add latency
- **Mitigation**:
  - AST parsing already happens during challenge import (see `local-import-runner.ts`)
  - Cache skip ranges in challenge entity (add new column: `skipRanges: JSON`)
  - Only parse once during import, not on every race creation

### Unknown Factors

**Question 1**: Should docstrings be treated differently than comments?

- **Investigation**: Test user preference - docstrings provide function context
- **Recommendation**: Make docstrings separately configurable (default: keep them typeable)

**Question 2**: How to handle multi-line comment blocks?

- **Investigation**: Check if users prefer typing opening `/*` and skipping body, or skipping entirely
- **Recommendation**: Skip entire block including delimiters for consistency

### Dependencies

- **Requires Feature 3.3A**: This is an extension of the character skipping architecture
- **Strongly recommended after 3.3A validation**: Prove the skip range system works before adding complexity

---

## Feature 3.4: Dynamic Syntax Highlighting

**Feasibility Rating**: 🔴 **Red** (Requires Major Rework)  
**Complexity**: **High**  
**Estimated Risk**: **High**

### Technical Approach

**CRITICAL FINDING**: The current Highlight.js implementation is **architecturally broken** for real-time typing:

**Current Implementation Problems:**

1. `highlightjs.highlightElement(typedRef.current)` runs on **every keystroke**
2. Highlight.js re-tokenizes the entire typed text (O(n) complexity per keystroke)
3. DOM manipulation happens on every render (performance killer)
4. Only applies to typed characters (Post-Typed model) - breaks visual context

**Recommended Approach: Pre-Tokenized Overlay System**

This requires abandoning Highlight.js in favor of a custom solution:

1. **Backend: Pre-Tokenization Service**

   - Create `SyntaxTokenizer` service using Tree-sitter (NOT Highlight.js)
   - When challenge is created, tokenize entire code: `[{type: 'keyword', start: 0, end: 6, text: 'const'}]`
   - Store tokens in race entity or cache (avoid re-tokenizing on every keystroke)
   - Emit tokens to frontend via WebSocket with `createdRace` event

2. **Frontend: Token-Based Rendering**

   - Replace `TypedChars.tsx` component with `TokenizedChars.tsx`
   - Map each character to its token type based on pre-calculated ranges
   - Apply syntax color via inline styles or CSS classes
   - Overlay feedback colors (correct/incorrect) on top of syntax colors

3. **Dual-Color System**

   - **Syntax Layer** (base): `color: token.color` (keyword = blue, string = green, etc.)
   - **Feedback Layer** (overlay):
     - Correct: Apply subtle opacity filter or border
     - Incorrect: `background: red-500/20` (semi-transparent overlay)
     - Untyped: `opacity: 0.4`

4. **Rendering Strategy: Pre-Typed Model Recommended**
   - Show full syntax highlighting from the start
   - User sees the "target" they're aiming for
   - Overlay feedback colors as they type
   - **Why better**: Provides visual context, helps users anticipate syntax

**Alternative: Hybrid Post-Typed with Lookahead**

- Show untyped code in syntax colors (faded)
- Typed code transitions to brighter syntax colors + feedback
- Best of both worlds but more complex to implement

**Key Libraries/Patterns:**

- **Tree-sitter**: Use for tokenization instead of Highlight.js
- **Token Mapping**: Build a lookup table `[charIndex] -> tokenType`
- **CSS Custom Properties**: Use for dynamic color application
- **React.memo**: Heavily optimize rendering to avoid re-renders

### Primary Risks

**Risk 1: Tokenization Accuracy**

- **Description**: Tree-sitter tokenization might not match user expectations (e.g., JSX syntax)
- **Mitigation**:
  - Tree-sitter parsers are language-specific and mature
  - Fallback to simpler regex-based tokenization if Tree-sitter fails
  - Make syntax highlighting optional (keep it as a toggle)

**Risk 2: Performance Degradation**

- **Description**: Rendering thousands of individually styled spans might be slow
- **Mitigation**:
  - Use virtualization if code exceeds 500 lines (unlikely given MAX_NODE_LENGTH filters)
  - Batch character updates using React's concurrent features
  - Profile with React DevTools before committing to architecture

**Risk 3: Color Contrast Issues**

- **Description**: Overlay feedback colors might conflict with syntax colors (readability)
- **Mitigation**:
  - Use HSL color space for easy brightness adjustments
  - Incorrect characters: strong background overlay (overrides syntax color)
  - Correct characters: subtle border or underline (preserves syntax color)
  - Extensive testing with different color schemes

**Risk 4: Maintenance Burden**

- **Description**: Custom tokenization system adds significant code complexity
- **Mitigation**:
  - Create comprehensive test suite for token rendering
  - Document token-to-color mapping clearly
  - Consider if the feature is worth the complexity (UX testing needed)

### Unknown Factors

**Question 1**: Will syntax highlighting actually improve typing speed/accuracy?

- **Investigation**: User testing is **essential** before committing to this feature
- **Recommendation**: Implement a simple prototype with Pre-Typed model and test with 5-10 users

**Question 2**: How to handle multi-line tokens (e.g., template literals)?

- **Investigation**: Check Tree-sitter's tokenization of multi-line constructs
- **Recommendation**: Break multi-line tokens into per-line segments for simpler rendering

**Question 3**: Should different languages have different color schemes?

- **Investigation**: Check if users want consistency across languages or language-specific themes
- **Recommendation**: Start with single theme (GitHub Dark), make themeable later if demanded

### Dependencies

- **Should be last feature implemented**: Requires stable foundation
- **User validation critical**: Don't implement without confirming user demand

### Alternative Consideration

**Recommendation: Postpone or Descope**

Given the high complexity and uncertain value, consider:

1. **Keep current toggle**: Fix performance issues but keep simple Post-Typed model
2. **Use simpler highlighter**: Try Prism.js (lighter weight) instead of Highlight.js
3. **Make it a v1.4.0 feature**: Focus on 3.1-3.3B first, revisit after user feedback

---

## Implementation Sequencing Recommendation

### Phase 1 (Foundation) - 2-3 weeks

**Features: 3.1 → 3.2**

1. **Week 1**: Implement Feature 3.1 (Stable User Identity)

   - Day 1-2: LocalUserService + bootstrap initialization
   - Day 3-4: Modify guest middleware + testing
   - Day 5: Database migration script for existing data

2. **Week 2-3**: Implement Feature 3.2 (Dashboard)
   - Week 2: Backend API endpoints + aggregation logic
   - Week 3: Frontend dashboard page + charts

**Rationale**: Establish foundational identity system and give users immediate value (progress tracking) before tackling complex features.

---

### Phase 2 (Enhancement) - 3-4 weeks

**Features: 3.3A**

3. **Week 4-5**: Implement Feature 3.3A (Character Skipping)
   - Week 4: Backend skip range calculation + config system
   - Week 5: Frontend skip logic + WebSocket integration
   - Day 1-2 of Week 6: Extensive testing + edge case handling

**Rationale**: This feature has immediate UX value (auto-handling spaces) and proves the skip range architecture before investing in AST complexity.

---

### Phase 3 (Advanced) - 2-3 weeks

**Features: 3.3B**

4. **Week 6-7**: Implement Feature 3.3B (AST-Based Skipping)
   - Week 6: Extend parser service + comment node detection
   - Week 7: Integration with 3.3A + skip range merging
   - Testing with multi-language snippets

**Rationale**: Builds on proven skip range system. Delivers significant value for users who want to focus on code structure rather than comments.

---

### Phase 4 (Polish / Optional) - 4-6 weeks

**Features: 3.4**

5. **Week 8-9**: **User Research & Prototype**

   - Create minimal viable syntax highlighting prototype
   - Test with 5-10 users - measure impact on speed/accuracy
   - **Decision point**: Proceed only if data supports value

6. **Week 10-13** (if proceeding): Implement Feature 3.4
   - Week 10: Backend tokenization service
   - Week 11-12: Frontend token rendering system
   - Week 13: Performance optimization + polish

**Rationale**: De-risk this feature by validating user demand first. High complexity warrants caution. Can be deferred to v1.4.0 if needed.

---

## Critical Unknowns & Recommended Investigations

### 1. User Identity Data Migration

**Unknown**: How much historical data exists from ephemeral guest users?  
**Investigation Required**:

```bash
sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM result;"
sqlite3 speedtyper-local.db "SELECT COUNT(DISTINCT userId) FROM result;"
```

**Why It Matters**: Determines if data migration script is necessary or if fresh start is acceptable.

---

### 2. WebSocket Payload Size Limits

**Unknown**: What is the maximum reasonable size for skip ranges array in WebSocket events?  
**Investigation Required**:

- Test with challenge containing 50+ skip ranges (e.g., heavily commented file)
- Measure WebSocket message size and latency
  **Why It Matters**: Might need to implement range compression if payload becomes large.

---

### 3. Highlight.js Performance Baseline

**Unknown**: Exact performance impact of current syntax highlighting on different machines  
**Investigation Required**:

- Profile with React DevTools on low-end hardware
- Measure frame rate during typing with highlighting enabled
  **Why It Matters**: Determines urgency of Feature 3.4 rework vs. keeping current implementation.

---

### 4. Tree-sitter Comment Node Coverage

**Unknown**: Does Tree-sitter reliably detect all comment types across JS/TS/Python?  
**Investigation Required**:

```bash
# Test parser with heavily commented files
cd packages/back-nest
npm run command local-import -- --test-comments
```

**Why It Matters**: Validates feasibility of Feature 3.3B before implementation begins.

---

### 5. User Preference: Skip Behavior

**Unknown**: Do users want skipped characters visible but untyped, or hidden entirely?  
**Investigation Required**:

- Create mockups of both approaches
- Survey 5-10 target users
  **Why It Matters**: Affects UX design for Features 3.3A/B and user adoption rate.

---

## Risk Mitigation Strategies

### General Principles

1. **Preserve Core Engine**: Never modify `keystroke-validator.service.ts` validation logic directly - extend it
2. **Backend as Source of Truth**: All skip ranges, tokens, and validation state originate from backend
3. **Feature Flags**: Implement each feature behind a toggle for easy rollback
4. **Comprehensive Logging**: Add debug logging to all new services for troubleshooting
5. **Incremental Rollout**: Test each feature in isolation before combining

### Specific Mitigations

**For Feature 3.3A/B (Skipping)**:

- Create test suite with 50+ edge cases before production use
- Add "skip visualization mode" for debugging (highlight skipped characters in bright yellow)
- Implement escape hatch: "Disable all skipping" button in settings

**For Feature 3.4 (Syntax Highlighting)**:

- Keep current Highlight.js implementation as fallback
- A/B test new tokenization system with 50% of users
- Monitor performance metrics (frame rate, input lag) in production

---

## Final Recommendations

### Strongly Recommended

✅ **Feature 3.1** - No-brainer foundational requirement  
✅ **Feature 3.2** - High value, low risk, enables long-term engagement  
✅ **Feature 3.3A** - Significant UX improvement, manageable complexity

### Proceed with Caution

⚠️ **Feature 3.3B** - High value for advanced users, but validate comment skipping UX first

### Requires Validation

🔍 **Feature 3.4** - Do NOT implement without user research. Current implementation is broken, and new approach is high-effort with uncertain ROI.

---

## Conclusion

This project is **feasible and well-architected**. The existing codebase provides excellent foundations:

- Clean separation between validation (backend) and rendering (frontend)
- Mature parser infrastructure (Tree-sitter)
- Pragmatic state management (Zustand)

The sequencing recommendation prioritizes **delivering value incrementally** while minimizing risk. Features 3.1-3.3A can be delivered with high confidence. Feature 3.3B requires careful UX consideration. Feature 3.4 should be treated as a research project, not a committed deliverable.

**Estimated Total Timeline**: 8-10 weeks for Features 3.1, 3.2, 3.3A, 3.3B (excluding 3.4)
