const CACHE_NAME = "restroflow-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          "<html><body style='background:#0a0d14;color:#e5e5e5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center'><div><div style='font-size:64px;margin-bottom:16px'>🍽️</div><h1>Restroflow</h1><p style='color:#888;margin-top:8px'>Offline — Please check your connection</p></div></body></html>",
          { headers: { "Content-Type": "text/html" } }
        )
      )
    );
  }
});
