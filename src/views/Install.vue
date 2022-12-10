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
            recordings: [1, 2, 3, 4, 7, 11, 13, 17, 31, 37, 47, 53, 62, 65, 72, 78, 86, 94, 95, 100, 106, 109, 113, 114, 121, 122, 125, 144, 150, 153, 161, 168, 177, 187, 195, 218, 219],
        };
    },
    computed: {
        progress() {
            return `${this.current}/${this.total}`;
        },
    },
    async beforeMount() {
        // if ((await this.$songs.count()) === 0) {


            this.fetchSongs().then(songs => {
                if (this.importSongs(songs)) this.success();
            });
            // this.fetchAudio().then(songs => {
            //     if (this.importSongs(songs)) this.success();
            // });

        // } else this.success();
    },
    methods: {
        /**
         * Fetches songs from JSON API
         *
         */
        fetchSongs() {
            if (SONGS_JSON === null) {
                this.message = 'URL for database is missing.';
                return false;
            }

            /*                 if (AUDIO_JSON === null) {
                                this.message = 'URL for audio recordings is missing.';
                                // return false;
                            } */

            // this.fetchAudio();

            return fetch(SONGS_JSON)
                .then(res => res.json())
                .catch(err => {
                    this.errorId = Sentry && Sentry.captureException(err);
                    this.message = `Įvyko klaida...`;
                });
        },

/*         fetchAudio() {
            if (AUDIO_JSON === null) {
                this.message = 'URL for audio recordings is missing.';
                return false;
            }
            return fetch(AUDIO_JSON)
                .then(res => res.json())
                .catch(err => {
                    this.errorId = Sentry && Sentry.captureException(err);
                    this.message = `Įvyko klaida...`;
                });
        }, */

        /**
         * Load songs from array into browser database using Dexie API
         *
         * @param {Dexie} table Database table
         * @param {array} songs Array of songs
         */
        importSongs(songs) {
            this.total = songs.length;
            let status = false;

            songs.forEach(song => {
                this.current += 1; // count the iteration
                this.audio = 0; // an icon indicating audio existence
                status = true;

                const {songId, title, verse, body, copyright} = song;
                if (this.recordings.includes(this.current)) this.audio = 1; // check if current song iteration should have an audio icon

                this.$songs
                    .put({
                        songId,
                        title,
                        verse,
                        body,
                        copyright,
                        favorited: 0,
                        audio: this.audio,
                    })
                    .catch(error => {
                        status = false;
                        this.errorId = Sentry && Sentry.captureException(error);
                    });
            });
            return status;
        },

        success() {
            this.status = 'ready';
            setTimeout(() => this.$router.push('/'), 1000);
        },
    },
};
</script>

<style>
.install-message {
    text-align: center;
}
</style>
