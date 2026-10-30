self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
      return undefined;
    }),
  );
});

// Push from the server when a clip arrives. The payload never says who sent it.
function inQuietHours(p) {
  if (!p || !p.quietHours) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = String(p.quietStart || "22:00").split(":").map(Number);
  const [eh, em] = String(p.quietEnd || "07:00").split(":").map(Number);
  const start = sh * 60 + (sm || 0);
  const end = eh * 60 + (em || 0);
  if (start === end) return false;
  return start < end ? cur >= start && cur < end : cur >= start || cur < end;
}

async function readPrefs() {
  try {
    const cache = await caches.open("haven-prefs");
    const res = await cache.match("/__haven-prefs");
    return res ? await res.json() : null;
  } catch {
    return null;
  }
}

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const prefs = await readPrefs();
      // iPhone requires every push to show a notification, so quiet hours
      // silence it rather than skip it.
      await self.registration.showNotification("New clip in Haven", {
        body: "Someone sent you a sealed clip.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "haven-inbox",
        renotify: true,
        silent: inQuietHours(prefs),
      });
    })(),
  );
});
