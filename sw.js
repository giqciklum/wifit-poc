/* ==========================================================
   WiFit Demo · Service Worker v3
   ==========================================================
   Estrategia:
   - HTML, JS, CSS, manifest: network-first (fallback cache).
     Un deploy nuevo se ve al recargar, sin limpiar cache.
   - Apps Script (backend): SIEMPRE network, nunca cache.
     Los KPIs en vivo nunca se quedan congelados.
   - Fuentes, imagenes, iconos: cache-first con revalidacion.
     Se sirven rapidas pero se refrescan en segundo plano.
   - Peticiones no http(s) y cross-origin sin regla: se dejan pasar.
   ========================================================== */

const CACHE_VERSION = "wifit-poc-v3";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./assets/chart.umd.min.js",
    "./assets/demo-runtime.js",
    "./assets/icon.svg",
    "./assets/wifit-logo-menu.png",
    "./assets/wifit-retiro-hero.jpg",
    "./assets/wifit-member-journey.jpg",
    "./assets/wifit-chamberi-hero.jpg"
];

const BACKEND_HOST = "script.google.com";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(APP_SHELL).catch(() => null))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

function isSameOrigin(url) {
    return url.origin === self.location.origin;
}

function isBackendCall(url) {
    return url.hostname.endsWith(BACKEND_HOST);
}

function isAssetRequest(request, url) {
    const dest = request.destination;
    if (dest === "image" || dest === "font") return true;
    const p = url.pathname.toLowerCase();
    return p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg")
        || p.endsWith(".svg") || p.endsWith(".webp") || p.endsWith(".ico")
        || p.endsWith(".woff") || p.endsWith(".woff2") || p.endsWith(".ttf");
}

function isAppShellRequest(request, url) {
    if (!isSameOrigin(url)) return false;
    const dest = request.destination;
    if (dest === "document" || dest === "script" || dest === "style" || dest === "manifest") return true;
    const p = url.pathname.toLowerCase();
    return p.endsWith("/") || p.endsWith(".html") || p.endsWith(".js")
        || p.endsWith(".css") || p.endsWith(".webmanifest");
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_VERSION);
    try {
        const fresh = await fetch(request);
        if (fresh && fresh.status === 200 && fresh.type === "basic") {
            cache.put(request, fresh.clone()).catch(() => {});
        }
        return fresh;
    } catch (err) {
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.destination === "document") {
            const shell = await cache.match("./index.html");
            if (shell) return shell;
        }
        throw err;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    if (cached) {
        fetch(request).then((resp) => {
            if (resp && resp.status === 200) {
                cache.put(request, resp.clone()).catch(() => {});
            }
        }).catch(() => {});
        return cached;
    }
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200) {
        cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
}

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    let url;
    try {
        url = new URL(request.url);
    } catch (_) {
        return;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    // Backend Apps Script: nunca cache, siempre red directa
    if (isBackendCall(url)) {
        return;
    }

    // App shell: network-first -> los deploys se ven al recargar
    if (isAppShellRequest(request, url)) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Assets: cache-first con revalidacion silenciosa
    if (isAssetRequest(request, url)) {
        event.respondWith(cacheFirst(request));
        return;
    }
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
