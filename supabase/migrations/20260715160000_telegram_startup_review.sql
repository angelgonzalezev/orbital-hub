-- Sends a moderation card to Telegram whenever a startup enters
-- verification_status = 'pending', and exposes the RPC the Telegram buttons
-- call back into. This is the missing pending -> verified/rejected step: there
-- is no admin dashboard, the review happens in the chat.
--
-- Same wiring as the tweet webhook: the trigger (running as the table owner)
-- resolves the founder itself because service_role has no direct table access,
-- and the URL plus shared secret live in Vault so this migration holds no
-- environment-specific values:
--   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'edge_functions_url');
--   select vault.create_secret('<random-string>', 'telegram_webhook_secret');
-- If either secret is missing the trigger is a no-op, so local development and
-- test databases never call out.

alter table public.startups
add column reviewed_at timestamptz,
add column reviewed_by text;

create or replace function public.notify_telegram_startup_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  functions_url text;
  webhook_secret text;
  founder public.profiles;
begin
  select decrypted_secret into functions_url
  from vault.decrypted_secrets
  where name = 'edge_functions_url';

  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'telegram_webhook_secret';

  if functions_url is null or webhook_secret is null then
    return new;
  end if;

  select * into founder from public.profiles where id = new.owner_profile_id;

  perform net.http_post(
    url := functions_url || '/telegram-startup-review',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'record', to_jsonb(new),
      'founder', jsonb_build_object(
        'display_name', founder.display_name,
        'job_title', founder.job_title,
        'twitter_handle', founder.twitter_handle,
        'telegram_handle', founder.telegram_handle,
        'wallet_address', founder.wallet_address
      )
    ),
    timeout_milliseconds := 5000
  );

  return new;
exception when others then
  -- Never block a verification request because the notification failed.
  raise warning 'telegram-startup-review webhook failed: %', sqlerrm;
  return new;
end;
$$;

-- Also fires on re-review: reset_verification_on_identity_change() sends a
-- verified startup back to 'pending' when its website or X handle changes.
create trigger startups_telegram_on_review_request
after update on public.startups
for each row
when (
  new.verification_status = 'pending'
  and old.verification_status is distinct from 'pending'
)
execute function public.notify_telegram_startup_review();

-- Called by the telegram-review-callback edge function (service_role) when a
-- reviewer presses Approve or Reject. Approving publishes in the same update,
-- which is what fires startups_tweet_on_publish.
create or replace function public.admin_review_startup(
  startup_id uuid,
  decision text,
  reviewer text,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.startups;
begin
  if decision not in ('approve', 'reject') then
    raise exception 'Unknown decision: %', decision;
  end if;

  -- Only a pending startup is reviewable, so a double-tapped button or two
  -- reviewers racing each other resolve to a no-op instead of a second review.
  select * into target
  from public.startups
  where id = startup_id and verification_status = 'pending'
  for update;

  if target.id is null then
    select * into target from public.startups where id = startup_id;
    if target.id is null then
      raise exception 'Startup not found';
    end if;
    return jsonb_build_object('applied', false, 'startup', to_jsonb(target));
  end if;

  if decision = 'approve' then
    update public.startups
    set verification_status = 'verified',
        domain_verification_status = 'verified',
        x_verification_status = 'verified',
        listing_status = 'published',
        verification_rejection_reason = null,
        reviewed_at = now(),
        reviewed_by = reviewer
    where id = startup_id
    returning * into target;
  else
    update public.startups
    set verification_status = 'rejected',
        domain_verification_status = 'failed',
        x_verification_status = 'failed',
        listing_status = 'draft',
        verification_rejection_reason = reason,
        reviewed_at = now(),
        reviewed_by = reviewer
    where id = startup_id
    returning * into target;
  end if;

  return jsonb_build_object('applied', true, 'startup', to_jsonb(target));
end;
$$;

revoke all on function public.admin_review_startup(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_review_startup(uuid, text, text, text) to service_role;
