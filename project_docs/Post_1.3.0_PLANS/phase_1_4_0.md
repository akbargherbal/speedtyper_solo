# Phase 1.4.0: Foundation Layer

**Duration:** 3-4 weeks  
**Risk Level:** 🟢 Low  
**Rollback Target:** v1.3.1

---

## Context

**What We're Building:**

- Feature 3.1: Stable user identity (single "Local Super User" replaces ephemeral guests)
- Feature 3.2: Progress dashboard (WPM trends, accuracy stats, language breakdown)

**Why This Phase Matters:**

- v1.5.0+ need consistent userId for storing skip preferences
- Consolidated data enables meaningful analytics
- Foundation for all future user-specific features

**Dependencies:**

- Builds on: v1.3.1 (current stable baseline)
- Enables: v1.5.0 (skip ranges need persistent user identity)

---

## Phase 0: Pre-Implementation Verification

**Duration:** Day 1, 30 minutes

### Checkpoint Tasks

```bash
# 1. Verify current state
cd ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo
git status
git tag v1.3.1  # Tag current state as rollback point

# 2. Check database health
cd packages/back-nest
sqlite3 speedtyper-local.db "SELECT COUNT(*) FROM result;"
sqlite3 speedtyper-local.db "SELECT COUNT(DISTINCT userId) FROM result;"

# 3. Verify app works
npm run dev
# Browser: Navigate to localhost:3001, complete one typing session
```

### Success Criteria

- ✅ v1.3.1 tagged in git
- ✅ Database queries return data
- ✅ App starts and typing works

---

## Feature 3.1: Stable User Identity

**Goal:** Replace ephemeral guest users with persistent "Local Super User"  
**Duration:** Days 2-4, 6-8 hours

---

### Day 2: Backend Service Creation (2-3 hours)

#### 1.1: Study Existing User System (30 min)

```bash
cat packages/back-nest/src/users/entities/user.entity.ts
cat packages/back-nest/src/users/services/user.service.ts
cat packages/back-nest/src/middlewares/guest-user.ts
```

**Expected Findings:**

- `User` entity has `legacyId` field (nullable, indexed) - perfect for stable identifier
- `generateAnonymousUser()` creates random users - this is what we'll replace
- Middleware runs before WebSocket connections

---

#### 1.2: Create LocalUserService (60 min)

**File:** `packages/back-nest/src/users/services/local-user.service.ts`

**Implementation:**

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class LocalUserService {
  private cachedUser: User | null = null;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async ensureLocalUser(): Promise<User> {
    // 1. Check cache
    if (this.cachedUser) return this.cachedUser;

    // 2. Query DB for legacyId = 'LOCAL_SUPER_USER'
    let user = await this.userRepo.findOneBy({
      legacyId: "LOCAL_SUPER_USER",
    });

    // 3. If not found, create it
    if (!user) {
      user = await this.userRepo.save({
        username: "local-user",
        legacyId: "LOCAL_SUPER_USER",
        isAnonymous: true,
      });
      console.log("[LocalUserService] Created LOCAL_SUPER_USER");
    }

    // 4. Cache and return
    this.cachedUser = user;
    return user;
  }

  async getLocalUser(): Promise<User> {
    if (this.cachedUser) return this.cachedUser;
    return this.ensureLocalUser();
  }
}
```

---

#### 1.3: Register Service in Module (15 min)

**File:** `packages/back-nest/src/users/users.module.ts`

**Changes:**

```typescript
import { LocalUserService } from "./services/local-user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    LocalUserService, // ADD THIS
  ],
  exports: [
    UserService,
    LocalUserService, // ADD THIS
  ],
  controllers: [UserController],
})
export class UsersModule {}
```

---

#### 1.4: Test Service in Isolation (30 min)

**Add Temporary Test Endpoint:**

**File:** `packages/back-nest/src/users/user.controller.ts`

```typescript
import { LocalUserService } from "./services/local-user.service";

@Controller("api/users")
export class UserController {
  constructor(
    // ... existing
    private localUserService: LocalUserService,
  ) {}

  // TEMPORARY - for testing only
  @Get("test-local")
  async testLocalUser() {
    return await this.localUserService.ensureLocalUser();
  }
}
```

**Test:**

```bash
cd packages/back-nest
npm run start:dev

