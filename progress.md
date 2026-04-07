# OpenGym PWA Progress Tracker

## Phase 1: Foundation
- [ ] Initialize Next.js project with TypeScript and Tailwind CSS.
- [ ] Configure `next-pwa` plugin for Service Workers, icons, and `manifest.json`.
- [ ] Set up basic folder structure (`/components`, `/lib`, `/hooks`, `/services`).
- [ ] Install UI dependencies (`shadcn/ui`, `lucide-react` for icons).

## Phase 2: Layout & Navigation
- [ ] Create a mobile-first app shell (Layout component).
- [ ] Implement Bottom Navigation Bar (Home, Workouts, History, Profile).
- [ ] Add Dark/Light mode toggle.
- [ ] Set up global loading states and error boundaries.

## Phase 3: API & Authentication
- [ ] Configure Axios instance with base URL pointing to the live hosted FastAPI backend.
- [ ] Add Axios interceptors for JWT token attachment and refresh logic.
- [ ] Set up TanStack React Query provider.
- [ ] Build Login & Registration screens to interface with the backend.
- [ ] Implement Next.js protected routes middleware.

## Phase 4: Core App Features
- [ ] **Dashboard:** Fetch and display user stats/summaries.
- [ ] **Exercises:** Build the exercise database/search page.
- [ ] **Workout Logger:** Create the interactive interface to start a workout, add sets, reps, and weights.
- [ ] **History:** Display past workouts chronologically.

## Phase 5: PWA & Offline Optimization
- [ ] Cache essential static assets and fonts.
- [ ] Implement optimistic UI updates using React Query (e.g., UI updates immediately when a user logs a set, syncing in the background).
- [ ] Add "Add to Home Screen" (A2HS) prompt logic.

## Phase 6: Deployment Prep (Vercel)
- [ ] Add environment variables setup (`.env.example` with `NEXT_PUBLIC_API_URL`).
- [ ] Final PWA Lighthouse Audit.
- [ ] Configure Vercel build settings.
- [ ] Ensure the live backend's CORS policy is updated to allow the new Vercel production URL.
