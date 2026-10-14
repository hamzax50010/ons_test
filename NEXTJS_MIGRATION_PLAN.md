# ONS Healthcare — Next.js Migration Plan

## Goal
Create a separate Next.js application for ONS Healthcare while preserving the existing product requirements, visual identity, Firestore data, and operational workflows. This branch is isolated from `main`; do not replace the current app until the new app is tested.

## Existing repository inventory (reviewed from main)
- Current stack: React 19, Vite 8, TypeScript, Tailwind CSS v4, Firebase Web SDK, Express server via `server.ts`, Lucide icons, Motion.
- Public pages: Home, Services, Service Detail, Request Service, About, Contact, Reviews, Leave Review, Privacy Policy.
- Admin areas: Overview, Services/Categories/Pricing, Providers, Requests, Reviews, Content Manager, General Settings, Media/Branding, Integrations, Communication, Setup Guide.
- Contexts: Auth, Data, Language.
- Existing API/server responsibilities include WhatsApp Business Cloud API configuration, sending/retrying order notifications, and audit log helpers.
- Firestore collections referenced by rules and app code include: `admins`, `siteSettings`, `siteContent`, `serviceCategories`, `services`, `serviceAreas`, `reviews`, `customerRequests`, `serviceProviders`, `integrations`, and `auditLogs`.

## Brand requirements
- Name: أُنس | ONS Healthcare
- Slogan: «لأن صحتك تستحق الأفضل.»
- Colors: Deep Teal `#153B36`, Warm Ivory `#F5F2EB`, Soft Teal `#70A69A`; no gold.
- Arabic-first with RTL support and English language toggle.
- Cairo for Arabic and Inter for Latin text.
- Premium, warm, human, clear healthcare brand; avoid generic medical clip-art.
- Do not make unverified claims about licensing, staffing, availability, coverage, or services. Only publish operationally confirmed services.

## Migration principles
1. Keep this work on `nextjs-migration`; never overwrite `main` during initial implementation.
2. Preserve the existing Firebase project/database and document IDs unless a reviewed migration explicitly requires otherwise.
3. Never expose server-only credentials or WhatsApp/Telegram bot tokens to browser code. Do not commit `.env`.
4. Keep Firestore security rules restrictive; never use public write permissions as a workaround.
5. Keep customer requests and historical data intact. Avoid cascading deletion of referenced records.
6. Migrate feature-by-feature and verify build, authentication, authorization, persistence, and responsive UI after each stage.
7. Use Next.js App Router and TypeScript. Use client components only where browser interactivity/Firebase client auth is needed; move server-only integrations into protected Route Handlers.
8. Do not assume a feature is working just because it exists in the old source; test it before declaring it complete.

## Known issue to fix during migration
The existing `deleteService`, `deleteCategory`, and `deleteProvider` functions update React state before the Firestore `deleteDoc` call succeeds. If Firestore rejects the operation, the item can disappear locally while remaining in the database. The service/provider/category delete flows must perform the remote delete first (or implement a rollback-safe optimistic update), surface permission failures, and only report success after confirmation.

The reported Firestore error was:
`Missing or insufficient permissions` for `services/srv-1792022323047`, with `authInfo.providerInfo: []`.
This is consistent with an unauthenticated Firebase client at the time of the write, but the exact root cause must be verified at runtime. Inspect Firebase Auth persistence/currentUser, the signed-in account's verified-email claim, app/project/database config, and deployed Firestore rules. Do not weaken rules to fix it.

## Phased implementation
### Phase 0 — audit and safety
- Inspect every page, shared component, data model, auth flow, Firestore listener/write path, server endpoint, and configuration file.
- Document which features use Firestore, localStorage, or server JSON files.
- Confirm which collections are live and whether the current production Firestore rules match the repository rules.
- Keep secrets out of source control.

### Phase 1 — Next.js foundation
- Scaffold Next.js App Router + TypeScript + styling setup on this branch.
- Establish root layout, fonts, metadata, theme tokens, Arabic RTL/English LTR switching, and shared header/footer.
- Add environment-variable validation with safe example values only.
- Add a health route and verify local production build.

### Phase 2 — public website
- Port Home, Services, Service Detail, Request Service, About, Contact, Reviews, Leave Review, and Privacy pages.
- Preserve working content and the ONS visual system.
- Implement accessible FAQ from Firestore only if its collection/data model is confirmed; otherwise document required setup.

### Phase 3 — authentication and admin shell
- Rebuild Google sign-in with Firebase Auth and explicit loading/error states.
- Enforce admin authorization server-side where applicable and via Firestore rules for direct client access.
- Never trust client-side sessionStorage role flags as security authorization.
- Port admin navigation and responsive layout.

### Phase 4 — admin features and data integrity
- Port services/categories, providers, areas, requests, reviews, settings/content, branding, integrations, and communication.
- Fix deletion semantics, loading states, confirmation, rollback/error behavior, and historical-reference safeguards.
- Ensure every success message reflects a confirmed persisted operation.
- Preserve order history when a service/provider is referenced.

### Phase 5 — integrations
- Move WhatsApp/Telegram secrets to server-only environment variables.
- Rebuild WhatsApp notification endpoints as protected Next.js Route Handlers and validate caller authorization.
- Preserve retry logs and audit history without exposing tokens or personal data.

### Phase 6 — validation and cutover
- Run TypeScript/lint and production build.
- Test signed-out, unauthorized, and verified-owner cases.
- Test create/update/delete persistence after refresh and permission-denied behavior.
- Test customer request creation, admin handling, notification failure/retry, RTL, mobile navigation, and bilingual content.
- Only after all tests pass, decide whether to deploy and switch traffic. Do not migrate or delete live data as part of cutover without a separate backup/restore plan.

## First acceptance criteria
- Next.js build succeeds.
- Existing Firestore project/database remains unchanged.
- Public routes render in Arabic RTL and English.
- Admin access requires real Firebase Authentication and verified authorization.
- Failed Firestore writes do not falsely remove records or show success.
- No server secrets are included in browser bundles or Git history.
