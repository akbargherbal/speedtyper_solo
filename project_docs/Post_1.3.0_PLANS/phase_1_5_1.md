# Phase 1.5.1: Smart Skipping - Advanced (AST)

**Duration:** 2-3 weeks  
**Risk Level:** 🟡 Medium  
**Rollback Target:** v1.5.0

---

## Context

**What We're Building:**

- AST-based skip range generation (comments, docstrings)
- Tree-sitter integration for accurate node detection
- Merged character + AST skip ranges
- Language-specific skip configuration

**Why This Phase Matters:**

- Completes smart skipping feature (v1.5.0 + v1.5.1 = full solution)
- AST parsing ensures accurate comment detection (not regex-based)
- Enables focus on actual code logic, skipping documentation

**Dependencies:**

- Builds on: v1.5.0 (character skip ranges, merging algorithm, frontend skip logic)
- Enables: Full smart skipping feature complete

**What Future Phases Will Add:** v1.6.0 adds syntax highlighting (separate concern, visual only)

---

## Phase 0: AST Feasibility Verification

**Duration:** Day 1, 2-3 hours

### 0.1: Test Tree-sitter Comment Detection (90 min)

**Create test files:**

```bash
cd packages/back-nest

# Python test
cat > test-comments.py << 'EOF'
# This is a comment
def hello():
    """Docstring here"""
    # Another comment
    return "world"  # Inline comment
EOF

# TypeScript test
cat > test-comments.ts << 'EOF'
// Line comment
function test() {
  /* Block comment */
  return true; // Inline
}
EOF

# JavaScript test
cat > test-comments.js << 'EOF'
/**
 * JSDoc comment
 */
function example() {
  // Regular comment
  const x = 5; // Inline
  return x;
}
EOF
```

**Test parser:**

```bash
# If you have a test command (adjust based on actual setup)
npm run command test-parser -- test-comments.py
npm run command test-parser -- test-comments.ts
npm run command test-parser -- test-comments.js
```

**Expected Output:** Parser should identify all comment nodes with correct positions

---

### 0.2: Review Parser Service (60 min)

```bash
cat packages/back-nest/src/challenges/services/parser.service.ts | grep -A 30 "findCommentNodes"
cat packages/back-nest/src/challenges/services/parser.service.ts | grep -A 30 "parse"
```

**Key Questions:**

- Does `findCommentNodes()` already exist?
- What node types represent comments in each language?
- How are node positions reported (byte offset vs character index)?
- Can parser distinguish inline vs standalone comments?

**Document Findings:** Create language-specific comment node type mapping

---

### 0.3: Verify Skip Range Merging (30 min)

**Test current merging algorithm:**

```typescript
// Test cases in Node console or create test file
const ranges = [
  { start: 0, end: 3, reason: "leading-spaces" },
  { start: 2, end: 5, reason: "comment" }, // Overlaps
  { start: 10, end: 15, reason: "comment" },
];

// Should merge overlapping ranges correctly
```

**Decision Gate:** Confirm Tree-sitter can detect comments accurately before proceeding

---

## Phase 1: Backend AST Skip Range Generation

**Duration:** Days 2-5, 6-8 hours

### 1.1: Extend Configuration (30 min)

**File:** `packages/back-nest/skip-config.json`

```json
{
  "version": "1.1.0",
  "enabled": true,
  "filters": {
    "skipLeadingSpaces": true,
    "skipTrailingSpaces": false,
    "skipMultipleConsecutiveSpaces": true,
    "minConsecutiveSpaces": 2
  },
  "astNodes": {
    "comments": true,
    "docstrings": false,
    "stringLiterals": false,
    "inlineComments": false
  },
  "languageSpecific": {
    "python": {
      "docstrings": true
    },
    "typescript": {
      "jsdocComments": true
    }
  }
}
```

