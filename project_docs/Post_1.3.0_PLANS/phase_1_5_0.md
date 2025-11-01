# Phase 1.5.0: Smart Skipping - Basic

**Duration:** 2-3 weeks  
**Risk Level:** 🟡 Medium  
**Rollback Target:** v1.4.0

---

## Context

**What We're Building:**

- Character-based skip ranges (leading spaces, trailing spaces, consecutive spaces)
- Backend skip range calculation service
- Frontend cursor auto-advancement over skipped characters
- Configuration system for skip rules

**Why This Phase Matters:**

- Proves skip concept before investing in complex AST parsing (v1.5.1)
- Improves typing practice focus (skip boilerplate indentation)
- Foundation for advanced AST-based skipping

**Dependencies:**

- Builds on: v1.4.0 (stable user identity for preferences)
- Enables: v1.5.1 (AST skip extends this character skip system)

**What v1.5.1 Will Add:** AST-based node skipping (comments, docstrings) by merging with character skip ranges from this phase

---

## Phase 0: Pre-Implementation Investigation

**Duration:** Day 1, 2-3 hours

### 0.1: Study Keystroke Validation (60 min)

```bash
cat packages/back-nest/src/races/services/keystroke-validator.service.ts
cat packages/back-nest/src/races/services/add-keystroke.service.ts
```

**Key Questions to Answer:**

- How does validation compare typed text to challenge code?
- Where is `expectedCharacter` determined?
- Can we inject "skip logic" without breaking validation?
- Does validation happen character-by-character or in batches?

**Document Findings:** Create notes on validation flow

---

### 0.2: Study Frontend Index Management (60 min)

```bash
cat packages/webapp-next/modules/play2/state/code-store.ts
grep -A 20 "_getForwardOffset" packages/webapp-next/modules/play2/state/code-store.ts
```

**Key Questions to Answer:**

- How does `currentIndex` advance after keystrokes?
- Where does cursor jump on correct/incorrect input?
- Can we modify `_getForwardOffset()` to skip ranges?
- Are there other places that manipulate index?

**Document Findings:** List all index manipulation points

---

### 0.3: WebSocket Payload Analysis (30 min)

```bash
cat packages/back-nest/src/races/race.gateway.ts | grep -A 10 "emit('challenge_selected'"
```

**Key Questions to Answer:**

- What's in `Challenge` object sent to frontend?
- Can we add `skipRanges: SkipRange[]` field without breaking client?
- Is payload size a concern?

**Decision Gate:** If investigation reveals major blockers, reassess approach before proceeding

---

## Phase 1: Backend Skip Range Calculation

**Duration:** Days 2-4, 4-6 hours

### 1.1: Create Configuration System (60 min)

**File:** `packages/back-nest/skip-config.json`

```json
{
  "version": "1.0.0",
  "enabled": true,
  "filters": {
    "skipLeadingSpaces": true,
    "skipTrailingSpaces": false,
    "skipMultipleConsecutiveSpaces": true,
    "minConsecutiveSpaces": 2
  }
}
```

**File:** `packages/back-nest/src/challenges/dto/skip-config.dto.ts`

```typescript
export interface SkipConfig {
  version: string;
  enabled: boolean;
  filters: {
    skipLeadingSpaces: boolean;
    skipTrailingSpaces: boolean;
    skipMultipleConsecutiveSpaces: boolean;
    minConsecutiveSpaces: number;
  };
}

export interface SkipRange {
  start: number; // Inclusive
  end: number; // Inclusive
  reason: string; // 'leading-spaces', 'trailing-spaces', etc.
}
```

---

### 1.2: Create Skip Range Calculator Service (120 min)

