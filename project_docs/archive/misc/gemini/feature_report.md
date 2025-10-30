# **Speedtyper Local: Feature Roadmap & Brainstorming Summary**

**Date:** October 30, 2025
**Source:** Session 18 Brainstorming

This document outlines the prioritized list of potential new features for the Speedtyper Local project. Each brief includes a description, its strategic value (impact), estimated effort and risk, and a clear path for implementation and verification.

---

## **Tier 1: High Priority (Release 1.1.0)**

*These features are low-effort, high-impact "quick wins" focused on improving quality of life, stability, and user control. They should be implemented first.*

### 1. Hunt and Remove Broken UI Elements

*   **What It Is:** A comprehensive cleanup task to find and remove all visible, non-functional UI elements inherited from the original multiplayer application.
*   **Why It's Important (Impact):** Improves application stability by removing known crash points (the leaderboard icon). Creates a cleaner, more honest UI that accurately reflects the app's solo-practice purpose by removing fake or empty data panels.
*   **Effort Entailed (Very Low):** A frontend-only task involving minor edits to two files.
*   **Implementation Plan:**
    1.  **Remove Crashing Leaderboard Button:**
        *   Edit `~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/webapp-next/common/components/NewNavbar.tsx`.
        *   Delete or comment out the line `<LeaderboardButton />` and its corresponding import statement.
    2.  **Remove Fake/Empty Results Panels:**
        *   Edit `~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/packages/webapp-next/modules/play2/containers/ResultsContainer.tsx`.
        *   Delete or comment out the `<TrendsWPM />` and `<DailyStreak />` components.
*   **How to Verify:** The crown icon is gone from the top navigation bar. The "daily streak" and "average wpm" panels are gone from the results screen. The application is more stable and the UI is cleaner.

### 2. Configurable Keyboard Shortcut System

*   **What It Is:** A system that allows the entire typing workflow to be controlled via the keyboard. It will ship with a set of logical default shortcuts, but every action will be user-configurable through a simple JSON object pasted into the settings modal.
*   **Default Shortcuts Proposed:**
    *   `Enter`: Start the next race after finishing one.
    *   `Ctrl + L`: Focus the language selection dropdown.
    *   `Ctrl + R`: Refresh the current snippet to get a new one.
*   **Why It's Important (Impact):** Reduces friction for keyboard-centric users. Provides a "power-user" experience, allowing you to tailor the tool to your exact workflow.
*   **Effort Entailed (Low-to-Medium):** A frontend-only feature. The main work is a one-time upgrade to `useKeyMap.ts` to support modifier keys. The UI for configuration will be a simple `<textarea>`, avoiding complex React work.
*   **Implementation Plan:**
    1.  **Upgrade Hook:** Enhance `useKeyMap.ts` to support `Ctrl`, `Alt`, and `Shift` modifiers.
    2.  **Create Service:** Build a `keybinding.service.ts` to manage defaults and load custom overrides from `localStorage`.
    3.  **Implement Defaults:** Integrate the service to provide the default shortcuts.
    4.  **Add Configuration UI:** Add a `<textarea>` to the settings modal for pasting custom JSON keybindings.
*   **How to Verify:** All default shortcuts work. Pasting a valid JSON into settings successfully overrides the defaults. The custom shortcuts persist after a page refresh.

### 3. Persist Language Selection

*   **What It Is:** The application will automatically remember and re-apply the last programming language you selected, even after closing the browser and returning later.
*   **Why It's Important (Impact):** Eliminates the repetitive friction of re-selecting your preferred language. Contributes to the "zero-friction startup" goal.
*   **Effort Entailed (Very Low):** A frontend-only, one-file change in `settings-store.ts` using `localStorage`.
*   **How to Verify:** Select a language (e.g., Python). Close the browser tab. Re-open the application. Confirm Python is still the selected language.

---

## **Tier 2: Medium Priority (The "Next Big Thing")**

*These are high-impact, high-effort features that represent the next major evolution of the application. They should be tackled after Release 1.1.0 is complete.*

### 4. User Progress Tracking & Persistence

*   **What It Is:** A major feature to track your typing performance over time. This involves making the "guest user" permanent (via `localStorage`) and building a new UI to display historical progress (WPM trends, accuracy over time, etc.).
*   **Why It's Important (Impact):** Transforms the application from a simple "practice tool" into a "personal improvement tool." Seeing your progress is a powerful motivator.
*   **Effort Entailed (High):** A full-stack feature. The backend work to make the user persistent is low-to-medium effort. The frontend work is high effort and high risk, as it requires building a brand new progress dashboard component from scratch.
*   **How to Verify:** A `userId` is persisted in `localStorage`. Completed race results are correctly associated with this user ID in the database. The new progress dashboard UI successfully fetches and displays historical data.

### 5. Smart Snippets (Visible but Skippable Comments)

*   **What It Is:** A feature where code comments (and potentially other elements like imports) are displayed visually but are automatically skipped over during typing.
*   **Why It's Important (Impact):** Makes practice more realistic by retaining the full context of the code. Allows focus on typing core logic while ignoring boilerplate.
*   **Effort Entailed (High):** The backend work is medium effort (on-the-fly parsing in `race-manager.service.ts` to add `nonTypableRanges` to the payload, requiring no DB changes). The frontend work is high effort and high risk, requiring significant changes to the core typing engine (`Game.ts`, `CodeArea.tsx`).
*   **How to Verify:** Backend WebSocket messages contain the `nonTypableRanges` data. On the frontend, comments are visually distinct, and the typing cursor instantly jumps over them. WPM/accuracy calculations correctly ignore the skipped text.

---

## **Tier 3: Low Priority (Future Consideration)**

*These features are valuable but either have a very high risk/reward ratio or are non-essential "nice-to-haves." They should only be considered after Tier 1 and Tier 2 features are complete.*

### 6. Language-Aware Syntax Highlighting

*   **What It Is:** An enhancement to display code snippets with IDE-like syntax highlighting (keywords, strings, etc., in different colors) underneath the typing-progress overlay.
*   **Why It's Important (Impact):** A massive visual upgrade that would make the application feel significantly more professional and polished.
*   **Effort Entailed (High Effort & High Risk):** A frontend-only feature. The risk is extremely high because it would require a fundamental rewrite of the core `CodeArea.tsx` component to merge a standard syntax highlighting library with the existing character-by-character typing logic.
*   **How to Verify:** Snippets are rendered with multiple colors before typing begins. Typing progress colors are correctly overlaid without breaking the highlighting or performance.

### 7. Configurable Snippet Filters

*   **What It Is:** A backend feature allowing you to control the characteristics of imported code snippets (e.g., length, line count) by editing a `parser.config.json` file.
*   **Why It's Important (Impact):** Gives you control over the difficulty and style of your practice material, improving the quality of the snippet library.
*   **Effort Entailed (Low, Backend Only):** A backend-only change with zero frontend risk. Involves modifying `parser.service.ts` to read from a new JSON config file.
*   **How to Verify:** Set an extreme filter in the config file (e.g., `"maxLength": 80`). Re-import snippets. Verify via a SQL query that no snippets in the database violate this new rule.