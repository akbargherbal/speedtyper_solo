# Phase 1.6.0: Visual Enhancement (Syntax Highlighting)

**Duration:** 4-6 weeks  
**Risk Level:** 🔴 HIGH  
**Rollback Target:** v1.5.1

---

## ⚠️ CRITICAL PRE-CONDITION

**DO NOT IMPLEMENT WITHOUT COMPLETING PHASE 0 USER VALIDATION**

This feature requires significant architectural rework and development time. Must prove value before investing resources.

---

## Context

**What We're Building:**

- Dynamic syntax highlighting during typing
- Pre-tokenized overlay system (not live Highlight.js)
- Tree-sitter token extraction
- Dual-layer rendering (tokens + feedback)

**Why This Phase Matters:**

- Visual enhancement (may improve focus/speed)
- Modern IDE-like experience
- Leverages existing Tree-sitter infrastructure

**Dependencies:**

- Builds on: v1.5.1 (Tree-sitter parser, skip ranges)
- Enables: Nothing - purely visual, optional feature

**Critical:** This is NOT required for functionality. v1.5.1 is a complete, working product.

---

## Phase 0: User Validation & Prototyping

**Duration:** Week 1-2, 8-10 hours

### ⚠️ MANDATORY - DO NOT SKIP

### 0.1: Current State Analysis (2 hours)

**Benchmark existing Highlight.js:**

```bash
cat packages/webapp-next/modules/play2/components/TypedChars.tsx | grep -A 10 "highlightjs"
```

**Performance Test:**

1. Load 500-char snippet
2. Open Chrome DevTools → Performance tab
3. Start profiling
4. Type through entire snippet
5. Stop profiling

**Analyze:**

- Highlight.js invocation count (should be on every keystroke)
- Re-tokenization frequency (re-parses entire typed text each time)
- Frame rate during typing (target: 60fps / 16ms per frame)
- Total render time per keystroke

**Expected Findings:**

- Highlight.js called repeatedly (O(n) complexity per keystroke)
- Performance degrades with longer typed text
- Inefficient for live typing

**Document:** Screenshot performance timeline, note bottlenecks

---

### 0.2: Build Minimal Prototype (4-6 hours)

**Create:** `packages/webapp-next/test-syntax-highlight.html`

