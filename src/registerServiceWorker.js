/* global caches, self */
import { isBot } from './helpers/isBot';

export default async () => {
    // Skip registration for unsupported browsers, bots
    if (!('serviceWorker' in navigator) || isBot) {
        return;
    }

    const swDisabled = localStorage.getItem('sw');

    if (swDisabled) {
        // If disabled, try to unregister it
        // usually for development reasons
        const serviceWorker = await navigator.serviceWorker.getRegistration();
        if (serviceWorker) {
            await serviceWorker.unregister();
            console.info('Service worker successfully unregistered.');
        }
    }

    // Update the service worker registration code here
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/ServiceWorker.js');
            console.info('Service worker registered:', registration);
        } catch (error) {
            console.error('Failed to register service worker:', error);
        }
    }

    // Add the cache clearing code here
    /* eslint-disable no-restricted-globals */
    self.addEventListener('activate', event => {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    });
    /* eslint-enable no-restricted-globals */
};
