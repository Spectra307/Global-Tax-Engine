# Global Tax Engine - Codebase Rules

Welcome to the Global Tax Engine! This project is a comprehensive tax calculation and tracking system supporting multiple countries.

These are the strict rules for the codebase. **Every developer must follow these rules without exception.**

## 1. Allowed Technology Stack
The following technologies are strictly mandated for use. No other major frameworks, databases, or languages may be used without explicit consultation and approval.

| Layer          | Technology         | Why             |
| -------------- | ------------------ | --------------- |
| Frontend       | SvelteKit          | Fast + reactive |
| Styling        | TailwindCSS        | Quick UI        |
| Icons          | Lucide Icons       | clean icons     |
| Charts         | Chart.js           | analytics       |
| Backend        | Node.js + Express  | simple          |
| Database       | Supabase free tier | auth + storage  |
| Hosting        | Vercel             | free            |
| PDF generation | pdf-lib            | invoices        |
| Data           | local JSON dataset | no paid APIs    |

## 2. Clear Documentation Requirements
*   **Every single file** must contain clear, beginner-friendly documentation at the top.
*   The documentation must explain:
    *   What the file does.
    *   How it interacts with other parts of the system.
    *   Key functions or components contained within.
*   "So simple a kid can understand" is our bar. Leave descriptive comments on all non-obvious logic.

## 3. Strict Modification Policy 
*   **NO new ideas, libraries, architectural changes, or processes are allowed without consultation.**
*   If you find a missing piece or a better way to do something, *ask first*.
*   Stick to the approved architecture diagram:

```text
        User
          |
          |
  SvelteKit Frontend
          |
-----------------------
|                     |
Tax Engine API        Supabase
  (Node.js)           Database
|
|
JSON Dataset
(20 country rules)
```

## 4. File and Folder Structure
*   All folders and files must be easy to access and intuitively located.
*   Use standard SvelteKit `src/routes` and `src/lib` structure for the frontend.
*   Use a clear modular Node.js/Express structure (`src/routes`, `src/controllers`, `src/services`, `src/utils`) for the backend.
*   Do not dump files into the root directory. Keep the root clean.

By adhering to these rules, we ensure a scalable, maintainable, and robust Global Tax Engine.
