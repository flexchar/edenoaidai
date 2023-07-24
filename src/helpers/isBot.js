/* eslint-disable no-restricted-globals */
export const runningOnBrowser = typeof self !== 'undefined';

export const isBot =
    (runningOnBrowser && !('onscroll' in self)) ||
    (typeof self.navigator !== 'undefined' &&
        /(gle|ing|ro)bot|crawl|spider/i.test(self.navigator.userAgent));
/* eslint-enable no-restricted-globals */