# In another terminal
curl http://localhost:1337/api/users/test-local
```

**Expected Response:**

```json
{
  "id": "uuid-here",
  "username": "local-user",
  "legacyId": "LOCAL_SUPER_USER",
  "isAnonymous": true
}
```

**Verify Database:**

```bash
sqlite3 speedtyper-local.db "SELECT * FROM user WHERE legacyId = 'LOCAL_SUPER_USER';"
```

---

### Day 3: Middleware Integration (2-3 hours)

#### 1.5: Modify Guest User Middleware (60 min)

**File:** `packages/back-nest/src/middlewares/guest-user.ts`

**Changes:**

```typescript
import { LocalUserService } from "../users/services/local-user.service";

@Injectable()
export class GuestUserMiddleware implements NestMiddleware {
  constructor(
    private localUserService: LocalUserService, // INJECT THIS
  ) {}

  async use(req: any, res: any, next: () => void) {
    if (!req.session.userId) {
      // REPLACE User.generateAnonymousUser() WITH:
      const localUser = await this.localUserService.getLocalUser();
      req.session.userId = localUser.id;
      console.log("[GuestUserMiddleware] Assigned LOCAL_SUPER_USER");
    }
    next();
  }
}
```

**CRITICAL:** Test that sessions still work (WebSocket connections authenticate correctly)

---

#### 1.6: Bootstrap Initialization (30 min)

**File:** `packages/back-nest/src/main.ts`

**Add before `app.listen()`:**

```typescript
import { LocalUserService } from "./users/services/local-user.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... existing setup

  // Ensure local user exists on startup
  const localUserService = app.get(LocalUserService);
  await localUserService.ensureLocalUser();
  console.log("[Bootstrap] Local Super User initialized");

  await app.listen(1337);
}
```

---

#### 1.7: Integration Test (60 min)

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
```

**Expected:** All results have SAME userId

**Verification Checklist:**

- [ ] Multiple races assign same userId
- [ ] No errors in backend console
- [ ] Typing functionality unchanged
- [ ] Results page displays correctly

---

#### 1.8: Data Migration Script (45 min)

**File:** `packages/back-nest/scripts/migrate-to-local-user.ts`

**Purpose:** Reassign old results to new local user

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { LocalUserService } from "../src/users/services/local-user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../src/users/entities/user.entity";
import { Result } from "../src/results/entities/result.entity";

async function migrate() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const localUserService = app.get(LocalUserService);
  const userRepo = app.get(getRepositoryToken(User));
  const resultRepo = app.get(getRepositoryToken(Result));

  const localUser = await localUserService.getLocalUser();

  // Find all old guest users (no legacyId)
  const oldGuestUsers = await userRepo.find({
    isAnonymous: true,
    legacyId: null,
  });

  console.log(`Found ${oldGuestUsers.length} old guest users`);

  // Reassign their results to local user
  for (const oldUser of oldGuestUsers) {
    const updatedCount = await resultRepo.update(
      { userId: oldUser.id },
      { userId: localUser.id },
    );
    console.log(`Migrated ${updatedCount.affected} results from ${oldUser.id}`);
  }

  console.log(`✅ Migration complete`);
  await app.close();
}

migrate();
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "migrate:local-user": "ts-node scripts/migrate-to-local-user.ts"
  }
}
```

**Run Migration:**

```bash
cd packages/back-nest
npm run migrate:local-user
```

---

### Day 4: Testing & Documentation (1-2 hours)

#### 1.9: Comprehensive Testing (45 min)

**Test Checklist:**

- [ ] Fresh install creates local user on first launch
- [ ] Multiple races assign same userId
- [ ] Database migration script works
- [ ] No errors in console logs
- [ ] Typing functionality unchanged
- [ ] Results page still displays correctly

**Edge Cases:**

- [ ] App restart preserves local user (not recreated)
- [ ] Session expiry doesn't create new guest users
- [ ] Local user has expected permissions

---

#### 1.10: Update Documentation (30 min)

**File:** `ARCHITECTURE.md`

Add section:

```markdown
## User Identity System

### Local Super User

- All results assigned to single persistent user (`legacyId: 'LOCAL_SUPER_USER'`)
- Created on first app launch via `LocalUserService`
- Cached in memory for performance
- Replaces ephemeral guest user system

