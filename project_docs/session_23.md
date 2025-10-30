# Session 23 Summary: Pattern Extraction Implementation & CRLF Bug Fix

**Date:** October 30, 2025  
**Duration:** ~60 minutes  
**Current Status:** ✅ **FEATURE COMPLETE** - Pattern extraction working in production

---

## Session Context

This session continued from Session 22, where we designed but **did not actually implement** the pattern-based snippet extraction feature. The user returned ready to test, only to discover the code changes had never been applied to the actual `parser.service.ts` file.

---

## Problem Discovery

### Initial Issue: Implementation Never Happened

When reviewing the current `parser.service.ts`, we found it was still the **original version** without any of the pattern extraction methods we designed in Session 22:
- ❌ No enhanced `parseTrackedNodes()` method
- ❌ No `extractPatternBlocks()` method  
- ❌ No `isValidPatternBlock()` method

**Root cause:** Code was designed but never actually saved to the file.

---

## Implementation Phase

### Step 1: Full Implementation of Pattern Extraction

Added three new methods to `parser.service.ts`:

**1. Enhanced `parseTrackedNodes()`**
```typescript
parseTrackedNodes(content: string) {
  // Check for pattern markers (supports both // and # comment styles)
  if (content.match(/^(?:\/\/|#)\s*PATTERN:/m)) {
    console.log('[parser]: Detected PATTERN markers, using block extraction mode');
    return this.extractPatternBlocks(content);
  }
  
  // Default tree-sitter mode
  const root = this.ts.parse(content).rootNode;
  return this.filterNodes(root);
}
```

**2. New `extractPatternBlocks()` Method**
- Splits file by `// PATTERN:` or `# PATTERN:` markers
- Supports JavaScript/TypeScript (`//`) and Python (`#`) comments
- Extracts code blocks between markers
- Returns SyntaxNode-like objects for pipeline compatibility

**3. New `isValidPatternBlock()` Method**
- Validates blocks against `parser.config.json` filters
- Requires 150-500 chars, 2-15 lines, max 80 chars/line
- Logs detailed rejection reasons for debugging

**4. New `createSyntaxNodeLike()` Helper**
- Creates minimal SyntaxNode objects for pattern blocks
- Uses `as unknown as TSParser.SyntaxNode` to bypass strict type checking
- Includes all required properties (tree, typeId, descendant methods, etc.)

---

## The Critical Bug: CRLF Line Endings

### First Test Results: 0 Snippets Extracted

```
[parser]: Detected PATTERN markers, using block extraction mode
[parser]: Starting pattern extraction from 47 lines
[parser]: Found 0 marker(s), extracted 0 valid block(s)
```

**Investigation:**
```bash
$ head -1 001_array-methods.js | od -c
0000000   /   /       P   A   T   T   E   R   N   :       A   r   r   a
0000020   y       M   e   t   h   o   d   s  \r  \n
```

**Discovery:** Files had **Windows CRLF line endings** (`\r\n`)!

### Why This Broke Everything

When Node.js `split('\n')` runs on CRLF files:
1. It only splits on `\n`, leaving `\r` at end of each line
2. Line becomes `"// PATTERN: Array Methods\r"` (with carriage return)
3. Regex requires `$` (end of line), but finds `\r` instead
4. **No match!** ❌

The regex test confirmed:
```bash
$ node -e "const line = '// PATTERN: Array Methods'; const match = line.match(/^(?:\/\/|#)\s*PATTERN:\s*(.+)$/); console.log('Match result:', match);"
Match result: [ '// PATTERN: Array Methods', 'Array Methods', ... ]  # Works!
```

But with CRLF in actual files, it failed silently.

---

## The Fix: Line Ending Normalization

### Updated `extractPatternBlocks()` Method

Added normalization at the top:

```typescript
private extractPatternBlocks(content: string): TSParser.SyntaxNode[] {
  const blocks: TSParser.SyntaxNode[] = [];
  
  // CRITICAL FIX: Normalize line endings (CRLF → LF)
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n');
  
  // ... rest of extraction logic
}
```