**Update DTO:**

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
  astNodes: {
    comments: boolean;
    docstrings: boolean;
    stringLiterals: boolean;
    inlineComments: boolean;
  };
  languageSpecific?: Record<string, any>;
}
```

---

### 1.2: Extend Skip Range Calculator (120 min)

**File:** `packages/back-nest/src/challenges/services/skip-range-calculator.service.ts`

**Add dependency and methods:**

```typescript
import { ParserService } from "./parser.service";

@Injectable()
export class SkipRangeCalculatorService {
  private config: SkipConfig;

  constructor(private parserService: ParserService) {
    // ... existing constructor code
  }

  // EXISTING METHOD: calculateSkipRanges (character-based)
  // Keep as-is from v1.5.0

  // NEW METHOD: Calculate AST-based skip ranges
  async calculateASTSkipRanges(
    code: string,
    language: string,
  ): Promise<SkipRange[]> {
    if (!this.config.enabled || !this.config.astNodes.comments) {
      return [];
    }

    try {
      const tree = await this.parserService.parse(code, language);
      const ranges: SkipRange[] = [];

      // Find all comment nodes
      const commentNodes = this.findCommentNodes(tree.rootNode, language);

      for (const node of commentNodes) {
        // Check if inline comment (starts after non-whitespace on line)
        const isInline = this.isInlineComment(code, node.startIndex);

        if (this.config.astNodes.inlineComments || !isInline) {
          ranges.push({
            start: node.startIndex,
            end: node.endIndex - 1, // endIndex is exclusive
            reason: isInline ? "inline-comment" : "comment",
          });
        }
      }

      // Find docstrings (Python)
      if (language === "python" && this.config.astNodes.docstrings) {
        const docstringNodes = this.findDocstringNodes(tree.rootNode);
        for (const node of docstringNodes) {
          ranges.push({
            start: node.startIndex,
            end: node.endIndex - 1,
            reason: "docstring",
          });
        }
      }

      return ranges;
    } catch (error) {
      console.error("[SkipRangeCalculator] AST parsing failed:", error);
      return []; // Graceful fallback
    }
  }

  // NEW METHOD: Find comment nodes in AST
  private findCommentNodes(node: any, language: string): any[] {
    const commentNodes: any[] = [];
    const commentTypes = this.getCommentNodeTypes(language);

    const traverse = (n: any) => {
      if (commentTypes.includes(n.type)) {
        commentNodes.push(n);
      }
      for (const child of n.children || []) {
        traverse(child);
      }
    };

    traverse(node);
    return commentNodes;
  }

  // NEW METHOD: Language-specific comment node types
  private getCommentNodeTypes(language: string): string[] {
    const mapping: Record<string, string[]> = {
      python: ["comment"],
      typescript: ["comment"],
      javascript: ["comment"],
      java: ["line_comment", "block_comment"],
      cpp: ["comment"],
      // Add more languages as needed
    };
    return mapping[language] || ["comment"];
  }

  // NEW METHOD: Check if comment is inline
  private isInlineComment(code: string, commentStart: number): boolean {
    // Find start of line containing comment
    let lineStart = commentStart;
    while (lineStart > 0 && code[lineStart - 1] !== "\n") {
      lineStart--;
    }

    // Check if there's non-whitespace before comment on same line
    const beforeComment = code.substring(lineStart, commentStart);
    return /\S/.test(beforeComment);
  }

  // NEW METHOD: Find Python docstrings
  private findDocstringNodes(node: any): any[] {
    const docstrings: any[] = [];

    // Python docstrings are string literals that are:
    // 1. First statement in function/class
    // 2. Triple-quoted strings
    const traverse = (n: any) => {
      if (
        (n.type === "expression_statement" &&
          n.children[0]?.type === "string" &&
          n.children[0]?.text?.startsWith('"""')) ||
        n.children[0]?.text?.startsWith("'''")
      ) {
        // Check if it's first statement in function/class
        const parent = n.parent;
        if (parent?.type === "block" && parent.children[0] === n) {
          docstrings.push(n.children[0]);
        }
      }

      for (const child of n.children || []) {
        traverse(child);
      }
    };

    traverse(node);
    return docstrings;
  }

