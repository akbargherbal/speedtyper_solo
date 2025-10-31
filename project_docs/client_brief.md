### **Project Brief & Request for Consultation: The Next Evolution of Speedtyper Local**

**Document Version:** 1.0  
**Date:** October 31, 2025  
**Project:** Speedtyper Local (v1.3.0-next)

#### **1.0 Project Overview & Philosophy**

Speedtyper Local is a developer tool for solo typing practice. It is a fork of the open-source project `speedtyper.dev`, transformed from a real-time, multiplayer coding race application into a **frictionless, local-first, personal training environment**.

Our core philosophy is rooted in pragmatism, simplicity, and systematic, phased implementation. The primary goal is to provide a high-fidelity typing interface that helps developers build muscle memory by practicing with their own code snippets.

**Key Principles:**

- **Zero-Friction Experience:** From `npm run dev` to typing should take less than 90 seconds. No Docker, no complex setup, no mandatory authentication.
- **Local-First:** The tool must work offline and without reliance on external services. All data (snippets, results) is stored locally in a single SQLite database file.
- **Preserve the Core:** The original application's real-time typing engine is excellent. Our strategy has been to surgically modify the surrounding architecture while treating this core engine with extreme care.

#### **2.0 Current Status: A Stable Foundation (v1.3.0)**

The initial, high-risk transformation is complete and successful. We have a stable, fully functional application that achieves the project's primary goals.

**Key Accomplishments:**

- **Database:** Migrated from PostgreSQL to a single-file SQLite database.
- **Snippet Source:** Replaced GitHub API integration with a local import system that uses Tree-sitter to parse code from a user-provided `snippets/` directory.
- **Authentication:** Removed the GitHub OAuth requirement in favor of an automatic, zero-friction guest user system.
- **Workflow:** Implemented keyboard-centric navigation and a one-command startup process.

We are now at a strategic inflection point, ready to build upon this stable foundation to deliver a richer, more insightful user experience.

#### **3.0 The Next Evolution: From Practice Tool to Personal Trainer**

We are exploring a new tier of features aimed at providing long-term value and enhancing the core typing experience. This exploration is currently in an investigative phase. We seek expert guidance on the feasibility, risks, and optimal implementation strategy for the following areas.

**3.1 Foundational Prerequisite: Stable User Identity**

- **Problem:** The current guest system is ephemeral. It often creates a new "guest" user on session restarts, making it impossible to track a single user's progress over time. All historical data becomes fragmented and unreliable.
- **Desired State:** A single, persistent, automatically managed "Local User" identity. From the first launch onward, all activity should be associated with this one user, whose identity is stored robustly within the SQLite database, not browser storage.

**3.2 The Goal: User Progress Dashboard**

- **Vision:** Once a stable identity is established, we aim to build a dashboard that provides users with meaningful insights into their performance.
- **Proposed Components:**
  - High-level KPIs (Average WPM, Average Accuracy, Total Races).
  - A performance-over-time chart visualizing WPM/accuracy trends.
  - A breakdown of performance metrics by programming language.
  - A history of recent race results.

**3.3 Core Experience Enhancement: "Smart Typing" Engine**

We want to make the typing experience feel more intuitive and aligned with a real developer workflow by allowing certain characters or code structures to be skipped.

- **A. Configurable Character Skipping:** The ability to automatically handle non-essential characters. The primary use case is auto-inserting spaces, so the user only types the visible characters of a line. This should be a configurable feature (e.g., via a JSON file) that can be toggled on or off.

- **B. Skippable Code Nodes (AST-based):** A more advanced concept where entire sections of code are visible for context but are not required to be typed. The primary use case is skipping comments. A potential extension could be skipping other nodes identified by Tree-sitter, such as string literals.

**3.4 Visual Fidelity: Dynamic, Language-Specific Syntax Highlighting**

- **Vision:** To replace the current three-color feedback system (correct/incorrect/untyped) with rich, language-specific syntax highlighting that still provides real-time typing feedback.
- **Non-Negotiable Constraint:** The solution **must not** sacrifice the immediate, character-by-character feedback that is core to the application. If a user makes a typo, the visual indication must be instant.
- **Key Design Question:** When should syntax colors appear?
  1.  **Pre-Typed:** The snippet is fully highlighted initially, and feedback colors are overlaid as the user types.
  2.  **Post-Typed:** The snippet starts as plain text, and tokens are colored in as they are typed correctly, providing a "live" highlighting effect.

#### **4.0 Key Questions for Consultation**

Given the context and our guiding principles, we request your analysis and recommendations on the following:

1.  **Stable Identity:** What is the most robust and simplest architectural pattern to implement the "Local Super User" model within a NestJS backend? Should this be handled in middleware, as a one-time database seed, or another approach?

2.  **Smart Typing Engine (Features 3.3 A & B):**

    - What are the primary risks associated with modifying the real-time keystroke validation logic on the backend?
    - How would you recommend modifying the WebSocket contract to communicate "skippable" character ranges to the frontend without introducing significant latency?
    - In your opinion, what is the most significant challenge in implementing the corresponding caret-jumping logic on the frontend?

3.  **Dynamic Syntax Highlighting (Feature 3.4):**

    - From a technical standpoint, what is the most viable approach to merge semantic syntax highlighting with real-time, character-level typing feedback (correct/incorrect)?
    - Between the "Pre-Typed" and "Post-Typed" models, which do you believe presents a more manageable technical challenge while offering a better user experience? Are there hybrid approaches we haven't considered?

4.  **Strategic Roadmap:** Considering the complexity and interdependencies, how would you sequence the implementation of these features? Please provide a recommended phasing that prioritizes foundational work and minimizes risk.

Due to token limits per session, I can’t upload the entire codebase. However, if you suspect there’s an issue with a file or need to verify something, please ALWAYS ASK for the specific files you need. Don’t make guesses or assumptions.


---
## 🤝 Collaboration Protocol (Minimum Friction)

### Command Patterns We're Using:

**When I (Consultant) need to see a file:**

```bash
cat ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/path/to/file
```

You copy-paste the output back to me.

**When I (Consultant) need to see specific lines:**

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
