/* eslint-disable no-param-reassign */

import Dexie from 'dexie';
import router from './router';

/**
 * Returns initialized Dexie database instance
 *
 */
function getDatabaseInstance() {
    const database = new Dexie('edenoAidai');

    // Move the version to localStorage so we can access it in Vue components
    localStorage.setItem('dbVersion', process.env.VUE_APP_CACHE_VERSION || '1');



    database.version(1).stores({
        songs: '++id, &songId, *title, verse, body, copyright, favorited, lists',
    });

    return database;
}

/**
 * Checks if table is empty and needs to be populated
 *
 * @param {Dexie} table Table of Dexie Database
 */
function needsInstall(table) {
    return (
        table
            .count()
            .then(count => {
                if (localStorage.getItem('databaseUpdated') === 'false' && count > 0) {
                    return false;
                }

                localStorage.setItem('databaseUpdated', 'false');
                return count === 0;
            })
            .catch(err => console.error(err))
    );
}


export default async function(Vue) {
    const database = getDatabaseInstance();
    Vue.prototype.$songs = database.songs;
    const cacheVersion = process.env.VUE_APP_CACHE_VERSION || '1';

// Check if the version stored in localStorage is the same as the current one
    if (localStorage.getItem('dbVersion') !== cacheVersion) {
        // If it's not, clear the database and set the new version
        await database.songs.clear();
        localStorage.setItem('dbVersion', cacheVersion);
    }

    (await needsInstall(database.songs)) && router.push('/install');
}
