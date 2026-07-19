---
title: Technology
description: The stack and architecture behind Orbital — Next.js, Privy, Supabase, and Solana tooling.
---

# Technology

Orbital is a Next.js application backed by Postgres, with Privy for identity and Solana for payments. This page describes the stack and the architectural decisions behind it, at the level of detail a technical founder or builder would want before trusting the platform.

## Stack

| Layer     | Technology                                                                                |
| --------- | ----------------------------------------------------------------------------------------- |
| Framework | Next.js 15 (App Router), React 19, TypeScript                                             |
| Styling   | Tailwind CSS 4                                                                            |
| Identity  | Privy — `@privy-io/react-auth` 3.x on the client, access-token verification on the server |
| Solana    | `@solana/kit` 5 and `@solana-program` libraries for USDC transfers                        |
| Database  | Supabase (`supabase-js` 2): Postgres with row-level security, RPCs, Edge Functions        |
| Globe     | `react-globe.gl` and `three.js` render [The Orbital](https://orbitalhub.dev/orbital)      |
| Hosting   | Netlify, Node 22                                                                          |

## Identity architecture

Privy is the identity provider: email, Google, and Solana wallet login, with an embedded Solana wallet created automatically for users who sign in without one.

Privy never talks to the database directly. A Next.js API route (`/api/auth/session`) verifies the Privy access token on the server and exchanges it for a short-lived Supabase-signed JWT whose subject is the user's profile id. `supabase-js` consumes that minted token, so every database query is enforced by Postgres row-level security under the caller's own identity.

There are no Supabase Auth users. The profile id in the token is the single source of truth for who can read and write what.

## Data layer

Core tables — profiles, startups, payments, linked wallets, linked emails — sit behind row-level security policies. State transitions, such as submitting a startup for review or publishing it, go through protected RPCs rather than direct table writes.

Edge Functions handle the work that must not run in a browser: verifying payments on-chain and publishing announcement posts when a startup goes live.

## Payments design

[Featured listings](/guide/featured-listings) are the only payment in the product today: a USDC transfer on Solana, signed with the user's own wallet. The design assumes the client can lie.

1. The client builds a USDC `transferChecked` transaction with `@solana/kit` and signs it via Privy — a silent one-click signature for embedded wallets.
2. A `verify-payment` Edge Function re-derives the payer and amount from the on-chain token balance changes of the confirmed transaction, rather than trusting anything the client reports.
3. The payer must be one of the wallets linked to the account making the purchase.
4. A payments ledger with unique transaction signatures prevents the same transaction from being redeemed twice.
5. Only then is the featured window activated or extended.

Orbital never holds user funds; payment moves directly from the user's wallet on-chain.

::: info In progress
Gas-sponsored (feeless) transactions for embedded wallets are built but not yet active in the app. Until activation, embedded-wallet users cover network fees from their own balance, funded via the built-in onramp.
:::

## Source and specs

The application repository is [github.com/angelgonzalezev/orbital-hub](https://github.com/angelgonzalezev/orbital-hub). Internal engineering specs — auth flows, payment verification, review pipeline — live under `docs/` in the repo.

This documentation site is built with VitePress and served at [orbitalhub.dev/docs](https://orbitalhub.dev/docs). For the product itself, start with [What is Orbital](/) or go straight to the [marketplace](https://orbitalhub.dev/startups).
