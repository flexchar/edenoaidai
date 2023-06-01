<template>
    <div class="list">
        <router-link
            v-for="song in songs"
            :key="song.id"
            class="element"
            :to="`/song/${song.songId}`"
        >
            <span class="element__number">{{ song.songId }}</span>

            <p class="element__title">{{ song.title }}</p>

            <div class="icons">
                <div  v-for="(key, index) in song.lists" :key="index" >
                    <svg class="icon-audio">
                        <use :href="`#icon-${key}`"></use>
                    </svg>
                </div>
            </div>

        </router-link>

    </div>
</template>

<script>
    export default {
        name: 'List',
        props: {
            songs: {
                type: Array,
                required: true,
            },
        },
    };
</script>

<style lang="scss">
    .element {
        display: grid;

        grid-template-columns: auto 1fr auto;
        align-items: center;

        font-size: 16px;
        line-height: 1.5;

        color: #2f2f2f;
        text-decoration: none;

        background-color: whitesmoke;
        border: none;

        margin: 10px 0;

        &__number {
            display: flex;

            align-self: stretch;
            align-items: center;

            padding: 0 15px;

            border-radius: 0 99px 99px 0;

            background-color: rgba(217, 178, 111, 1);
        }


        &__title {
            display:  inline-block;
            text-align: left;

            padding: 10px;
            margin: 0;
        }

        transition: box-shadow ease-in-out 0.2s;

        &:hover {
            background-color: beige;
            box-shadow: 2px 5px 10px 0 rgba(0, 0, 0, 0.1);
        }
    }
    .icons {
        display:flex;
    }
    .icon-audio{

        width: 2em;
        height: 2em;
        stroke-width: 0;
        stroke: currentColor;
        fill: currentColor;
        padding-top: 10px;
        padding-bottom: 10px;

        margin: 0;
    }
</style>
