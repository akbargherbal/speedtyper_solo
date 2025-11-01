# Speedtyper Local: Phased Implementation Plan

**Version Range:** v1.3.0 → v1.6.0  
**Strategy:** Incremental feature delivery with rollback safety nets  
**Philosophy:** Never break existing typing functionality

---

## Version Milestones Overview

| Version | Focus                    | Duration Estimate | Rollback Target | Risk Level     |
|---------|--------------------------|-------------------|-----------------|----------------|
| v1.4.0  | Foundation Layer         | 3-4 weeks         | v1.3.0          | 🟢 Low         |
| v1.5.0  | Smart Skipping (Basic)   | 2-3 weeks         | v1.4.0          | 🟡 Medium      |
| v1.5.1  | Smart Skipping (Advanced)| 2-3 weeks         | v1.5.0          | 🟡 Medium      |
| v1.6.0  | Visual Enhancement       | 4-6 weeks         | v1.5.1          | 🔴 High        |

**Total Timeline:** 11-16 weeks (flexible, adjust per real progress)

---

## Version 1.4.0: Foundation Layer

**Theme:** Stable Identity & Analytics Infrastructure  
**Duration:** 3-4 weeks  
**Dependencies:** None (builds on v1.3.0)  
**Rollback Point:** v1.3.0 (current stable)

### Phase 0: Pre-Implementation Verification (Day 1, 30 min)

**Checkpoint Tasks:**
```bash
# Verify current state
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo
git status
git tag v1.3.0  # Tag current state as rollback point

# Check database health
cd packages/back-nest
sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM result;"
sqlite3 speedtyper-local.db "SELECT COUNT(DISTINCT userId) FROM result;"

# Verify app works
npm run dev
```

**Success Criteria:**
- ✅ v1.3.0 tagged in git
- ✅ Database queries return data
- ✅ App starts and typing works

**Deliverable:** Confirmed baseline stability

---

### Phase 1: Feature 3.1 - Stable User Identity (Days 2-4, 6-8 hours)

**Goal:** Replace ephemeral guest users with persistent "Local Super User"

#### Day 2: Backend Service Creation (2-3 hours)

**1.1: Study Existing User System** (30 min)
```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/users/entities/user.entity.ts
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/users/services/user.service.ts
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/middlewares/guest-user.ts
```

**Expected Findings:**
- `User` entity has `legacyId` field (nullable, indexed) - perfect for stable identifier
- `generateAnonymousUser()` creates random users - this is what we'll replace
- Middleware runs before WebSocket connections

**1.2: Create LocalUserService** (60 min)

Create `packages/back-nest/src/users/services/local-user.service.ts`:

**Key Methods:**
- `ensureLocalUser()` - Create or retrieve user with `legacyId: 'LOCAL_SUPER_USER'`
- `getLocalUser()` - Fast lookup (cached in memory)

**Implementation Pattern:**
```typescript
// Pseudo-code structure (you'll provide full implementation)
@Injectable()
export class LocalUserService {
  private cachedUser: User | null = null;

  async ensureLocalUser(): Promise<User> {
    // 1. Check cache
    if (this.cachedUser) return this.cachedUser;
    
    // 2. Query DB for legacyId = 'LOCAL_SUPER_USER'
    let user = await this.userRepo.findOneBy({ legacyId: 'LOCAL_SUPER_USER' });
    
    // 3. If not found, create it
    if (!user) {
      user = await this.userRepo.save({
        username: 'local-user',
        legacyId: 'LOCAL_SUPER_USER',
        isAnonymous: true
      });
    }
    
    // 4. Cache and return
    this.cachedUser = user;
    return user;
  }
}
```

**1.3: Register Service in Module** (15 min)

Modify `packages/back-nest/src/users/users.module.ts`:
- Add `LocalUserService` to providers
- Export it for use in other modules

**1.4: Test Service in Isolation** (30 min)

Create test file or use command:
```bash
cd packages/back-nest
# Add temporary test endpoint to user.controller.ts
# GET /api/users/test-local -> calls localUserService.ensureLocalUser()
npm run start:dev
curl http://localhost:1337/api/users/test-local
```

**Expected Result:**
```json
{
  "id": "uuid-here",
  "username": "local-user",
  "legacyId": "LOCAL_SUPER_USER",
  "isAnonymous": true
}
```

**Verification:**
```bash
sqlite3 speedtyper-local.db "SELECT * FROM user WHERE legacyId = 'LOCAL_SUPER_USER';"
```

#### Day 3: Middleware Integration (2-3 hours)

**1.5: Modify Guest User Middleware** (60 min)

Edit `packages/back-nest/src/middlewares/guest-user.ts`:

**Changes:**
- Inject `LocalUserService`
- Replace `User.generateAnonymousUser()` with `localUserService.getLocalUser()`
- Remove UUID generation logic

**Critical:** Test that sessions still work (WebSocket connections authenticate correctly)

**1.6: Bootstrap Initialization** (30 min)

Modify `packages/back-nest/src/main.ts`:

**Add before app.listen():**
```typescript
// Ensure local user exists on startup
const localUserService = app.get(LocalUserService);
await localUserService.ensureLocalUser();
console.log('[Bootstrap] Local Super User initialized');
```

**1.7: Integration Test** (60 min)

```bash
# Fresh start
rm packages/back-nest/speedtyper-local.db
npm run dev

# In browser:
# 1. Navigate to localhost:3001
# 2. Start typing a snippet
# 3. Complete it
# 4. Check database

sqlite3 packages/back-nest/speedtyper-local.db "SELECT userId, wpm, accuracy FROM result;"
# Verify: All results have SAME userId
```

**1.8: Data Migration Script** (45 min)

Create `packages/back-nest/scripts/migrate-to-local-user.ts`:

**Purpose:** Reassign old results to new local user

