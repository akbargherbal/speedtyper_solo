### **Bug Report: Issue #6 - Language Selector UI Desynchronization**

**Status:** `[RESOLVED]`
**Last Updated:** November 7, 2025
**Resolution Session:** Session 42

#### **1. Symptom**

When changing the programming language via the `Alt+Arrow` keyboard shortcuts, the application exhibited desynchronized behavior:

- The code snippet correctly updates to the new language (e.g., from Python to TypeScript).
- The language button in the footer, however, failed to update. It either remained on the original language or reverted to a previous language, creating a mismatch between the displayed code and the selected language UI.
- The toast notification showing the language change displayed incorrect/stale language names.
- Manually selecting a language with the mouse worked as expected.

#### **2. Diagnostic and Repair History**

This bug persisted through four sessions (Sessions 39-42) with multiple failed fix attempts that progressively revealed the root cause.

**Session 40 Hypothesis: Parent Component Not Re-rendering**

- **Analysis:** It was believed that a parent component (`ActionButtons` in `PlayFooter.tsx`) was not subscribed to the `settings-store`, preventing its child (`RaceSettings`) from receiving updated props and re-rendering.
- **Attempted Fix:** Subscribed `ActionButtons` to the `languageSelected` state and passed the language name down as a prop to `RaceSettings`.
- **Result:** **[FAILURE]**. The fix had no effect, and the UI remained desynchronized.

**Session 41, Hypothesis 1: Prop-Drilling Defeated by Memoization**

- **Analysis:** The failure of the first fix suggested that `React.memo` or a similar optimization was blocking the prop from trickling down the component tree. The proposed solution was to bypass the parent and have the child subscribe directly to the global state.
- **Attempted Fix:**
  1. Reverted changes in `PlayFooter.tsx`, removing the state subscription from `ActionButtons`.
  2. Modified `RaceSettings.tsx` to subscribe directly to `useSettingsStore` to get the `languageSelected` value.
- **Result:** **[FAILURE]**. The bug's behavior changed slightly but was not resolved. The UI would sometimes show the correct language momentarily before reverting.

**Session 41, Hypothesis 2: State Management Race Condition**

- **Analysis:** The new behavior pointed towards a race condition where the state was being updated correctly, then immediately overwritten with an incorrect value.
- **Diagnostic Step:** Added a `console.log` to the `setLanguage` function in `settings-store.ts` to trace every state mutation.
- **Confirmation:** The logs confirmed the hypothesis, showing a double-fire pattern on every keyboard shortcut press:
  1. `setLanguage` is called with the **correct** new language (e.g., 'TypeScript').
  2. `setLanguage` is immediately called again with the **incorrect** old language (e.g., 'JavaScript').
- **Root Cause Identified:** The programmatic state change was causing the Headless UI `Listbox` component in `LanguageSelector.tsx` to re-render. This re-render was triggering its `onChange` handler, which then re-set the global state to the value it previously held internally.

**Session 41, Hypothesis 3: Fixing the Race Condition**

- **Analysis:** The `Listbox`'s `onChange` handler needed to be smarter to prevent this feedback loop.
- **Attempted Fix:**
  1. Refactored `LanguageSelector.tsx` to use a new `handleLanguageChange` function.
  2. This function checks if the incoming language is different from the current state before calling `setLanguage` and refreshing the snippet.
- **Result:** **[FAILURE]**. Despite the logical guard, the bug persists, indicating a more subtle and complex interaction between the Zustand global store and the internal state management of the Headless UI `Listbox` component.

**Session 42: Eliminating the Headless UI Listbox**

- **Analysis:** To prove the `Listbox` component was the issue, replaced it with a standard HTML `<select>` element.
- **Attempted Fix:** Simplified `LanguageSelector.tsx` to use native `<select>` instead of Headless UI.
- **Result:** **[PARTIAL SUCCESS]**. The selector dropdown synchronized correctly, but the toast notification still showed stale language names.

**Session 42: Root Cause - Duplicate Keyboard Handlers**

- **Analysis:** Through systematic investigation, discovered **two separate keyboard handlers** responding to `Alt+Arrow`:
  1. In `index.tsx`: Using `useSWR` to fetch languages and a local `cycleLanguage()` function
  2. In `useGame.ts`: Using `nextLanguage()`/`previousLanguage()` from `settings-store.ts`
- **Root Cause Confirmed:** The race condition was caused by duplicate handlers reading from different data sources:
  - `index.tsx` handler read from **SWR cache** (stale data) and showed it in toast
  - `useGame.ts` handler updated **Zustand store** (fresh data) which updated the code snippet and selector
  - Both handlers fired simultaneously, causing the desynchronization
- **Final Fix:**
  1. Removed duplicate keyboard handlers and `cycleLanguage()` function from `index.tsx`
  2. Added toast notifications to `nextLanguage()` and `previousLanguage()` functions in `settings-store.ts`
  3. Replaced Headless UI `Listbox` with standard HTML `<select>` element for simplicity
- **Result:** **[SUCCESS]** ✅ All UI elements now synchronize correctly.

#### **3. Resolution Summary**

**The bug was caused by:**
1. **Duplicate keyboard event handlers** responding to the same shortcuts
2. **Multiple data sources** (SWR cache vs Zustand store) creating inconsistent state
3. **Headless UI Listbox complexity** adding unnecessary indirection

**The fix involved:**
1. **Single source of truth**: All language state managed exclusively through `settings-store.ts`
2. **Single keyboard handler**: Only `useGame.ts` handles `Alt+Arrow` shortcuts
3. **Simplified UI component**: Replaced Headless UI `Listbox` with native `<select>` element
4. **Centralized notifications**: Toast messages triggered directly from state management functions

**Files Modified:**
- `packages/webapp-next/modules/play2/state/settings-store.ts` - Added toast notifications to `nextLanguage()` and `previousLanguage()`
- `packages/webapp-next/modules/play2/components/race-settings/LanguageSelector.tsx` - Replaced Headless UI with native `<select>`
- `packages/webapp-next/pages/index.tsx` - Removed duplicate keyboard handlers and language fetching logic

**Lessons Learned:**
- Always check for duplicate event handlers when debugging UI synchronization issues
- Multiple data sources (SWR + Zustand) can create subtle race conditions
- Simpler UI components (native elements) are often more reliable than complex libraries for controlled components
- Methodical debugging with logging is essential for isolating race conditions