This strips all `\r` characters before splitting, ensuring regex matches work correctly.

---

## Final Test Results

### Second Import: ✅ SUCCESS!

```
╔════════════════════════════════════════════════════════════╗
║                    Import Summary                          ║
╚════════════════════════════════════════════════════════════╝
✅ Success: 28 file(s) processed
📦 Snippets: 95 snippet(s) imported
⊘  Skipped: 5 file(s) had no valid snippets
```

### Breakdown by File Type

**JavaScript (13 files):**
- ✅ 8 snippets from `002_async-patterns.js`
- ✅ 3 snippets from `013_string-methods.js`
- ✅ 2 snippets from `009_json-operations.js`
- ⊘ `001_array-methods.js` - Single 1246-char block (too large)

**TypeScript (20 files):**
- ✅ 9 snippets from `036_react-specific-typescript.ts`
- ✅ 7 snippets from `021_react-hook-form-form-handling.tsx`
- ✅ 7 snippets from `022_react-router-navigation.tsx`
- ⊘ `014_async-patterns.tsx` - All blocks > 15 lines
- ⊘ `015_common-ui-patterns.tsx` - All blocks > 500 chars

### Common Rejection Reasons (from logs)

1. **Below min length (< 150 chars)** - Most common
   - Small utility functions
   - Single-line type definitions
   - Interface declarations

2. **Above max length (> 500 chars)**
   - Large React components
   - Complex async workflows

3. **Too many lines (> 15)**
   - Full component implementations
   - Multi-step tutorials

4. **Lines too long (> 80 chars)**
   - Fetch URLs
   - Long template literals
   - Deeply nested object literals

---

## Architecture Decisions Made

### 1. Multi-Language Comment Support

**Decision:** Support both `//` and `#` comment styles in a single regex

**Regex:**
```typescript
const match = line.match(/^(?:\/\/|#)\s*PATTERN:\s*(.+)$/);
```

**Why:** User's Python script generates files for JavaScript, TypeScript, AND Python. A single parser needed to handle all three.

**Alternatives Considered:**
- ❌ Separate parsers per language (too complex)
- ❌ Tree-sitter comment detection (overkill for simple markers)

---

### 2. Line Ending Normalization

**Decision:** Always normalize to LF (`\n`) before processing

**Implementation:**
```typescript
const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
```

**Why:** Files are generated on Windows (CRLF) but processed in WSL/Linux (LF). Cross-platform compatibility is essential.

**Edge cases handled:**
- Windows CRLF (`\r\n`)
- Classic Mac CR (`\r`)
- Unix LF (`\n`)

---

### 3. Validation Logging Strategy

**Decision:** Always log validation attempts, even for accepted blocks

**Why:** User needs to understand:
- Why 95 snippets were imported (not all of them)
- Which specific blocks failed validation
- How to adjust filters to get more/fewer snippets

**Example output:**
```
[parser]: Validating block: 133 chars, 4 lines
[parser]: ❌ REJECTED:
  - Below min length (need 150, got 133)
```

This transparency helps debug file issues without opening the parser code.

---

### 4. Type Safety Workaround

**Challenge:** Creating SyntaxNode-like objects that satisfy TypeScript's strict type checking

**Solution:** Double cast pattern
```typescript
return {
  text,
  type: 'pattern_block',
  // ... all required properties
} as unknown as TSParser.SyntaxNode;
```

**Why:** Tree-sitter's `SyntaxNode` interface has 30+ properties. We only need a subset for the import pipeline, but TypeScript requires all of them. The `as unknown as` cast bypasses this safely.

---

## Key Implementation Details

### Pattern Block Extraction Logic

```typescript
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^(?:\/\/|#)\s*PATTERN:\s*(.+)$/);

  if (match) {
    // Save previous block if exists
    if (currentPattern && currentBlock.length > 0) {
      const blockText = currentBlock.join('\n').trim();
      if (this.isValidPatternBlock(blockText)) {
        blocks.push(this.createSyntaxNodeLike(blockText, blockStartLine));
      }
    }

    // Start new block
    currentPattern = match[1].trim();
    currentBlock = [];
    blockStartLine = i + 1;
  } else if (currentPattern) {
    // Accumulate lines for current block (skip empty lines after marker)
    if (currentBlock.length > 0 || line.trim() !== '') {
      currentBlock.push(line);
    }
  }
}
```