```typescript
// Pseudo-code
const localUser = await localUserService.getLocalUser();
const oldGuestUsers = await userRepo.find({ isAnonymous: true, legacyId: null });

for (const oldUser of oldGuestUsers) {
  await resultRepo.update({ userId: oldUser.id }, { userId: localUser.id });
}

console.log(`Migrated ${oldGuestUsers.length} guest users to local user`);
```

**Run Migration:**
```bash
cd packages/back-nest
npm run command migrate-to-local-user
```

#### Day 4: Testing & Documentation (1-2 hours)

**1.9: Comprehensive Testing** (45 min)

**Test Checklist:**
- [ ] Fresh install creates local user on first launch
- [ ] Multiple races assign same userId
- [ ] Database migration script works
- [ ] No errors in console logs
- [ ] Typing functionality unchanged

**1.10: Update Documentation** (30 min)

Add to `ARCHITECTURE.md`:
- New "User Identity" section
- Explain LocalUserService pattern
- Document migration script usage

**Success Criteria:**
- ✅ All results in database have same userId
- ✅ Migration script tested and documented
- ✅ No breaking changes to typing workflow

**Rollback Plan:**
```bash
git checkout v1.3.0 packages/back-nest/src/middlewares/guest-user.ts
git checkout v1.3.0 packages/back-nest/src/users/
npm run dev
```

---

### Phase 2: Feature 3.2 - Progress Dashboard (Days 5-10, 8-10 hours)

**Goal:** Display WPM trends, accuracy stats, language breakdown

#### Day 5: Backend API Design (2-3 hours)

**2.1: Create Dashboard Module** (30 min)

```bash
cd packages/back-nest/src
mkdir dashboard
touch dashboard/dashboard.module.ts
touch dashboard/dashboard.controller.ts
touch dashboard/dashboard.service.ts
```

**2.2: Define API Endpoints** (60 min)

**Endpoints to Implement:**
1. `GET /api/dashboard/stats` - High-level KPIs
   - Average WPM (all-time)
   - Average accuracy
   - Total races completed
   - Favorite language (most practiced)

2. `GET /api/dashboard/trends?days=30` - Time-series data
   - WPM by date
   - Accuracy by date
   - Races per day

3. `GET /api/dashboard/by-language` - Language breakdown
   - Races per language
   - Average WPM per language
   - Average accuracy per language

4. `GET /api/dashboard/recent?limit=10` - Recent history
   - Last N race results with timestamps

**2.3: Implement Dashboard Service** (90 min)

Create `packages/back-nest/src/dashboard/dashboard.service.ts`:

**Key Methods:**
```typescript
// Pseudo-code
async getStats(userId: string): Promise<DashboardStats> {
  const results = await this.resultRepo.find({ userId });
  
  return {
    avgWpm: _.meanBy(results, 'wpm'),
    avgAccuracy: _.meanBy(results, 'accuracy'),
    totalRaces: results.length,
    favoriteLanguage: _.maxBy(
      _.groupBy(results, 'challenge.language'),
      group => group.length
    )
  };
}

async getTrends(userId: string, days: number): Promise<TrendData[]> {
  // Use TypeORM query builder
  return this.resultRepo
    .createQueryBuilder('result')
    .where('result.userId = :userId', { userId })
    .andWhere('result.createdAt >= :startDate', { 
      startDate: new Date(Date.now() - days * 86400000) 
    })
    .groupBy('DATE(result.createdAt)')
    .select('DATE(result.createdAt)', 'date')
    .addSelect('AVG(result.wpm)', 'avgWpm')
    .addSelect('AVG(result.accuracy)', 'avgAccuracy')
    .addSelect('COUNT(*)', 'raceCount')
    .getRawMany();
}
```

**2.4: Test API Endpoints** (30 min)

```bash
npm run start:dev

# Test with curl/Postman
curl http://localhost:1337/api/dashboard/stats
curl http://localhost:1337/api/dashboard/trends?days=30
curl http://localhost:1337/api/dashboard/by-language
```

#### Day 6-7: Frontend Dashboard Page (4-5 hours)

**2.5: Create Dashboard Route** (30 min)

Create `packages/webapp-next/pages/dashboard.tsx`:

**Structure:**
```typescript
// Pseudo-code
export default function DashboardPage() {
  const stats = useDashboardStats();  // Custom hook
  const trends = useDashboardTrends();
  const byLanguage = useDashboardByLanguage();
  
  return (
    <Layout>
      <DashboardHeader stats={stats} />
      <TrendsChart data={trends} />
      <LanguageBreakdown data={byLanguage} />
      <RecentHistory />
    </Layout>
  );
}
```

**2.6: Create API Client Functions** (45 min)

Create `packages/webapp-next/common/api/dashboard.ts`:

```typescript
// Pseudo-code
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${SERVER_URL}/api/dashboard/stats`);
  return response.json();
}

