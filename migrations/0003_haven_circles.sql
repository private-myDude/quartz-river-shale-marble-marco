-- Groups (circles), media kind, and retention hooks for the sealed mailbox.
-- Ciphertext stays opaque. delivered_at lets a later cloud mailbox keep a
-- sealed copy until TTL instead of shredding on first pickup.

alter table envelopes add column if not exists media_kind text not null default 'video';
alter table envelopes add column if not exists mime_type text not null default 'video/webm';
alter table envelopes add column if not exists group_id text;
alter table envelopes add column if not exists delivered_at timestamptz;

create table if not exists circles (
  id          text primary key,
  name        text not null,
  created_by  text not null,
  created_at  timestamptz not null default now()
);

create table if not exists circle_members (
  circle_id   text not null,
  user_id     text not null,
  role        text not null default 'member',
  joined_at   timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create index if not exists circle_members_user_idx on circle_members (user_id);
create index if not exists envelopes_group_idx on envelopes (group_id);