**Purpose:** Prove pre-tokenized overlay concept works

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Syntax Highlighting Prototype</title>
    <style>
      body {
        background: #1e1e1e;
        color: #d4d4d4;
        font-family: "Fira Code", monospace;
        font-size: 16px;
        padding: 20px;
      }

      #code-display {
        line-height: 1.6;
        white-space: pre;
      }

      /* Token colors (VS Code Dark+ theme) */
      .token-keyword {
        color: #569cd6;
      }
      .token-function {
        color: #dcdcaa;
      }
      .token-string {
        color: #ce9178;
      }
      .token-number {
        color: #b5cea8;
      }
      .token-comment {
        color: #6a9955;
        font-style: italic;
      }
      .token-identifier {
        color: #9cdcfe;
      }
      .token-operator {
        color: #d4d4d4;
      }
      .token-type {
        color: #4ec9b0;
      }

      /* Feedback overlays */
      .char-correct {
        border-bottom: 2px solid rgba(0, 255, 0, 0.3);
      }

      .char-incorrect {
        background: rgba(255, 0, 0, 0.3);
        color: #fff;
      }

      .char-untyped {
        opacity: 0.4;
      }

      .char-skipped {
        opacity: 0.2;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <h1>Syntax Highlighting Prototype</h1>
    <p>Type the code below. Observe performance and visual clarity.</p>
    <div id="code-display"></div>

    <script>
      // Pre-calculated tokens (simulates backend response)
      const tokens = [
        { type: "keyword", start: 0, end: 5, text: "const" },
        { type: "identifier", start: 6, end: 6, text: "x" },
        { type: "operator", start: 8, end: 8, text: "=" },
        { type: "number", start: 10, end: 10, text: "5" },
        { type: "keyword", start: 13, end: 18, text: "const" },
        { type: "identifier", start: 19, end: 19, text: "y" },
        { type: "operator", start: 21, end: 21, text: "=" },
        { type: "number", start: 23, end: 24, text: "10" },
      ];

      const code = "const x = 5;\nconst y = 10;";
      let typedIndex = 0;
      let incorrectIndices = new Set();

      // Build character-to-token lookup (O(n) once)
      const charTokenMap = new Map();
      tokens.forEach((token) => {
        for (let i = token.start; i <= token.end; i++) {
          charTokenMap.set(i, token);
        }
      });

      function renderCode() {
        const display = document.getElementById("code-display");
        let html = "";

        // Render each character (O(n) per render)
        for (let i = 0; i < code.length; i++) {
          const char = code[i];
          const token = charTokenMap.get(i);
          const tokenClass = token ? `token-${token.type}` : "";

          // Determine feedback state
          let feedbackClass = "char-untyped";
          if (i < typedIndex) {
            feedbackClass = incorrectIndices.has(i)
              ? "char-incorrect"
              : "char-correct";
          }

          // Combine classes
          const classes = `${tokenClass} ${feedbackClass}`;

          // Render span
          html += `<span class="${classes}">${char === "\n" ? "<br>" : char}</span>`;
        }

        display.innerHTML = html;
      }

      // Handle typing
      document.addEventListener("keypress", (e) => {
        if (typedIndex >= code.length) return;

        const expected = code[typedIndex];

        if (e.key === expected) {
          // Correct
          typedIndex++;
        } else {
          // Incorrect
          incorrectIndices.add(typedIndex);
          typedIndex++;
        }

        renderCode();
      });

      // Initial render
      renderCode();

      // Performance measurement
      let keystrokeCount = 0;
      let totalTime = 0;

      document.addEventListener("keypress", () => {
        const start = performance.now();
        renderCode();
        const end = performance.now();

        keystrokeCount++;
        totalTime += end - start;

        if (keystrokeCount % 10 === 0) {
          console.log(
            `Avg render time: ${(totalTime / keystrokeCount).toFixed(2)}ms`,
          );
        }
      });
    </script>
  </body>
</html>
```

**Test Prototype:**

1. Open `test-syntax-highlight.html` in browser
2. Type the code (`const x = 5;...`)
3. Observe:
   - Token colors display correctly?
   - Feedback overlay works?
   - Performance smooth (check console for render times)?
   - Any visual issues (color conflicts, readability)?

**Success Metrics:**

- Render time: <5ms per keystroke (much faster than current)
- No frame drops while typing
- Token colors don't interfere with feedback
- Clear visual hierarchy

---

### 0.3: User Testing (2 hours)

**Recruit:** 5-10 users (or extensive self-testing)

**Test Protocol:**

**Session A: Without Highlighting**

1. Use v1.5.1 (current stable)
2. Type 3 medium-length snippets (200-300 chars each)
3. Record: WPM, accuracy, subjective experience

**Session B: With Highlighting**

1. Use prototype (or v1.6.0 if implementing)
2. Type same 3 snippets
3. Record: WPM, accuracy, subjective experience

**Questions:**

- Which version felt better to use?
- Did highlighting help or distract?
- Was performance noticeably different?
- Would you prefer to have it on/off by default?

**Measurement:**

- WPM comparison (with vs without)
- Accuracy comparison
- User preference percentage

---

### 0.4: Decision Gate (CRITICAL)

**Proceed with v1.6.0 IF:**

- ✅ WPM improves by >5% OR
- ✅ >70% of users prefer highlighting OR
- ✅ Strong subjective benefit reported

**DEFER to v1.7.0+ IF:**

- ❌ No measurable benefit
- ❌ Users find it distracting
- ❌ Performance concerns in prototype

**If deferring:** Skip to "Handoff" section, mark v1.6.0 as future work

---

## Phase 1: Backend Tokenization Service

**Duration:** Weeks 3-4, 8-10 hours

**⚠️ Only proceed if Phase 0 validation passed**

### 1.1: Create Syntax Tokenizer Service (4 hours)

**File:** `packages/back-nest/src/challenges/services/syntax-tokenizer.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { ParserService } from "./parser.service";

export interface SyntaxToken {
  type: TokenType;
  start: number; // Character index
  end: number; // Character index (inclusive)
  text: string;
}

export type TokenType =
  | "keyword"
  | "function"
  | "string"
  | "number"
  | "comment"
  | "identifier"
  | "operator"
  | "type"
  | "property"
  | "text";

@Injectable()
export class SyntaxTokenizerService {
  constructor(private parserService: ParserService) {}

  async tokenize(code: string, language: string): Promise<SyntaxToken[]> {
    try {
      const parser = await this.parserService.getParser(language);
      const tree = parser.parse(code);

      const tokens: SyntaxToken[] = [];

      // Traverse AST and extract tokens
      this.traverseNode(tree.rootNode, tokens, language);

      // Sort by start position
      tokens.sort((a, b) => a.start - b.start);

      return tokens;
    } catch (error) {
      console.error("[SyntaxTokenizer] Parsing failed:", error);
      return []; // Graceful fallback
    }
  }

  private traverseNode(
    node: any,
    tokens: SyntaxToken[],
    language: string,
  ): void {
    // Map Tree-sitter node type to token type
    const tokenType = this.mapNodeTypeToTokenType(node.type, language);

    if (tokenType && node.text) {
      tokens.push({
        type: tokenType,
        start: node.startIndex,
        end: node.endIndex - 1, // Make inclusive
        text: node.text,
      });
    }

    // Recurse into children
    for (const child of node.children || []) {
      this.traverseNode(child, tokens, language);
    }
  }

  private mapNodeTypeToTokenType(
    nodeType: string,
    language: string,
  ): TokenType | null {
    // Universal mappings
    const universal: Record<string, TokenType> = {
      comment: "comment",
      string: "string",
      number: "number",
      integer: "number",
      float: "number",
      identifier: "identifier",
      property_identifier: "property",
    };

    if (universal[nodeType]) {
      return universal[nodeType];
    }

    // Language-specific mappings
    const mappings: Record<string, Record<string, TokenType>> = {
      python: {
        def: "keyword",
        class: "keyword",
        if: "keyword",
        else: "keyword",
        return: "keyword",
        import: "keyword",
        function_definition: "function",
      },
      typescript: {
        const: "keyword",
        let: "keyword",
        var: "keyword",
        function: "keyword",
        class: "keyword",
        interface: "keyword",
        type: "keyword",
        function_declaration: "function",
        type_identifier: "type",
      },
      javascript: {
        const: "keyword",
        let: "keyword",
        function: "keyword",
        function_declaration: "function",
      },
    };

    return mappings[language]?.[nodeType] || null;
  }
}
```

---

### 1.2: Cache Tokens in Challenge Entity (2 hours)

**File:** `packages/back-nest/src/challenges/entities/challenge.entity.ts`

**Add column:**

```typescript
@Entity()
export class Challenge {
  // ... existing fields

  @Column({ type: "text", nullable: true })
  tokens: string; // JSON serialized SyntaxToken[]
}
```

**Generate migration:**

```bash
npm run typeorm migration:generate -- -n AddTokensToChallenge
npm run typeorm migration:run
```

---

### 1.3: Integrate with Import Process (2-3 hours)

**File:** `packages/back-nest/src/challenges/commands/local-import-runner.ts`

**Modify import logic:**

```typescript
import { SyntaxTokenizerService } from "../services/syntax-tokenizer.service";

@Injectable()
export class LocalImportRunner {
  constructor(
    // ... existing
    private tokenizerService: SyntaxTokenizerService,
  ) {}

  async importFile(filePath: string, language: string): Promise<void> {
    // ... existing parsing logic

    for (const node of nodes) {
      // Tokenize content
      const tokens = await this.tokenizerService.tokenize(
        node.content,
        language,
      );

      // Create challenge
      const challenge = new Challenge();
      challenge.content = node.content;
      challenge.language = language;
      challenge.tokens = JSON.stringify(tokens); // Cache tokens
      // ... other fields

      await this.challengeRepo.save(challenge);
    }
  }
}
```

---

### 1.4: Emit Tokens via WebSocket (1 hour)

**File:** `packages/back-nest/src/races/race.gateway.ts`

**Modify challenge_selected event:**

```typescript
socket.emit("challenge_selected", {
  ...challenge,
  skipRanges: challenge.skipRanges || [],
  tokens: challenge.tokens ? JSON.parse(challenge.tokens) : [], // ADD THIS
});
```

---

### 1.5: Test Backend (2 hours)

**Test tokenization:**

```bash
# Create test endpoint (temporary)
# GET /api/challenges/:id/tokens

npm run start:dev

# Get challenge ID
sqlite3 packages/back-nest/speedtyper-local.db "SELECT id FROM challenge LIMIT 1;"

# Test
curl http://localhost:1337/api/challenges/CHALLENGE_ID/tokens
```

**Expected Output:**

```json
{
  "tokens": [
    { "type": "keyword", "start": 0, "end": 4, "text": "const" },
    { "type": "identifier", "start": 6, "end": 6, "text": "x" },
    ...
  ]
}
```

**Verify:**

- Token positions correct (match code indices)
- Token types appropriate for language
- Full code coverage (no gaps)

**Re-import snippets:**

```bash
# Reimport to generate tokens
npm run reimport

# Verify database
sqlite3 speedtyper-local.db "SELECT id, LEFT(tokens, 100) FROM challenge LIMIT 1;"
```

---

## Phase 2: Frontend Token-Based Rendering

**Duration:** Weeks 5-6, 10-12 hours

### 2.1: Create Token Rendering Component (4 hours)

**File:** `packages/webapp-next/modules/play2/components/TokenizedChars.tsx`

```typescript
import React, { useMemo } from 'react';
import clsx from 'clsx';

interface SyntaxToken {
  type: string;
  start: number;
  end: number;
  text: string;
}

interface Props {
  code: string;
  tokens: SyntaxToken[];
  typedIndex: number;
  incorrectIndices: number[];
  skipRanges?: Array<{ start: number; end: number; reason: string }>;
}

export const TokenizedChars = React.memo(({
  code,
  tokens,
  typedIndex,
  incorrectIndices,
  skipRanges = []
}: Props) => {
  // Build character-to-token lookup map (memoized)
  const charTokenMap = useMemo(() => {
    const map = new Map<number, SyntaxToken>();
    tokens.forEach(token => {
      for (let i = token.start; i <= token.end; i++) {
        map.set(i, token);
      }
    });
    return map;
  }, [tokens]);

  // Pre-compute token classes for each character
  const charClasses = useMemo(() => {
    return Array.from(code).map((char, index) => {
      const token = charTokenMap.get(index);
      return token ? `token-${token.type}` : '';
    });
  }, [code, charTokenMap]);

  // Helper: Check if in skip range
  const isSkipped = (index: number): boolean => {
    return skipRanges.some(r => index >= r.start && index <= r.end);
  };

  return (
    <div className="code-display">
      {Array.from(code).map((char, index) => {
        const tokenClass = charClasses[index];

        // Determine feedback state
        let feedbackClass = 'char-untyped';
        if (index < typedIndex) {
          if (incorrectIndices.includes(index)) {
            feedbackClass = 'char-incorrect';
          } else {
            feedbackClass = 'char-correct';
          }
        } else if (isSkipped(index)) {
          feedbackClass = 'char-skipped';
        }

        return (
          <span
            key={index}
            className={clsx(tokenClass, feedbackClass)}
          >
            {char === '\n' ? <br /> : char}
          </span>
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these change
  return (
    prevProps.typedIndex === nextProps.typedIndex &&
    prevProps.incorrectIndices.length === nextProps.incorrectIndices.length &&
    prevProps.code === nextProps.code
  );
});
```

---

### 2.2: Define Token Color Styles (2 hours)

**File:** `packages/webapp-next/styles/globals.css`

**Add token colors (VS Code Dark+ theme):**

```css
/* Syntax token colors */
.token-keyword {
  color: #569cd6;
  font-weight: 600;
}

.token-function {
  color: #dcdcaa;
}

.token-string {
  color: #ce9178;
}

.token-number {
  color: #b5cea8;
}

.token-comment {
  color: #6a9955;
  font-style: italic;
}

.token-identifier {
  color: #9cdcfe;
}

.token-operator {
  color: #d4d4d4;
}

.token-type {
  color: #4ec9b0;
  font-weight: 500;
}

.token-property {
  color: #9cdcfe;
}

/* Feedback overlays - subtle, don't overpower syntax colors */
.char-correct {
  /* No background - preserve token color */
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

.char-incorrect {
  /* Strong background - error should be obvious */
  background: rgba(255, 0, 0, 0.4);
  color: #fff !important; /* Override token color */
}

.char-untyped {
  opacity: 0.4;
}

.char-skipped {
  opacity: 0.2;
  font-style: italic;
}
```

---

### 2.3: Replace Existing Rendering (3-4 hours)

**File:** `packages/webapp-next/modules/play2/components/CodeArea.tsx`

**Find existing rendering:**

```typescript
// OLD (approximate structure)
<div className="code-container">
  <TypedChars chars={typedChars} />
  <UntypedChars chars={untypedChars} />
</div>
```

**Replace with:**

```typescript
import { TokenizedChars } from './TokenizedChars';
import { useCodeStore } from '../state/code-store';

// In component
const { code, tokens, currentIndex, incorrectIndices, skipRanges } = useCodeStore();
const syntaxHighlighting = useSettingsStore(s => s.syntaxHighlighting);

// Render
{syntaxHighlighting ? (
  <TokenizedChars
    code={code}
    tokens={tokens}
    typedIndex={currentIndex}
    incorrectIndices={incorrectIndices}
    skipRanges={skipRanges}
  />
) : (
  // Fallback to old rendering (toggle-able)
  <>
    <TypedChars chars={code.slice(0, currentIndex)} />
    <UntypedChars chars={code.slice(currentIndex)} />
  </>
)}
```

---

### 2.4: Extend Code Store (1 hour)

**File:** `packages/webapp-next/modules/play2/state/code-store.ts`

**Add to state:**

```typescript
interface CodeState {
  // ... existing
  tokens: SyntaxToken[];
}

// Add setter
setTokens(tokens: SyntaxToken[]) {
  this.tokens = tokens;
},
```

---

### 2.5: Update WebSocket Listener (1 hour)

**File:** `packages/webapp-next/modules/play2/services/Game.ts`

**Modify handler:**

```typescript
this.socket.subscribe("challenge_selected", (challenge: Challenge) => {
  codeStore.setCode(challenge.content);
  codeStore.setTokens(challenge.tokens || []);
  codeStore.setSkipRanges(challenge.skipRanges || []);
  // ... existing logic
});
```

---

## Phase 3: Performance Optimization

**Duration:** Week 7, 6-8 hours

### 3.1: React Rendering Optimization (3 hours)

**Already done:** Memoization in TokenizedChars component

**Additional optimizations:**

1. **Virtual Scrolling (if very long snippets):**

```typescript
// Use react-window or similar
import { FixedSizeList } from 'react-window';

// Only render visible lines
<FixedSizeList
  height={500}
  itemCount={lines.length}
  itemSize={20}
>
  {({ index, style }) => (
    <div style={style}>
      {renderLine(lines[index])}
    </div>
  )}
</FixedSizeList>
```

2. **Debounced Feedback Updates:**

```typescript
// Batch state updates
import { unstable_batchedUpdates } from "react-dom";

unstable_batchedUpdates(() => {
  codeStore.setTypedIndex(newIndex);
  codeStore.addIncorrectIndex(newIndex);
});
```

---

### 3.2: Token Lookup Optimization (2 hours)

**If charTokenMap.get() is slow:**

**Pre-compute token class array:**

```typescript
// In useMemo
const tokenClasses = useMemo(() => {
  return code.split("").map((_, i) => {
    const token = tokens.find((t) => i >= t.start && i <= t.end);
    return token ? `token-${token.type}` : "";
  });
}, [code, tokens]);

// In render, just use tokenClasses[i]
```

---

### 3.3: Performance Profiling (2-3 hours)

**Use React DevTools Profiler:**

1. Open React DevTools
2. Go to Profiler tab
3. Click "Start Profiling"
4. Type through 200-char snippet
5. Click "Stop Profiling"

**Analyze:**

- TokenizedChars render time (should be <16ms)
- Number of re-renders per keystroke (should be 1)
- Commit phase duration
- Any expensive child components

**Metrics to Track:**

```typescript
// Add performance marks
performance.mark("render-start");
// ... render logic
performance.mark("render-end");
performance.measure("render", "render-start", "render-end");

const renderTime = performance.getEntriesByName("render")[0].duration;
console.log("Render time:", renderTime, "ms");
```

**Targets:**

- TokenizedChars render: <16ms (60fps)
- Re-renders per keystroke: 1
- Total keystroke latency: <20ms (same as v1.5.1)

**If Performance Issues:**

- Use React.memo more aggressively
- Implement virtualization for long code
- Profile with Chrome DevTools (JS profiler)
- Consider Web Workers for tokenization (overkill, likely)

---

## Phase 4: Testing & Release

**Duration:** Week 8, 4-6 hours

### 4.1: Visual Regression Testing (2 hours)

**Test Matrix:**

| Language   | Features to Check                        |
| ---------- | ---------------------------------------- |
| TypeScript | Keywords, functions, strings colored     |
| Python     | Docstrings, decorators, keywords colored |
| JavaScript | Template literals, JSX syntax colored    |
| Java       | Annotations, types, keywords colored     |

**For Each:**

1. Import snippet with various syntax elements
2. Start race
3. Type through it
4. Verify:
   - [ ] Token colors correct
   - [ ] Feedback overlay visible on all token types
   - [ ] Incorrect characters clearly marked (red wins)
   - [ ] Skipped characters still visible (faint)
   - [ ] No color conflicts or readability issues

---

### 4.2: Performance Regression Test (1 hour)

**Compare with v1.5.1:**

**v1.5.1 (baseline):**

```bash
git checkout v1.5.1
npm run dev
# Measure WPM, keystroke latency, complete 5 races
```

**v1.6.0 (new):**

```bash
git checkout v1.6.0
npm run dev
# Measure WPM, keystroke latency, complete 5 races
```

**Compare:**

- Average WPM (should not decrease >5%)
- Keystroke latency (should stay <25ms)
- Subjective smoothness

**Acceptance Criteria:**

- No >5% WPM degradation
- Keystroke latency <25ms
- No visible frame drops

---

### 4.3: Feature Toggle Implementation (2 hours)

**Add setting:**

**File:** `packages/webapp-next/common/state/settings-store.ts`

```typescript
interface Settings {
  // ... existing
  syntaxHighlighting: boolean;
}

// Default to true (or false for beta)
syntaxHighlighting: true,

setSyntaxHighlighting(enabled: boolean) {
  this.syntaxHighlighting = enabled;
  // Persist to localStorage
  localStorage.setItem('syntaxHighlighting', String(enabled));
},
```

**File:** `packages/webapp-next/common/components/modals/SettingsModal.tsx`

```typescript
<ToggleSwitch
  label="Syntax Highlighting (Beta)"
  checked={settings.syntaxHighlighting}
  onChange={(enabled) => settingsStore.setSyntaxHighlighting(enabled)}
  description="Color-code syntax elements while typing"
/>
```

---

### 4.4: Documentation & Release (1 hour)

**File:** `ARCHITECTURE.md`

Add section:

```markdown
## Syntax Highlighting System (v1.6.0)

### Pre-Tokenization Approach

- Backend: Tree-sitter extracts tokens during import
- Tokens cached in Challenge entity (JSON column)
- Frontend: Token-based rendering (not live Highlight.js)

### Token Rendering

- Component: TokenizedChars (memoized)
- Character-to-token lookup map (O(1) access)
- Dual-layer: Token colors + feedback overlay
- Configurable: Can toggle on/off in settings

### Performance

- Target: <16ms render time (60fps)
- Memoization prevents unnecessary re-renders
- Graceful fallback if tokens missing
```

**File:** `README-LOCAL.md`

```markdown
## Features

### Syntax Highlighting (Beta)

- **IDE-like experience**: Color-coded syntax while typing
- **Performance**: Pre-tokenized for smooth rendering
- **Toggle-able**: Enable/disable in settings
- **Preserves feedback**: Error highlighting still visible
- **Works with skipping**: Skipped code still color-coded
```

**File:** `CHANGELOG.md`

```markdown
## [1.6.0] - 2025-XX-XX

### Added

- Dynamic syntax highlighting during typing
- Pre-tokenized rendering system
- Token-based color coding
- Feature toggle in settings
- VS Code Dark+ color theme

### Changed

- Code rendering moved to TokenizedChars component
- Challenge entity includes cached tokens

### Technical

- Tree-sitter token extraction
- React.memo optimization
- Graceful fallback for missing tokens
```

---

### 4.5: Create Git Tag (15 min)

```bash
git add .
git commit -m "Release v1.6.0: Dynamic syntax highlighting (beta)

- Pre-tokenized syntax highlighting
- Tree-sitter token extraction
- Token-based rendering component
- Performance optimized (<16ms render)
- Feature toggle in settings
- VS Code Dark+ color theme"

git tag v1.6.0
git push origin main
git push origin v1.6.0
```

---

### 4.6: Test Rollback (30 min)

```bash
# Backup database
cp packages/back-nest/speedtyper-local.db packages/back-nest/speedtyper-local.db.v1.6.0

# Rollback to v1.5.1
git checkout v1.5.1
npm install
npm run dev

# Verify: Full functionality without highlighting
# Complete one race

# Return to v1.6.0
git checkout v1.6.0
npm run dev

# Verify: Highlighting works
```

---

## Success Criteria

- [ ] Syntax highlighting works across 3+ languages
- [ ] Performance acceptable (<16ms render time)
- [ ] No >5% WPM degradation vs v1.5.1
- [ ] Feature toggleable (can disable if issues)
- [ ] Feedback overlay works correctly (errors visible)
- [ ] Token colors don't interfere with typing
- [ ] Skip ranges still functional with highlighting
- [ ] Graceful fallback if tokens missing

---

## Rollback Procedure

```bash
git checkout v1.5.1
npm install
npm run dev

# If database issues (unlikely):
cp packages/back-nest/speedtyper-local.db.v1.5.1 packages/back-nest/speedtyper-local.db
```

**When to Rollback:**

- Performance degrades (>25ms keystroke latency)
- Syntax colors cause confusion or eye strain
- Rendering bugs affect typing accuracy
- Feature causes crashes or errors
- User feedback strongly negative

---

## Known Limitations

1. **Token caching:** Requires re-import to update tokens if parser improves
2. **Language coverage:** Only supported languages get highlighting
3. **Custom themes:** Currently hard-coded to VS Code Dark+
4. **Long snippets:** May need virtualization for 1000+ char files

---

## Future Enhancements (Post v1.6.0)

If v1.6.0 succeeds:

- **v1.6.1:** Add theme selector (Monokai, Solarized, etc.)
- **v1.6.2:** User-customizable token colors
- **v1.6.3:** Semantic highlighting (variable references)
- **v1.7.0:** Next major feature (TBD based on user feedback)

---

## Deferred Features (If v1.6.0 Skipped)

If Phase 0 validation fails:

- Mark v1.6.0 as "Future Work"
- Consider simpler alternatives:
  - Static syntax highlighting (pre-render, no live updates)
  - Minimal color coding (keywords only)
  - Theme improvements without tokenization
- Focus efforts on other high-value features:
  - Multiplayer mode
  - Advanced statistics
  - Practice modes (specific weaknesses)
  - More language support

---

## Post-Release Monitoring

**Week 1 After Release:**

1. **Performance Monitoring:**
   - Collect render time metrics from users (if telemetry)
   - Monitor error reports related to rendering
   - Check for memory leaks (long sessions)

2. **User Feedback:**
   - Survey users: "Do you use syntax highlighting?"
   - Track toggle rate (how many disable it?)
   - Gather subjective feedback (GitHub issues, etc.)

3. **Bug Triage:**
   - Language-specific rendering issues
   - Color conflict reports
   - Performance complaints

**Decision Point (Week 2):**

- If major issues: Consider reverting to v1.5.1
- If minor issues: Patch in v1.6.1
- If stable: Continue to next feature

---

## Handoff to Future Development

**What's Complete After v1.6.0:**

- ✅ Stable user identity (v1.4.0)
- ✅ Progress dashboard (v1.4.0)
- ✅ Character-based skipping (v1.5.0)
- ✅ AST-based skipping (v1.5.1)
- ✅ Syntax highlighting (v1.6.0)

**Technical Foundation Ready For:**

- Multiplayer: LocalUserService can be extended to multi-user
- Advanced stats: Dashboard infrastructure in place
- Custom themes: Token rendering system supports theme swapping
- More languages: Tree-sitter parser factory extensible

**Next Version (v1.7.0) Candidates:**

1. **Multiplayer Mode:** Real-time races with other users
2. **Practice System:** Targeted practice for weak areas
3. **Custom Challenges:** User-created snippets
4. **Mobile App:** React Native port
5. **Advanced Analytics:** Heatmaps, error patterns, improvement tracking

**Recommended Approach:**

- Survey users for most-wanted feature
- Prototype before committing
- Maintain incremental, rollback-safe development
- Never break core typing functionality

---

## Final Notes

### Success Definition (End of v1.6.0)

**Functional Success:**

- All planned features working
- Performance within targets
- No critical bugs

**User Success:**

- Positive feedback on features
- Features actually used (not disabled immediately)
- WPM/accuracy improvements or maintained

**Technical Success:**

- Clean, maintainable codebase
- Well-documented architecture
- Easy to extend for future features
- Reliable rollback capability

### Philosophy Maintained

Throughout all versions:

- ✅ Core typing always works
- ✅ Performance never degrades significantly
- ✅ Features are toggleable
- ✅ Rollback tested at each version
- ✅ Documentation kept current

### Lessons Learned (To Document)

After completing implementation:

1. What took longer than expected?
2. What was easier than expected?
3. Which technical decisions were right/wrong?
4. What would you do differently?
5. What surprised you about user behavior?

**Document these** in a `RETROSPECTIVE.md` for future reference.

---

## Emergency Procedures

### If Critical Bug Found Post-Release

```bash
# Immediate rollback
git checkout v1.5.1  # Or last stable version
npm install
npm run dev

# Notify users (if applicable)
# Add warning to README
echo "⚠️ v1.6.0 temporarily rolled back due to [issue]" >> README.md

# Fix in development
git checkout v1.6.0
git checkout -b hotfix/critical-bug
# ... fix bug ...
git commit -m "Hotfix: [description]"
git tag v1.6.0-hotfix-1
git checkout main
git merge hotfix/critical-bug

# Re-deploy with fix
npm run dev
# Test thoroughly
# Re-release as v1.6.1 or v1.6.0-hotfix-1
```

### If Performance Issue Found

```bash
# Quick mitigation: Disable feature by default
# Edit settings-store.ts:
syntaxHighlighting: false,  // Default to off

# Re-deploy
git commit -m "Hotfix: Disable syntax highlighting by default"
git tag v1.6.0-patch-1

# Work on optimization separately
git checkout -b optimize/syntax-rendering
# ... optimize ...
# Test thoroughly
# Release as v1.6.1
```

### If User Confusion Reported

```bash
# Quick mitigation: Add prominent help text
# Update UI to explain feature better

# Add onboarding tooltip
# Add "What's this?" button next to toggle
# Update README with FAQ section

# Release as v1.6.0-patch-2
```

---

## Conclusion

Version 1.6.0 represents a **complete overhaul** of the rendering system. It's marked as HIGH-RISK for good reason:

- Touches core typing experience
- Significant architectural change
- Performance-sensitive
- User experience impact uncertain

**Only implement if Phase 0 validation strongly supports it.**

If validation fails, v1.5.1 is a **fully functional, production-ready product** with:

- Stable user identity
- Progress tracking
- Smart skipping (character + AST)
- Excellent performance
- Solid foundation for future features

**There is no shame in stopping at v1.5.1.** Ship a great product, gather feedback, and decide on v1.7.0 based on real user needs.

---

## Final Checklist Before Starting v1.6.0

- [ ] Phase 0 user validation completed
- [ ] > 70% user preference OR >5% WPM improvement
- [ ] Prototype proves concept works
- [ ] Performance targets achievable
- [ ] Team consensus to proceed
- [ ] Rollback plan understood
- [ ] Time budget allocated (4-6 weeks)
- [ ] v1.5.1 tagged as stable fallback

**If all checked: Proceed with Phase 1**  
**If any unchecked: Defer to future version**