export async function fetchDashboardTrends(days: number): Promise<TrendData[]> {
  const response = await fetch(`${SERVER_URL}/api/dashboard/trends?days=${days}`);
  return response.json();
}
```

**2.7: Create Zustand Store** (30 min)

Create `packages/webapp-next/common/state/dashboard-store.ts`:

**Pattern:** Follow existing `game-store.ts` structure

**2.8: Implement Dashboard Components** (120 min)

**Components to Create:**
1. `DashboardHeader.tsx` - Display high-level stats (KPI cards)
2. `TrendsChart.tsx` - Line chart showing WPM over time (use Recharts)
3. `LanguageBreakdown.tsx` - Table or bar chart of language stats
4. `RecentHistory.tsx` - List of recent races with links to results

**Use Existing Patterns:**
- Leverage `ResultsChart.tsx` as foundation for TrendsChart
- Use Tailwind styling (follow existing component patterns)

**2.9: Add Navigation Link** (15 min)

Modify `packages/webapp-next/common/components/NewNavbar.tsx`:
- Add "Dashboard" link → `/dashboard`

#### Day 8: Testing & Polish (1-2 hours)

**2.10: Integration Testing** (45 min)

**Test Workflow:**
1. Complete 5-10 races across different languages
2. Navigate to `/dashboard`
3. Verify all stats display correctly
4. Test date range filter (7 days, 30 days, all-time)
5. Verify charts render (Recharts working)
6. Click recent race → navigates to results page

**2.11: Edge Case Handling** (30 min)

**Scenarios to Test:**
- Fresh user (no races): Display "No data yet" message
- Single language only: Language breakdown still renders
- Old database with ephemeral users: Migration script ran successfully

**2.12: Performance Check** (15 min)

```bash
# Check query performance
sqlite3 speedtyper-local.db ".timer on"
sqlite3 speedtyper-local.db "SELECT AVG(wpm) FROM result WHERE userId = 'local-user-id';"
```

**Target:** <50ms for all dashboard queries

**Success Criteria:**
- ✅ Dashboard displays all metrics correctly
- ✅ Charts render without errors
- ✅ Navigation integrated seamlessly
- ✅ Performance acceptable (<100ms page load)

**Rollback Plan:**
```bash
git checkout v1.3.0 packages/webapp-next/pages/dashboard.tsx
git checkout v1.3.0 packages/back-nest/src/dashboard/
npm run dev
```

---

### Phase 3: Version 1.4.0 Final Verification (Day 9-10, 2-3 hours)

**3.1: Complete Smoke Test** (60 min)

**Checklist:**
- [ ] Fresh install works (delete .db, run `npm run dev`)
- [ ] Local user created on first launch
- [ ] Multiple races save to same userId
- [ ] Dashboard displays historical data
- [ ] All existing features still work (typing, results page)
- [ ] No console errors (frontend or backend)

**3.2: Update Documentation** (45 min)

**Files to Update:**
- `FEATURES.md` - Mark 3.1 and 3.2 as completed
- `ARCHITECTURE.md` - Add dashboard architecture section
- `README-LOCAL.md` - Add dashboard feature mention
- `CHANGELOG.md` - Create v1.4.0 entry

**3.3: Create Git Tag** (15 min)

```bash
git add .
git commit -m "Release v1.4.0: Stable user identity + progress dashboard"
git tag v1.4.0
git push origin v1.4.0
```

**3.4: Test Rollback** (30 min)

**Simulate failure scenario:**
```bash
# Simulate broken state
rm packages/back-nest/speedtyper-local.db
git checkout v1.4.0  # Stay on new version

# Rollback
git checkout v1.3.0
npm install  # Reinstall old dependencies if needed
npm run dev

# Verify: Typing still works with v1.3.0
```

**Success Criteria:**
- ✅ v1.4.0 tagged and documented
- ✅ Rollback tested successfully
- ✅ All features working as expected

---

## Version 1.5.0: Smart Skipping - Phase 1

**Theme:** Configurable Character Skipping (Spaces)  
**Duration:** 2-3 weeks  
**Dependencies:** v1.4.0 (stable foundation)  
**Rollback Point:** v1.4.0

### Phase 0: Pre-Implementation Investigation (Day 1, 2-3 hours)

**Goal:** Answer critical unknowns before implementation

**0.1: Study Keystroke Validation** (60 min)

```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/races/services/keystroke-validator.service.ts
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/races/services/add-keystroke.service.ts
```

**Key Questions:**
- How does validation compare typed text to challenge code?
- Where is `expectedCharacter` determined?
- Can we inject "skip logic" without breaking validation?

**0.2: Study Frontend Index Management** (60 min)

```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/webapp-next/modules/play2/state/code-store.ts
grep -A 20 "_getForwardOffset" ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/webapp-next/modules/play2/state/code-store.ts
```

**Key Questions:**
- How does `currentIndex` advance after keystrokes?
- Where does cursor jump on correct/incorrect input?
- Can we modify `_getForwardOffset()` to skip ranges?

**0.3: WebSocket Payload Analysis** (30 min)

```bash
# Check existing event payloads
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/races/race.gateway.ts | grep -A 10 "emit('challenge_selected'"
```

**Key Questions:**
- What's in `Challenge` object sent to frontend?
- Can we add `skipRanges: SkipRange[]` field without breaking client?

**Deliverable:** Documented findings → decision to proceed or pivot

---

### Phase 1: Backend Skip Range Calculation (Days 2-4, 4-6 hours)

**1.1: Create Configuration System** (60 min)

Create `packages/back-nest/skip-config.json`:

```json
{
  "version": "1.0.0",
  "filters": {
    "skipLeadingSpaces": true,
    "skipTrailingSpaces": false,
    "skipMultipleConsecutiveSpaces": true
  }
}
```

**1.2: Create Skip Range Calculator Service** (120 min)

Create `packages/back-nest/src/challenges/services/skip-range-calculator.service.ts`:

**Key Method:**
```typescript
// Pseudo-code
calculateSkipRanges(code: string, config: SkipConfig): SkipRange[] {
  const ranges: SkipRange[] = [];
  
  if (config.skipLeadingSpaces) {
    const lines = code.split('\n');
    lines.forEach((line, lineIndex) => {
      const leadingSpaceCount = line.match(/^\s+/)?.[0].length || 0;
      if (leadingSpaceCount > 0) {
        const startIdx = this.getAbsoluteIndex(lineIndex, 0);
        ranges.push({
          start: startIdx,
          end: startIdx + leadingSpaceCount - 1,
          reason: 'leading-spaces'
        });
      }
    });
  }
  
  return this.mergeOverlappingRanges(ranges);
}
```

**1.3: Integrate with Race Creation** (90 min)

Modify `packages/back-nest/src/races/services/race-manager.service.ts`:

**Changes:**
1. When selecting challenge, calculate skip ranges
2. Store skip ranges in race entity (or emit directly)
3. Include skip ranges in WebSocket event

**Modified Flow:**
```typescript
// Pseudo-code
const challenge = await this.selectRandomChallenge(settings);
const skipRanges = await this.skipRangeCalculator.calculateSkipRanges(
  challenge.content,
  this.skipConfig
);

// Attach to race or challenge object
const enrichedChallenge = {
  ...challenge,
  skipRanges
};

