# Session 22 Summary: Pattern-Based Snippet Extraction

**Date:** October 30, 2025
**Duration:** ~90 minutes
**Current Status:** Implementation ready, pending offline testing

---

## Session Context

This was a **revision and investigation session** focused on understanding why many LLM-generated pattern files were being skipped during import. The user generates code snippets via LLM specifically for **pattern memorization training** (not production code practice), which created a fundamental mismatch with the tree-sitter extraction philosophy.

---

## Problem Identified

### The Core Issue

**Import Log Analysis:**

- 43 files processed
- Only 23 files yielded snippets (44 total snippets)
- **20 files completely skipped** (0 snippets extracted)

**Why Files Were Skipped:**

Tree-sitter's `filterValidNodeTypes()` method uses a strict whitelist that only accepts:

- Functions (`function_declaration`, `method_declaration`)
- Classes (`class_declaration`, `class_definition`)
- Modern declarations (`lexical_declaration`, `arrow_function`)

**Everything else is rejected**, including:

- `expression_statement` - Standalone code like `const x = value;` or `console.log()`
- `try_statement` - Try/catch blocks
- `if_statement`, `for_statement` - Control flow
- `interface_declaration`, `type_alias_declaration` - TypeScript types

**The User's Files Contained:**

Pattern demonstration blocks like:

```javascript
const userInput = "  hello world  ";
const cleanInput = userInput.trim();
console.log(cleanInput);

const csvData = "apple,banana,cherry";
const fruitArray = csvData.split(",");
console.log(fruitArray);
```

These are **expression statements**, not functions, so tree-sitter skipped them entirely.

---

## Key Insight: Use Case Clarification

**User's Quote:** "I am not practicing on production code; I am practicing on LLM generated most frequent patterns as a way to absorb those patterns and train my memory muscles."

This is **pattern memorization training**, not production typing practice. The files are structured like flashcards:

- Each block = one pattern to memorize
- Blocks separated by blank lines
- No function wrappers needed (just the pattern itself)

**Architectural Mismatch:**

- Parser expects: "Extract reusable functions from production code"
- User needs: "Extract demonstration blocks for pattern learning"

---

## Solutions Considered

### Option A: Wrap Everything in Functions ❌

**Rejected** - Would require changing the user's entire workflow and LLM prompts. Goes against the pattern demonstration philosophy.

### Option B: Modify Tree-Sitter Whitelist ⚠️

Add `expression_statement` to allowed node types.

**Risk Assessment:**

- 🟡 **Medium Risk** - Could extract random single-line fragments
- ⚠️ **Context Loss** - Expression statements lack semantic grouping
- ⚠️ **Quality Degradation** - Tree-sitter can't distinguish intentional blocks from code fragments

**Conclusion:** Too risky without additional safeguards.

### Option C: Block-Based Extraction with Comment Markers ✅

**Selected Solution**

Add special comment markers to delimit pattern blocks:

```javascript
// PATTERN: String trim
const text = "  hello  ";
const cleaned = text.trim();

// PATTERN: String split
const csv = "a,b,c";
const parts = csv.split(",");
```

Parser detects markers → extracts blocks → applies quality filters.

**Why This Works:**

- ✅ Explicit structure (no guessing)
- ✅ Preserves pattern titles (metadata)
- ✅ Self-contained blocks (semantic meaning preserved)
- ✅ Non-breaking (files without markers use tree-sitter normally)
- ✅ Zero new dependencies

---

## What We Implemented

### Modified File: `parser.service.ts`

**Three new methods added:**

1. **`parseTrackedNodes()` - Enhanced**

   - Checks for `// PATTERN:` markers before tree-sitter
   - Falls back to tree-sitter if no markers found
   - Backward compatible

2. **`extractPatternBlocks()` - New**

   - Splits file by `// PATTERN:` markers
   - Extracts code between markers
   - Converts blocks to SyntaxNode-like objects
   - Logs extraction statistics