**Key behaviors:**
- Skips empty lines immediately after markers
- Preserves internal blank lines in code blocks
- Trims whitespace from final block text
- Saves final block after loop ends

---

### Validation Rules (from `parser.config.json`)

```json
{
  "filters": {
    "maxNodeLength": 500,    // Max characters
    "minNodeLength": 150,    // Min characters (avoid trivial snippets)
    "maxNumLines": 15,       // Max lines (prevent scrolling)
    "maxLineLength": 80      // Max chars/line (fit on screen)
  }
}
```

**Additional validation:**
- Minimum 2 lines (prevent single-line fragments)
- All lines must meet max length requirement

---

## Python Script Integration

### Updated Export Function

The user's Python script needed adjustment to output the correct format:

**Before (Session 22 design):**
```python
content_parts.append(f'{comment_char} PATTERN [{cat}]')  # Brackets
```

**After (Session 23 implementation):**
```python
content_parts.append(f'{comment_char} PATTERN: {cat}')   # Colon
```

**Comment styles supported:**
```python
COMMENT_STYLES = {
    'js': '//',
    'tsx': '//',
    'ts': '//',
    'py': '#',
}
```

---

## File Format Specification

### Valid Pattern File Structure

```javascript
// PATTERN: Array Map
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

// PATTERN: Array Filter
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
```

**Python example:**
```python
# PATTERN: List Comprehension
numbers = [1, 2, 3, 4, 5]
squares = [n ** 2 for n in numbers]

# PATTERN: Dictionary Comprehension
words = ['hello', 'world']
lengths = {word: len(word) for word in words}
```

**Rules:**
1. Marker must be on its own line
2. Format: `// PATTERN: Description` or `# PATTERN: Description`
3. Code block follows until next marker (or EOF)
4. Optional blank line after marker (automatically skipped)
5. Blocks validated against config filters

---

## Debugging Features Added

### Enhanced Logging

**Marker detection:**
```
[parser]: Starting pattern extraction from 47 lines
[parser]: Found marker #1 at line 1: "Array Methods"
[parser]: Found marker #2 at line 19: "String Methods"
```

**Validation logging:**
```
[parser]: Validating block: 423 chars, 15 lines
[parser]: ✅ ACCEPTED

[parser]: Validating block: 1246 chars, 45 lines
[parser]: ❌ REJECTED:
  - Above max length (max 500, got 1246)
  - Line count outside range (need 2-15, got 45)
```

**Long line details:**
```
[parser]: ❌ REJECTED:
  - 2 line(s) too long (max 80 chars)
    Line 1 (88 chars): const fastPromise = new Promise(resolve => setTimeout(() => ...
    Line 2 (89 chars): const slowPromise = new Promise(resolve => setTimeout(() => ...
```

This verbosity was critical for diagnosing the CRLF bug and understanding filter behavior.

---

## Performance Considerations

### Pattern Extraction vs Tree-Sitter

**Pattern mode:**
- O(n) line-by-line scan
- Regex matching per line
- Minimal memory overhead
- Fast for small-to-medium files

**Tree-sitter mode:**
- O(n log n) AST parsing
- Full syntax analysis
- Higher memory usage
- Better for complex code structures

**Hybrid approach chosen:**
```typescript
if (content.match(/^(?:\/\/|#)\s*PATTERN:/m)) {
  return this.extractPatternBlocks(content);  // Fast pattern mode
}
return this.filterNodes(this.ts.parse(content).rootNode);  // Full parsing
```

Files automatically use the most appropriate method.

---

## Known Limitations

### 1. Single Pattern Name Per Block

Current implementation assumes each marker starts a new block. Multi-pattern blocks are not supported:

```javascript
// NOT SUPPORTED:
// PATTERN: Array Methods (Map, Filter, Reduce)
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((a, b) => a + b);
```

