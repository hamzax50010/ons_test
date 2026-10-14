# ONS Healthcare — Next.js migration workspace

This folder is an isolated Next.js App Router + TypeScript foundation. The existing Vite app at the repository root is intentionally left unchanged.

## Run locally
```bash
cd next-app
bun install
bun run dev
```

## Current status
- Initial brand shell and responsive styling are in place.
- This is not a production-ready replacement yet.
- Firestore, authentication, service data, request flow, admin dashboard, and server integrations must be migrated and tested before deployment.
- Do not copy secrets into this folder or commit a real `.env`. Use server-only environment variables for integrations.
