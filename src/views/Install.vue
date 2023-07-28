<template>
    <div v-if="status === 'ready'" :class="'install-message'">Paruošta!</div>
    <div v-else :class="'install-message'">
        {{ message }}
        {{ progress }}
        <div v-if="errorId">Klaidos kodas: {{ errorId }}</div>
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
        };
    },
    computed: {
        progress() {
            return `${this.current}/${this.total}`;
        },
    },

    async beforeMount() {
        try {
            await this.fetchAndStoreData(this);
        } catch (error) {
            this.message = `Įvyko klaida: ${error.message}`;
        }
    },

    methods: {
        async refreshData() {
            try {
                await this.$songs.clear();  // clear existing data before fetching and importing again
                await this.fetchAndStoreData(this);
            } catch (error) {
                this.message = `Įvyko klaida: ${error.message}`;
            }
        },

        async fetchAndStoreData(vm) {
            const songs = await vm.fetchData(SONGS_JSON);
            const tracks = await vm.fetchData(TRACKS_JSON);
            if (await vm.importSongs(songs, tracks)) {
                vm.success();
            }
        },
        /**
         * Fetches songs from JSON API
         *
         */

        async fetchData(url) {
            if (!url) {
                throw new Error('URL for database is missing.');
            }

            try {
                // Add timestamp as a query parameter
                const fullUrl = `${url}?${Date.now()}`;
                const response = await fetch(fullUrl);
                return await response.json();
            } catch (error) {
                throw new Error(`Failed to fetch data: ${error.message}`);
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
            this.$songs.clear();
            this.total = songs.length;
            this.current = 0;  // reset current count before importing songs
            let status = true;

            try {
                await Promise.all(songs.map(async (song) => {
                    const {songId, title, verse, body, copyright} = song;
                    const lists = [];

                    tracks.forEach(trackList => {
                        if (trackList.tracks.includes(songId)) {
                            lists.push(trackList.name);
                        }
                    });

                    const songObject = {
                        songId,
                        title,
                        verse,
                        body,
                        copyright,
                        favorited: 0,
                        lists,
                    };

                    await this.$songs.put(songObject);

                    this.current += 1;
                }));
            } catch (error) {
                status = false;
                console.error(error);
            }

            return status;
        },

        success() {
            this.status = 'ready';
            localStorage.setItem('databaseUpdated', 'false');
            setTimeout(() => this.$router.push('/'), 1000);
        }
    },
};
</script>

<style>
.install-message {
    text-align: center;
}
</style>
