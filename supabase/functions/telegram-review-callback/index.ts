// Handles the Approve / Reject buttons on the cards posted by
// telegram-startup-review, and applies the decision through the
// admin_review_startup RPC (service_role only).
//
// This URL is public — Telegram will not send a JWT — so it is guarded twice:
// the secret token Telegram echoes back in the X-Telegram-Bot-Api-Secret-Token
// header (set at setWebhook time), and an allowlist of Telegram user ids. A
// leaked URL alone cannot approve anything.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { callTelegram, type InlineButton } from '../_shared/telegram.ts';

// Keys stay short: Telegram caps callback_data at 64 bytes and a uuid already
// eats 36 of them.
const REJECT_REASONS: Record<string, { label: string; reason: string }> = {
  incomplete: {
    label: '📝 Incomplete',
    reason:
      'Your submission is missing information or the description is too thin. Please flesh out your startup details and request verification again.',
  },
  unverified: {
    label: '🔍 Unverifiable',
    reason: 'We could not confirm that you control the website and the X account linked to this startup.',
  },
  standards: {
    label: '🚫 Off-standard',
    reason: 'This submission does not meet the Orbital listing standards.',
  },
};

type CallbackQuery = {
  id: string;
  data?: string;
  from: { id: number; username?: string; first_name?: string };
  message?: { message_id: number; chat: { id: number } };
};

function reviewerLabel(from: CallbackQuery['from']): string {
  return from.username ? `@${from.username}` : `${from.first_name ?? 'unknown'} (${from.id})`;
}

function answer(callbackQueryId: string, text: string, alert = false) {
  return callTelegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: alert,
  });
}

function setKeyboard(query: CallbackQuery, rows: InlineButton[][]) {
  if (!query.message) return Promise.resolve();
  return callTelegram('editMessageReplyMarkup', {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: { inline_keyboard: rows },
  });
}

// The outcome is written into the keyboard rather than the message body: the
// card was sent as HTML and Telegram hands it back as plain text, so re-editing
// the text would mean re-escaping it. A spent card shows one inert button.
function outcomeKeyboard(text: string): InlineButton[][] {
  return [[{ text, callback_data: 'noop' }]];
}

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (req.headers.get('x-telegram-bot-api-secret-token') !== Deno.env.get('TELEGRAM_CALLBACK_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const update = await req.json();
  const query = update.callback_query as CallbackQuery | undefined;
  // Anything that is not a button press (a plain chat message, a bot command)
  // is acknowledged and dropped, otherwise Telegram keeps redelivering it.
  if (!query?.data) {
    return ok({ ignored: true });
  }

  const [action, startupId, reasonKey] = query.data.split(':');
  if (action === 'noop') {
    await answer(query.id, 'Already reviewed.');
    return ok({ ignored: true });
  }

  const admins = (Deno.env.get('TELEGRAM_ADMIN_IDS') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  if (!admins.includes(String(query.from.id))) {
    console.warn('Rejected review attempt from non-admin', query.from.id);
    await answer(query.id, '⛔️ You are not allowed to review startups.', true);
    return ok({ unauthorized: true });
  }

  // Pressing Reject only swaps the keyboard for the reason picker; nothing is
  // written until a reason is chosen, and Back returns to the original card.
  if (action === 'reject') {
    await setKeyboard(query, [
      ...Object.entries(REJECT_REASONS).map(([key, { label }]) => [
        { text: label, callback_data: `reason:${startupId}:${key}` },
      ]),
      [{ text: '↩️ Back', callback_data: `back:${startupId}` }],
    ]);
    await answer(query.id, 'Pick a reason — the founder will see it.');
    return ok({ awaiting_reason: startupId });
  }

  if (action === 'back') {
    await setKeyboard(query, [
      [
        { text: '✅ Approve & publish', callback_data: `approve:${startupId}` },
        { text: '❌ Reject', callback_data: `reject:${startupId}` },
      ],
    ]);
    await answer(query.id, 'Cancelled.');
    return ok({ cancelled: startupId });
  }

  const decision = action === 'approve' ? 'approve' : action === 'reason' ? 'reject' : null;
  if (!decision) {
    await answer(query.id, 'Unknown action.');
    return ok({ ignored: true });
  }

  const reviewer = reviewerLabel(query.from);
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.rpc('admin_review_startup', {
    startup_id: startupId,
    decision,
    reviewer,
    reason: decision === 'reject' ? (REJECT_REASONS[reasonKey]?.reason ?? null) : null,
  });

  if (error) {
    console.error('admin_review_startup failed', error);
    await answer(query.id, `⚠️ Review failed: ${error.message}`, true);
    return ok({ error: error.message });
  }

  // The RPC only acts on a pending startup, so a card that was already resolved
  // (double tap, someone else got there first) comes back applied: false.
  if (!data?.applied) {
    await setKeyboard(query, outcomeKeyboard('⚠️ Already reviewed'));
    await answer(query.id, 'This startup was already reviewed.', true);
    return ok({ applied: false });
  }

  const name = data.startup?.name ?? 'Startup';
  const outcome =
    decision === 'approve'
      ? `✅ Approved & published by ${reviewer}`
      : `❌ Rejected (${REJECT_REASONS[reasonKey]?.label ?? 'no reason'}) by ${reviewer}`;

  await setKeyboard(query, outcomeKeyboard(outcome));
  await answer(query.id, decision === 'approve' ? `${name} is live 🚀` : `${name} rejected.`);

  console.log('Review applied', decision, startupId, 'by', reviewer);
  return ok({ applied: true, decision, startup_id: startupId });
});
