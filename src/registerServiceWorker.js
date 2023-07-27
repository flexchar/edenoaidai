/* global  */
import { isBot } from './helpers/isBot';

export default async () => {
    // Skip registration for unsupported browsers, bots
    if (!('serviceWorker' in navigator) || isBot) {
        return;
    }

    const swDisabled = localStorage.getItem('sw');

    if (swDisabled) {
        // If disabled, try to unregister it
        // usually for developments reasons
        const serviceWorker = await navigator.serviceWorker.getRegistration();
        if (serviceWorker) {
            await serviceWorker.unregister();
            console.info('Service worker successfully unregistered.');
        }
    } else {
        const version = process.env.CACHE_VERSION || '1'; // use cache version from env
        navigator.serviceWorker
            .register(`${window.location.origin}/service-worker.js?${version}`)
            .then((registration) => {
                // Check if a new service worker is getting installed
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        // If the new service worker is installed, ask users to refresh their page to use the new version
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // Show an update banner or alert
                                console.info('New content is available; please refresh.');
                                // You can also use a custom event to show a popup or banner in your web app asking users to refresh
                                // document.dispatchEvent(new Event('swUpdated'));
                            } else {
                                console.info('Content is cached for offline use.');
                            }
                        }

                        // If the new service worker is activated, set the databaseUpdated flag to 'true'
                        if (newWorker.state === 'activated') {
                            localStorage.setItem('databaseUpdated', 'true');
                            console.info('New service worker is active.');
                        }
                    });
                });
            })
            .catch(err =>
                // eslint-disable-next-line no-console
                console.error(`Failed to register SW: `, err),
            );
    }
};