  // MODIFIED METHOD: Combine character + AST ranges
  async calculateCombinedSkipRanges(
    code: string,
    language: string,
  ): Promise<SkipRange[]> {
    // Get character-based ranges (from v1.5.0)
    const charRanges = this.calculateSkipRanges(code);

    // Get AST-based ranges (new in v1.5.1)
    const astRanges = await this.calculateASTSkipRanges(code, language);

    // Merge and return
    return this.mergeSkipRanges(charRanges, astRanges);
  }

  // MODIFIED METHOD: Merge both types of ranges
  private mergeSkipRanges(
    charRanges: SkipRange[],
    astRanges: SkipRange[],
  ): SkipRange[] {
    const allRanges = [...charRanges, ...astRanges];
    return this.mergeOverlappingRanges(allRanges);
  }

  // EXISTING METHOD: mergeOverlappingRanges
  // Keep as-is from v1.5.0
}
```

---

### 1.3: Update Race Manager Integration (60 min)

**File:** `packages/back-nest/src/races/services/race-manager.service.ts`

**Modify challenge selection:**

```typescript
async selectChallengeForRace(settings: any): Promise<any> {
  const challenge = await this.selectRandomChallenge(settings);

  // CHANGED: Use combined skip ranges (character + AST)
  const skipRanges = await this.skipRangeCalculator.calculateCombinedSkipRanges(
    challenge.content,
    challenge.language,
  );

  return {
    ...challenge,
    skipRanges,
  };
}
```

---

### 1.4: Integration Testing (120 min)

**Test Cases by Language:**

**Python:**

```python
# Line comment
def test():
    """Docstring"""
    x = 5  # Inline
    return x
```

**TypeScript:**

```typescript
// Line comment
/** JSDoc */
function test() {
  const x = 5; // Inline
  /* Block */
  return x;
}
```

**JavaScript:**

```javascript
// Comment
function test() {
  /* Block */
  return true; // Inline
}
```

**For each:**

```bash
# 1. Import test file
npm run import -- test-file.py

# 2. Get challenge ID
sqlite3 packages/back-nest/speedtyper-local.db "SELECT id FROM challenge ORDER BY createdAt DESC LIMIT 1;"

# 3. Test endpoint
curl http://localhost:1337/api/challenges/CHALLENGE_ID/skip-ranges
```

**Verify:**

- [ ] Comments detected correctly
- [ ] Inline comments handled per config
- [ ] Docstrings detected (Python)
- [ ] Character + AST ranges merged
- [ ] No overlapping ranges in output

---

## Phase 2: Frontend Rendering Enhancement

**Duration:** Days 6-7, 3-4 hours

### 2.1: Enhanced Visual Styling (60 min)

**File:** `packages/webapp-next/modules/play2/components/UntypedChars.tsx`

**Differentiate skip types:**

```typescript
const getSkipStyle = (index: number): string => {
  const range = codeStore.skipRanges.find(
    r => index >= r.start && index <= r.end
  );

  if (!range) return "opacity-60"; // Normal untyped

  // Different styles based on reason
  switch (range.reason) {
    case 'leading-spaces':
    case 'trailing-spaces':
      return "opacity-10"; // Almost invisible

    case 'comment':
      return "opacity-30 italic text-gray-500"; // Faint gray

    case 'inline-comment':
      return "opacity-40 italic text-gray-400"; // Slightly more visible

    case 'docstring':
      return "opacity-40 italic text-blue-400"; // Blue tint

    case 'consecutive-spaces':
      return "opacity-15";

    default:
      return "opacity-20";
  }
};

