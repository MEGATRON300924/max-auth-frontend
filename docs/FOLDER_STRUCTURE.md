# MAX Auth Frontend — Folder Structure

```
max-auth-frontend/
├── public/
│   ├── logo.png / favicon.png     — official MAX AI logo
│
├── src/
│   ├── app/                        — Next.js App Router: one folder = one route
│   │   ├── layout.tsx               — root layout: fonts, providers, metadata/favicon
│   │   ├── page.tsx                 — landing page
│   │   ├── not-found.tsx            — 404 page
│   │   ├── globals.css              — Tailwind entry + base styles
│   │   │
│   │   ├── (auth)/                  — route group: shared glass-card layout, no URL prefix
│   │   │   ├── layout.tsx            — centered card + aurora background shell
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── create-account/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx   — reads ?token= from the emailed link
│   │   │   └── verify-email/page.tsx     — reads ?token= from the emailed link
│   │   │
│   │   ├── (dashboard)/             — route group: sidebar + header shell, auth-gated
│   │   │   ├── layout.tsx            — wraps everything in <ProtectedRoute>
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── ai-personalization/page.tsx
│   │   │   ├── security/page.tsx
│   │   │   ├── devices/page.tsx
│   │   │   ├── sessions/page.tsx
│   │   │   ├── login-history/page.tsx
│   │   │   ├── connected-apps/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── privacy-policy/page.tsx
│   │   └── terms-of-service/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                      — design-system primitives (no app logic)
│   │   │   Button, Input, Card, Badge, Spinner, Skeleton, EmptyState,
│   │   │   Alert, Toast, Modal, Dropdown
│   │   │
│   │   ├── layout/                  — page chrome
│   │   │   AuroraBackground, MaxLogo, SiteHeader, SiteFooter, StaticPageShell,
│   │   │   DashboardSidebar, DashboardHeader
│   │   │
│   │   ├── auth/                    — auth-page-specific pieces
│   │   │   AuthCard, PasswordStrengthMeter
│   │   │
│   │   └── dashboard/                — dashboard-specific widgets
│   │       PageHeader, TagInput, WelcomeCard, ProfileCompletionCard,
│   │       SecurityStatusCard, QuickActionsCard, RecentDevicesCard,
│   │       RecentLoginsCard, ConnectedAppsCard, AIPersonalizationCard,
│   │       RecentActivityCard
│   │
│   ├── lib/
│   │   ├── api/                     — everything that talks to the backend
│   │   │   ├── client.ts             — fetch wrapper: auth headers, CSRF, auto-refresh-on-401
│   │   │   ├── tokenStore.ts         — in-memory access token (never localStorage)
│   │   │   ├── ApiError.ts
│   │   │   ├── auth.ts / profile.ts / devices.ts / security.ts
│   │   │
│   │   ├── auth/                    — session state
│   │   │   AuthContext.tsx, useAuth.ts, ProtectedRoute.tsx
│   │   │
│   │   ├── hooks/                    — shared React hooks
│   │   │   ToastContext.tsx, useToast.ts, useAsyncData.ts
│   │   │
│   │   └── utils/                    — pure helper functions
│   │       cn.ts (classnames), validators.ts, formatters.ts
│   │
│   └── types/
│       └── api.ts                    — TypeScript types mirroring the backend's API responses
│
├── docs/
│   └── FOLDER_STRUCTURE.md           — this file
│
├── package.json, tsconfig.json, tailwind.config.ts, next.config.js,
│   postcss.config.js, eslint.config.mjs, .env.example
```

## How data flows

1. A page (e.g. `app/(dashboard)/devices/page.tsx`) calls `useAsyncData(() => devicesApi.list())`.
2. `devicesApi.list()` (in `lib/api/devices.ts`) calls `apiClient.get("/devices")`.
3. `apiClient` (in `lib/api/client.ts`) attaches the in-memory access token, sends the request
   with `credentials: "include"` (for the refresh cookie), and if it gets a 401, silently calls
   `/auth/refresh` once and retries — the page never has to think about token expiry.
4. The typed response flows back up through `useAsyncData`'s `{ data, isLoading, error, refetch }`.

## Where to plug in real functionality later

- **2FA / passkeys / recovery codes**: UI badges already say "Coming soon" in
  `app/(dashboard)/security/page.tsx` — swap those `Badge` elements for real forms once the
  backend endpoints exist.
- **Provider OAuth buttons** (Google, GitHub, etc.): `app/(dashboard)/connected-apps/page.tsx`
  already renders linked accounts and unlink actions — add "Connect" buttons once the backend's
  OAuth handshake for each provider is implemented.
- **"Continue with MAX AI" consent screen**: `lib/api/security.ts`'s `oauthApi` already has
  `listClients`/`createClient`/`revokeClient`/`listConsents`/`revokeConsent` wired up. The
  interactive `/authorize` screen (a real Next.js page hitting the backend's `/oauth/authorize`)
  isn't built yet, matching the backend's current `501 Not Implemented` status there.
