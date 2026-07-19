# Orbital - MVP Specification

This file is now the compact source-of-truth index for the MVP. Detailed product, implementation, and delivery documentation lives in `docs/`.

## Agent Context Guide

Start here in every new session. Read this file first to understand the product, hard rules, routes, and which deeper document to open next. Do not load all docs by default; jump only to the linked file that matches the task.

Use this file when you need:

- A fast product summary.
- Non-negotiable rules.
- Route overview.
- The right documentation entry point.

## Product Summary

Orbital is a Solana startups marketplace.

> Discover startups orbiting the Solana ecosystem.

Today the product is discovery: verified startup profiles, market signals (raising funds, open to acquisition conversations), and featured listings paid in USDC.

Direction (roadmap, not current scope): funding, acquisitions, and talent on-platform.

## Current Scope

Included (live):

- Privy authentication: email, Google, and wallet login; embedded wallets; token exchange to a Supabase JWT at `/api/auth/session`.
- User/founder profile and private dashboard.
- Guided onboarding and email linking for wallet users.
- Create, edit, archive, verify, and publish owned startups.
- Public marketplace of verified and published startups (no login gate).
- Public startup detail pages.
- Filters by category, stage, tech stack, fundraising, and acquisition status.
- Featured listings paid in USDC: 20 USDC for 7 days, verified by the `verify-payment` edge function.
- `/orbital` interactive globe.
- Public profiles at `/<username>` and `/u/<wallet>`.
- Founder contact through X and Telegram from the startup owner profile.

Out of scope (roadmap):

- In-app messaging.
- Deal rooms.
- Escrow.
- Executing acquisitions or investments on-platform.
- Investor accounts.
- Jobs.
- Email notifications.
- Automated domain/X verification.
- Admin/reviewer UI.
- Analytics.

## Non-Negotiable Rules

- A startup appears in marketplace only when `verificationStatus = verified` and `listingStatus = published`.
- Only the owner can edit, archive, request verification, or publish their startup.
- MRR is private by default: show it only when `showMrr = true` (enforced server-side in RPCs, not just in the UI).
- Founder contact is limited to X and Telegram from the owner profile associated with the startup.
- `open_to_discuss` means open to acquisition conversations, not a transaction flow.
- Never describe roadmap features in present tense; see [docs-site/docs/about/messaging.md](docs-site/docs/about/messaging.md) for the messaging policy.

## Key Routes

| Route                                   | Access                 | Purpose                                       |
| :-------------------------------------- | :--------------------- | :-------------------------------------------- |
| `/`                                     | Public                 | Landing page.                                 |
| `/startups`                             | Public                 | Marketplace.                                  |
| `/startups/[id]`                        | Public                 | Startup detail and founder contact.           |
| `/orbital`                              | Public                 | Interactive globe of startups.                |
| `/[username]`                           | Public                 | Public user profile.                          |
| `/u/[wallet]`                           | Public                 | Public profile by wallet address.             |
| `/dashboard`                            | Logged-in only         | Private overview.                             |
| `/dashboard/profile`                    | Logged-in only         | Edit profile.                                 |
| `/dashboard/startups`                   | Logged-in only         | Manage owned startups.                        |
| `/dashboard/startups/new`               | Logged-in with profile | Create startup.                               |
| `/dashboard/startups/[id]/edit`         | Owner only             | Edit startup.                                 |
| `/dashboard/startups/[id]/verification` | Owner only             | Verification and publication.                 |
| `/api/auth/session`                     | API                    | Exchanges the Privy token for a Supabase JWT. |

## Documentation Map

Public docs site (VitePress, `docs-site/`):

- Pages under `docs-site/docs/`: `index`, `vision`, `roadmap`, `guide/*`, `about/*`.

Internal specs (`docs/`):

Product:

- [Product Brief](docs/product/PRODUCT_BRIEF.md)
- [Access and Permissions](docs/product/ACCESS_AND_PERMISSIONS.md)
- [Metrics](docs/product/METRICS.md)

Implementation:

- [Implementation Blueprint](docs/implementation/IMPLEMENTATION_BLUEPRINT.md)
- [Data Models](docs/implementation/DATA_MODELS.md)
- [Validation Rules](docs/implementation/VALIDATION_RULES.md)
- [Services Contracts](docs/implementation/SERVICES_CONTRACTS.md)
- [Taxonomy](docs/implementation/TAXONOMY.md)
- [Mock Data Requirements](docs/implementation/MOCK_DATA_REQUIREMENTS.md)

Delivery:

- [Roadmap](docs/delivery/ROADMAP.md)
- [Task Backlog](docs/delivery/TASK_BACKLOG.md)
- [QA Checklist Pointer](docs/delivery/QA_CHECKLIST.md)
- Root checklist: [QA_CHECKLIST.md](QA_CHECKLIST.md)

## Current Progress Snapshot

Last audited: 2026-07-19.

For current status, use git history and the public roadmap: [docs-site/docs/roadmap.md](docs-site/docs/roadmap.md).

## Current Technical Status

Authentication uses Privy (email, Google, and wallet login; embedded wallets); the Privy token is exchanged for a Supabase JWT at `/api/auth/session`. Product persistence uses Supabase. Profile images and startup logos use owner-scoped Supabase Storage paths with public asset delivery. Database authorization is enforced by RLS and protected RPCs; local fixtures and pgTAP policy tests live under `supabase/`. Featured-listing USDC payments are verified server-side by the `verify-payment` Supabase edge function.