// Apply in render
return (
  <span className={getSkipStyle(index)}>
    {char}
  </span>
);
```

---

### 2.2: Smooth Caret Transitions (60 min)

**File:** `packages/webapp-next/modules/play2/components/SmoothCaret.tsx`

**Enhance for large jumps:**

```typescript
// Calculate jump distance
const jumpDistance = newPosition - oldPosition;

// Detect skip jumps (large distances)
if (jumpDistance > 5) {
  return {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth ease
    transform: `translateX(${newPosition * charWidth}px)`,
  };
} else {
  // Normal transition for single characters
  return {
    transition: "all 0.1s ease-out",
    transform: `translateX(${newPosition * charWidth}px)`,
  };
}
```

---

### 2.3: User Feedback Enhancement (45 min)

**Add skip indicator when landing after large jump:**

**File:** `packages/webapp-next/modules/play2/components/SkipIndicator.tsx` (new)

```typescript
import React, { useState, useEffect } from 'react';

interface Props {
  visible: boolean;
  reason: string;
}

export function SkipIndicator({ visible, reason }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  const getMessage = () => {
    if (reason.includes('comment')) return '⏭️ Comment skipped';
    if (reason.includes('docstring')) return '⏭️ Docstring skipped';
    if (reason.includes('spaces')) return '⏭️ Spaces skipped';
    return '⏭️ Skipped';
  };

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
      {getMessage()}
    </div>
  );
}
```

**Integrate in code area:**

```typescript
// In CodeArea.tsx or similar
const [skipIndicatorVisible, setSkipIndicatorVisible] = useState(false);
const [skipReason, setSkipReason] = useState('');

// When index changes and skips detected
useEffect(() => {
  if (skipDistance > 5) {
    setSkipIndicatorVisible(true);
    setSkipReason(lastSkippedRange?.reason || '');
  }
}, [currentIndex]);

// In render
<SkipIndicator visible={skipIndicatorVisible} reason={skipReason} />
```

---

### 2.4: Settings Toggle (45 min)

**File:** `packages/webapp-next/common/components/modals/SettingsModal.tsx`

**Add skip configuration options:**

```typescript
<div className="space-y-4">
  <h3 className="text-lg font-bold">Smart Skipping</h3>

  <ToggleSwitch
    label="Skip Leading Spaces"
    checked={settings.skipLeadingSpaces ?? true}
    onChange={(enabled) => settingsStore.setSkipLeadingSpaces(enabled)}
  />

  <ToggleSwitch
    label="Skip Comments"
    checked={settings.skipComments ?? true}
    onChange={(enabled) => settingsStore.setSkipComments(enabled)}
  />

  <ToggleSwitch
    label="Skip Inline Comments"
    checked={settings.skipInlineComments ?? false}
    onChange={(enabled) => settingsStore.setSkipInlineComments(enabled)}
  />

  <ToggleSwitch
    label="Skip Docstrings (Python)"
    checked={settings.skipDocstrings ?? false}
    onChange={(enabled) => settingsStore.setSkipDocstrings(enabled)}
  />
</div>
```

**Note:** Settings would need to be sent to backend or backend config updated manually

---

## Phase 3: Edge Case Handling

**Duration:** Days 8-9, 3-4 hours

### 3.1: Multi-Line Comment Blocks (60 min)

**Test Case:**

```python
"""
This is a very long
docstring that spans
multiple lines with lots
of text inside
"""
def my_function():
    pass