### Migration

- Script: `npm run migrate:local-user`
- Consolidates old guest users into local user
- Safe to run multiple times (idempotent)
```

---

## Feature 3.2: Progress Dashboard

**Goal:** Display WPM trends, accuracy stats, language breakdown  
**Duration:** Days 5-10, 8-10 hours

---

### Day 5: Backend API Design (2-3 hours)

#### 2.1: Create Dashboard Module (30 min)

```bash
cd packages/back-nest/src
mkdir dashboard
touch dashboard/dashboard.module.ts
touch dashboard/dashboard.controller.ts
touch dashboard/dashboard.service.ts
touch dashboard/dto/dashboard-stats.dto.ts
```

**File:** `packages/back-nest/src/dashboard/dashboard.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Result } from "../results/entities/result.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Result]), UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
```

**Register in `app.module.ts`:**

```typescript
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // ... existing
    DashboardModule,
  ],
})
```

---

#### 2.2: Define DTOs (30 min)

**File:** `packages/back-nest/src/dashboard/dto/dashboard-stats.dto.ts`

```typescript
export class DashboardStatsDto {
  avgWpm: number;
  avgAccuracy: number;
  totalRaces: number;
  favoriteLanguage: string;
  totalTimeMinutes: number;
}

export class TrendDataDto {
  date: string;
  avgWpm: number;
  avgAccuracy: number;
  raceCount: number;
}

export class LanguageStatsDto {
  language: string;
  raceCount: number;
  avgWpm: number;
  avgAccuracy: number;
}

export class RecentRaceDto {
  id: string;
  wpm: number;
  accuracy: number;
  language: string;
  createdAt: Date;
}
```

---

#### 2.3: Implement Dashboard Service (90 min)

**File:** `packages/back-nest/src/dashboard/dashboard.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Result } from "../results/entities/result.entity";
import { LocalUserService } from "../users/services/local-user.service";
import * as _ from "lodash";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Result)
    private resultRepo: Repository<Result>,
    private localUserService: LocalUserService,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const localUser = await this.localUserService.getLocalUser();
    const results = await this.resultRepo.find({
      where: { userId: localUser.id },
      relations: ["challenge"],
    });

    if (results.length === 0) {
      return {
        avgWpm: 0,
        avgAccuracy: 0,
        totalRaces: 0,
        favoriteLanguage: "N/A",
        totalTimeMinutes: 0,
      };
    }

    const byLanguage = _.groupBy(results, (r) => r.challenge.language);
    const favoriteLanguage =
      _.maxBy(
        Object.entries(byLanguage),
        ([lang, races]) => races.length,
      )?.[0] || "N/A";

    return {
      avgWpm: _.meanBy(results, "wpm"),
      avgAccuracy: _.meanBy(results, "accuracy"),
      totalRaces: results.length,
      favoriteLanguage,
      totalTimeMinutes: _.sumBy(results, (r) => r.timeMs / 60000),
    };
  }

  async getTrends(days: number): Promise<TrendDataDto[]> {
    const localUser = await this.localUserService.getLocalUser();
    const startDate = new Date(Date.now() - days * 86400000);

    const trends = await this.resultRepo
      .createQueryBuilder("result")
      .where("result.userId = :userId", { userId: localUser.id })
      .andWhere("result.createdAt >= :startDate", { startDate })
      .groupBy("DATE(result.createdAt)")
      .select("DATE(result.createdAt)", "date")
      .addSelect("AVG(result.wpm)", "avgWpm")
      .addSelect("AVG(result.accuracy)", "avgAccuracy")
      .addSelect("COUNT(*)", "raceCount")
      .orderBy("date", "ASC")
      .getRawMany();

    return trends;
  }

  async getByLanguage(): Promise<LanguageStatsDto[]> {
    const localUser = await this.localUserService.getLocalUser();

    const stats = await this.resultRepo
      .createQueryBuilder("result")
      .leftJoin("result.challenge", "challenge")
      .where("result.userId = :userId", { userId: localUser.id })
      .groupBy("challenge.language")
      .select("challenge.language", "language")
      .addSelect("COUNT(*)", "raceCount")
      .addSelect("AVG(result.wpm)", "avgWpm")
      .addSelect("AVG(result.accuracy)", "avgAccuracy")
      .orderBy("raceCount", "DESC")
      .getRawMany();

    return stats;
  }

  async getRecent(limit: number = 10): Promise<RecentRaceDto[]> {
    const localUser = await this.localUserService.getLocalUser();

    const results = await this.resultRepo.find({
      where: { userId: localUser.id },
      relations: ["challenge"],
      order: { createdAt: "DESC" },
      take: limit,
    });

    return results.map((r) => ({
      id: r.id,
      wpm: r.wpm,
      accuracy: r.accuracy,
      language: r.challenge.language,
      createdAt: r.createdAt,
    }));
  }
}
```

---

#### 2.4: Implement Dashboard Controller (30 min)

**File:** `packages/back-nest/src/dashboard/dashboard.controller.ts`

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("api/dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("stats")
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get("trends")
  async getTrends(@Query("days") days: string = "30") {
    return this.dashboardService.getTrends(parseInt(days));
  }

  @Get("by-language")
  async getByLanguage() {
    return this.dashboardService.getByLanguage();
  }

  @Get("recent")
  async getRecent(@Query("limit") limit: string = "10") {
    return this.dashboardService.getRecent(parseInt(limit));
  }
}
```

