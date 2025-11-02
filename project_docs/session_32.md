# Session 32 Summary: Phase 1.4.0 - Result Saving Bug Investigation

**Date:** November 2, 2025  
**Duration:** ~1.5 hours  
**Current Status:** v1.3.2 → v1.4.0 (Feature 3.1: 85% Complete - BLOCKED)

---

## What We Accomplished This Session

### 1. Fixed Entity Configuration ✅

- **File Modified:** `packages/back-nest/src/results/entities/result.entity.ts`
- Added `@Column({ nullable: true })` decorator to `userId` field
- Fixed TypeORM schema synchronization issue

### 2. Fixed Result Factory ✅

- **File Modified:** `packages/back-nest/src/results/services/result-factory.service.ts`
- Set both `result.user = user` AND `result.userId = user.id`
- TypeORM now has proper relation object for foreign key handling

### 3. Updated Existing Results ✅

- Ran SQL migration: `UPDATE results SET userId = (SELECT id FROM users WHERE legacyId = 'LOCAL_SUPER_USER');`
- All existing results now reference LOCAL_SUPER_USER

### 4. Enhanced WebSocket Session Handling ⚠️

- **File Modified:** `packages/back-nest/src/sessions/session.adapter.ts`
  - Added LocalUserService injection
  - Added middleware to assign LOCAL_SUPER_USER to WebSocket sessions
- **File Modified:** `packages/back-nest/src/main.ts`
  - Passed LocalUserService to SessionAdapter constructor

---

## Critical Issue Discovered 🔴

### The Problem: Ghost Guest Users

Despite all our fixes, the system **still creates ephemeral guest users** somewhere in the flow:

**Evidence from Logs:**

```
[GuestUserMiddleware] ✅ Assigned LOCAL_SUPER_USER to session
[ResultsHandler] User ID: 09ded906-0e5f-4ebd-b01c-a7448fba48af  ← NOT LOCAL_SUPER_USER!
[ResultsHandler] User object: { "username": "AdorableSwift", "isAnonymous": true }
QueryFailedError: SqliteError: FOREIGN KEY constraint failed
```

**Expected User ID:** `ca93c046-4c53-4bd7-bda4-0bd2628b698d` (LOCAL_SUPER_USER)  
**Actual User ID:** `09ded906-0e5f-4ebd-b01c-a7448fba48af` (Random guest user)

### Root Cause Analysis

The session is being populated with a **random guest user** before our middleware runs. The flow is:

1. Browser makes HTTP request → SessionMiddleware creates session
2. GuestUserMiddleware sets `session.user = LOCAL_SUPER_USER` ✅
3. WebSocket connects using **same session cookie**
4. But WebSocket gets a **different user** (`AdorableSwift`) ❌

**Hypothesis:** The session is being created elsewhere with a random guest user, and our middleware never overwrites it because `if (!req.session?.user)` returns false (session already has a user).

---

## Files Modified This Session

### ✅ Successfully Modified (7 files)

```
packages/back-nest/src/results/entities/result.entity.ts (added @Column to userId)
packages/back-nest/src/results/services/result-factory.service.ts (set both user and userId)
packages/back-nest/src/races/services/results-handler.service.ts (added debug logging)
packages/back-nest/src/sessions/session.adapter.ts (added LocalUserService middleware)
packages/back-nest/src/main.ts (passed LocalUserService to adapter)
```

### 🔍 Need Investigation (Potential Sources)

```
packages/back-nest/src/middlewares/guest-user.ts
packages/back-nest/src/sessions/session.middleware.ts
packages/back-nest/src/users/entities/user.entity.ts (generateAnonymousUser still exists)
```

---

## Database State

### Users Table:

```sql
sqlite3 speedtyper-local.db "SELECT id, username, legacyId FROM users;"
ca93c046-4c53-4bd7-bda4-0bd2628b698d|local-user|LOCAL_SUPER_USER
```

✅ Only 1 user in database (correct)

### Results Table:

```sql
sqlite3 speedtyper-local.db "SELECT id, userId FROM results LIMIT 3;"
19df4083-2cca-4157-bbf4-c3cfdd10de44|ca93c046-4c53-4bd7-bda4-0bd2628b698d
4668ee71-1490-4c98-af0e-d49c970065a2|ca93c046-4c53-4bd7-bda4-0bd2628b698d
```

✅ Existing results linked to LOCAL_SUPER_USER (correct)

### The Ghost:

The user `09ded906-0e5f-4ebd-b01c-a7448fba48af` ("AdorableSwift") **does NOT exist** in the users table, yet it's being used by the WebSocket race handler.

---

## Next Session (Session 33) Action Plan

### Immediate Investigation (First 30 minutes)

**1. Find Where Ghost Users Are Created:**

Search for all places `generateAnonymousUser` is called:

```bash
grep -r "generateAnonymousUser" ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/
```

Check if any middleware/service creates users outside GuestUserMiddleware:

```bash
grep -r "new User()" ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/
grep -r "User.create" ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest/src/
```

**2. Trace Session Flow:**

Add extensive logging to track session state through the entire flow:

- HTTP request arrives (session.user should be undefined)
- GuestUserMiddleware runs (session.user = LOCAL_SUPER_USER)
- WebSocket connects (what is session.user now?)
- Race starts (what user is passed to results handler?)

**3. Check Session Cookie Handling:**

Verify browser is sending same session cookie for HTTP and WebSocket:

- Browser DevTools → Application → Cookies → Check `speedtyper-v2-sid`
- Backend logs should show same session ID for HTTP and WebSocket

### Likely Solutions (Priority Order)