```

**Verify:**

- [ ] Entire docstring treated as one skip range
- [ ] Cursor jumps from `def` directly to `my_function`
- [ ] No intermediate stops inside docstring
- [ ] Range boundaries correct (no off-by-one)

**Debug if needed:**

```typescript
console.log("Skip ranges:", codeStore.skipRanges);
console.log("Current index:", codeStore.currentIndex);
console.log("Next index:", codeStore.getNextNonSkippedIndex(currentIndex));
```

---

### 3.2: Inline Comments (45 min)

**Test Case:**

```typescript
const x = 5; // This should NOT be skipped (inline)
const y = 10; // Another inline
```

**Verify:**

- [ ] If `inlineComments: false` → comments remain typeable
- [ ] If `inlineComments: true` → comments skipped
- [ ] Only standalone comments skipped by default
- [ ] Config setting works correctly

---

### 3.3: Nested Structures (45 min)

**Test Case:**

```javascript
function outer() {
  // Comment inside function
  function inner() {
    /* Block comment */
    return true;
  }
  // Another comment
  return inner();
}
```

**Verify:**

- [ ] All comment ranges calculated correctly
- [ ] Nested comments don't break parser
- [ ] Index calculations accurate through nesting
- [ ] Merging works with nested ranges

---

### 3.4: Language-Specific Edge Cases (60 min)

**Python:**

```python
# Real comment
x = "# Not a comment"
"""Docstring"""
y = '"""Not a docstring"""'
```

**Verify:**

- [ ] AST correctly distinguishes comments from strings
- [ ] Docstrings detected only when appropriate
- [ ] String literals not marked as skip ranges

**TypeScript:**

```typescript
// Comment
const regex = /\/\/ not a comment/;
const url = "https://example.com"; // Comment
```

**Verify:**

- [ ] Regex containing `//` not treated as comment
- [ ] URLs in strings ignored
- [ ] Only actual comments skipped

**JavaScript:**

```javascript
const str = "/* not a comment */";
/* Real comment */
const template = `// ${value}`;
```

**Verify:**

- [ ] Template literals handled correctly
- [ ] String contents ignored
- [ ] Block comments detected

**Mitigation:** Tree-sitter should handle these correctly (real parser, not regex)

---

## Phase 4: Testing & Release

**Duration:** Day 10, 2-3 hours

### 4.1: Comprehensive Integration Test (90 min)

**Test Matrix:**

| Language   | Comment Type  | Config           | Expected |
| ---------- | ------------- | ---------------- | -------- |
| Python     | `# comment`   | comments: true   | Skip     |
| Python     | `"""doc"""`   | docstrings: true | Skip     |
| Python     | `# inline`    | inline: false    | Type     |
| TypeScript | `// comment`  | comments: true   | Skip     |
| TypeScript | `/* block */` | comments: true   | Skip     |
| JavaScript | `// inline`   | inline: false    | Type     |

**For Each Test:**

1. Import snippet with specific comment patterns
2. Configure skip settings
3. Start race
4. Type through snippet
5. Verify cursor behavior matches expected
6. Complete and check WPM/accuracy

---

### 4.2: Performance Regression Test (30 min)

**Measure:**

**1. AST Parsing Time:**

```typescript
const start = performance.now();
const tree = await parserService.parse(code, language);
const parseTime = performance.now() - start;
console.log("Parse time:", parseTime, "ms");
```

**Target:** <100ms per file

**2. Skip Range Calculation:**

```typescript
const start = performance.now();
const ranges = await calculator.calculateCombinedSkipRanges(code, language);
const calcTime = performance.now() - start;
console.log("Calculation time:", calcTime, "ms");
```

**Target:** <10ms

**3. Keystroke Latency:**

- Should remain <20ms (same as v1.5.0)

**If Performance Issues:**

- Cache parsed trees
- Limit AST traversal depth
- Simplify comment detection logic

---

### 4.3: User Experience Polish (45 min)

**Checklist:**

- [ ] Visual distinction clear (comments vs spaces)
- [ ] Caret transitions smooth (not jarring on large jumps)
- [ ] Skip indicator helpful (appears at right time)
- [ ] Skip indicator not annoying (disappears quickly)
- [ ] Settings toggles work correctly
- [ ] No confusion about what's being skipped

**User Testing (if possible):**

- Have someone else try the feature
- Observe if they understand what's happening
- Ask for feedback on visual indicators

---

### 4.4: Documentation & Release (30 min)

**File:** `ARCHITECTURE.md`

