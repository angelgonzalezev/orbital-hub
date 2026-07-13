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

select is(
  (
    with changed as (
      update storage.objects
      set metadata = '{"intruder":true}'
      where bucket_id = 'media'
        and name = '40000000-0000-4000-8000-000000000001/profiles/avatar/test.webp'
      returning 1
    )
    select count(*)::integer from changed
  ),
  0,
  'another authenticated user cannot update the owner media object'
);

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);

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
  'permission denied for table objects',
  'anonymous users cannot create media'
);

select * from finish();
rollback;