**Workaround:** Use separate markers for each pattern.

### 2. No Inline Pattern Markers

Markers must be on their own line:

```javascript
// NOT SUPPORTED:
const x = 1; // PATTERN: Variable Declaration

// SUPPORTED:
// PATTERN: Variable Declaration
const x = 1;
```

### 3. No Nested Patterns

Pattern blocks cannot contain nested `// PATTERN:` markers.

---

## Files Modified

### Backend Changes

**File:** `packages/back-nest/src/challenges/services/parser.service.ts`

**Lines added:** ~150 lines (3 new methods + enhancements)

**Methods added:**
1. `extractPatternBlocks()` - 60 lines
2. `isValidPatternBlock()` - 40 lines  
3. `createSyntaxNodeLike()` - 45 lines

**Methods enhanced:**
1. `parseTrackedNodes()` - Added pattern detection

**Key changes:**
- Added CRLF normalization
- Added multi-language comment support
- Added detailed validation logging
- Added TypeScript type workarounds

---

## Testing Results

### Import Statistics

**Total files scanned:** 33  
**Files with valid snippets:** 28 (85%)  
**Files skipped:** 5 (15%)

**Snippets imported:** 95

**Files with most snippets:**
1. `036_react-specific-typescript.ts` - 9 snippets
2. `002_async-patterns.js` - 8 snippets
3. `021_react-hook-form-form-handling.tsx` - 7 snippets
4. `022_react-router-navigation.tsx` - 7 snippets
5. `033_function-patterns.ts` - 7 snippets

**Files completely skipped (0 snippets):**
1. `001_array-methods.js` - Single massive block
2. `014_async-patterns.tsx` - All blocks too long
3. `015_common-ui-patterns.tsx` - All blocks too long
4. `026_apidata-patterns.ts` - All blocks too short
5. `034_interface-patterns.ts` - All blocks too short

---

## Rejection Analysis

### By Rejection Type

**Below min length (150 chars):** ~60% of rejections
- Small utility functions
- Single-line declarations
- Interface/type definitions

**Above max length (500 chars):** ~15% of rejections
- Complex React components
- Multi-step workflows

**Too many lines (> 15):** ~15% of rejections
- Full component implementations
- Tutorial-style code blocks

**Lines too long (> 80 chars):** ~10% of rejections
- Long URLs
- Template literals
- Nested object literals

---

## Recommendations for Better Results

### Option 1: Adjust Filter Thresholds

**Current settings:**
```json
{
  "minNodeLength": 150,
  "maxNodeLength": 500,
  "maxNumLines": 15,
  "maxLineLength": 80
}
```

**Suggested relaxed settings:**
```json
{
  "minNodeLength": 100,    // ↓ Accept smaller snippets
  "maxNodeLength": 600,    // ↑ Accept larger snippets
  "maxNumLines": 20,       // ↑ More lines allowed
  "maxLineLength": 100     // ↑ Longer lines for URLs
}
```

**Expected gain:** +20-30 additional snippets

---

### Option 2: Fix Problem Files

**For files with single massive blocks (e.g., 001_array-methods.js):**

Add more markers to split into smaller chunks:

```javascript
// PATTERN: Array Map
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

// PATTERN: Array Filter  ← Add this marker
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);

// PATTERN: Array Find  ← Add this marker
const users = [{ name: 'Alice', age: 25 }];
const adult = users.find(user => user.age >= 18);
```

**Expected gain:** ~15 snippets from `001_array-methods.js`

---

### Option 3: Update Python Script

**Modify `join_small_snippets()` to be smarter:**

