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
const DETAILS_JSON = process.env.VUE_APP_DB2_URL || null;

// const SONGS_JSON = process.env.VUE_APP_DB_URL || null;
// const SONGS_JSON = "https://adventistai.lt/edeno-aidai.json" || null;

export default {
    data() {
        return {
            message: 'Ruošiama',
            status: '',
            total: 0,
            current: 0,
            errorId: '',
            music: [],
            vocal: [],
        };
    },
    computed: {
        progress() {
            return `${this.current}/${this.total}`;
        },
    },
    async beforeMount() {
        this.fetchSongs().then(songs => {
            if (this.importSongs(songs)) this.success();
        });
    },
    created() {
        fetch(DETAILS_JSON)
            .then(response => response.json())
            .then(data => {
                this.music = data[0].music;
                this.vocal = data[1].vocal;
            })

            .catch(error => {
                console.error(error);
            });
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

            return fetch(SONGS_JSON)
                .then(res => res.json())
                .catch(err => {
                    this.errorId = Sentry && Sentry.captureException(err);
                    this.message = `Įvyko klaida...`;
                });
        },

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
                this.musicAudio = 0; // an icon indicating music audio file existence
                this.vocalAudio = 0; // an icon indicating vocal audio file existance
                status = true;

                const {songId, title, verse, body, copyright,} = song;
                if (this.music.includes(this.current)) this.musicAudio = 1; // check if current song iteration should have an audio icon
                if (this.vocal.includes(this.current)) this.vocalAudio = 1;

                this.$songs
                    .put({
                        songId,
                        title,
                        verse,
                        body,
                        copyright,
                        favorited: 0,
                        musicAudio: this.musicAudio,
                        vocalAudio: this.vocalAudio,
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
