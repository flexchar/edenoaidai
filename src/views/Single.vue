<!-- eslint-disable vue/no-v-html -->
<template>
    <div v-if="song" class="song">
        <h2 class="song__title">{{ song.songId }} {{ song.title }}</h2>
        <div class="song__buttons">
            <button class="song__navigation-button" :disabled="disablePreviousButton"
                    @click="goToPreviousSong">{{ getPreviousSongId() }} ←
            </button>

            <button class="song__font-size-button" @click="adjustFontSize(true)">Aa++</button>
            <button class="song__font-size-button" @click="adjustFontSize(false)">Aa--</button>

            <button
                class="song__favorite-button"
                :title="song.favorited ? 'Išsaugota' : 'Pamėgti'"
                @click="toggleFavorite"
            >
                <svg class="icon">
                    <use v-if="song.favorited" :href="`#icon-star-full`"></use>
                    <use v-else :href="`#icon-star-empty`"></use>
                </svg>
            </button>

            <button class="song__navigation-button" :disabled="disableNextButton"
                    @click="goToNextSong">→ {{ getNextSongId() }}
            </button>
        </div>
        <p class="song__verse">
            <em>{{ song.verse }}</em>
        </p>

        <div v-for="(key, index) in song.lists" :key="index" class="audio-container">
            <div class="audio-icon">
                <svg class="song__icon-audio">
                    <use :href="`#icon-${key}`"></use>
                </svg>
            </div>
            <div v-if="index !== undefined" class="audio-player">
                <audio :ref="`audio-${index}`" preload="metadata" controls>
                    <source :src="getAudioSourceUrl(key)" type="audio/mpeg" @error="audioError">
                    Naršyklė nepalaiko audio elementų.
                </audio>
            </div>
        </div>


        <div style="text-align: center; margin-top: 20px;">
            <div class="song__body" :style="fontSizeStyle" v-html="song.body"></div>
        </div>

        <div class="image-format-container" style="margin-top: 20px;">
            <button
                :class="['song__font-size-button', 'image-format-button', { 'selected': imageType === 'svg' }]"
                @click="updateImageType('svg')">Rodyti SVG
            </button>
            <button
                :class="['song__font-size-button', 'image-format-button', { 'selected': imageType === 'jpg' }]"
                @click="updateImageType('jpg')">Rodyti JPG
            </button>
        </div>

        <div class="song-image">
            <template v-if="imageUrl1">
                <img :src="imageUrl1" alt=""/>
            </template>
            <template v-if="imageUrl2">
                <img :src="imageUrl2" alt=""/>
            </template>
            <template v-if="imageUrl3">
                <img :src="imageUrl3" alt=""/>
            </template>
        </div>

        <small class="song__copyright" v-html="song.copyright"></small>

    </div>
</template>

<script>

export default {
    name: 'Single',
    props: {
        songId: {
            type: String,
            required: true,
        },
    },


    data() {
        return {
            imageType: 'jpg',
            baseUrl: '',

            song: null, // Initialize with null
            songIds: [], // Initialize with an empty array

            get fontSize() {
                return parseInt(localStorage.getItem('fontSize'), 10) || 24;
            },
            // eslint-disable-next-line vue/no-dupe-keys
            set fontSize(newVal) {
                localStorage.setItem('fontSize', newVal);
            },
        };
    },


    computed: {
        fontSizeStyle() {
            return {
                fontSize: `${this.fontSize}px`,
            };
        },
        imageUrl1() {
            return `${this.baseUrl}${this.songId}.${this.imageType}`;
        },
        imageUrl2() {
            return `${this.baseUrl}/${this.songId}_1.${this.imageType}`;
        },
        imageUrl3() {
            return `${this.baseUrl}/${this.songId}_2.${this.imageType}`;
        },

        disablePreviousButton() {
            // Check if song and songIds are not null or empty
            if (!this.song || !this.songIds.length) {
                return true;
            }
            const currentIndex = this.songIds.indexOf(this.song.songId);
            return currentIndex <= 0;
        },
        disableNextButton() {
            // Check if song and songIds are not null or empty
            if (!this.song || !this.songIds.length) {
                return true;
            }
            const currentIndex = this.songIds.indexOf(this.song.songId);
            return currentIndex >= this.songIds.length - 1;
        },
    },

    watch: {
        '$route': 'fetchSong',
    },

    created() {
        // this.baseUrl = `https://adventistai.lt/giesmes/notes/${this.imageType}/`;
        this.fetchSongs();
        this.fetchSong();

    },

    methods: {
        updateImageType(type) {
            this.imageType = type;
            this.baseUrl = `https://adventistai.lt/giesmes/notes/${this.imageType}/`;
        },

        getAudioSourceUrl(key) {
            return `https://adventistai.lt/giesmes/${key}/${this.song.songId}.mp3`;
        },

        fetchSongs() {
            this.$songs.toArray().then((songs) => {
                this.songIds = songs
                    .map((song) => ({id: parseInt(song.id, 10), songId: song.songId}))
                    .sort((a, b) => a.id - b.id)
                    .map((song) => song.songId);

                this.$songs
                    .where('songId')
                    .equals(this.songId)
                    .first()
                    .then((song) => {
                        this.song = song;
                    });
            });
        },

        fetchSong() {
            this.baseUrl = `https://adventistai.lt/giesmes/notes/${this.imageType}/`;
            this.$songs.where('songId').equals(this.songId).first().then(song => {
                this.song = song;
            });
        },


        goToPreviousSong() {
            const currentIndex = this.songIds.indexOf(this.song.songId);
            if (currentIndex > 0) {
                const previousSongId = this.songIds[currentIndex - 1];
                this.$router.push(`/song/${previousSongId}`);
                window.location.reload(); // Force reload the page
            }
        },

        getPreviousSongId() {
            const currentIndex = this.songIds.indexOf(this.song.songId);
            if (currentIndex > 0) {
                return this.songIds[currentIndex - 1];
            }
            return '';
        },
        goToNextSong() {
            const currentIndex = this.songIds.indexOf(this.song.songId);
            if (currentIndex < this.songIds.length - 1) {
                const nextSongId = this.songIds[currentIndex + 1];
                this.$router.push(`/song/${nextSongId}`);
                window.location.reload(); // Force reload the page
            }
        },

        getNextSongId() {
            const currentIndex = this.songIds.indexOf(this.song.songId);
            if (currentIndex < this.songIds.length - 1) {
                return this.songIds[currentIndex + 1];
            }
            return '';
        },


        audioError(event) {
            console.log('got error: ', event)

        },
        toggleFavorite() {
            this.$songs
                .update(this.song.id, {
                    favorited: this.song.favorited ? 0 : 1,
                })
                .then(successfullyUpadated => {
                    if (successfullyUpadated) {
                        this.song.favorited = this.song.favorited ? 0 : 1;
                    } else {
                        // console.info('Failed to toggle favorite');
                    }
                })
                .catch(err => Sentry && Sentry.captureException(err));
        },
        adjustFontSize(increase) {
            increase ? (this.fontSize += 1) : (this.fontSize -= 1);
        },
    },
};
</script>

