# Product Requirements Document (PRD)

**Project Name:** MentorMatch AI
**Document Status:** Approved for Development
**Target Platform:** Web / Mobile Web (PWA)
**Engineering Team:** 4 Engineers (DB/Auth, AI/Vector, UI/Analytics, PWA/Real-Time)

## 1. Executive Summary

MentorMatch AI is an offline-capable, voice-enabled mentorship platform designed to instantly connect students with specialized mentors. By leveraging OpenAI Whisper for voice intake, GPT-4o-mini for query structuring, and pgvector for semantic mentor matching, the platform eliminates the friction of finding the right help. To ensure accessibility, it is built as a Progressive Web App (PWA) with background sync, allowing students in low-connectivity areas to record doubts offline and automatically upload them upon reconnection.

## 2. Target Personas

1. **The Student:** Wants immediate answers to complex technical roadblocks. Frequently uses mobile devices on transit with spotty internet.
2. **The Mentor:** A specialized domain expert who wants a curated feed of questions tailored specifically to their skills, rather than sifting through a noisy forum.
3. **The Admin:** Platform manager monitoring system health, query resolution speeds, and overall mentor engagement.

## 3. Core User Journeys (CUJs)

### CUJ 1: Offline-Tolerant Voice Query

* **Trigger:** Student hits a roadblock and clicks the microphone button.
* **Action:** Student speaks their doubt. The internet drops. The audio blob is saved to IndexedDB.
* **Resolution:** When the connection returns, a background listener pushes the audio to the `/api/process-audio` route. Whisper transcribes the audio, and GPT-4o-mini structures the doubt into a JSON payload.

### CUJ 2: AI Vector Mentor Matching

* **Trigger:** A structured doubt is saved to the database.
* **Action:** The system generates vector embeddings for the doubt text.
* **Resolution:** A PostgreSQL RPC function calculates Cosine similarity against mentor profiles, instantly routing the doubt to the top 3 most relevant mentors.

### CUJ 3: Real-Time Resolution

* **Trigger:** Mentor opens their personalized Doubt Board.
* **Action:** Mentor answers the routed question.
* **Resolution:** Supabase Realtime pushes the answer to the Student's screen instantly without a page refresh.

## 4. Product Requirements (P0 & P1)

| Feature | Priority | Description | Owner |
| --- | --- | --- | --- |
| **Role-Based Auth** | P0 | Secure login for Students, Mentors, and Admins with route protection (Next.js middleware + Supabase RLS). | Person 1 & 3 |
| **Voice-to-Text AI** | P0 | Audio capture UI that posts to an OpenAI Whisper API route for transcription. | Person 2 & 3 |
| **Vector Matcher** | P0 | `pgvector` database extension computing Cosine similarity between student doubts and mentor skills. | Person 1 & 2 |
| **Offline Syncing** | P0 | PWA manifest, Service Workers, and IndexedDB to cache failed audio uploads and auto-sync when online. | Person 4 |
| **Live Doubt Board** | P1 | Real-time Supabase subscriptions updating the Q&A feed seamlessly. | Person 4 |
| **Career Roadmap** | P1 | GPT-4o-mini generating structured milestone roadmaps saved as interactive UI checklists. | Person 2 & 3 |
| **Admin Analytics** | P1 | Recharts dashboard showing resolution speeds and active users, populated by seeded data. | Person 3 |

## 5. Technical Architecture & Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Recharts.
* **Backend:** Next.js API Routes, Supabase (PostgreSQL), `@supabase/ssr`.
* **AI Engine:** OpenAI Whisper (Speech-to-Text), GPT-4o-mini (Structured Data extraction).
* **Vector DB:** Supabase `pgvector` extension.
* **PWA & Offline:** `@serwist/next`, `idb-keyval` (IndexedDB).
* **Real-Time:** Supabase Subscriptions.

## 6. Out of Scope for v1.0

* Native iOS/Android apps (we are strictly building a PWA).
* Video calls or live screen sharing between mentor and student.
* Payment processing or monetization gateways.
* Multi-language translation support.