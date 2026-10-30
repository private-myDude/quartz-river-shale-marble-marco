-- One-time password reset links the owner creates for a family member.
-- Only a hash of the link's token is stored.

create table if not exists password_resets (
  token_hash  text primary key,
  user_id     text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists password_resets_user_idx on password_resets (user_id);
