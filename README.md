# MAX Auth — Frontend

The complete frontend for MAX Auth, the identity platform for The MAX AI Ecosystem. Built with
Next.js 16 (App Router), TypeScript, and Tailwind CSS. Connects to the existing MAX Auth backend
— no backend code here.

The official MAX AI logo is in place at `public/logo.png` / `public/favicon.png`, used in the
header, sidebar, auth pages, and browser favicon via `src/components/layout/MaxLogo.tsx`.

---

## Quick start

```bash
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your MAX Auth backend URL

npm install
npm run dev
```

Open `http://localhost:3000`. Make sure the backend's `CORS_ALLOWED_ORIGINS` includes this
frontend's origin.

## Build for production

```bash
npm run build
npm start
```

## Verified

This build was installed, linted, and run through a full `next build` before delivery — all 17
routes compile and prerender cleanly with zero TypeScript or ESLint errors. Next.js is pinned to
`^16.2.12` specifically because 14.2.5 has a disclosed critical RCE/DoS vulnerability
(CVE-2025-66478 and related) — always keep this pinned to a current patched version.

## What's implemented vs. prepared

**Fully implemented and wired to the real backend API:** registration, sign-in, sign-out, silent
token refresh, forgot/reset password, email verification, profile editing, AI personalization,
password change, account deletion, device management (list/trust/revoke), session management
(list/revoke/revoke-all), login history, audit log, connected-accounts list/unlink, and OAuth
client registration/management ("Continue with MAX AI" developer side).

**Architecture-ready, not implemented (per the brief — UI shows "Coming soon"):** 2FA, passkeys,
recovery codes, live provider OAuth buttons (Google/X/Instagram/Snapchat/Spotify/Discord/GitHub),
and the interactive "Continue with MAX AI" consent/authorize screen (client registration works;
the actual authorize flow isn't built on the backend yet either, by design).

See `docs/FOLDER_STRUCTURE.md` for a full file-by-file explanation.