// Emit to frontend
this.raceEventsService.emitChallengeSelected(socket, enrichedChallenge);
```

**1.4: Test Backend in Isolation** (45 min)

```bash
# Add test endpoint
# GET /api/challenges/:id/skip-ranges -> returns calculated ranges

npm run start:dev
curl http://localhost:1337/api/challenges/some-challenge-id/skip-ranges
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

---

### Phase 2: Frontend Skip Logic (Days 5-7, 4-6 hours)

**2.1: Extend Code Store** (60 min)

Modify `packages/webapp-next/modules/play2/state/code-store.ts`:

**Add State:**
```typescript
skipRanges: SkipRange[]; // Received from backend
```

**Add Method:**
```typescript
isInSkipRange(index: number): boolean {
  return this.skipRanges.some(
    range => index >= range.start && index <= range.end
  );
}
```

**2.2: Modify Index Advancement Logic** (120 min)

**Key Change:**
```typescript
// Before (simple increment):
_getForwardOffset() {
  return this.currentIndex + 1;
}

// After (skip-aware):
_getForwardOffset() {
  let nextIndex = this.currentIndex + 1;
  
  // Jump over skip ranges
  while (this.isInSkipRange(nextIndex) && nextIndex < this.code.length) {
    nextIndex++;
  }
  
  return nextIndex;
}
```

**Critical:** Update all references to `currentIndex` to use `_getForwardOffset()`

**2.3: Update WebSocket Listener** (30 min)

Modify `packages/webapp-next/modules/play2/services/Game.ts`:

**Add Handler:**
```typescript
this.socket.subscribe('challenge_selected', (challenge: Challenge) => {
  codeStore.setCode(challenge.content);
  codeStore.setSkipRanges(challenge.skipRanges || []);
  // ... existing logic
});
```

**2.4: Visual Indicator for Skipped Characters** (60 min)

Modify `packages/webapp-next/modules/play2/components/UntypedChars.tsx`:

**Enhancement:**
```typescript
// Apply different styling to skipped characters
const charClassName = isInSkipRange(index) 
  ? "opacity-20 italic"  // Very faint, different style
  : "opacity-60";        // Normal untyped style
```

---

### Phase 3: Integration & Testing (Days 8-9, 3-4 hours)

**3.1: End-to-End Test** (90 min)

**Test Workflow:**
1. Start app: `npm run dev`
2. Select challenge with indentation (Python/TypeScript)
3. Start typing
4. Verify: Cursor jumps over leading spaces automatically
5. Verify: Backend validation still passes
6. Complete snippet
7. Check: WPM calculation correct (skipped chars not counted)

**3.2: Edge Case Testing** (60 min)

**Scenarios:**
- Empty lines (only spaces): Skip entire line?
- Mixed tabs/spaces: Normalization working?
- No leading spaces: Skip ranges empty, typing normal?
- Cursor repositioning: Does skip logic still work?

**3.3: Performance Check** (30 min)

**Measure:**
- WebSocket payload size with skip ranges
- Keystroke latency (should be unchanged)
- Frontend render performance (any jank?)

**Tool:**
```javascript
// Browser console
performance.mark('keystroke-start');
// Type character
performance.mark('keystroke-end');
performance.measure('keystroke', 'keystroke-start', 'keystroke-end');
```

**Target:** <20ms per keystroke (same as before)

**Success Criteria:**
- ✅ Spaces skip automatically
- ✅ Validation passes
- ✅ WPM calculation accurate
- ✅ No performance degradation

**Rollback Plan:**
```bash
git checkout v1.4.0
npm run dev
```

---

### Phase 4: Documentation & Release (Day 10, 1-2 hours)

**4.1: Update Configuration Docs** (30 min)

Add to `ARCHITECTURE.md`:
- Skip range architecture explanation
- Configuration options in `skip-config.json`

**4.2: User-Facing Documentation** (30 min)

Update `README-LOCAL.md`:
- Explain skip feature ("auto-skips leading spaces")
- How to configure (`skip-config.json`)

**4.3: Create Git Tag** (15 min)

```bash
git add .
git commit -m "Release v1.5.0: Character skipping (leading spaces)"
git tag v1.5.0
git push origin v1.5.0
```

**4.4: Test Rollback** (30 min)

**Verify:** v1.4.0 still works after tagging v1.5.0

---

## Version 1.5.1: Smart Skipping - Phase 2

**Theme:** AST-Based Node Skipping (Comments)  
**Duration:** 2-3 weeks  
**Dependencies:** v1.5.0 (basic skipping stable)  
**Rollback Point:** v1.5.0

### Phase 0: AST Feasibility Verification (Day 1, 2-3 hours)

**0.1: Test Tree-sitter Comment Detection** (90 min)

```bash
# Create test file with heavy comments
cat > packages/back-nest/test-comments.py << 'EOF'
# This is a comment
def hello():
    """Docstring here"""
    # Another comment
    return "world"  # Inline comment
EOF

# Test parser
cd packages/back-nest
npm run command test-parser -- test-comments.py
```

**Expected Output:** Parser should identify all comment nodes

**0.2: Review Parser Service** (60 min)

```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/challenges/services/parser.service.ts | grep -A 30 "findCommentNodes"
```

**Key Question:** Does `findCommentNodes()` already exist? (Hint: Yes, for comment removal)

**Deliverable:** Confirmation that AST comment detection works reliably

---

### Phase 1: Backend AST Skip Range Generation (Days 2-5, 6-8 hours)

**1.1: Extend Configuration** (30 min)

Modify `packages/back-nest/skip-config.json`:

```json
{
  "filters": {
    "skipLeadingSpaces": true
  },
  "astNodes": {
    "comments": true,
    "docstrings": false,
    "stringLiterals": false
  }
}
```

**1.2: Extend Skip Range Calculator** (120 min)

Modify `packages/back-nest/src/challenges/services/skip-range-calculator.service.ts`:

**Add Method:**
```typescript
// Pseudo-code
async calculateASTSkipRanges(
  code: string,
  language: Language,
  config: SkipConfig
): Promise<SkipRange[]> {
  const tree = await this.parserService.parse(code, language);
  const ranges: SkipRange[] = [];
  
  if (config.astNodes.comments) {
    const commentNodes = this.parserService.findCommentNodes(tree);
    
    for (const node of commentNodes) {
      // Only skip standalone comments (not inline)
      if (node.startPosition.column === 0) {
        ranges.push({
          start: node.startIndex,
          end: node.endIndex - 1,
          reason: 'comment',
          nodeType: node.type
        });
      }
    }
  }
  
  return ranges;
}
```

**1.3: Merge Character + AST Skip Ranges** (90 min)

**Challenge:** Overlapping ranges (e.g., comment with leading spaces)

**Solution:** Interval merging algorithm

```typescript
// Pseudo-code
mergeSkipRanges(
  charRanges: SkipRange[],
  astRanges: SkipRange[]
): SkipRange[] {
  const allRanges = [...charRanges, ...astRanges].sort(
    (a, b) => a.start - b.start
  );
  
  const merged: SkipRange[] = [];
  let current = allRanges[0];
  
  for (let i = 1; i < allRanges.length; i++) {
    const next = allRanges[i];
    
    if (next.start <= current.end + 1) {
      // Overlapping or adjacent - merge
      current = {
        start: current.start,
        end: Math.max(current.end, next.end),
        reason: `${current.reason},${next.reason}`
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  
  merged.push(current);
  return merged;
}
```

**1.4: Integration Testing** (120 min)

**Test Cases:**
1. Python file with docstrings + line comments
2. TypeScript file with JSDoc + inline comments
3. JavaScript file with block comments
4. Mixed: Comments with heavy indentation

**Verification:**
```bash
# For each test file:
curl http://localhost:1337/api/challenges/test-challenge-id/skip-ranges

# Expected: Comment ranges identified correctly
```

---

### Phase 2: Frontend Rendering (Days 6-7, 3-4 hours)

**2.1: Enhanced Visual Styling** (60 min)

Modify `packages/webapp-next/modules/play2/components/UntypedChars.tsx`:

**Differentiate Skip Types:**
```typescript
const getSkipStyle = (index: number) => {
  const range = skipRanges.find(r => index >= r.start && index <= r.end);
  
  if (!range) return "opacity-60"; // Normal untyped
  
  switch (range.reason) {
    case 'leading-spaces':
      return "opacity-10"; // Almost invisible
    case 'comment':
      return "opacity-30 italic text-gray-500"; // Faint but visible
    case 'docstring':
      return "opacity-40 italic text-blue-400"; // Slightly more visible
    default:
      return "opacity-20";
  }
};
```

**2.2: Smooth Caret Transitions** (60 min)

**Enhancement:** When jumping over comment blocks, animate caret smoothly

Modify `packages/webapp-next/modules/play2/components/SmoothCaret.tsx`:

```typescript
// Detect large jumps (e.g., skipping entire comment block)
const jumpDistance = newPosition - oldPosition;

if (jumpDistance > 1) {
  // Animate faster for skip jumps
  return {
    transition: 'all 0.15s ease-out', // Slightly slower than normal
    // ... position styles
  };
}
```

**2.3: User Feedback Enhancement** (45 min)

**Add Tooltip/Indicator:**
- When cursor lands after skipped comment, briefly show indicator: "✓ Comment skipped"
- Use existing feedback patterns from codebase

**2.4: Settings Toggle** (45 min)

Modify `packages/webapp-next/common/components/modals/SettingsModal.tsx`:

**Add Option:**
```typescript
<ToggleSwitch
  label="Skip Comments While Typing"
  checked={settings.skipComments}
  onChange={(enabled) => settingsStore.setSkipComments(enabled)}
/>
```

**Integration:**
- Send setting to backend in race creation request
- Backend includes/excludes AST ranges based on setting

---

### Phase 3: Edge Case Handling (Days 8-9, 3-4 hours)

**3.1: Multi-Line Comment Blocks** (60 min)

**Test Case:**
```python
"""
This is a very long
docstring that spans
multiple lines
"""
def my_function():
    pass
```

**Verify:**
- Entire docstring skipped as one range
- Cursor jumps from `def` directly to typing `my_function`

**3.2: Inline Comments** (45 min)

**Test Case:**
```typescript
const x = 5; // This should NOT be skipped (inline)
```

**Verify:**
- Inline comments remain typeable (config: `skipInlineComments: false`)
- Only standalone comments skipped

**3.3: Nested Structures** (45 min)

**Test Case:**
```javascript
function outer() {
  // Comment inside function
  function inner() {
    /* Block comment */
    return true;
  }
}
```

**Verify:**
- All comment ranges calculated correctly
- No off-by-one errors in index calculation

**3.4: Language-Specific Edge Cases** (60 min)

**Python:**
- Docstrings vs. regular strings
- `#` in strings (not a comment)

**TypeScript:**
- JSDoc comments (should skip)
- Template literals with `//` inside (not a comment)

**JavaScript:**
- Regex containing `/*` (not a comment start)