**File:** `packages/back-nest/src/challenges/services/skip-range-calculator.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { SkipConfig, SkipRange } from "../dto/skip-config.dto";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class SkipRangeCalculatorService {
  private config: SkipConfig;

  constructor() {
    // Load config on initialization
    const configPath = path.join(__dirname, "../../../skip-config.json");
    this.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  calculateSkipRanges(code: string): SkipRange[] {
    if (!this.config.enabled) {
      return [];
    }

    const ranges: SkipRange[] = [];
    const lines = code.split("\n");
    let absoluteIndex = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip leading spaces
      if (this.config.filters.skipLeadingSpaces) {
        const leadingMatch = line.match(/^(\s+)/);
        if (leadingMatch) {
          const leadingSpaceCount = leadingMatch[1].length;
          ranges.push({
            start: absoluteIndex,
            end: absoluteIndex + leadingSpaceCount - 1,
            reason: "leading-spaces",
          });
        }
      }

      // Skip trailing spaces
      if (this.config.filters.skipTrailingSpaces) {
        const trailingMatch = line.match(/(\s+)$/);
        if (trailingMatch) {
          const trailingStart = line.length - trailingMatch[1].length;
          ranges.push({
            start: absoluteIndex + trailingStart,
            end: absoluteIndex + line.length - 1,
            reason: "trailing-spaces",
          });
        }
      }

      // Skip multiple consecutive spaces (in middle of line)
      if (this.config.filters.skipMultipleConsecutiveSpaces) {
        const minSpaces = this.config.filters.minConsecutiveSpaces;
        const regex = new RegExp(`(?<!^)(\\s{${minSpaces},})(?!$)`, "g");
        let match;

        while ((match = regex.exec(line)) !== null) {
          ranges.push({
            start: absoluteIndex + match.index,
            end: absoluteIndex + match.index + match[1].length - 1,
            reason: "consecutive-spaces",
          });
        }
      }

      // Move to next line (account for \n character)
      absoluteIndex += line.length + 1;
    }

    return this.mergeOverlappingRanges(ranges);
  }

  private mergeOverlappingRanges(ranges: SkipRange[]): SkipRange[] {
    if (ranges.length === 0) return [];

    // Sort by start index
    const sorted = ranges.sort((a, b) => a.start - b.start);
    const merged: SkipRange[] = [];
    let current = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];

      if (next.start <= current.end + 1) {
        // Overlapping or adjacent - merge
        current = {
          start: current.start,
          end: Math.max(current.end, next.end),
          reason: `${current.reason},${next.reason}`,
        };
      } else {
        merged.push(current);
        current = next;
      }
    }

    merged.push(current);
    return merged;
  }

  getConfig(): SkipConfig {
    return this.config;
  }

  reloadConfig(): void {
    const configPath = path.join(__dirname, "../../../skip-config.json");
    this.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
}
```

---

### 1.3: Register Service in Module (15 min)

**File:** `packages/back-nest/src/challenges/challenges.module.ts`

```typescript
import { SkipRangeCalculatorService } from "./services/skip-range-calculator.service";

@Module({
  // ... existing
  providers: [
    // ... existing services
    SkipRangeCalculatorService,
  ],
  exports: [
    // ... existing
    SkipRangeCalculatorService,
  ],
})
export class ChallengesModule {}
```

---

### 1.4: Integrate with Race Creation (90 min)

**File:** `packages/back-nest/src/races/services/race-manager.service.ts`

**Add to class:**

```typescript
import { SkipRangeCalculatorService } from "../../challenges/services/skip-range-calculator.service";

@Injectable()
export class RaceManagerService {
  constructor(
    // ... existing dependencies
    private skipRangeCalculator: SkipRangeCalculatorService,
  ) {}

  // Modify or add method that handles challenge selection
  async selectChallengeForRace(settings: any): Promise<any> {
    const challenge = await this.selectRandomChallenge(settings);

    // Calculate skip ranges
    const skipRanges = this.skipRangeCalculator.calculateSkipRanges(
      challenge.content,
    );

    // Return enriched challenge
    return {
      ...challenge,
      skipRanges,
    };
  }
}
```

**File:** `packages/back-nest/src/races/race.gateway.ts`

**Modify challenge_selected emission:**

```typescript
// When emitting challenge to client
socket.emit("challenge_selected", {
  ...challenge,
  skipRanges: challenge.skipRanges || [],
});
```

---

### 1.5: Test Backend in Isolation (45 min)

**Create test endpoint:**

**File:** `packages/back-nest/src/challenges/challenges.controller.ts`

```typescript
import { SkipRangeCalculatorService } from "./services/skip-range-calculator.service";

@Controller("api/challenges")
export class ChallengesController {
  constructor(
    // ... existing
    private skipRangeCalculator: SkipRangeCalculatorService,
  ) {}

  // TEMPORARY - for testing
  @Get(":id/skip-ranges")
  async getSkipRanges(@Param("id") id: string) {
    const challenge = await this.challengesService.findOne(id);
    const skipRanges = this.skipRangeCalculator.calculateSkipRanges(
      challenge.content,
    );
    return { skipRanges };
  }
}
```

**Test:**

```bash
npm run start:dev

# Get a challenge ID from database
sqlite3 packages/back-nest/speedtyper-local.db "SELECT id FROM challenge LIMIT 1;"

# Test endpoint
curl http://localhost:1337/api/challenges/CHALLENGE_ID/skip-ranges
```

**Expected Output:**

```json
{
  "skipRanges": [
    { "start": 0, "end": 3, "reason": "leading-spaces" },
    { "start": 45, "end": 48, "reason": "leading-spaces" }
  ]
}
```

