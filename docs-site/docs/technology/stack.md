---
title: Technology Stack
description: Frameworks, libraries, and development tools used by the project.
---

# Technology Stack

## Application

- Next.js 15 with App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- GSAP and Lenis for animation and smooth scrolling.
- `@solana/client` and `@solana/react-hooks` for Wallet Standard discovery and wallet sessions.
- Supabase Auth/SSR, PostgreSQL, RLS, and SQL RPCs.

## Documentation

- Docusaurus 3.
- Markdown and MDX.
- Static export served under `/docs`.

## Development tooling

- npm scripts.
- ESLint.
- Prettier.
- Husky and lint-staged.
- Commitlint is installed, but product commits use the task-based format documented in the repository.
- Vitest for TypeScript unit tests and pgTAP through the Supabase CLI for database policy tests.

## Release limitations

- The service-role key is server-only and required for verified profile provisioning.
- Development verification actions are disabled in production; a reviewer workflow is still required.
- Use a dedicated Solana RPC endpoint in hosted environments instead of relying on the public mainnet endpoint.