---

#### 2.5: Test API Endpoints (30 min)

```bash
npm run start:dev

# Test endpoints
curl http://localhost:1337/api/dashboard/stats
curl http://localhost:1337/api/dashboard/trends?days=30
curl http://localhost:1337/api/dashboard/by-language
curl http://localhost:1337/api/dashboard/recent?limit=5
```

**Expected Responses:**

- Stats: Object with avgWpm, totalRaces, etc.
- Trends: Array of date-based trend data
- By Language: Array of language stats
- Recent: Array of recent race results

---

### Day 6-7: Frontend Dashboard Page (4-5 hours)

#### 2.6: Create API Client Functions (30 min)

**File:** `packages/webapp-next/common/api/dashboard.ts`

```typescript
import { SERVER_URL } from "./constants";

export interface DashboardStats {
  avgWpm: number;
  avgAccuracy: number;
  totalRaces: number;
  favoriteLanguage: string;
  totalTimeMinutes: number;
}

export interface TrendData {
  date: string;
  avgWpm: number;
  avgAccuracy: number;
  raceCount: number;
}

export interface LanguageStats {
  language: string;
  raceCount: number;
  avgWpm: number;
  avgAccuracy: number;
}

export interface RecentRace {
  id: string;
  wpm: number;
  accuracy: number;
  language: string;
  createdAt: string;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${SERVER_URL}/api/dashboard/stats`);
  return response.json();
}

export async function fetchDashboardTrends(
  days: number = 30,
): Promise<TrendData[]> {
  const response = await fetch(
    `${SERVER_URL}/api/dashboard/trends?days=${days}`,
  );
  return response.json();
}

export async function fetchLanguageStats(): Promise<LanguageStats[]> {
  const response = await fetch(`${SERVER_URL}/api/dashboard/by-language`);
  return response.json();
}

export async function fetchRecentRaces(
  limit: number = 10,
): Promise<RecentRace[]> {
  const response = await fetch(
    `${SERVER_URL}/api/dashboard/recent?limit=${limit}`,
  );
  return response.json();
}
```

---

#### 2.7: Create Dashboard Store (30 min)

**File:** `packages/webapp-next/common/state/dashboard-store.ts`

```typescript
import { create } from "zustand";
import {
  DashboardStats,
  TrendData,
  LanguageStats,
  RecentRace,
  fetchDashboardStats,
  fetchDashboardTrends,
  fetchLanguageStats,
  fetchRecentRaces,
} from "../api/dashboard";

