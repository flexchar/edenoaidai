<template>
    <div v-if="status === 'ready'" class="install-message">Paruošta!</div>
    <div v-else class="install-message">
        {{ message }}
        {{ progress }}
        <div v-if="errorId">Klaidos kodas: {{ errorId }}</div>
    </div>
</template>

<script>
const SONGS_JSON = process.env.VUE_APP_DB_URL || null;
const TRACKS_JSON = process.env.VUE_APP_DB2_URL || null;
// const SONGS_JSON = process.env.VUE_APP_DB_URL || null;
// const SONGS_JSON = "https://adventistai.lt/edeno-aidai.json" || null;
// const AUDIO_JSON = "https://adventistai.lt/giesmes/recordings.json" || null;

export default {
    data() {
        return {
            message: 'Ruošiama',
            status: '',
            total: 0,
            current: 0,
            errorId: '',
            tracks:[],
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
    methods: {
        /**
         * Fetches songs from JSON API
         *
         */
        async fetchSongs() {
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

            songs.forEach(song => {
                this.current += 1; // count the iteration
                status = true;

                const {songId, title, verse, body, copyright} = song;
                const trackLists = tracks.filter(track => track.list.includes(songId));
                const lists = {};

                trackLists.forEach(track => {
                    const listName = tracks.find(item => item.tracks.includes(track.number)).name;
                    lists[listName] = true;
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

};
</script>

<style>
.install-message {
    text-align: center;
}
</style>
