<template>
    <div v-if="status === 'ready'" class="install-message">Paruošta!</div>
    <div v-else class="install-message">
        {{ message }}
        {{ progress }}
        <div v-if="errorId">Klaidos kodas: {{ errorId }}</div>
        <div v-if="updateAvailable" class="update-message">Yra nauji atnaujinimai. Perkraukite puslapį.</div>
    </div>
</template>

<script>
const SONGS_JSON = process.env.VUE_APP_DB_URL || null;
const TRACKS_JSON = process.env.VUE_APP_DB2_URL || null;

export default {
    data() {
        return {
            message: 'Ruošiama',
            status: '',
            total: 0,
            current: 0,
            errorId: '',
            tracks: [],
            updateAvailable: false,
        };
    },
    computed: {
        progress() {
            return `${this.current}/${this.total}`;
        },

    },
    async beforeMount() {
        try {
            const songs = await this.fetchSongs();
            const tracks = await this.fetchTracks();
            if (await this.importSongs(songs, tracks)) {
                this.success();
            }
        } catch (error) {
            this.message = `Įvyko klaida: ${error.message}`;
        }
    },
    mounted() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.onmessage = (event) => {
                if (event.data === 'reloadDatabase') {
                    this.reloadDatabase();
                }
            };

            navigator.serviceWorker.ready.then(registration => {
                // eslint-disable-next-line no-param-reassign
                registration.onupdatefound = () => {
                    const newWorker = registration.installing;
                    newWorker.onstatechange = () => {
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // new update available
                                this.updateAvailable = true;
                            }
                        }
                    };
                };
            });
        }
    },


    methods: {
        async reloadDatabase() {
            try {
                const songs = await this.fetchSongs();
                const tracks = await this.fetchTracks();
                if (await this.importSongs(songs, tracks)) {
                    this.success();
                }
            } catch (error) {
                this.message = `Įvyko klaida: ${error.message}`;
            }
        },

        /**
         * Fetches songs from JSON API
         *
         */
        async fetchSongs() {
            console.log(SONGS_JSON);
            if (SONGS_JSON === null) {
                throw new Error('URL for database is missing.');
            }

            try {
                const response = await fetch(SONGS_JSON);

                return await response.json();
            } catch (error) {
                throw new Error(`Failed to fetch songs: ${error.message}`);
            }
        },

        async fetchTracks() {
            if (TRACKS_JSON === null) {
                throw new Error('URL for tracks database is missing.');
            }

            try {
                const response = await fetch(TRACKS_JSON);
                return await response.json();
            } catch (error) {
                throw new Error(`Failed to fetch tracks: ${error.message}`);
            }
        },


        /**
         * Load songs from array into browser database using Dexie API
         *
         * @param {Dexie} table Database table
         * @param {array} songs Array of songs
         * @param {array} tracks Array of tracks
         */
        async importSongs(songs, tracks) {
            this.total = songs.length;
            let status = false;

            // Clear the table first
            await this.$songs.clear().catch(error => {
                status = false;
                console.error(error);
            });

            songs.forEach(song => {
                status = true;

                const {songId, title, verse, body, copyright} = song;
                const lists = [];

                tracks.forEach(trackList => {
                    if (trackList.tracks.includes(songId)) {
                        lists.push(trackList.name);
                    }
                });

                this.$songs
                    .put({
                        songId,
                        title,
                        verse,
                        body,
                        copyright,
                        favorited: 0,
                        lists,
                    })
                    .catch(error => {
                        status = false;
                        console.error(error);
                    });

            });

            return status;
        },

        success() {
            this.status = 'ready';
            setTimeout(() => this.$router.push('/'), 1000);
        },
    }
};
</script>

<style>
.install-message {
    text-align: center;
}

.update-message {
    color: red;
}
</style>