**Verify:** Manual check against actual challenge content

---

## Phase 2: Frontend Skip Logic

**Duration:** Days 5-7, 4-6 hours

### 2.1: Extend Code Store (60 min)

**File:** `packages/webapp-next/modules/play2/state/code-store.ts`

**Add to interface:**

```typescript
interface SkipRange {
  start: number;
  end: number;
  reason: string;
}

interface CodeState {
  // ... existing fields
  skipRanges: SkipRange[];
}
```

**Add methods:**

```typescript
// In the store implementation
skipRanges: [],

setSkipRanges(ranges: SkipRange[]) {
  this.skipRanges = ranges;
},

isInSkipRange(index: number): boolean {
  return this.skipRanges.some(
    range => index >= range.start && index <= range.end
  );
},

// Add helper to get next non-skipped index
getNextNonSkippedIndex(fromIndex: number): number {
  let nextIndex = fromIndex;

  while (this.isInSkipRange(nextIndex) && nextIndex < this.code.length) {
    nextIndex++;
  }

  return nextIndex;
},
```

---

### 2.2: Modify Index Advancement Logic (120 min)

**File:** `packages/webapp-next/modules/play2/state/code-store.ts`

**Find and modify `_getForwardOffset()` or equivalent:**

```typescript
// BEFORE (example - adjust to actual code structure)
_getForwardOffset() {
  return this.currentIndex + 1;
}

// AFTER
_getForwardOffset() {
  let nextIndex = this.currentIndex + 1;

  // Jump over skip ranges
  nextIndex = this.getNextNonSkippedIndex(nextIndex);

  return nextIndex;
}
```

**CRITICAL:** Search for ALL places that increment currentIndex:

```bash
grep -n "currentIndex.*++" packages/webapp-next/modules/play2/state/code-store.ts
grep -n "currentIndex.*=" packages/webapp-next/modules/play2/state/code-store.ts
```

**Update each location** to use skip-aware logic

---

### 2.3: Update WebSocket Listener (30 min)

**File:** `packages/webapp-next/modules/play2/services/Game.ts`

**Modify challenge_selected handler:**

```typescript
this.socket.subscribe("challenge_selected", (challenge: any) => {
  codeStore.setCode(challenge.content);
  codeStore.setSkipRanges(challenge.skipRanges || []);
  // ... existing logic
});
```

**Add TypeScript interface:**

**File:** `packages/webapp-next/modules/play2/types.ts` (or appropriate location)

```typescript
export interface Challenge {
  id: string;
  content: string;
  language: string;
  skipRanges?: SkipRange[];
  // ... other fields
}

export interface SkipRange {
  start: number;
  end: number;
  reason: string;
}
```

---

### 2.4: Visual Indicator for Skipped Characters (60 min)

**File:** `packages/webapp-next/modules/play2/components/UntypedChars.tsx`

**Modify character rendering:**

```typescript
// Add skip range check
const isSkipped = codeStore.isInSkipRange(index);

// Apply different styling
const charClassName = clsx(
  'char',
  isSkipped && 'opacity-20 italic text-gray-600', // Very faint
  !isSkipped && 'opacity-60' // Normal untyped
);

return <span className={charClassName}>{char}</span>;
```

**Tailwind classes** (add to component or globals.css):

```css
.char-skipped {
  opacity: 0.2;
  font-style: italic;
  color: #6b7280; /* gray-500 */
}
```

---

## Phase 3: Integration & Testing

**Duration:** Days 8-9, 3-4 hours

### 3.1: End-to-End Test (90 min)

**Test Workflow:**

```bash
npm run dev
```

**In Browser:**

1. Select Python or TypeScript challenge (has indentation)
2. Start race
3. Begin typing
4. **Verify:**
   - [ ] Cursor automatically jumps over leading spaces
   - [ ] Skipped spaces appear very faint
   - [ ] Typing continues normally after skip
   - [ ] Can complete snippet
5. Check result
   - [ ] WPM calculated correctly
   - [ ] Accuracy reflects only typed characters

**Backend Logs Check:**

```bash
# Should see skip ranges in console
grep "skipRanges" logs/backend.log
```

---

### 3.2: Edge Case Testing (60 min)

**Test Scenarios:**

**1. Empty Lines (only spaces):**

```python
def hello():

    return "world"
```

Expected: Skip entire empty line indentation

**2. Mixed Tabs/Spaces:**

```javascript
function test() {
\t\treturn true;  // Tab indentation
}
```

Expected: Skip tabs (treated as whitespace)

**3. No Leading Spaces:**

```python
x = 5
y = 10
```

Expected: No skips, normal typing

