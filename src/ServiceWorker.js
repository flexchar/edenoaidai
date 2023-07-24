/* global workbox */

/**
 * Load plugins
 * https://developers.google.com/web/tools/workbox/modules/workbox-sw#avoid_async_imports
 */
const { strategies, expiration, cacheableResponse } = workbox;

// Use the CACHE_VERSION constant
const CACHE_VERSION = 'v5';

/**
 * Forcefully take over clients after update
 */
workbox.core.skipWaiting();
workbox.core.clientsClaim();

/**
 * Enable offline Google Analytics reporting
 * https://developers.google.com/web/tools/workbox/modules/workbox-google-analytics
 */
workbox.googleAnalytics.initialize({
    parameterOverrides: {
        cd1: 'offline',
    },
});

/**
 * Things to precache on install event
 */
workbox.precaching.precacheAndRoute([
    {
        url: '/',
    },
    {
        url: './components/List.vue',
    },
    {
        url: './views/Home.vue',
    },
    {
        url: './views/Install.vue',
    },
    {
        url: './views/Search.vue',
    },
    {
        url: './views/Single.vue',
    },
    {
        url: './database.js',
    },
    ...self.__precacheManifest /* eslint-disable-line */,
]);
const OFFLINE_FALLBACK_URI = workbox.precaching.getCacheKeyForURL('/');

/**
 * Catch handler for offline fallbacks
 */
const catchHandler = ({ event }) => {
    if (/.(?:js|css|map)$/.test(event.request.url)) {
        return fetch(event.request);
    }
    return caches
        .match(OFFLINE_FALLBACK_URI)
        .then(response => response)
        .catch(err => console.info(err));
};
workbox.routing.setCatchHandler(catchHandler);

/**
 * Default handler for runtime requests
 */
workbox.routing.setDefaultHandler({
    handle: args => {
        if (args.event.request.method === 'GET') {
            return new strategies.CacheFirst({
                cacheName: 'default',
                // as a default handler, it may cache too many resources,
                // limit to 50 entries and only for good w/200 responses
                plugins: [
                    new expiration.Plugin({
                        maxEntries: 50,
                        purgeOnQuotaError: true,
                    }),
                    new cacheableResponse.Plugin({
                        statuses: [200],
                    }),
                ],
            }).handle(args);
        }
        return fetch(args.event.request);
    },
});

/**
 * Cache json files
 * hopefully songs file
 */
workbox.routing.registerRoute(
    new RegExp('.json$'),
    new strategies.CacheFirst({
        cacheName: `json-${CACHE_VERSION}`,
        plugins: [
            new cacheableResponse.Plugin({
                statuses: [200],
            }),
        ],
    }),
);

/**
 * Sentry API
 */
workbox.routing.registerRoute(
    new RegExp('https://sentry.io/api/.*'),
    new strategies.NetworkOnly(),
);

// Clear old caches when a new service worker is activated
// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    // Check if the cache name starts with the old version prefix
                    return cacheName.startsWith('default-') && !cacheName.includes(CACHE_VERSION);
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
