<!-- eslint-disable vue/no-v-html -->
<template>
    <div v-if="song" class="song">
        <h2 class="song__title">{{ song.songId }} {{ song.title }}</h2>
        <div class="song__buttons">
            <button class="song__font-size-button" @click="adjustFontSize(true)">Aa++</button>
            <button class="song__font-size-button" @click="adjustFontSize(false)">Aa--</button>
            <button
                class="song__favorite-button"
                :title="song.favorited ? 'Išsaugota' : 'Pamėgti'"
                @click="toggleFavorite"
            >
                <svg class="icon">
                    <use :href="song.favorited ? '#icon-star-full' : '#icon-star-empty'"></use>
                </svg>
            </button>
        </div>
        <p class="song__verse">
            <em>{{ song.verse }}</em>
        </p>

        <div v-show="song.musicAudio" class="audio-container">
            <div class="audio-description">
                <svg class="icon-audio">
                    <use :href="'#icon-music' "></use>
                </svg>
                <span>Melodijos įrašas:</span>
            </div>

            <audio id="music" ref="music" class="audio-file" preload="metadata" controls>
                <source :src="musicUrl" type="audio/mpeg">
                Naršyklė nepalaiko audio elementų.
            </audio>
        </div>

        <div v-show="song.vocalAudio" class="audio-container">
            <div class="audio-description">
                <svg class="icon-audio">
                    <use :href="'#icon-vocal' "></use>
                </svg>
                <span>Giesmės įrašas:</span>
            </div>

            <audio id="vocal" ref="vocal" class="audio-file" preload="metadata" controls>
                <source :src="vocalUrl" type="audio/mpeg">
            </audio>
        </div>

        <div style="text-align: center;">
            <div class="song__body" :style="fontSizeStyle" v-html="song.body"></div>
        </div>

        <div class="song-image">
            <img :src="imageUrl1" alt=""/>
            <img :src="imageUrl2" alt=""/>
            <img :src="imageUrl3" alt=""/>
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
            baseUrl: 'https://adventistai.lt/giesmes/',
            imageFormat: 'svg',

            song: {},
            get fontSize() {
                return parseInt(localStorage.getItem('fontSize'), 10) || 16;
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
        vocalUrl() {
            return `${this.baseUrl}vocal/${this.songId}.mp3`;
        },
        musicUrl() {
            return `${this.baseUrl}music/${this.songId}.mp3`;
        },
        imageUrl1() {
            return `${this.baseUrl}notes/${this.imageFormat}/${this.songId}.${this.imageFormat}`;
        },
        imageUrl2() {
            return `${this.baseUrl}notes/${this.imageFormat}/${this.songId}${this.imageFormat.replace(this.imageFormat, `_1.${this.imageFormat}`)}`;
        },
        imageUrl3() {
            return `${this.baseUrl}notes/${this.imageFormat}/${this.songId}${this.imageFormat.replace(this.imageFormat, `_2.${this.imageFormat}`)}`;
        },
    },

    created() {
        this.$songs
            .get({
                songId: this.songId,
            })
            .then(song => {
                this.song = song;
            })
            .catch(err => Sentry && Sentry.captureException(err));
    },
    methods: {
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
.icon-audio {
    width: 2em;
    height: 2em;
    stroke-width: 0;
    stroke: currentColor;
    fill: currentColor;
    padding: 10px;
    margin: 0;
}

.audio-description {
    align-items: center;
    justify-content: center;
    display: flex;
}

.audio-container {
    text-align: center;
    display: block;
}

.audio-file {
    text-align: center;
    padding-bottom: 20px;
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
    -webkit-optimize-contrast: auto;
    object-fit: cover;
}

.song {
    &__title {
        font-size: 20px;
        text-align: center;
        width: auto;
        margin: 0;
        margin-bottom: 10px;
        border-bottom: 1px solid black;
    }

    &__verse {
        font-size: 16px;
        text-align: center;
        margin: 0;
        margin-bottom: 20px;
    }

    &__body {
        display: inline-block;
        text-align: left;
        alignment: center;
        font-size: 16px;
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
}
</style>
