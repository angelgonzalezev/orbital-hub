---
title: Application Flow
description: End-to-end product flows for founders and marketplace users.
---

# Application Flow

## Public visitor

1. Opens the landing page.
2. Sees product positioning and high-level ecosystem information.
3. Attempts to open the marketplace.
4. Sees a wallet login gate before startup data is rendered.

## Founder profile

1. Founder selects an installed Solana wallet and signs the SIWS message.
2. If no profile exists, the app prompts for profile completion.
3. Founder adds display name, job title, bio, avatar, X, and Telegram.
4. The wallet remains the primary identity.

## Listing a startup

1. Founder opens the dashboard.
2. Founder creates a startup draft.
3. Founder completes required startup information.
4. Founder adds website and X.
5. Founder requests verification.
6. Startup moves to pending.
7. A reviewer approves it as verified; local development can explicitly enable a simulated decision.
8. Founder publishes it.
9. Startup appears in the logged-in marketplace.

## Discovering startups

1. Logged-in user opens `/startups`.
2. App lists only verified and published startups.
3. User filters by category, stage, tech stack, fundraising, and acquisition status.
4. User opens a startup detail page.

## Contacting a founder

1. Logged-in user opens a startup detail page.
2. App loads the profile associated with the startup owner.
3. Founder contact shows avatar, name, job title, X, and Telegram when available.
4. If no social links exist, the page shows that no public contact channel is available yet.
