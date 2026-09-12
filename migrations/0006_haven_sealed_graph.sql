-- Sealed social graph: no plaintext names/handles, no sender on envelopes.
-- Friendships, groups, and blocks live on-device. Lookup is hash-only.

alter table profiles add column if not exists handle_hash text;
create unique index if not exists profiles_handle_hash_uidx on profiles (handle_hash);

-- Wipe names we used to store. Handles become opaque placeholders so uniqueness holds.
update profiles set display_name = '' where display_name is distinct from '';
update profiles set handle = 'h' || substr(replace(user_id, '-', ''), 1, 19)
  where handle is not null;

alter table envelopes alter column sender_id drop not null;
update envelopes set sender_id = null, group_id = null, caption = null;