3. **`isValidPatternBlock()` - New**
   - Validates blocks against `parser.config.json` filters
   - Min 2 lines (prevent single-line fragments)
   - Applies existing length, line count, char count limits
   - Logs why blocks are rejected

**Implementation Details:**

```typescript
// Detection logic
if (content.includes("// PATTERN:")) {
  console.log(
    "[parser]: Detected PATTERN markers, using block extraction mode"
  );
  return this.extractPatternBlocks(content);
}

// Extraction via regex
const match = line.match(/^\/\/ PATTERN:\s*(.+)$/);

// Validation using existing config
const isValid =
  lines.length >= 2 &&
  lines.length <= this.MAX_NUM_LINES &&
  charCount >= this.MIN_NODE_LENGTH &&
  charCount <= this.MAX_NODE_LENGTH &&
  lines.every((line) => line.length <= this.MAX_LINE_LENGTH);
```

---

## File Format Specification

### The `// PATTERN:` Marker Format

**Structure:**

```javascript
// PATTERN: {descriptive name}
{code block - 2-15 lines}

// PATTERN: {next pattern name}
{code block - 2-15 lines}
```

**Example File:**

```javascript
// PATTERN: String trim
const userInput = "  hello world  ";
const cleanInput = userInput.trim();
console.log(cleanInput);

// PATTERN: String split
const csvData = "apple,banana,cherry";
const fruitArray = csvData.split(",");
console.log(fruitArray);
```

**Rules:**

1. Marker must be on its own line
2. Pattern name follows after `// PATTERN:`
3. Code block continues until next marker (or EOF)
4. Optional blank line after marker (automatically skipped)
5. Blocks are validated against existing filters

---

## Testing Plan (To Be Done Offline)

### Test File Created

**Location:** `snippets/javascript/013_string-methods.js`
**Content:** 9 patterns (trim, split, join, includes, startsWith/endsWith, replaceAll, case conversion, padStart, template literals)

### Expected Results

**Command:**

```bash
npm run reimport
```

**Expected Output:**

```
[parser]: Detected PATTERN markers, using block extraction mode
[parser]: Extracted 9 pattern block(s)
[parser]: 9 pattern block(s) passed validation
✓ javascript/013_string-methods.js - Extracted 9 snippet(s)
```

**Database Verification:**

```bash
sqlite3 speedtyper-local.db "SELECT id, language, length(content) as chars FROM challenge WHERE path LIKE '%013_string-methods%';"
```

Should show 9 rows with ~150-200 chars each.

### Files Ready for Marker Addition

**Currently skipped files (20 total):**

- JavaScript: 001, 003, 005, 007, 008, 009, 012, 013
- Python: 01, 02, 04, 06
- TypeScript: 015, 020, 022, 026, 028, 031, 034

**Expected gain after adding markers:** ~30-40 additional snippets

---

## Risk Assessment

### 🟢 Very Low Risk

**Why Implementation is Safe:**

1. **Non-Breaking Change**

   - Files without `// PATTERN:` markers → tree-sitter (existing behavior)
   - Files with markers → new block extraction
   - Zero impact on existing working files

2. **Isolated Feature**

   - New code paths only execute if markers detected
   - Doesn't modify tree-sitter logic
   - No changes to database schema
   - No changes to frontend

3. **Uses Existing Infrastructure**

   - Respects `parser.config.json` filters (150-500 chars, max 15 lines)
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

---

## Next Steps (For Next Session)

### Immediate Actions

1. **Test Implementation**

   - Run `npm run reimport` with test file
   - Verify 9 snippets extracted
   - Check database for correct content
   - Test typing one snippet in app

2. **If Test Succeeds:**

   - Add `// PATTERN:` markers to the 20 skipped files
   - Update LLM prompt to generate markers automatically
   - Re-import all snippets
   - Verify ~30-40 new snippets available

