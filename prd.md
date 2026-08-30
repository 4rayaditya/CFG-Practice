# Product Requirements Document (PRD) v3.0

**Project Name:** MentorMatch AI (K-12 Edition)
**Document Status:** Approved for Hackathon Development
**Target Platform:** Web / Mobile Web (PWA)
**Engineering Team:** 4 Engineers (DB/Auth, AI/Vector, UI/Analytics, PWA/Real-Time)

## 1. Executive Summary

MentorMatch AI is an offline-capable, voice-enabled mentorship platform designed to instantly connect high school and middle school students with qualified peer tutors and teachers. By leveraging Groq's LPUs for hyper-fast audio transcription (`whisper-large-v3`) and query structuring (Llama 3), combined with Supabase `pgvector` for semantic mentor matching, the platform eliminates the friction of finding homework help. Built as a distraction-free Progressive Web App (PWA) with background sync, it allows students in low-connectivity areas to record academic doubts offline and auto-sync when the internet returns.

## 2. Target Personas

* **The Student:** A K-12 student needing immediate homework or exam prep help in core subjects (Physics, Algebra, History). Often studies in distraction-free zones or transit with spotty internet.
* **The Mentor:** A supportive teacher or peer tutor who wants a curated feed of questions tailored to their specific academic expertise, rather than sifting through a noisy forum.
* **The Admin:** Platform manager monitoring system health, homework resolution speeds, and overall tutor engagement.

## 3. Core User Journeys (CUJs)

### CUJ 1: Offline-Tolerant Voice Query

* **Trigger:** Student struggles with a concept (e.g., balancing a redox equation) and clicks the microphone button.
* **Action:** Student speaks their doubt. If offline, the audio blob is saved to IndexedDB.
* **Resolution:** When the connection returns, a background listener pushes the audio to the `/api/process-audio` route. Groq Whisper transcribes the audio, and Llama 3 structures it into a categorized JSON payload (e.g., `#chemistry`).

### CUJ 2: AI Vector Mentor Matching

* **Trigger:** A structured doubt is saved to the Supabase database.
* **Action:** The system generates 384-dimensional vector embeddings for the doubt text.
* **Resolution:** A PostgreSQL RPC function calculates Cosine similarity against mentor profiles, routing the question to the top 3 tutors skilled in that specific subject.

### CUJ 3: Real-Time Resolution

* **Trigger:** Mentor opens their personalized Doubt Board.
* **Action:** Mentor answers the routed question with a textual solution.
* **Resolution:** Supabase Realtime pushes the answer to the Student's screen instantly without a page refresh.

## 4. Product Requirements (P0 & P1)

| Feature | Priority | Description | Owner |
| --- | --- | --- | --- |
| **Role-Based Auth** | P0 | Secure login for Students, Mentors, Admins (React Router AuthGuards + FastAPI JWT Middleware + Supabase RLS). | Person 1 & 3 |
| **Voice-to-Text AI** | P0 | Audio capture UI posting to FastAPI, integrating Groq Whisper for instant transcription. | Person 2 & 3 |
| **Vector Matcher** | P0 | `pgvector` computing Cosine similarity between student homework doubts and tutor academic skills. | Person 1 & 2 |
| **Offline Syncing** | P0 | PWA manifest, `vite-plugin-pwa`, and IndexedDB to cache failed audio uploads and auto-sync. | Person 4 |
| **Live Doubt Board** | P1 | Supabase Realtime subscriptions updating the Q&A feed seamlessly on the frontend. | Person 4 |
| **Study Roadmap** | P1 | FastAPI endpoint using Groq Llama 3 to generate structured academic milestone roadmaps. | Person 2 & 3 |
| **Admin Analytics** | P1 | Recharts dashboard showing resolution speeds across subjects (Math, Science, etc.). | Person 3 |

## 5. Technical Architecture & Stack

* **Frontend:** React SPA (Vite), TypeScript, Tailwind CSS, Lucide Icons, Recharts. (Calm, humanized UI: `bg-slate-50`, muted primary colors, `max-w-prose` typography for high-focus reading).
* **Backend:** Python (FastAPI), JWT Authentication.
* **Database & Realtime:** Supabase (PostgreSQL), `supabase-js` client, `pgvector`.
* **AI Engine:** Groq API (`whisper-large-v3` for STT, `llama-3.1-70b-versatile` for JSON extraction).
* **PWA & Offline:** `vite-plugin-pwa`, `idb-keyval` (IndexedDB).

## 6. Out of Scope for v1.0

* Native iOS/Android apps (strictly a Web PWA).
* Video calls or live screen sharing.
* Payment processing.
* Computer Science/Software Engineering queries (strictly K-12 core academics).