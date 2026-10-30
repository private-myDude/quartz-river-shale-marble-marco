-- Web Push subscriptions: where to wake each signed-in device when a clip arrives.
-- The push carries no content, sender, or name — just "something new".

create table if not exists push_subscriptions (
  endpoint    text primary key,
  user_id     text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);