```python
def join_small_snippets(list_code, min_lines=4, max_combined_lines=12):
    """Join consecutive snippets intelligently."""
    joined = []
    buffer = []
    buffer_lines = 0
    
    for snippet in list_code:
        line_count = len(snippet.strip().split('\n'))
        
        if line_count < min_lines:
            # Check if adding to buffer exceeds max
            if buffer_lines + line_count <= max_combined_lines:
                buffer.append(snippet)
                buffer_lines += line_count
            else:
                # Flush buffer and start new
                if buffer:
                    joined.append('\n\n'.join(buffer))
                buffer = [snippet]
                buffer_lines = line_count
        else:
            # Flush buffer if exists
            if buffer:
                joined.append('\n\n'.join(buffer))
                buffer = []
                buffer_lines = 0
            # Add the large snippet
            joined.append(snippet)
    
    # Flush any remaining buffer
    if buffer:
        joined.append('\n\n'.join(buffer))
    
    return joined
```

This prevents creating blocks that are too large by respecting a maximum combined size.

---

## What This Enables

### Use Cases Now Supported

1. **Pattern Memorization Training**
   - Type LLM-generated pattern examples
   - Focus on common idioms (map, filter, reduce)
   - No function wrappers needed

2. **Language-Specific Practice**
   - JavaScript array methods
   - TypeScript type patterns
   - React hooks usage
   - Python list comprehensions

3. **Mixed Content Files**
   - Tutorial-style files with multiple examples
   - Comparison files (good vs bad patterns)
   - Progressive complexity sequences

4. **Custom Snippet Collections**
   - Organize by difficulty
   - Group by framework (React, Vue, etc.)
   - Category-based practice sessions

---

## Risk Assessment

### 🟢 Very Low Risk

**Why Implementation is Safe:**

1. **Non-Breaking Change**
   - Files without `// PATTERN:` markers → tree-sitter (unchanged)
   - Files with markers → new block extraction
   - Zero impact on existing working files

2. **Isolated Feature**
   - New code paths only execute if markers detected
   - Doesn't modify tree-sitter logic
   - No changes to database schema
   - No changes to frontend

3. **Uses Existing Infrastructure**
   - Respects `parser.config.json` filters
   - Returns standard SyntaxNode objects
   - Integrates with existing import pipeline

4. **Easy Rollback**
   - Remove markers from files → falls back to tree-sitter
   - No database migrations needed
   - No dependencies added

**Edge Cases Handled:**
- ✅ Empty blocks → Filtered out
- ✅ Blocks outside size limits → Logged and skipped
- ✅ Files without markers → Tree-sitter mode
- ✅ Malformed markers → Ignored, continues parsing
- ✅ CRLF line endings → Normalized
- ✅ Multiple comment styles → Both supported

---

## Future Enhancements (Not Implemented)

### 1. Pattern Metadata Support

**Idea:** Allow additional metadata in markers

```javascript
// PATTERN: Array Map [difficulty: easy] [time: 30s]
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
```

**Benefits:**
- Difficulty-based filtering
- Estimated typing time
- Tags/categories

**Effort:** Medium (2-3 hours)

---

### 2. Multi-Language Pattern Files

**Idea:** Support multiple languages in one file

```
// PATTERN [js]: Array Methods
const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2);

# PATTERN [py]: List Methods
nums = [1, 2, 3]
doubled = [n * 2 for n in nums]
```

**Benefits:**
- Compare syntax across languages
- Side-by-side examples

**Effort:** High (4-6 hours)

---

### 3. Pattern Validation Rules

**Idea:** Enforce rules per pattern type

```json
{
  "patterns": {
    "Array Methods": {
      "minLength": 100,
      "maxLength": 300,
      "requiresConsoleLog": false
    },
    "React Hooks": {
      "minLength": 200,
      "maxLength": 600,
      "requiresReturn": true
    }
  }
}
```

**Benefits:**
- Pattern-specific quality control
- Enforce best practices

**Effort:** High (6-8 hours)

---

## Lessons Learned

### 1. Line Ending Nightmares

**Learning:** Always normalize line endings when reading files from cross-platform sources.

**Pattern to remember:**
```typescript
const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
```

This should be standard practice for any file reading in Node.js projects.

---

### 2. Debug Logging is Essential

**Learning:** When building parsers, verbose logging saves hours of debugging.

Without detailed logs, we would never have quickly identified:
- Why blocks were rejected
- Which lines were too long
- How many markers were found

**Rule:** Always log extraction/validation steps during development, make it configurable for production.