3. **If Test Fails:**
   - Share error logs
   - Debug extraction logic
   - Adjust marker format if needed

### Documentation Updates Needed

Once tested and working:

**Update `README.md`:**

- Document `// PATTERN:` marker format
- Add example pattern file
- Update "Adding Snippets" section

**Update `ARCHITECTURE.md`:**

- Document block extraction mode
- Add "Pattern Files vs Code Files" section
- Explain marker detection logic

**Update `FEATURES.md`:**

- Move "Pattern Block Extraction" to completed features
- Update version to v1.3.0

---

## LLM Prompt Updates

### Current Prompt Issues

User's LLM generates XML with `<pattern>` blocks, which are then manually converted to `.js`/`.ts` files. This conversion step loses structure.

### Recommended New Prompt

**For Direct Code Generation:**

```markdown
Generate {LANGUAGE} code snippets for these patterns: {PATTERN_LIST}

Format each pattern like this:

// PATTERN: {Pattern Name}
{2-10 lines of demonstration code}

Rules:

1. Each pattern starts with // PATTERN: marker
2. Use realistic variable names (no foo/bar)
3. Keep blocks 2-10 lines (max 15 lines)
4. Self-contained code (no external references)
5. Add blank line between patterns for readability

Example:
// PATTERN: Array map
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n \* 2);
console.log(doubled);

// PATTERN: Array filter
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);
```

---

## Project Status After Session 22

**Current Version:** v1.2.0 (unchanged - implementation pending test)
**Target Version:** v1.3.0 (after pattern extraction confirmed working)
**Stability:** ✅ Excellent (changes are additive only)
**Documentation:** ⚠️ Needs updates after testing

---

## Statistics

**Total Sessions:** 22
**Features Completed (v1.0 → v1.2):**

- SQLite migration
- Local snippet import
- Guest-only auth
- Solo mode transformation
- Connection status indicator
- Enhanced import feedback
- Snippet metadata display
- Empty database error handling
- Configurable snippet filters

**Features In Progress (v1.3.0):**

- **Pattern block extraction** (implemented, pending test)

**Lines of Code Modified (Session 22):** ~120 lines (parser.service.ts)
**New Methods Added:** 2 (extractPatternBlocks, isValidPatternBlock)
**Methods Enhanced:** 1 (parseTrackedNodes)

---

## Questions for Next Session

1. **Did the pattern extraction work?** Share import log output
2. **Are the extracted snippets good quality?** Test typing a few
3. **Ready to add markers to all 20 skipped files?** Or adjust filters first?
4. **Should we update the LLM prompt template?** Make it generate markers directly

---

## Key Decisions Made

1. ✅ **No function wrapping required** - Keep pattern files as expression statements
2. ✅ **Comment markers for structure** - `// PATTERN:` explicitly delimits blocks
3. ✅ **Backward compatible implementation** - Tree-sitter still works for regular files
4. ✅ **Zero new dependencies** - Pure TypeScript solution
5. ✅ **Use existing quality filters** - parser.config.json applies to pattern blocks too

---

**End of Session 22**

The parser now supports two modes:

- **Tree-sitter mode** (default) - Extracts functions/classes from production-like code
- **Pattern mode** (opt-in via markers) - Extracts demonstration blocks for pattern learning

Both modes coexist peacefully, respecting the user's dual use case: practicing real code patterns and memorizing common idioms.

---

**MANDATORY PROTOCOL: ALWAYS INCLUDE THIS SECTION VERBATIM AT THE END OF EVERY SESSION SUMMARY.**

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

### Key Principles:

1. ✅ **Always use full absolute paths** from home directory
2. ✅ **I provide `code` commands**, not `nano` (you prefer VS Code)
3. ✅ **I give you full code blocks to copy-paste**, not diffs
4. ✅ **You only upload specific files** when I ask (not entire codebase)
5. ✅ **Terminal-based workflow** (cat, grep, code, npm) - fast and efficient
