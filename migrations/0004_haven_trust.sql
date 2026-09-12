-- Privacy, invites, blocks, group invites, opaque recovery blobs, receipts.
-- Blobs here are ciphertext only. No plaintext logs.

alter table profiles add column if not exists discovery text not null default 'handle';
alter table profiles add column if not exists allow_save boolean not null default false;
alter table profiles add column if not exists send_receipts boolean not null default true;
alter table profiles add column if not exists totp_enabled boolean not null default false;
alter table profiles add column if not exists recovery_email_hash text;

alter table envelopes add column if not exists purpose text not null default 'clip';
alter table envelopes add column if not exists allow_save boolean not null default false;
alter table envelopes add column if not exists caption text;

alter table circle_members add column if not exists status text not null default 'member';

create table if not exists blocks (
  blocker_id  text not null,
  blocked_id  text not null,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists invites (
  token       text primary key,
  inviter_id  text not null,
  created_at  timestamptz not null default now()
);

create table if not exists recovery_blobs (
  user_id     text not null,
  kind        text not null,
  blob        text not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, kind)
);

create index if not exists invites_inviter_idx on invites (inviter_id);