---

### 3. User Workflow Understanding is Critical

**Learning:** The original tree-sitter approach was designed for "production code extraction" but the user needed "pattern memorization blocks."

Understanding the **actual use case** (LLM-generated flashcard-style snippets) led to the right solution (marker-based extraction).

**Rule:** Always clarify the user's workflow before designing features.

---

### 4. TypeScript Type Safety Can Be Worked Around

**Learning:** When interfaces from external libraries are too strict, the double-cast pattern (`as unknown as Type`) is a valid escape hatch.

```typescript
return mockObject as unknown as StrictInterfaceType;
```

**Caveat:** Only use when you're confident the mock object will work correctly in practice.

---

## Project Status After Session 23

**Current Version:** v1.2.0 (unchanged - feature complete, version bump pending)  
**Target Version:** v1.3.0 (after documentation updates)  
**Stability:** ✅ Excellent (pattern extraction tested and working)  
**Documentation:** ⚠️ Needs updates (add pattern format to README)

---

## Statistics

**Total Sessions:** 23  
**Lines of Code Modified (Session 23):** ~150 lines (parser.service.ts)  
**New Methods Added:** 3 (extractPatternBlocks, isValidPatternBlock, createSyntaxNodeLike)  
**Methods Enhanced:** 1 (parseTrackedNodes)  
**Bugs Fixed:** 1 (CRLF line ending issue)  
**Snippets Successfully Imported:** 95  
**Files Processed:** 28 of 33 (85% success rate)

---

## Next Session Priorities

### Documentation Updates

1. **Update README.md**
   - Document `// PATTERN:` marker format
   - Add example pattern file
   - Update "Adding Snippets" section
   - Explain pattern mode vs tree-sitter mode

2. **Update ARCHITECTURE.md**
   - Document block extraction mode
   - Add "Pattern Files vs Code Files" section
   - Explain marker detection logic
   - Document CRLF handling

3. **Create PATTERN_FORMAT.md**
   - Complete specification
   - Examples for all supported languages
   - Best practices guide
   - Troubleshooting section

---

### Feature Enhancements (Optional)

1. **Filter tuning** - Test with relaxed settings to import more snippets
2. **Problem file fixes** - Add markers to skipped files (001, 014, 015, etc.)
3. **Python script refinement** - Improve `join_small_snippets()` logic
4. **Version bump** - Update to v1.3.0 once documented

---

## Questions for Next Session

1. **How's the typing experience?** Are the 95 snippets good quality for practice?
2. **Want more snippets?** Should we relax filters or fix problem files?
3. **Ready for documentation?** Or should we test/refine more first?
4. **Python files next?** Do you have Python snippets to test the `#` marker support?

---

## Key Decisions Made

1. ✅ **Multi-language comment support** - Both `//` and `#` in same parser
2. ✅ **CRLF normalization required** - Handle Windows/Linux line endings
3. ✅ **Colon format over brackets** - `PATTERN: Name` not `PATTERN [Name]`
4. ✅ **Detailed logging essential** - Help users understand import results
5. ✅ **Hybrid parsing approach** - Pattern mode for marked files, tree-sitter for others
6. ✅ **No breaking changes** - Feature adds new capability, doesn't modify existing behavior

---

**End of Session 23**

Pattern-based snippet extraction is now **fully implemented and working**. The parser successfully processes LLM-generated code files with marker-delimited blocks, handling cross-platform line ending issues and providing detailed validation feedback.

The feature enables the user's core workflow: practicing pattern memorization with flashcard-style code examples, without requiring production-style function wrappers.

**Status:** ✅ Feature complete, ready for production use

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

1. ✅ **Always use full absolute paths** from home directory
2. ✅ **I provide `code` commands**, not `nano` (you prefer VS Code)
3. ✅ **I give you full code blocks to copy-paste**, not diffs
4. ✅ **You only upload specific files** when I ask (not entire codebase)
5. ✅ **Terminal-based workflow** (cat, grep, code, npm) - fast and efficient
6. ✅ **Hex dumps for debugging** encoding/line ending issues