**Mitigation:** Tree-sitter handles these correctly (it's a real parser, not regex)

---

### Phase 4: Testing & Release (Day 10, 2-3 hours)

**4.1: Comprehensive Integration Test** (90 min)

**Test Matrix:**

| Language   | Comment Type | Expected Behavior |
|------------|--------------|-------------------|
| Python     | `# comment`  | Skip              |
| Python     | `"""doc"""`  | Configurable      |
| TypeScript | `// comment` | Skip              |
| TypeScript | `/* block */`| Skip              |
| JavaScript | Inline `//`  | Keep (typeable)   |

**For Each:**
1. Import snippet
2. Start race
3. Type through it
4. Verify cursor behavior
5. Complete and check WPM

**4.2: Performance Regression Test** (30 min)

**Measure:**
- AST parsing time during import (should be <100ms per file)
- Skip range calculation (should be <10ms)
- Keystroke latency (should remain <20ms)

**4.3: User Experience Polish** (45 min)

**Checklist:**
- [ ] Visual distinction clear (comments faint but visible)
- [ ] Caret jumps feel natural (not jarring)
- [ ] Settings toggle works
- [ ] Tooltip/indicator helpful (not annoying)

**4.4: Documentation & Release** (30 min)

**Update Files:**
- `ARCHITECTURE.md` - AST skip range architecture
- `README-LOCAL.md` - "Comments auto-skip" feature
- `skip-config.json` - Document all options
- `CHANGELOG.md` - v1.5.1 entry

**Git Tag:**
```bash
git add .
git commit -m "Release v1.5.1: AST-based comment skipping"
git tag v1.5.1
git push origin v1.5.1
```

**Success Criteria:**
- ✅ Comments skip reliably across 3+ languages
- ✅ No validation errors
- ✅ WPM calculation correct (skipped chars not counted)
- ✅ User can toggle feature on/off

**Rollback Plan:**
```bash
git checkout v1.5.0
npm run dev
```

---

## Version 1.6.0: Visual Enhancement (OPTIONAL)

**Theme:** Dynamic Syntax Highlighting  
**Duration:** 4-6 weeks (ONLY if user validation succeeds)  
**Dependencies:** v1.5.1 (full functionality without highlighting)  
**Rollback Point:** v1.5.1  
**Risk Level:** 🔴 **HIGH**

### ⚠️ CRITICAL PRE-CONDITION

**DO NOT IMPLEMENT without completing Phase 0 user validation.**

This feature requires **architectural rework** and **significant development time**. The feasibility report correctly identifies this as high-risk.

---

### Phase 0: User Validation & Prototyping (Week 1-2, 8-10 hours)

**Goal:** Prove the feature adds value before investing in full implementation

**0.1: Current State Analysis** (2 hours)

```bash
# Measure current Highlight.js performance
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/webapp-next/modules/play2/components/TypedChars.tsx | grep -A 10 "highlightjs"
```

**Benchmark Test:**
1. Load 500-char snippet
2. Type through it while monitoring:
   - Frame rate (Chrome DevTools Performance tab)
   - Highlight.js invocation count
   - Re-render count (React DevTools Profiler)

**Expected Findings:**
- Highlight.js called on every keystroke (inefficient)
- Re-tokenizes entire typed text each time (O(n) complexity)

**0.2: Build Minimal Prototype** (4-6 hours)

**Create Standalone Test:**
`packages/webapp-next/test-syntax-highlight.html`

**Approach:** Pre-tokenized overlay system (as recommended by consultant)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Token colors */
    .token-keyword { color: #569cd6; }
    .token-string { color: #ce9178; }
    .token-comment { color: #6a9955; font-style: italic; }
    .token-function { color: #dcdcaa; }
    
    /* Feedback overlay */
    .char-correct { border-bottom: 2px solid rgba(0, 255, 0, 0.3); }
    .char-incorrect { background: rgba(255, 0, 0, 0.2); }
    .char-untyped { opacity: 0.4; }
  </style>
</head>
<body>
  <div id="code-display"></div>
  
  <script>
    // Pre-calculated tokens (would come from backend)
    const tokens = [
      { type: 'keyword', start: 0, end: 5, text: 'const' },
      { type: 'identifier', start: 6, end: 6, text: 'x' },
      { type: 'operator', start: 8, end: 8, text: '=' },
      { type: 'number', start: 10, end: 10, text: '5' }
    ];
    
    const code = 'const x = 5;';
    let typedIndex = 0;
    
    function renderCode() {
      const display = document.getElementById('code-display');
      let html = '';
      
      for (let i = 0; i < code.length; i++) {
        const token = tokens.find(t => i >= t.start && i <= t.end);
        const tokenClass = token ? `token-${token.type}` : '';
        
        const feedbackClass = i < typedIndex 
          ? 'char-correct' 
          : 'char-untyped';
        
        html += `<span class="${tokenClass} ${feedbackClass}">${code[i]}</span>`;
      }
      
      display.innerHTML = html;
    }
    
    // Simulate typing
    document.addEventListener('keypress', (e) => {
      if (e.key === code[typedIndex]) {
        typedIndex++;
        renderCode();
      }
    });
    
    renderCode();
  </script>
</body>
</html>
```

**Test Prototype:**
1. Open in browser
2. Type the code
3. Observe:
   - Do token colors display?
   - Does feedback overlay work?
   - Is performance smooth?

**0.3: User Testing** (2 hours)

**Recruit 5-10 Users (or self-test extensively):**

**Test Scenarios:**
1. Type with syntax highlighting ON
2. Type with highlighting OFF
3. Measure:
   - Typing speed (WPM with vs. without)
   - Accuracy (with vs. without)
   - Subjective preference

**Critical Question:** Does highlighting actually help, or is it just visual noise?

**Decision Gate:**
- If WPM improves >5% OR users strongly prefer it: **PROCEED**
- If no measurable benefit: **DEFER to v1.7.0** (focus on other features)

---

### Phase 1: Backend Tokenization Service (Weeks 3-4, 8-10 hours)

**Only proceed if Phase 0 validation passes.**

**1.1: Create Syntax Tokenizer Service** (4 hours)

Create `packages/back-nest/src/challenges/services/syntax-tokenizer.service.ts`:

**Use Tree-sitter (NOT Highlight.js):**

```typescript
// Pseudo-code
@Injectable()
export class SyntaxTokenizerService {
  async tokenize(code: string, language: Language): Promise<SyntaxToken[]> {
    const parser = this.parserFactory.getParser(language);
    const tree = parser.parse(code);
    
    const tokens: SyntaxToken[] = [];
    
    // Traverse AST and extract token types
    this.traverse(tree.rootNode, (node) => {
      tokens.push({
        type: this.mapNodeTypeToTokenType(node.type),
        start: node.startIndex,
        end: node.endIndex,
        text: node.text
      });
    });
    
    return tokens;
  }
  
  private mapNodeTypeToTokenType(nodeType: string): TokenType {
    // Map Tree-sitter node types to syntax categories
    const mapping = {
      'function_declaration': 'function',
      'identifier': 'identifier',
      'string': 'string',
      'comment': 'comment',
      'keyword': 'keyword',
      // ... more mappings
    };
    
    return mapping[nodeType] || 'text';
  }
}
```

**1.2: Cache Tokens in Challenge Entity** (2 hours)

**Option A:** Add `tokens: JSON` column to `challenge` table

**Option B:** Calculate tokens on-demand, cache in memory

**Recommendation:** Option A (pre-calculate during import)

Modify `packages/back-nest/src/challenges/entities/challenge.entity.ts`:

```typescript
@Entity()
export class Challenge {
  // ... existing fields
  
  @Column({ type: 'text', nullable: true })
  tokens: string; // JSON serialized tokens
}
```

**1.3: Integrate with Import Process** (2-3 hours)

Modify `packages/back-nest/src/challenges/commands/local-import-runner.ts`:

```typescript
// After parsing nodes, before saving:
const tokens = await this.tokenizerService.tokenize(
  node.content,
  language
);

const challenge = new Challenge();
challenge.content = node.content;
challenge.tokens = JSON.stringify(tokens);
// ... save
```

**1.4: Emit Tokens via WebSocket** (1 hour)

Modify `packages/back-nest/src/races/race.gateway.ts`:

```typescript
// In challenge_selected event:
socket.emit('challenge_selected', {
  ...challenge,
  tokens: JSON.parse(challenge.tokens || '[]')
});
```

**1.5: Test Backend** (2 hours)

```bash
# Reimport snippets (now with tokens)
npm run reimport

# Check database
sqlite3 speedtyper-local.db "SELECT id, LEFT(tokens, 100) FROM challenge LIMIT 1;"

# Test WebSocket event
npm run dev
# Use browser console to inspect challenge_selected payload
```

---

### Phase 2: Frontend Token-Based Rendering (Weeks 5-6, 10-12 hours)

**2.1: Create Token Rendering Component** (4 hours)

Create `packages/webapp-next/modules/play2/components/TokenizedChars.tsx`:

```typescript
// Pseudo-code structure
interface Props {
  code: string;
  tokens: SyntaxToken[];
  typedIndex: number;
  incorrectIndices: number[];
}

export function TokenizedChars({ code, tokens, typedIndex, incorrectIndices }: Props) {
  // Build character-to-token lookup map
  const charTokenMap = useMemo(() => {
    const map = new Map<number, SyntaxToken>();
    tokens.forEach(token => {
      for (let i = token.start; i <= token.end; i++) {
        map.set(i, token);
      }
    });
    return map;
  }, [tokens]);
  
  return (
    <div className="code-display">
      {Array.from(code).map((char, index) => {
        const token = charTokenMap.get(index);
        const tokenClass = token ? `token-${token.type}` : '';
        
        // Feedback overlay
        let feedbackClass = 'char-untyped';
        if (index < typedIndex) {
          feedbackClass = incorrectIndices.includes(index)
            ? 'char-incorrect'
            : 'char-correct';
        }
        
        return (
          <span 
            key={index}
            className={`${tokenClass} ${feedbackClass}`}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}
```

**2.2: Define Token Color Styles** (2 hours)

Add to `packages/webapp-next/styles/globals.css`:

```css
/* Syntax token colors (GitHub Dark theme) */
.token-keyword { color: #ff7b72; }
.token-function { color: #d2a8ff; }
.token-string { color: #a5d6ff; }
.token-number { color: #79c0ff; }
.token-comment { color: #8b949e; font-style: italic; }
.token-identifier { color: #c9d1d9; }
.token-operator { color: #ff7b72; }

/* Feedback overlays (subtle, don't interfere with syntax colors) */
.char-correct {
  /* No background - let syntax color show */
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

.char-incorrect {
  /* Strong red background - overrides syntax color for errors */
  background: rgba(255, 0, 0, 0.3);
  color: #fff;
}

.char-untyped {
  opacity: 0.4;
}
```

**2.3: Replace Existing Rendering** (3-4 hours)

Modify `packages/webapp-next/modules/play2/components/CodeArea.tsx`:

**Replace:**
- `<TypedChars>` + `<UntypedChars>` components

**With:**
- `<TokenizedChars tokens={challenge.tokens} ... />`

**Critical:** Preserve all existing props (typedIndex, incorrectIndices, etc.)

**2.4: Extend Code Store** (1 hour)

Modify `packages/webapp-next/modules/play2/state/code-store.ts`:

```typescript
interface CodeState {
  // ... existing fields
  tokens: SyntaxToken[];
}

// Add setter
setTokens(tokens: SyntaxToken[]) {
  this.tokens = tokens;
}
```

**2.5: Update WebSocket Listener** (1 hour)

Modify `packages/webapp-next/modules/play2/services/Game.ts`:

```typescript
this.socket.subscribe('challenge_selected', (challenge: Challenge) => {
  codeStore.setCode(challenge.content);
  codeStore.setTokens(challenge.tokens || []);
  codeStore.setSkipRanges(challenge.skipRanges || []);
  // ... existing logic
});
```

---

### Phase 3: Performance Optimization (Week 7, 6-8 hours)

**3.1: React Rendering Optimization** (3 hours)

**Add Memoization:**

```typescript
export const TokenizedChars = React.memo(({ code, tokens, typedIndex, incorrectIndices }: Props) => {
  // ... component logic
}, (prevProps, nextProps) => {
  // Only re-render if typedIndex or incorrectIndices changed
  return prevProps.typedIndex === nextProps.typedIndex &&
         prevProps.incorrectIndices.length === nextProps.incorrectIndices.length;
});
```

**3.2: Character Lookup Optimization** (2 hours)

**Problem:** `charTokenMap.get(index)` on every render might be slow

**Solution:** Pre-compute token class for each character

```typescript
const charClasses = useMemo(() => {
  return Array.from(code).map((char, index) => {
    const token = tokens.find(t => index >= t.start && index <= t.end);
    return token ? `token-${token.type}` : '';
  });
}, [code, tokens]);

// In render:
return <span className={charClasses[index]}>{char}</span>;
```

**3.3: Performance Profiling** (2-3 hours)

**Use React DevTools Profiler:**

1. Start profiling
2. Type through 500-char snippet
3. Analyze:
   - Component render times
   - Number of re-renders
   - Expensive operations

**Target Metrics:**
- `<TokenizedChars>` render time: <16ms (60fps)
- Re-renders per keystroke: 1 (not cascading)
- Total keystroke latency: <20ms (same as before)

**If Performance Issues:**
- Consider virtualization (render only visible characters)
- Use `useTransition` for non-urgent updates
- Profile with Chrome DevTools (JS profiler)

---

### Phase 4: Testing & Release (Week 8, 4-6 hours)

**4.1: Visual Regression Testing** (2 hours)

**Checklist:**
- [ ] TypeScript: Keywords, functions, strings colored correctly
- [ ] Python: Docstrings, decorators, keywords colored correctly
- [ ] JavaScript: Template literals, JSX syntax colored correctly
- [ ] Feedback overlay visible on all token types
- [ ] Incorrect characters clearly marked (red background wins)

**4.2: Performance Regression Test** (1 hour)

**Compare:**
- v1.5.1 (without highlighting): Measure WPM, keystroke latency
- v1.6.0 (with highlighting): Measure WPM, keystroke latency

**Acceptance Criteria:**
- No >5% degradation in WPM
- Keystroke latency <25ms (slight increase acceptable)

**4.3: Feature Toggle Implementation** (2 hours)

**Add Setting:**

```typescript
// In settings-store.ts
interface Settings {
  // ... existing
  syntaxHighlighting: boolean;
}

// In SettingsModal.tsx
<ToggleSwitch
  label="Syntax Highlighting"
  checked={settings.syntaxHighlighting}
  onChange={(enabled) => settingsStore.setSyntaxHighlighting(enabled)}
/>
```

**Conditional Rendering:**

```typescript
// In CodeArea.tsx
{settings.syntaxHighlighting ? (
  <TokenizedChars tokens={tokens} ... />
) : (
  <PlainCodeDisplay ... />  // Fallback to v1.5.1 rendering
)}
```

**4.4: Documentation & Release** (1 hour)

**Update Files:**
- `ARCHITECTURE.md` - Token rendering architecture
- `README-LOCAL.md` - "Syntax highlighting (beta)" feature
- `CHANGELOG.md` - v1.6.0 entry with performance notes

**Git Tag:**
```bash
git add .
git commit -m "Release v1.6.0: Dynamic syntax highlighting (beta)"
git tag v1.6.0
git push origin v1.6.0
```

**Success Criteria:**
- ✅ Syntax highlighting works across 3+ languages
- ✅ Performance acceptable (<16ms render time)
- ✅ Feature toggleable (can disable if issues)
- ✅ Feedback overlay works correctly

**Rollback Plan:**
```bash
git checkout v1.5.1
npm run dev
```

---

## Cross-Version Testing Protocol

**Before Each Release:**

### 1. Smoke Test Checklist

```markdown
- [ ] Fresh install works (delete .db, run `npm run dev`)
- [ ] Can import snippets
- [ ] Can select language
- [ ] Can start typing
- [ ] WPM calculates correctly
- [ ] Can complete snippet
- [ ] Results page displays
- [ ] Dashboard shows data (v1.4.0+)
- [ ] Skip features work (v1.5.0+)
- [ ] Syntax highlighting works (v1.6.0+)
- [ ] No console errors
```

### 2. Rollback Verification

**After tagging new version:**

```bash
# Test rollback to previous version
git checkout v1.X.0  # Previous stable
npm install  # Reinstall dependencies
npm run dev

# Verify core functionality works
# Complete at least one full typing workflow
```

### 3. Database Compatibility

**Before each release:**

```bash
# Backup database
cp packages/back-nest/speedtyper-local.db packages/back-nest/speedtyper-local.db.backup

# Test with old database
git checkout v1.X+1.0  # New version
npm run dev

# Verify: App works with old database schema
# If schema changes needed: Provide migration script
```

---

## Risk Mitigation Summary

| Version | Primary Risk                    | Mitigation Strategy                                    |
|---------|---------------------------------|--------------------------------------------------------|
| v1.4.0  | Data migration breaks           | Test migration script, provide rollback SQL            |
| v1.5.0  | Skip logic breaks validation    | Backend is source of truth, extensive edge case tests  |
| v1.5.1  | AST parsing fails for language  | Language-specific test suite, graceful fallback        |
| v1.6.0  | Performance degradation         | Profiling at each step, feature toggle, defer if slow  |

---

## Final Notes

### Philosophy Reminder

**Never break the core typing experience.**

If a feature introduces:
- Latency >25ms per keystroke
- Validation errors
- Visual confusion

Then: **Defer it, toggle it off, or revert it.**

### Flexibility

This is a **living plan**. Adjust timelines based on:
- Real implementation complexity
- User feedback
- Performance findings

**It's okay to:**
- Skip v1.6.0 entirely (highlighting optional)
- Extend timelines (quality over speed)
- Reorder features (adapt to discoveries)

### Success Metrics

**After v1.6.0:**
- ✅ Stable user identity (predictable data)
- ✅ Progress tracking (meaningful analytics)
- ✅ Smart skipping (better practice focus)
- ✅ Optional highlighting (visual enhancement)
- ✅ All features toggleable (user control)
- ✅ Performance maintained (<25ms keystroke latency)

---

**Next Steps:**

1. Review this plan
2. Finalize v1.3.0 (the minor bug you mentioned)
3. Tag v1.3.0 as stable
4. Begin Phase 0 of v1.4.0 (database investigation)

Let's build this incrementally and safely! 🚀