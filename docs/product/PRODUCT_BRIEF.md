# Product Brief - Orbital

## Agent Context Guide

Open this file when you need product intent, user definitions, current scope, out-of-scope boundaries, core flows, product principles, or approved messaging. Do not use this file for implementation details; use `docs/implementation/IMPLEMENTATION_BLUEPRINT.md` instead.

Related files:

- Access rules: `docs/product/ACCESS_AND_PERMISSIONS.md`
- Metrics/events: `docs/product/METRICS.md`
- Task status: `docs/delivery/TASK_BACKLOG.md`

## Product Definition

Orbital is a curated marketplace directory for startups building in the Solana ecosystem.

Founders sign in with Privy (email, Google, or a Solana wallet; embedded wallets are created automatically), complete a professional profile, list their startup, and make it discoverable in the public marketplace to investors, buyers, scouts, builders, funds, accelerators, and ecosystem teams.

Today, "marketplace" means structured discovery, public market signals, founder contact through social links, and paid featured listings. It does not yet mean transactional acquisition, offers, or deal rooms.

## Direction

The product vision is a marketplace where Solana startups raise funding, find buyers, and hire. That destination is staged in `docs/delivery/ROADMAP.md`: marketplace foundations (investor/buyer account types, intro requests, fundraising profiles) come before transactions and talent (acquisition listings, escrowed settlement, jobs). Always frame this as direction and roadmap, never as the current product.

## Product Promise

> Discover startups orbiting the Solana ecosystem.

## Primary User

The primary user is a Solana startup founder.

Their goals:

- Sign in with Privy using email, Google, or a Solana wallet.
- Complete a professional profile.
- List a startup with enough information to be trusted.
- Control and update the public status of that startup.
- Signal if the startup is raising or open to acquisition conversations.

## Secondary Users

Secondary users are people exploring the Solana startup ecosystem:

- Investors.
- Potential acquirers.
- Scouts.
- Builders.
- Funds and accelerators.
- Ecosystem teams.
- Community members.

Their goal is to discover real startups, filter them by useful criteria, and understand their status quickly.

## Current Scope

Included:

- Privy authentication: email, Google, or Solana wallet sign-in, with embedded wallets created automatically and external wallets/emails linked to the same account.
- Basic user/founder profile.
- Private dashboard.
- Create, edit, publish, and archive owned startups.
- Verification through human review: a manual checklist covering wallet, domain, and X.
- Public marketplace of verified and published startups.
- Public startup detail page.
- Filters by category, stage, tech stack, fundraising, and acquisition status.
- Founder contact through the creator's public X and Telegram.
- Featured listings: 20 USDC for 7 days, verified on-chain before activation.

Out of scope:

- XMTP.
- Anonymous chat.
- Internal contact forms.
- Saved contact requests.
- Private offers.
- Marketplace-transaction features beyond featured listings (escrow, settlement, paid deals).
- Deal room.
- NDA/document handling.
- Automated domain verification.
- Real X API integration.
- Notifications.
- Admin/reviewer dashboard.

## Non-Negotiable Rules

- The marketplace is public: anonymous visitors can browse `/startups` and `/startups/[id]` without logging in.
- `/dashboard/*` requires login through Privy.
- Only startups that are `verified + published` are visible to anyone other than their owner.
- Only the owner can edit, archive, verify, or publish their own startups.
- Founder contact is only the public social links from the `User` associated with `Startup.ownerWallet`.
- No forms, chat, or internal messaging should be implemented yet; intro requests and in-app messaging are roadmap items.
- `open_to_discuss` means open to acquisition conversations, not for-sale transaction flow.

## Core Flows

### Founder Registration

1. User signs in with Privy using email, Google, or a Solana wallet; an embedded wallet is created automatically.
2. If no profile exists, guided onboarding prompts for a basic profile.
3. User completes display name, job title, avatar, bio, and social links.
4. The profile is the primary identity; wallets and emails are linked to it.

### List Startup

1. Founder opens `My Startups`.
2. Founder creates a startup in `draft`.
3. Founder completes required public information.
4. Founder adds website and X.
5. Founder requests verification.
6. Startup moves to `pending`.
7. A reviewer approves it as `verified` (development builds may expose a local-only simulation).
8. Founder publishes it.
9. Startup appears in the public marketplace.

### Discover Startups

1. Visitor opens `/startups`; no login is required.
2. They see verified and published startups.
3. They filter by category, stage, tech stack, fundraising, and acquisition status.
4. They open the startup detail page.

### Contact Founder

1. Visitor opens startup detail.
2. The app loads the owner profile using `Startup.ownerWallet`.
3. The `Founder Contact` block shows avatar, name, job title, X, and Telegram when available.
4. If no social links exist, show `No public founder contact available yet`.

## Product Principles

- Prioritize trust over volume.
- Talk about the funding/acquisition/talent direction openly, but never claim those features exist before they ship.
- Make every published startup look real, maintained, and verifiable.
- Keep the UI ready for future wallet-to-wallet conversations without implementing them now.
- Separate public signals from private/future data.
- Build the marketplace directory before transactional layers.

## Messaging

The canonical editorial policy is `docs-site/docs/about/messaging.md` (published on the docs site). Follow it for all copy; this section is a summary.

The model is tense-based, not a forbidden-phrases list:

- Present tense is reserved for live features: discover, showcase, verified (human-reviewed) listings, market signals, founder-declared "raising funds" and "open to acquisition conversations" signals, founder contact, featured listings paid in USDC, embedded wallets, and the Orbital globe.
- Funding, acquisition, and talent marketplace language - raise funding on Orbital, buy or sell startups, deal rooms, escrow, investor accounts, jobs - is encouraged in vision and roadmap contexts, and banned as a present-tense product claim. Wrap every mention in "planned", "on our roadmap", "we are building toward", or "the vision is".
- Never say, in any tense: "instant acquisition", "vetted deals", "investment opportunities", or anything implying Orbital holds funds in escrow, has custody, or brokers deals.
- "Open to acquisition" always expands to "open to acquisition conversations" in prose.

Litmus test: if a user could screenshot a sentence and reasonably believe they can complete that action in the app today, the feature must be live - otherwise the sentence gets future framing.
