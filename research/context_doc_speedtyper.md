# Context Document: Speedtyper.dev Local Simplification Project

## Executive Summary

The user wants to create a local, solo version of **speedtyper.dev** (https://github.com/codicocodes/speedtyper.dev) that removes multiplayer complexity while preserving the excellent frontend typing experience. They've commissioned Gemini Deep Research (GDR) to analyze all viable approaches and provide evidence-based recommendations.

**Next Session Goals:**

1. Review GDR's research report
2. Validate GDR's findings against the actual repository
3. Make final architectural decisions based on verified evidence
4. Create implementation roadmap

---

## The Problem

### What is speedtyper.dev?

A real-time multiplayer typing practice application specifically designed for programmers. Users type code snippets from real open-source projects and can compete in races with other developers.

**Current Architecture:**

- **Frontend**: Next.js 12.2.5 + TypeScript + Zustand + Socket.IO client
- **Backend**: NestJS 9.0.0 + PostgreSQL + TypeORM + Socket.IO server
- **Features**: Multiplayer races, GitHub OAuth, tree-sitter parsing for 15+ languages
- **Deployment**: Docker-based with docker-compose

**GitHub Repository**: https://github.com/codicocodes/speedtyper.dev

### What's Wrong With Current Setup?

**Friction Points:**

1. **Startup complexity**: Docker + multiple terminals + 5-10 minutes to get running
2. **Random snippets**: Code from random GitHub projects, not the user's own code
3. **Multiplayer overhead**: Complex race system, WebSocket infrastructure the user doesn't need
4. **Authentication**: GitHub OAuth for features the user won't use locally

**User's Current Workflow:**

```bash
# 10 minutes of friction:
git clone repo
docker-compose up -d postgres
docker-compose up backend  # Wait for builds...
cd frontend && npm install && npm run dev  # New terminal, wait...
# Manually open browser, navigate to localhost:3000
# Get random code snippet they don't care about
```

**Desired Workflow:**

```bash
# One command, < 1 minute to typing:
[single command]  # Could be: ./start.sh, docker-compose up, python start.py, npm start
# Browser auto-opens → immediately presented with their own code to practice
```

---

## User's Goals (Priority-Ranked)

### 🔴 Priority 1: Non-Negotiable

1. **Use own code snippets**: Practice typing their Python/TypeScript/React code, not random GitHub code
2. **Minimal startup friction**: One command → typing in < 1 minute
3. **Preserve frontend quality**: Keep excellent typing interface, WPM/accuracy metrics, syntax highlighting

### 🟡 Priority 2: Strong Preferences (Negotiable)

4. **Simplify complexity**: Remove/disable multiplayer features
5. **Reduce cognitive load**: Easier to understand, maintain, restart after not using for weeks
6. **Align with skills**: User is Python-first (6+ years), minimal React knowledge (1/10)

### 🟢 Priority 3: Nice-to-Have (Flexible)

7. **Avoid Docker** (but not opposed if Docker IS simplest)
8. **Python backend** (but not if keeping NestJS is faster)
9. **Lightweight database** (but not if PostgreSQL migration is complex)

**CRITICAL INSIGHT**: User initially stated anti-Docker/pro-Python preferences, but explicitly clarified these should NOT constrain the research. They want the **optimal solution**, not the solution that matches initial biases.

---

## User's Constraints

**Timeline**: 1 week maximum

**Technical Profile:**

- **Python Backend**: B-level (Flask), B/C-level (Django), D-level (FastAPI)
- **Frontend**: C-level JavaScript, 1/10 React/Next.js (treat as black box)
- **TypeScript/Node.js**: C/D-level
- **DevOps**: Minimal Docker knowledge, prefers avoiding it but pragmatic about it

**Risk Tolerance:**

- **LOW** for frontend changes (it works well, don't break it)
- **MEDIUM** for backend changes (comfortable territory)
- **HIGH** for deployment/startup simplification (willing to experiment)

**Budget**: Zero (open-source only)

**Development Environment:**

- VS Code primary IDE
- Dual monitor setup
- Windows + ConEmu terminal
- Python-first workflow (thinks in Python)

---

## Verified Technical Architecture

The user provided a detailed architecture specification (`speedtyper-factcheck.md`) with verified information from the repository:

### Frontend Structure (`packages/webapp-next/`)

- Next.js 12.2.5, TypeScript 4.8.2, Tailwind CSS 3.1.8
- Zustand 4.1.1 for state management
- Socket.IO Client v2.x (with latest version alias)
- SWR 2.0.3 for data fetching
- Highlight.js 11.6.0 for syntax highlighting
- Key stores: `code-store`, `game-store`, `connection-store`, `settings-store`, `trends-store`

### Backend Structure (`packages/back-nest/`)

- NestJS 9.0.0, TypeScript 4.7.4
- PostgreSQL via TypeORM 0.3.10
- Socket.IO 4.5.2 for real-time races
- Passport 0.6.0 + passport-github for OAuth
- Sessions stored in PostgreSQL (connect-typeorm 2.0.0)
- Tree-sitter 0.20.0 with 15+ language parsers

**Key Backend Modules:**

- `auth/` - GitHub OAuth
- `challenges/` - Challenge management, parsing, import
- `races/` - Race gateway, countdown, keystroke validation, progress
- `results/` - Result calculation
- `projects/` - GitHub project import/sync
- `users/` - User management
- `sessions/` - Session storage

### Notable Details

1. **No Next.js API routes**: Backend is completely separate NestJS app
2. **Session storage**: PostgreSQL-backed (not Redis or separate store)
3. **Monorepo**: Yarn workspace with separate packages
4. **Socket.IO version mismatch**: Backend v4.5.2, Frontend v2.x (potential compatibility issue)
5. **Tree-sitter integration**: Backend uses tree-sitter to parse real GitHub repos and extract typing challenges

---

## Research Questions Sent to GDR

The user commissioned Gemini Deep Research with a comprehensive, solution-agnostic prompt asking for:

### Tier 1: Critical Path Analysis (Must Answer First)

1. **Comprehensive Approach Comparison**: Evaluate ALL approaches (simplify existing, hybrid, minimal fork, alternatives)
2. **Frontend-Backend Coupling**: How tightly integrated? Can backend be swapped?
3. **Startup Simplification**: Compare Docker-optimized vs. process managers vs. shell scripts vs. monorepo tools
4. **Custom Snippet System**: Tree-sitter vs. simple file-based vs. hybrid approach

### Tier 2: Implementation Details

5. **WebSocket Necessity**: Is Socket.IO needed for solo mode? Can it be replaced with REST?
6. **Auth & Multiplayer Removal**: Safest way to remove unused features
7. **Database Migration**: PostgreSQL → SQLite feasibility assessment

### Tier 3: Optimization

8. **State Management Cleanup**: Zustand store simplification for solo mode

**Key Instruction to GDR**: "Help me make the smartest decisions, not necessarily the decisions that match my initial assumptions."

---

## Critical Considerations for Next Session

### What We Need to Validate

When reviewing GDR's report, verify claims against the actual repository:

1. **API Contract Claims**
   - GDR may infer API endpoints/WebSocket events
   - User can share actual controller/gateway files to verify
   - Check: Are GDR's assumptions about coupling accurate?

2. **Architecture Recommendations**
   - GDR may recommend specific approaches (keep NestJS, rewrite, etc.)
   - User can share specific module files to validate complexity assessments
   - Check: Are time estimates realistic given actual codebase?

3. **Migration Feasibility**
   - GDR may claim "easy migration" or "complex migration"
   - User can share entity files, schemas to verify
   - Check: Did GDR understand the actual database complexity?

4. **Frontend Dependencies**
   - GDR may assess frontend-backend coupling
   - User can share relevant frontend components/stores
   - Check: Did GDR identify actual integration points?

### Questions to Ask GDR's Report

1. **Completeness**: Did GDR answer all 8 research questions?
2. **Evidence Quality**: Are recommendations backed by real examples/projects?
3. **Feasibility Assessment**: Are time estimates realistic for 1-week constraint?
4. **Trade-off Clarity**: Did GDR clearly explain costs/benefits of each approach?
5. **Decision Support**: Can we make confident architectural choice based on findings?
6. **Risk Identification**: Did GDR flag high-risk approaches clearly?
7. **Verification Needs**: What claims need verification against actual repo?

### Expected Decision Points

After reviewing GDR's report, the user needs to decide:

1. **Backend Strategy**: Keep NestJS simplified OR rewrite in Python
2. **Startup Method**: Docker-optimized OR process manager OR shell script
3. **Database Approach**: Keep PostgreSQL OR migrate to SQLite
4. **WebSocket Handling**: Keep Socket.IO OR replace with REST
5. **Snippet System**: Keep tree-sitter OR simplify to file-based
6. **Implementation Order**: Which components to tackle first

---

## User's Communication Preferences

**For this specific project:**

- **Treat frontend as black box**: Minimize React/Next.js changes
- **Be pragmatic over idealistic**: Working > perfect
- **Challenge assumptions**: Don't confirm biases, find optimal solution
- **Show trade-offs clearly**: No silver bullets, just informed choices
- **Provide evidence**: Real examples > theoretical approaches
- **Flag risks explicitly**: Especially frontend breakage risk
- **Estimate time realistically**: User has only 1 week

**Red Flags to Watch For:**

- GDR recommending approaches that require extensive React knowledge
- Time estimates that don't account for learning curves
- Solutions that increase complexity to avoid Docker/PostgreSQL
- Theoretical solutions without working examples
- Missing risk assessments

---

## Context for Future Claude

**Your Role in Next Session:**

You are reviewing Gemini Deep Research's findings with the user. Your job is to:

1. **Analyze GDR's report critically**: Did it answer the questions? Are recommendations sound?
2. **Identify verification needs**: What claims should user verify against actual repo?
3. **Synthesize decision framework**: Help user choose optimal approach based on evidence
4. **Create implementation roadmap**: Break chosen approach into actionable steps
5. **Flag risks and gaps**: What did GDR miss? What's unclear?

**You should NOT:**

- Re-research what GDR already researched
- Make decisions without evidence from GDR's report
- Assume GDR's findings are correct without verification
- Ignore trade-offs in favor of user's original preferences

**User will provide:**

1. This context document (what you're reading now)
2. GDR's complete research report
3. Potentially: specific files from the repository for verification

**Your immediate tasks:**

1. Confirm you understand the problem context
2. Review GDR's report comprehensively
3. Assess: Did GDR deliver on the research brief?
4. Identify: What needs verification from the actual repo?
5. Synthesize: What's the recommended path forward based on evidence?

---

## Key Files from Repository (For Reference)

**User provided these documents in previous session:**

1. **speedtyper-factcheck.md**: Comprehensive verified architecture spec
2. **GDR.txt**: Brief explanation of Gemini Deep Research feature
3. **Blind Spot Navigator persona**: The meta-prompt defining your role

**User may provide in next session:**

- Actual source files from the repository for verification
- Specific components/modules mentioned in GDR's report
- Database schemas, API endpoints, or other technical details

---

## Success Criteria for Next Session

The session will be successful if:

1. ✅ We validate GDR's key findings against the actual repository
2. ✅ We identify any gaps, errors, or unclear areas in GDR's research
3. ✅ We make confident architectural decisions based on verified evidence
4. ✅ We create a clear, actionable implementation roadmap
5. ✅ We understand top 3 risks and mitigation strategies
6. ✅ User can start implementation immediately after the session

**Ultimate Goal**: User should leave the session with confidence about their approach and a clear path to achieving their goals within the 1-week timeline.

---

## Quick Reference: The Core Problem

**FROM**: Complex Docker setup, random snippets, 10-minute startup, multiplayer overhead
**TO**: One-command startup (< 1 min), own code snippets, solo experience, preserved frontend quality
**CONSTRAINT**: 1 week, minimal React changes, Python-first developer
**RESEARCH STATUS**: Awaiting GDR's comprehensive analysis of all viable approaches

**Next step**: Review GDR's report and validate findings.
