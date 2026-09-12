-- Zero-knowledge mailbox: hashed emails for contact match, no plaintext captions.
-- Caption/kind/duration on envelopes are ignored going forward; identity lives in ciphertext.

alter table profiles add column if not exists email_hash text;
create index if not exists profiles_email_hash_idx on profiles (email_hash);

update envelopes set caption = null where caption is not null;
