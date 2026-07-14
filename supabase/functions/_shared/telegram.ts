// Shared Telegram Bot API client for the startup review flow.
// TELEGRAM_API_URL is overridable so local testing can point at a mock server.

const TELEGRAM_API_URL = Deno.env.get('TELEGRAM_API_URL') ?? 'https://api.telegram.org';

export type InlineButton = { text: string; callback_data: string };

export async function callTelegram(method: string, body: unknown): Promise<Response> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN secret is not set');

  const response = await fetch(`${TELEGRAM_API_URL}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.error(`Telegram ${method} failed`, response.status, await response.text());
  }
  return response;
}

// parse_mode: 'HTML' only reserves these three characters.
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
