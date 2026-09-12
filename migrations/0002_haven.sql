-- Haven: public profiles, friendships, and zero-knowledge video envelopes.
-- Video plaintext never lives here — envelopes hold opaque ciphertext only.

create table if not exists profiles (
  user_id       text primary key,
  handle        text not null unique,
  display_name  text not null,
  phone_hash    text unique,
  phone_last4   text,
  public_key    text,
  default_ttl   text not null default '1d',
  setup_complete boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_handle_idx on profiles (handle);
create index if not exists profiles_phone_hash_idx on profiles (phone_hash);

create table if not exists friendships (
  id            text primary key,
  requester_id  text not null,
  addressee_id  text not null,
  status        text not null default 'pending',
  created_at    timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

create index if not exists friendships_requester_idx on friendships (requester_id);
create index if not exists friendships_addressee_idx on friendships (addressee_id);

-- Ephemeral encrypted relay. Deleted after pickup or expiry.
-- wrapped_key + ciphertext are opaque; this app cannot decrypt them.
create table if not exists envelopes (
  id              text primary key,
  sender_id       text not null,
  recipient_id    text not null,
  ttl_mode        text not null,
  expires_at      timestamptz,
  wrapped_key     text not null,
  iv              text not null,
  ciphertext      text not null,
  poster          text,
  duration_ms     integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists envelopes_recipient_idx on envelopes (recipient_id, created_at desc);
create index if not exists envelopes_expires_idx on envelopes (expires_at);
