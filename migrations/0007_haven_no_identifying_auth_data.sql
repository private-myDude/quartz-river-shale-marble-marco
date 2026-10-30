-- Accounts keep no name, and sign-ins keep no IP address or device type.
-- Names live on-device; new rows are blanked by hooks in src/lib/auth/server.ts.

update "user" set "name" = '' where "name" <> '';
update "session" set "ipAddress" = null, "userAgent" = null
  where "ipAddress" is not null or "userAgent" is not null;