**Option A: Nuclear Option - Remove generateAnonymousUser Entirely**

- Delete/comment out `User.generateAnonymousUser()` method
- Search and destroy ALL usages
- Force compile errors to find all guest user creation points

**Option B: Fix Session Initialization Order**

- Ensure GuestUserMiddleware runs BEFORE any user is assigned to session
- May need to move middleware earlier in the chain

**Option C: WebSocket-Specific User Loading**

- The SessionAdapter middleware we added might not be working
- May need to load user in RaceGateway.handleConnection instead

---

## Debug Commands for Next Session

### Check for orphaned guest users in session store:

```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest
sqlite3 speedtyper-local.db "SELECT * FROM session LIMIT 5;"
```

### Add more debug logging to GuestUserMiddleware:

```typescript
async use(req: Request, _: Response, next: NextFunction) {
  console.log('[GuestUserMiddleware] Session ID:', req.session.id);
  console.log('[GuestUserMiddleware] Existing user:', req.session?.user?.id);

  if (req.session && !req.session?.user) {
    const localUser = await this.localUserService.getLocalUser();
    req.session.user = localUser;
    console.log('[GuestUserMiddleware] ✅ Assigned LOCAL_SUPER_USER:', localUser.id);
  } else {
    console.log('[GuestUserMiddleware] ⚠️ Session already has user, skipping');
  }
  next();
}
```

### Add logging to SessionAdapter:

```typescript
server.use(async (socket: Socket, next: NextFunction) => {
  console.log("[SessionAdapter] Session ID:", socket.request.session.id);
  console.log(
    "[SessionAdapter] Existing user:",
    socket.request.session?.user?.id
  );

  if (!socket.request.session?.user) {
    const localUser = await this.localUserService.getLocalUser();
    socket.request.session.user = localUser;
    console.log("[SessionAdapter] ✅ Assigned LOCAL_SUPER_USER:", localUser.id);
  }
  next();
});
```

---

## Technical Insights

### 1. TypeORM Relation Best Practices

- **Always set BOTH** the relation object (`result.user`) AND the foreign key (`result.userId`)
- TypeORM needs the object for cascading, but the ID for SQL INSERT
- Nullable relations require `{ nullable: true }` in `@Column()` decorator

### 2. NestJS Middleware Execution Order

- HTTP Routes: SessionMiddleware → GuestUserMiddleware (via AppModule) → Controllers
- WebSocket: SessionMiddleware → Custom Adapter Middlewares → Gateway
- Middlewares registered in `AppModule.configure()` do NOT apply to WebSockets

### 3. Session Debugging Strategy

- Sessions persist between HTTP and WebSocket via cookie
- Same session ID should be used for both connection types
- Session data can become stale if not explicitly saved

---

## Blockers

### 🔴 Critical (Prevents v1.4.0 completion):

1. **Ghost Guest User Creation** - Unknown source creating random users that bypass LocalUserService
   - Impact: Results fail to save (foreign key constraint)
   - Symptom: `AdorableSwift` (ID: `09ded906...`) doesn't exist in database
   - Required: Find and eliminate ALL guest user creation points

---

## Success Criteria (Still Pending)

- [ ] Complete typing session without errors
- [ ] Result saves with `userId = ca93c046-4c53-4bd7-bda4-0bd2628b698d`
- [ ] Results page loads without crash
- [ ] Debug logs show LOCAL_SUPER_USER used throughout flow
- [ ] No more "FOREIGN KEY constraint failed" errors

---

## Rollback Information

**Current State:** Partially broken (results don't save)  
**Rollback Command:**

```bash
git checkout v1.3.2
npm install
npm run dev
```

**Database Restoration (if needed):**

```bash
cp packages/back-nest/speedtyper-local.db.backup packages/back-nest/speedtyper-local.db
```

---

## Estimated Time to Fix

- **Best Case:** 30 minutes (find and remove one `generateAnonymousUser` call)
- **Likely Case:** 1-2 hours (trace session flow, fix middleware order)
- **Worst Case:** 3-4 hours (fundamental architecture issue with sessions)

---

**End of Session 32** ⏸️

**Status:** Feature 3.1 at 85% - Critical bug blocking completion  
**Next:** Find ghost guest user source, complete result saving fix  
**Confidence:** High - We're very close, just need to find the last guest user creation point

---

## 🤝 Collaboration Protocol (Minimum Friction)

### Command Patterns We're Using:

**When I (Claude) need to see a file:**

```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file
```

You copy-paste the output back to me.

**When I (Claude) need to see specific lines:**

```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file | grep -A 20 "searchTerm"
```

**When you need to edit a file:**

```bash
code ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file
```

I provide the full code block, you copy-paste into VS Code.

**When testing:**

```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo
npm run dev
```

**When checking database:**

```bash
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/back-nest
sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM challenge WHERE id LIKE 'local-%';"
```

**When searching for files/content:**

```bash
find ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo -name "filename"
grep -r "searchterm" --include="*.tsx" ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/
```

**When checking line endings or hidden characters:**

```bash
head -1 file.js | od -c              # Show character codes
file file.js                          # Check file encoding
hexdump -C file.js | head -3         # Show hex dump
```

### Key Principles:

1.  ✅ **Always use full absolute paths** from home directory
2.  ✅ **I provide `code` commands**, not `nano` (you prefer VS Code)
3.  ✅ **I give you full code blocks to copy-paste**, not diffs
4.  ✅ **You only upload specific files** when I ask (not entire codebase)
5.  ✅ **Terminal-based workflow** (cat, grep, code, npm) - fast and efficient
6.  ✅ **Hex dumps for debugging** encoding/line ending issues
