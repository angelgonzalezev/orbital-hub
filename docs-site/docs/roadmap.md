---
title: Roadmap
description: What is live in Orbital today, what we are building now, and where the product is heading.
---

# Roadmap

Every item on this page carries one of four statuses: **Shipped**, **In progress**, **Planned**, or **Exploring**. Only items marked Shipped exist in the product today. Everything else is direction, not commitment.

::: info How to read this page
**Shipped** means live at [orbitalhub.dev](https://orbitalhub.dev) right now. **In progress** means built or in active development, not yet available. **Planned** means we intend to build it and know roughly how. **Exploring** means we are still deciding whether and how.
:::

## Recently shipped

| Item                       | Status  | Note                                                                                                                                                        |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privy authentication       | Shipped | Sign in with email, Google, or a Solana wallet. Embedded wallets are created automatically; external wallets and a linked email attach to the same account. |
| Featured listings          | Shipped | 20 USDC for 7 days, verified on-chain before activation, with a built-in onramp to fund your wallet.                                                        |
| The Orbital                | Shipped | A 3D globe of geo-located published startups at /orbital, with featured startups marked in gold.                                                            |
| Public profiles            | Shipped | Vanity URLs at orbitalhub.dev/&lt;username&gt; plus wallet-based URLs at /u/&lt;wallet&gt;.                                                                 |
| Market signals and filters | Shipped | Free-text search plus filters for categories, stage, tech stack, "Raising funds", and "Open to acquisition".                                                |
| Human review pipeline      | Shipped | Every listing passes a 7-point checklist and a manual review before it publishes.                                                                           |
| Guided onboarding          | Shipped | New users are routed step by step: profile, first startup, marketplace.                                                                                     |

## Now — hardening the foundation

| Item                                | Status      | Note                                                                         |
| ----------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| Gas-sponsored transactions          | In progress | Feeless transactions for embedded wallets are built and awaiting activation. |
| Email notifications                 | Planned     | Emails are already captured at sign-up; the sending side is not built yet.   |
| Automated domain and X verification | Planned     | Automated checks to complement human review, which stays in place.           |
| Admin review interface              | Planned     | Internal tooling to make the manual review queue faster and more consistent. |
| Product analytics                   | Planned     | Understanding how founders and visitors actually use the marketplace.        |

## Next — marketplace foundations

| Item                                           | Status    | Note                                                                                                                  |
| ---------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| Investor and buyer account types               | Planned   | Dedicated account types for investors and acquirers, distinct from founder accounts.                                  |
| Structured intro requests and in-app messaging | Planned   | A native way to reach founders, replacing today's outbound-only contact via X or Telegram.                            |
| Fundraising profiles                           | Planned   | Founders describe their round in a structured format. Orbital does not verify fundraising claims or handle any funds. |
| Deal rooms                                     | Exploring | Shared spaces where a founder and an interested party can exchange diligence materials.                               |

## Later — transactions and talent

| Item                                       | Status    | Note                                                                                                                 |
| ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------- |
| Acquisition listings and structured offers | Exploring | A clearer format for founders who are open to acquisition conversations to present their startup and receive offers. |
| Escrowed USDC settlement                   | Exploring | On-chain settlement on Solana for deals both sides have agreed to. Orbital holds no funds today.                     |
| Jobs board                                 | Exploring | Letting listed startups post open roles and reach builders in the ecosystem.                                         |

## How this roadmap moves

Phases are ordered, not dated. We ship the foundation before the layers that depend on it, and the ordering shifts with what we learn. Feedback sent to the founder on X ([@angelgonzaleh](https://x.com/angelgonzaleh)) directly shapes what gets built next.

For the destination this roadmap points toward, read [Vision](/vision).