interface DashboardState {
  stats: DashboardStats | null;
  trends: TrendData[];
  languageStats: LanguageStats[];
  recentRaces: RecentRace[];
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTrends: (days?: number) => Promise<void>;
  fetchLanguageStats: () => Promise<void>;
  fetchRecentRaces: (limit?: number) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  trends: [],
  languageStats: [],
  recentRaces: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await fetchDashboardStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTrends: async (days = 30) => {
    try {
      const trends = await fetchDashboardTrends(days);
      set({ trends });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchLanguageStats: async () => {
    try {
      const languageStats = await fetchLanguageStats();
      set({ languageStats });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchRecentRaces: async (limit = 10) => {
    try {
      const recentRaces = await fetchRecentRaces(limit);
      set({ recentRaces });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        useDashboardStore.getState().fetchStats(),
        useDashboardStore.getState().fetchTrends(),
        useDashboardStore.getState().fetchLanguageStats(),
        useDashboardStore.getState().fetchRecentRaces(),
      ]);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

---

#### 2.8: Create Dashboard Components (150 min)

**File:** `packages/webapp-next/common/components/dashboard/DashboardHeader.tsx`

```typescript
import React from 'react';
import { DashboardStats } from '../../api/dashboard';

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
}

export function DashboardHeader({ stats, loading }: Props) {
  if (loading || !stats) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (stats.totalRaces === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No races completed yet. Start typing to see your stats!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Average WPM"
        value={stats.avgWpm.toFixed(1)}
      />
      <StatCard
        label="Average Accuracy"
        value={`${stats.avgAccuracy.toFixed(1)}%`}
      />
      <StatCard
        label="Total Races"
        value={stats.totalRaces}
      />
      <StatCard
        label="Favorite Language"
        value={stats.favoriteLanguage}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
```

**File:** `packages/webapp-next/common/components/dashboard/TrendsChart.tsx`

```typescript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData } from '../../api/dashboard';

interface Props {
  trends: TrendData[];
}

export function TrendsChart({ trends }: Props) {
  if (trends.length === 0) {
    return <div className="text-gray-500 text-center py-8">No trend data available</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-bold text-white mb-4">WPM Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgWpm"
            stroke="#3B82F6"
            name="WPM"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="avgAccuracy"
            stroke="#10B981"
            name="Accuracy %"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**File:** `packages/webapp-next/common/components/dashboard/LanguageBreakdown.tsx`

```typescript
import React from 'react';
import { LanguageStats } from '../../api/dashboard';

interface Props {
  languageStats: LanguageStats[];
}

export function LanguageBreakdown({ languageStats }: Props) {
  if (languageStats.length === 0) {
    return <div className="text-gray-500 text-center py-8">No language data available</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-bold text-white mb-4">By Language</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-gray-400">Language</th>
              <th className="pb-3 text-gray-400">Races</th>
              <th className="pb-3 text-gray-400">Avg WPM</th>
              <th className="pb-3 text-gray-400">Avg Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {languageStats.map((stat) => (
              <tr key={stat.language} className="border-b border-gray-700">
                <td className="py-3 text-white font-medium">{stat.language}</td>
                <td className="py-3 text-gray-300">{stat.raceCount}</td>
                <td className="py-3 text-gray-300">{stat.avgWpm.toFixed(1)}</td>
                <td className="py-3 text-gray-300">{stat.avgAccuracy.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**File:** `packages/webapp-next/common/components/dashboard/RecentHistory.tsx`

```typescript
import React from 'react';
import { useRouter } from 'next/router';
import { RecentRace } from '../../api/dashboard';

interface Props {
  recentRaces: RecentRace[];
}

export function RecentHistory({ recentRaces }: Props) {
  const router = useRouter();

  if (recentRaces.length === 0) {
    return <div className="text-gray-500 text-center py-8">No recent races</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Recent Races</h2>
      <div className="space-y-3">
        {recentRaces.map((race) => (
          <div
            key={race.id}
            className="bg-gray-700 p-4 rounded cursor-pointer hover:bg-gray-600 transition"
            onClick={() => router.push(`/results/${race.id}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white font-medium">{race.language}</span>
                <span className="text-gray-400 text-sm ml-3">
                  {new Date(race.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-blue-400">{race.wpm.toFixed(1)} WPM</span>
                <span className="text-green-400">{race.accuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

#### 2.9: Create Dashboard Page (30 min)

**File:** `packages/webapp-next/pages/dashboard.tsx`

```typescript
import React, { useEffect } from 'react';
import { useDashboardStore } from '../common/state/dashboard-store';
import { DashboardHeader } from '../common/components/dashboard/DashboardHeader';
import { TrendsChart } from '../common/components/dashboard/TrendsChart';
import { LanguageBreakdown } from '../common/components/dashboard/LanguageBreakdown';
import { RecentHistory } from '../common/components/dashboard/RecentHistory';

export default function DashboardPage() {
  const {
    stats,
    trends,
    languageStats,
    recentRaces,
    loading,
    error,
    fetchAll
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <DashboardHeader stats={stats} loading={loading} />
      <TrendsChart trends={trends} />
      <LanguageBreakdown languageStats={languageStats} />
      <RecentHistory recentRaces={recentRaces} />
    </div>
  );
}
```

---

#### 2.10: Add Navigation Link (15 min)

**File:** `packages/webapp-next/common/components/NewNavbar.tsx`

**Add to navigation items:**

```typescript
// Find the navigation items array and add:
{
  label: 'Dashboard',
  href: '/dashboard',
  icon: <ChartBarIcon className="w-5 h-5" /> // Or appropriate icon
}
```

---

### Day 8: Testing & Polish (1-2 hours)

#### 2.11: Integration Testing (45 min)

**Test Workflow:**

1. Complete 5-10 races across different languages
2. Navigate to `/dashboard`
3. Verify all sections display correctly:
   - [ ] Header shows correct stats
   - [ ] Trends chart renders with data
   - [ ] Language breakdown table populated
   - [ ] Recent history shows races
4. Test interactions:
   - [ ] Click recent race → navigates to results page
   - [ ] Stats update after completing new race (refresh page)

**Edge Case Testing:**

```bash
# Test with empty database
rm packages/back-nest/speedtyper-local.db
npm run dev
# Navigate to /dashboard
# Expected: "No races completed yet" message
```

---

#### 2.12: Performance Check (30 min)

**Database Query Performance:**

```bash
sqlite3 packages/back-nest/speedtyper-local.db ".timer on"

# Test queries
sqlite3 speedtyper-local.db "SELECT AVG(wpm) FROM result WHERE userId = 'local-user-id';"
sqlite3 speedtyper-local.db "SELECT language, COUNT(*), AVG(wpm) FROM result r JOIN challenge c ON r.challengeId = c.id WHERE userId = 'local-user-id' GROUP BY language;"
```

**Target:** <50ms for all dashboard queries

**Frontend Performance:**

- Dashboard page load: <500ms
- Chart rendering: <100ms
- No layout shifts

---

## Phase 3: Final Verification (Day 9-10, 2-3 hours)

### 3.1: Complete Smoke Test (60 min)

**Full Test Checklist:**

```bash
# 1. Fresh install test
rm packages/back-nest/speedtyper-local.db
npm run dev
```

**Browser Testing:**

- [ ] Navigate to localhost:3001
- [ ] Local user created automatically
- [ ] Complete typing session
- [ ] Result saves with local user ID
- [ ] Dashboard accessible
- [ ] Complete 3 more races
- [ ] Dashboard updates correctly
- [ ] All existing features work (results page, language selection)
- [ ] No console errors (frontend or backend)

**Database Verification:**

```bash
sqlite3 packages/back-nest/speedtyper-local.db "SELECT * FROM user WHERE legacyId = 'LOCAL_SUPER_USER';"
sqlite3 packages/back-nest/speedtyper-local.db "SELECT COUNT(*), COUNT(DISTINCT userId) FROM result;"
# Expected: Same count (all results have same userId)
```

---

### 3.2: Update Documentation (45 min)

**File:** `FEATURES.md`

```markdown
## Completed Features

### v1.4.0 Foundation Layer ✅

- **3.1 Stable User Identity**
  - Single persistent local user replaces ephemeral guests
  - All results consolidated under one user ID
  - Migration script available: `npm run migrate:local-user`
- **3.2 Progress Dashboard**
  - Average WPM and accuracy tracking
  - WPM trends over time (line chart)
  - Language breakdown statistics
  - Recent race history with quick access
  - Access via `/dashboard` route
```

**File:** `ARCHITECTURE.md`

Add section:

```markdown
## Dashboard System

### Architecture

- Backend: REST API endpoints (`/api/dashboard/*`)
- Service layer: DashboardService (TypeORM queries)
- Frontend: Zustand store + React components
- Charts: Recharts library

### Endpoints

- `GET /api/dashboard/stats` - High-level KPIs
- `GET /api/dashboard/trends?days=30` - Time-series data
- `GET /api/dashboard/by-language` - Language breakdown
- `GET /api/dashboard/recent?limit=10` - Recent races

### Performance

- Queries optimized with indexes on `userId`, `createdAt`
- Target: <50ms per query
- Frontend: Memoized components, single fetch on mount
```

**File:** `README-LOCAL.md`

Update features section:

```markdown
## Features

### Progress Tracking

- **Dashboard**: View your typing statistics over time
  - Average WPM and accuracy
  - Performance trends (7/30/90 days)
  - Language-specific breakdown
  - Recent race history
- **Persistent Identity**: All your results tracked under one user
```

**File:** `CHANGELOG.md`

```markdown
## [1.4.0] - 2025-XX-XX

### Added

- Stable user identity system (LocalUserService)
- Progress dashboard with WPM trends, accuracy stats
- Language breakdown analytics
- Recent race history view
- Data migration script for consolidating old guest users

### Changed

- Guest user system replaced with persistent local user
- All results now assigned to single local user

### Technical

- New DashboardModule with REST API endpoints
- LocalUserService for user management
- Dashboard Zustand store for state management
- Recharts integration for data visualization
```

---

### 3.3: Create Git Tag (15 min)

```bash
# Ensure all changes committed
git status
git add .
git commit -m "Release v1.4.0: Stable user identity + progress dashboard

- LocalUserService for persistent user identity
- Dashboard with WPM trends and language stats
- Migration script for consolidating guest users
- Full test coverage and documentation"

# Create and push tag
git tag v1.4.0
git push origin main
git push origin v1.4.0
```

---

### 3.4: Test Rollback (30 min)

**Simulate rollback scenario:**

```bash
# Backup current database (has v1.4.0 data)
cp packages/back-nest/speedtyper-local.db packages/back-nest/speedtyper-local.db.v1.4.0

# Rollback to v1.3.1
git checkout v1.3.1
npm install
npm run dev

# Test in browser
# Expected: Typing still works (basic functionality preserved)
# Expected: Dashboard route doesn't exist (feature not present)
# Expected: Results page works
# Complete one typing session - verify it saves

# Return to v1.4.0
git checkout v1.4.0
npm install
npm run dev

# Verify: All features work again
# Verify: Dashboard accessible
```

**Success Criteria:**

- [ ] v1.3.1 rollback works (typing functional)
- [ ] v1.4.0 restoration successful
- [ ] No data loss during rollback/restore

---

## Success Criteria Summary

### Feature 3.1: Stable User Identity ✅

- [ ] Single local user created on first launch
- [ ] All results assigned to same userId
- [ ] Migration script tested and documented
- [ ] No breaking changes to typing workflow
- [ ] LocalUserService cached for performance

### Feature 3.2: Progress Dashboard ✅

- [ ] Dashboard displays all metrics correctly
- [ ] Charts render without errors
- [ ] Navigation integrated seamlessly
- [ ] Performance acceptable (<100ms page load)
- [ ] Empty state handled gracefully
- [ ] Recent races link to results page

### General Requirements ✅

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Git tagged (v1.4.0)
- [ ] Rollback tested successfully
- [ ] No console errors
- [ ] Core typing functionality unchanged

---

## Rollback Procedure

If critical issues discovered:

```bash
# Stop application
Ctrl+C

# Rollback code
git checkout v1.3.1
npm install
npm run dev

# If database issues, restore backup
cp packages/back-nest/speedtyper-local.db.backup packages/back-nest/speedtyper-local.db

# Verify typing works
# Complete test workflow
```

**When to Rollback:**

- LocalUserService causes authentication errors
- Dashboard queries cause performance degradation (>100ms)
- Data migration corrupts database
- Critical typing functionality broken

---

## Handoff to Phase 1.5.0

**What's Ready:**

- ✅ Stable userId for storing user preferences
- ✅ Dashboard infrastructure (can add skip stats later)
- ✅ LocalUserService pattern established

**What v1.5.0 Needs:**

- Review: How to store skip preferences (add to User entity or separate table)
- Consider: Dashboard integration for skip statistics
- Note: Skip ranges will use LocalUserService.getLocalUser() for userId

**Prepare Before Starting v1.5.0:**

- Review existing keystroke validation system
- Study code-store.ts index management
- Understand WebSocket challenge payload structure
