// Posts a review card with Approve / Reject buttons to the moderation chat
// whenever a startup enters verification_status = 'pending'. Invoked by the
// `startups_telegram_on_review_request` database trigger (see the
// 20260715160000_telegram_startup_review.sql migration), authenticated with the
// shared secret in the `x-webhook-secret` header instead of a JWT.
//
// The buttons are handled by the telegram-review-callback function.

import { callTelegram, escapeHtml } from '../_shared/telegram.ts';

// Telegram caps a message at 4096 characters; the description is the only
// unbounded-ish field (2000 chars), so it is the one that gets trimmed.
const DESCRIPTION_BUDGET = 700;

// The trigger resolves the founder itself because service_role has no direct
// read access to the tables in this schema.
type WebhookPayload = {
  type: string;
  record: {
    id: string;
    name: string;
    one_liner: string;
    description: string;
    website: string;
    twitter: string;
    stage: string;
    category: string[];
    tech_stack: string[];
    team_size: number;
    is_raising: boolean;
  };
  founder: {
    display_name: string | null;
    job_title: string | null;
    twitter_handle: string | null;
    telegram_handle: string | null;
    wallet_address: string;
  };
};

function handle(value: string | null): string | null {
  const trimmed = value?.trim().replace(/^@/, '');
  return trimmed ? `@${trimmed}` : null;
}

function buildCard(payload: WebhookPayload, startupUrl: string): string {
  const s = payload.record;
  const f = payload.founder;

  const founderLine = [
    f.display_name || 'Unnamed founder',
    f.job_title,
    handle(f.twitter_handle),
    handle(f.telegram_handle),
  ]
    .filter(Boolean)
    .map((part) => escapeHtml(String(part)))
    .join(' · ');

  const description =
    s.description.length > DESCRIPTION_BUDGET
      ? s.description.slice(0, DESCRIPTION_BUDGET).trimEnd() + '…'
      : s.description;

  return [
    '🛰 <b>Verification requested</b>',
    '',
    `🪐 <b>${escapeHtml(s.name)}</b>`,
    `<i>${escapeHtml(s.one_liner)}</i>`,
    '',
    `👤 ${founderLine}`,
    `💳 <code>${escapeHtml(f.wallet_address)}</code>`,
    '',
    `🌐 ${escapeHtml(s.website)}`,
    `🐦 ${escapeHtml(s.twitter)}`,
    `🏷 ${escapeHtml(s.stage)} · ${escapeHtml(s.category.join(', ') || '—')}`,
    `🧰 ${escapeHtml(s.tech_stack.join(', ') || '—')}`,
    `👥 ${s.team_size} · ${s.is_raising ? 'raising 💰' : 'not raising'}`,
    '',
    `📝 ${escapeHtml(description)}`,
    '',
    `🔗 ${escapeHtml(startupUrl)}`,
  ].join('\n');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('TELEGRAM_WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = (await req.json()) as WebhookPayload;
  if (!payload.record?.id) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  const siteUrl = Deno.env.get('SITE_URL');
  if (!chatId || !siteUrl) {
    console.error('TELEGRAM_CHAT_ID or SITE_URL secret is not set');
    return new Response(JSON.stringify({ error: 'missing_config' }), { status: 500 });
  }

  const startupUrl = `${siteUrl.replace(/\/$/, '')}/startups/${payload.record.id}`;
  const response = await callTelegram('sendMessage', {
    chat_id: chatId,
    text: buildCard(payload, startupUrl),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approve & publish', callback_data: `approve:${payload.record.id}` },
          { text: '❌ Reject', callback_data: `reject:${payload.record.id}` },
        ],
      ],
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'telegram_send_failed' }), { status: 502 });
  }

  console.log('Review card sent', payload.record.id);
  return new Response(JSON.stringify({ notified: payload.record.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
