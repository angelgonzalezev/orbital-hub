# telegram-startup-review / telegram-review-callback

The `pending -> verified | rejected` step of the verification flow. There is no
admin dashboard: a startup that requests verification shows up as a card in a
Telegram chat with **Approve & publish** / **Reject** buttons.

Two functions, because they have two different callers and two different auth
models:

| Function                   | Called by                                                              | Authenticated with                                                           |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `telegram-startup-review`  | the `startups_telegram_on_review_request` DB trigger, through `pg_net` | `x-webhook-secret` header (Vault secret)                                     |
| `telegram-review-callback` | Telegram, on every button press                                        | `X-Telegram-Bot-Api-Secret-Token` header + an allowlist of Telegram user ids |

Both are wired up in the
`supabase/migrations/20260715160000_telegram_startup_review.sql` migration.

## Flow

1. A founder calls `request_startup_verification()` → `verification_status` becomes
   `pending` → the trigger posts the review card.
2. **Approve & publish** calls `admin_review_startup(..., 'approve', ...)`, which
   sets `verified` **and** `published` in a single update. That update is what
   fires `startups_tweet_on_publish`, so approving also announces the launch on X.
   The founder does not need to do anything else.
3. **Reject** swaps the keyboard for a reason picker (Incomplete / Unverifiable /
   Off-standard, plus Back). The chosen reason is written to
   `verification_rejection_reason`, which the founder sees on their verification
   page. Nothing is written to the database until a reason is picked.
4. The card's keyboard is then replaced by a single inert button recording the
   outcome and who pressed it, and `reviewed_at` / `reviewed_by` are stamped.

`admin_review_startup` only acts on a startup that is still `pending`, so a
double-tapped button — or two reviewers racing each other — is a no-op that
reports "Already reviewed" instead of overwriting the first decision.

The trigger also fires on **re-review**: `reset_verification_on_identity_change()`
sends a verified startup back to `pending` when its website or X handle changes,
so those changes land in the chat too.

## One-time setup

### 1. Bot and chat

Create a bot with [@BotFather](https://t.me/BotFather) (`/newbot`) and keep the
token. Then, for the destination:

- **A private chat with yourself**: send the bot any message, then read your
  chat id from `https://api.telegram.org/bot<TOKEN>/getUpdates`.
- **A group**: add the bot to the group, send a message, and read the (negative)
  chat id from the same endpoint. Groups are the better choice if more than one
  person reviews.

Your own numeric Telegram user id (the `from.id` in `getUpdates`) is what goes in
`TELEGRAM_ADMIN_IDS` — the id, not the `@username`, since usernames can change.

### 2. Edge function secrets

```sh
supabase secrets set \
  TELEGRAM_BOT_TOKEN=123456:ABC-DEF... \
  TELEGRAM_CHAT_ID=-1001234567890 \
  TELEGRAM_ADMIN_IDS=11111111,22222222 \
  TELEGRAM_WEBHOOK_SECRET="$(openssl rand -hex 32)" \
  TELEGRAM_CALLBACK_SECRET="$(openssl rand -hex 32)" \
  SITE_URL=https://your-production-domain.com
```

`TELEGRAM_ADMIN_IDS` is a comma-separated allowlist. Anyone else pressing a
button gets "You are not allowed to review startups" and nothing happens — which
matters because the callback URL is public.

### 3. Vault secrets (used by the database trigger)

Run once in the SQL editor of the hosted project, using the same value chosen for
`TELEGRAM_WEBHOOK_SECRET` above. `edge_functions_url` is shared with the tweet
webhook, so it may already exist:

```sql
select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'edge_functions_url');
select vault.create_secret('<same value as TELEGRAM_WEBHOOK_SECRET>', 'telegram_webhook_secret');
```

If these are missing (e.g. locally), the trigger is a no-op and requesting
verification works normally without notifying.

### 4. Deploy

```sh
supabase db push
supabase functions deploy telegram-startup-review --no-verify-jwt
supabase functions deploy telegram-review-callback --no-verify-jwt
```

### 5. Register the Telegram webhook

Point the bot at the callback function, using the same value chosen for
`TELEGRAM_CALLBACK_SECRET`:

```sh
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://<project-ref>.supabase.co/functions/v1/telegram-review-callback",
    "secret_token": "<same value as TELEGRAM_CALLBACK_SECRET>",
    "allowed_updates": ["callback_query"]
  }'
```

Check it with `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` —
`last_error_message` is where a wrong secret or a bad URL shows up.

## Testing locally

`supabase functions serve` is not reachable from Telegram's servers, so a full
local loop needs a tunnel (`ngrok http 54321`) pointed at by `setWebhook`. For
everything short of that, mock the Telegram API with `TELEGRAM_API_URL`:

```sh
cat > /tmp/telegram-test.env <<'EOF'
TELEGRAM_BOT_TOKEN=test-token
TELEGRAM_CHAT_ID=12345
TELEGRAM_ADMIN_IDS=99999
TELEGRAM_WEBHOOK_SECRET=local-secret
TELEGRAM_CALLBACK_SECRET=local-callback-secret
SITE_URL=http://localhost:3000
TELEGRAM_API_URL=http://host.docker.internal:9997
EOF

supabase functions serve --env-file /tmp/telegram-test.env --no-verify-jwt
```

Then point the trigger at the locally served function and request verification:

```sql
select vault.create_secret('http://host.docker.internal:54321/functions/v1', 'edge_functions_url');
select vault.create_secret('local-secret', 'telegram_webhook_secret');
select public.request_startup_verification('<a draft startup id>');
```

The review card lands on the mock server. To exercise a button press, POST the
callback update the way Telegram would:

```sh
curl -X POST http://127.0.0.1:54321/functions/v1/telegram-review-callback \
  -H 'Content-Type: application/json' \
  -H 'X-Telegram-Bot-Api-Secret-Token: local-callback-secret' \
  -d '{"callback_query":{"id":"1","from":{"id":99999,"username":"you"},
       "message":{"message_id":1,"chat":{"id":12345}},
       "data":"approve:<startup id>"}}'
```

The database-side guarantees (approve publishes, double review is a no-op,
founders cannot call the RPC) are covered by
`supabase/tests/database/startup_review.test.sql` — `npm run db:test`.