<style lang="scss">
.image-format-container {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}

.image-format-button {
    font-size: 16px;
    line-height: 1.5;
    background-color: transparent;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    margin-right: 10px;
    color: black; /* Set the text color to black */
    transition: background-color 0.3s, color 0.3s; /* Add transition for smooth color change */
    font-weight: normal; /* Set the font weight to normal */
}

.image-format-button.selected {
    background-color: dodgerblue;
    color: black; /* Set the text color to black */
    font-weight: bold; /* Set the font weight to bold */
}

.image-format-button:hover:not(.selected) {
    background-color: lightgray;
    color: white; /* Set the text color to white */
}


.song__navigation-button {
    font-size: 18px;
    line-height: 1.5;
    @extend %button-shadow;
    background-color: lightblue; // Example color, adjust as needed
    color: black; // Set the text color to black
    padding: 8px 12px;
    font-weight: 500; // Set a lighter font weight value
}

.song__navigation-button:focus {
    outline: none; // Remove the default focus outline if desired
}

.song__navigation-button:hover:not([disabled]) {
    background-color: dodgerblue; // Example hover color, adjust as needed
}

.audio-container {
    display: flex;
    align-items: center;
    justify-content: center; /* Horizontally center the elements */
    margin-bottom: 10px;
}

.audio-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    width: 60px; /* Adjust the width as needed */
    height: 60px; /* Adjust the height as needed */
    fill: black;
    /*transform: scale(1);*/
    /* Adjust the scale factor as needed */
}

/*.icon-audio {
    width: 70%; !* Adjust the width as needed *!
    height: 70%; !* Adjust the height as needed *!
}*/


.audio-player {
    justify-content: center;
    display: flex;
    margin: 10px;
}

.song-image {
    justify-content: center;
    display: grid;
    margin: 20px
}

.song-image img {
    max-width: 100%;
    width: auto;
    height: auto;
    shape-rendering: crispEdges;
    image-rendering: optimizeQuality;

    object-fit: cover;
}

.song__buttons {
    justify-content: center;
    align-items: center;
    display: flex;
    padding: 10px 0;
}

.song__buttons button {
    margin-right: 10px;
    border: none;
    border-radius: 20px;
    background-color: white;
    box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.4);
    font-size: 16px;
    line-height: 1.5;
}

.song__buttons button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}

.song__buttons button:hover:not([disabled]) {
    background-color: lightgray;
}

.song {
    &__title {
        font-size: 20px;
        text-align: center;
        width: auto;
        margin: 0 0 10px;
        border-bottom: 1px solid black;
    }

    &__verse {
        font-size: 16px;
        text-align: center;
        margin: 0 0 20px;
    }

    &__body {
        display: inline-block;
        text-align: left;
        alignment: center;
        font-size: 24px;
        margin-bottom: 20px;
    }

    &__buttons {
        justify-content: center;
        align-items: center;
        display: flex;
        padding: 10px 0;

        > :not(:last-child) {
            margin-right: 10px;
        }
    }

    %button-shadow {
        border: none;
        border-radius: 20px;
        background-color: white;
        box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.4);
    }

    &__favorite-button {
        display: inline-block;
        font-size: 20px;
        line-height: 1;
        vertical-align: bottom;
        padding: 0 2px;
        border: none;
        color: rgba(228, 179, 99, 1);
        @extend %button-shadow;
    }

    &__font-size-button {
        font-size: 16px;
        line-height: 1.5;
        @extend %button-shadow;
    }

    &__copyright {
        text-align: center;
        justify-content: center;
        display: flex;
    }

    .icon-audio {
        display: block;
        margin: 0 auto;
    }
}
</style>