**4. Consecutive Spaces in Code:**

```python
x    =    5  # Many spaces
```

Expected: Skip extra spaces based on config

---

### 3.3: Performance Check (30 min)

**Measure:**

**1. WebSocket Payload Size:**

```javascript
// Browser console
window.addEventListener("message", (e) => {
  if (e.data.type === "challenge_selected") {
    console.log("Payload size:", JSON.stringify(e.data).length);
  }
});
```

**2. Keystroke Latency:**

```javascript
performance.mark("keystroke-start");
// Type character
performance.mark("keystroke-end");
performance.measure("keystroke", "keystroke-start", "keystroke-end");
console.log(performance.getEntriesByName("keystroke")[0].duration);
```

**Target Metrics:**

- Payload increase: <1KB per challenge
- Keystroke latency: <20ms (unchanged from v1.4.0)

**If Performance Issues:**

- Reduce skip range granularity
- Consider skip range compression
- Profile with React DevTools

---

## Phase 4: Documentation & Release

**Duration:** Day 10, 1-2 hours

### 4.1: Update Configuration Docs (30 min)

**File:** `ARCHITECTURE.md`

Add section:

````markdown
## Skip Range System

### Character-Based Skipping (v1.5.0)

- Backend calculates skip ranges during challenge selection
- Configuration: `skip-config.json`
- Filters: leading spaces, trailing spaces, consecutive spaces
- Ranges transmitted via WebSocket with challenge

### Skip Range Structure

```typescript
interface SkipRange {
  start: number; // Character index (inclusive)
  end: number; // Character index (inclusive)
  reason: string; // Filter that created range
}
```
````

### Frontend Integration

- Code store maintains skip ranges
- `_getForwardOffset()` jumps over ranges
- Visual feedback: Skipped chars appear faint/italic

````

---

### 4.2: User-Facing Documentation (30 min)

**File:** `README-LOCAL.md`

Update features:
```markdown
## Features

### Smart Character Skipping
- **Auto-skips leading spaces** - Focus on code, not indentation
- **Configurable filters** - Customize what to skip
- **Visual feedback** - Skipped characters appear faint
- **Configuration**: Edit `packages/back-nest/skip-config.json`
  ```json
  {
    "filters": {
      "skipLeadingSpaces": true,
      "skipTrailingSpaces": false
    }
  }
````

````

---

### 4.3: Create Git Tag (15 min)

```bash
git add .
git commit -m "Release v1.5.0: Character-based smart skipping

- Skip range calculator service
- Leading/trailing/consecutive space filters
- Frontend cursor auto-advancement
- Visual indicators for skipped characters
- Configurable via skip-config.json"

git tag v1.5.0
git push origin main
git push origin v1.5.0
````

---

### 4.4: Test Rollback (30 min)

```bash
# Backup database
cp packages/back-nest/speedtyper-local.db packages/back-nest/speedtyper-local.db.v1.5.0

# Rollback to v1.4.0
git checkout v1.4.0
npm install
npm run dev

# Verify: Typing works (no skip feature, but functional)
# Complete one race

# Return to v1.5.0
git checkout v1.5.0
npm run dev

# Verify: Skip feature works again
```

---

## Success Criteria

- [ ] Spaces skip automatically (leading, trailing, consecutive)
- [ ] Backend validation still passes
- [ ] WPM calculation accurate (skipped chars not counted)
- [ ] No performance degradation (<20ms keystroke)
- [ ] Visual indicators clear and not distracting
- [ ] Configuration system works (can toggle filters)
- [ ] No errors in console (frontend or backend)
- [ ] Rollback tested successfully

---

## Rollback Procedure

```bash
git checkout v1.4.0
npm install
npm run dev

# If database issues:
cp packages/back-nest/speedtyper-local.db.v1.4.0 packages/back-nest/speedtyper-local.db
```

**When to Rollback:**

- Skip logic breaks validation (incorrect characters accepted/rejected)
- Performance degrades (>25ms keystroke latency)
- Cursor behavior confusing to users
- WebSocket payload causes connection issues

---

## Handoff to Phase 1.5.1

**What's Ready:**

- ✅ Skip range calculation pattern established
- ✅ Frontend skip-aware index advancement
- ✅ Configuration system for skip rules
- ✅ Range merging algorithm

**What v1.5.1 Will Add:**

- AST-based skip ranges (comments, docstrings)
- Tree-sitter integration for node detection
- Merge character + AST skip ranges

**Prepare Before Starting v1.5.1:**

- Review Tree-sitter parser service (already exists for parsing)
- Study comment node detection (findCommentNodes method)
- Test skip range merging with larger datasets