Add/update section:

```markdown
## Skip Range System

### AST-Based Skipping (v1.5.1)

- Tree-sitter parser detects comment nodes accurately
- Language-specific node type mapping
- Inline vs standalone comment detection
- Python docstring detection
- Graceful fallback if parsing fails

### Combined System

1. Calculate character-based ranges (spaces)
2. Calculate AST-based ranges (comments/docstrings)
3. Merge overlapping ranges
4. Transmit to frontend via WebSocket
5. Frontend applies skip logic during typing
```

**File:** `README-LOCAL.md`

Update:

```markdown
## Features

### Smart Skipping (Complete)

- **Character-based**: Leading/trailing/consecutive spaces
- **AST-based**: Comments, docstrings (language-aware)
- **Configurable**: `packages/back-nest/skip-config.json`
  - Toggle individual skip types
  - Language-specific settings
  - Inline comment handling
- **Visual feedback**: Different opacity/styling per skip type
```

**File:** `CHANGELOG.md`

```markdown
## [1.5.1] - 2025-XX-XX

### Added

- AST-based comment skip detection
- Python docstring skipping
- Inline vs standalone comment distinction
- Language-specific skip configurations
- Enhanced visual indicators for skip types
- Skip transition animations

### Changed

- Skip range calculation now combines character + AST analysis
- Improved caret transitions for large skip jumps

### Technical

- Tree-sitter integration for comment detection
- Language-specific node type mapping
- Graceful AST parsing fallback
```

---

### 4.5: Create Git Tag (15 min)

```bash
git add .
git commit -m "Release v1.5.1: AST-based comment skipping

- Tree-sitter comment detection
- Python docstring skipping
- Inline comment handling
- Merged character + AST skip ranges
- Enhanced visual feedback
- Language-specific configurations"

git tag v1.5.1
git push origin main
git push origin v1.5.1
```

---

### 4.6: Test Rollback (30 min)

```bash
# Backup database
cp packages/back-nest/speedtyper-local.db packages/back-nest/speedtyper-local.db.v1.5.1

# Rollback to v1.5.0
git checkout v1.5.0
npm install
npm run dev

# Verify: Character skip still works, no AST skip
# Complete one race

# Return to v1.5.1
git checkout v1.5.1
npm run dev

# Verify: Full skip feature works
```

---

## Success Criteria

- [ ] Comments skip reliably across 3+ languages
- [ ] Docstrings detected (Python)
- [ ] Inline comments handled per configuration
- [ ] No validation errors
- [ ] WPM calculation correct (skipped chars not counted)
- [ ] Performance acceptable (parsing <100ms)
- [ ] User can toggle feature components on/off
- [ ] Visual indicators clear and helpful
- [ ] AST parsing errors handled gracefully

---

## Rollback Procedure

```bash
git checkout v1.5.0
npm install
npm run dev

# If database issues:
cp packages/back-nest/speedtyper-local.db.v1.5.0 packages/back-nest/speedtyper-local.db
```

**When to Rollback:**

- AST parsing causes performance issues (>100ms)
- Comment detection inaccurate for major languages
- Skip logic breaks validation
- Keystroke latency exceeds 25ms
- User confusion about skip behavior

---

## Handoff to Phase 1.6.0 (Optional)

**What's Ready:**

- ✅ Complete skip system (character + AST)
- ✅ Tree-sitter parser infrastructure
- ✅ Language-specific node detection

**What v1.6.0 Would Add:**

- Syntax highlighting (separate concern)
- Token-based rendering
- Pre-calculated token colors

**Critical Decision Point:**

- v1.6.0 is OPTIONAL and HIGH-RISK
- Must complete Phase 0 user validation before implementing
- Can defer to later version if not validated

**If Proceeding to v1.6.0:**

- Review Tree-sitter token extraction (similar to comment detection)
- Study existing syntax highlighting (Highlight.js usage)
- Performance profile current rendering system
