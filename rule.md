# Real-Time Phishing Simulator Arena - Codebase Rules

Welcome to the Real-Time Phishing Simulator Arena! This project is a multiplayer educational game where players interact with AI-generated phishing attacks and defend system nodes.

These are the strict rules for the codebase. **Every developer must follow these rules without exception.**

## 1. Allowed Technology Stack
The following technologies are strictly mandated for use. No other major frameworks, databases, or languages may be used without explicit consultation and approval.
*   **Frontend**: React / Next.js
*   **3D Rendering**: React Three Fiber
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Real-Time Data**: Socket.io
*   **Backend API**: Fast API (Python)
*   **Databases**: PostgreSQL (Relational Data) and Redis (Live Match Data & Caching)
*   **AI Models**: GPT-4o-mini, Grok, Llama (for Attack Generation)

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
*   Stick to the approved architecture diagrams:
    *   *Frontend flow*: App -> Login -> Lobby -> Game -> Interact -> Debrief.
    *   *Backend flow*: FastAPI handles Game Logic (PostgreSQL/Redis) and orchestrates AI Attack Generators (GPT/Voice/Llama/External APIs) securely.

## 4. File and Folder Structure
*   All folders and files must be easy to access and intuitively located.
*   Use standard Next.js `src/app` routing for the frontend.
*   Use a clear modular FastAPI structure (`app/api`, `app/core`, `app/services`, `app/models`) for the backend.
*   Do not dump files into the root directory. Keep the root clean.

By adhering to these rules, we ensure a scalable, maintainable, and robust Real-Time Phishing Simulator Arena.
