begin;
select plan(9);

select is(
  (select public from storage.buckets where id = 'media'),
  true,
  'media bucket is public'
);

select is(
  (select file_size_limit from storage.buckets where id = 'media'),
  2097152::bigint,
  'media bucket limits files to 2 MB'
);

select is(
  (select allowed_mime_types from storage.buckets where id = 'media'),
  array['image/jpeg', 'image/png', 'image/webp'],
  'media bucket accepts only supported image formats'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', null, '', now(), now(), now(), '{}', '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', null, '', now(), now(), now(), '{}', '{}'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);

select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values ('media', '40000000-0000-4000-8000-000000000001/profiles/avatar/test.webp',
      '40000000-0000-4000-8000-000000000001')$$,
  'an authenticated user can create media in their own prefix'
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values ('media', '40000000-0000-4000-8000-000000000002/profiles/avatar/test.webp',
      '40000000-0000-4000-8000-000000000001')$$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'an authenticated user cannot create media in another prefix'
);

select lives_ok(
  $$update storage.objects set metadata = '{"updated":true}'
    where bucket_id = 'media'
      and name = '40000000-0000-4000-8000-000000000001/profiles/avatar/test.webp'$$,
  'the owner can update their media object'
);

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000002', true);

-- RLS hides the row from the intruder, so this update matches zero rows. It has
-- to be a top-level statement (a data-modifying CTE inside is() is invalid SQL),
-- so the assertion is the owner reading their metadata back unchanged.
update storage.objects
set metadata = '{"intruder":true}'
where bucket_id = 'media'
  and name = '40000000-0000-4000-8000-000000000001/profiles/avatar/test.webp';

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);

select is(
  (select metadata from storage.objects
   where bucket_id = 'media'
     and name = '40000000-0000-4000-8000-000000000001/profiles/avatar/test.webp'),
  '{"updated":true}'::jsonb,
  'another authenticated user cannot update the owner media object'
);

-- Storage ships a protect_delete trigger that blocks direct SQL deletes unless
-- this setting is on; disabling it here lets the test exercise the RLS policy,
-- which is what actually guards the Storage API path.
select set_config('storage.allow_delete_query', 'true', true);

select lives_ok(
  $$delete from storage.objects
    where bucket_id = 'media'
      and name = '40000000-0000-4000-8000-000000000001/profiles/avatar/test.webp'$$,
  'the owner can delete their media object'
);

reset role;
set local role anon;

select throws_ok(
  $$insert into storage.objects (bucket_id, name)
    values ('media', 'anonymous/profiles/avatar/test.webp')$$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'anonymous users cannot create media'
);

select * from finish();
rollback;
