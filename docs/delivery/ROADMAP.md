# Roadmap

## Agent Context Guide

Open this file when deciding what should happen next at the phase level. This roadmap reflects the current audited implementation state, not the original greenfield plan, and mirrors the public roadmap at `docs-site/docs/roadmap.md` with internal detail added. For task-level status, use `docs/delivery/TASK_BACKLOG.md`.

Related files:

- Task tracking: `docs/delivery/TASK_BACKLOG.md`
- Product scope: `docs/product/PRODUCT_BRIEF.md`
- Public roadmap: `docs-site/docs/roadmap.md`
- Release checklist: `QA_CHECKLIST.md`
- Implementation details: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`

## Current State - 2026-07-19

The product is live in production, with the first verified featured-listing purchase completed:

- Privy authentication (email, Google, or Solana wallet sign-in, with embedded wallets created automatically) has replaced the previous SIWS + Supabase Auth flow; external wallets and a linked email attach to the same account.
- The marketplace (`/startups`) and startup detail pages are public; `/dashboard/*` remains login-only.
- Featured listings are live: 20 USDC for 7 days, verified on-chain before activation, with a built-in onramp.
- The Orbital globe at `/orbital` shows geo-located published startups, with featured startups marked in gold.
- Public profiles exist at vanity `/<username>` URLs and wallet-based `/u/<wallet>` URLs.
- Guided onboarding routes new users step by step: profile, first startup, marketplace.
- Every listing passes a 7-point checklist and manual human review before it publishes.
- Supabase-backed services, RLS, and protected state-transition RPCs exist; `service_role` has no direct table access (explicit grants plus security definer functions).
- `npm run build` passes and `QA_CHECKLIST.md` exists.

Remaining gaps: gas sponsorship is built but not yet activated, and startup validation hardening, the direct save-and-request verification flow, analytics, and broader service/UI tests remain incomplete.

## Roadmap Priorities

### Recently Shipped

Live in the product and covered by the public roadmap; no further milestone work is tracked for these:

- Privy auth migration.
- Featured listings with on-chain payment verification (20 USDC / 7 days).
- The Orbital globe.
- Public profiles.
- Guided onboarding.
- Email linking (emails captured at sign-up and attachable to existing accounts).

### Now - Hardening the Foundation

Goal: make what is shipped reliable, reviewed, and measurable before building marketplace features.

Priority: highest.

- Gas-sponsored transactions - In progress. Built behind `NEXT_PUBLIC_ENABLE_GAS_SPONSORSHIP`, awaiting Privy dashboard activation.
- Email notifications - Planned. Emails are already captured at sign-up; the sending side is not built.
- Automated domain and X verification - Planned. Automated checks complement human review, which stays in place.
- Admin review interface - Planned. Internal tooling to make the manual review queue faster and more consistent.
- Product analytics - Planned. Lightweight `trackEvent` events (`wallet_connected`, `profile_saved`, `startup_draft_created`, `startup_updated`, `verification_requested`, `startup_published`, `marketplace_viewed`, `startup_filter_applied`, `startup_filter_reset`, `startup_detail_viewed`, `founder_contact_clicked`); can start mock/local and swap in a real provider later. (TASK-035)

Engineering hardening still open:

- Harden startup validation to fully match `docs/implementation/VALIDATION_RULES.md`. (TASK-008)
- Add the `Save and request verification` flow to startup creation/editing, with `StartupForm` clearly distinguishing save draft, save changes, and request verification. (TASK-020, TASK-021)
- Broaden unit test coverage: profile validation, startup validation, `listPublishedStartups`, owner/non-owner mutations, `requestVerification`, `publishStartup`, `showMrr` visibility. (TASK-036)
- Manual QA of protected routes plus responsive/visual QA across landing, marketplace, detail, dashboard, profile form, startup form, and verification pages; keep `QA_CHECKLIST.md` matching actual results, not intended results. (TASK-037, TASK-038)

### Next - Marketplace Foundations

- Investor and buyer account types - Planned. Distinct from founder accounts.
- Structured intro requests and in-app messaging - Planned. Replaces today's outbound-only contact via X or Telegram.
- Fundraising profiles - Planned. Founders describe their round in a structured format; Orbital does not verify fundraising claims or handle any funds.
- Deal rooms - Exploring.

### Later - Transactions and Talent

- Acquisition listings and structured offers - Exploring.
- Escrowed USDC settlement - Exploring. Orbital holds no funds today.
- Jobs board - Exploring.

## Scope Constraints

- Featured listings are the only live paid feature. Do not build marketplace-transaction features beyond featured listings (offers, escrow, settlement, deal rooms) until the "Next - Marketplace Foundations" phase deliberately begins.
- All copy follows the tense model in `docs-site/docs/about/messaging.md`: present tense only for shipped items; everything else gets explicit future framing.
