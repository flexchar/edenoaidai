<script>
import List from '../components/List.vue';

export default {
    name: 'Home',
    data() {
        return {
            songs: [],
        };
    },
    created() {
        this.$songs
            .orderBy('id')
            // .offset(Math.round(Math.random() * 100))
            // .limit(10)
            .toArray()
            .then(songs => {
                this.songs = songs;
            });
    },
    methods: {
        goToInstallPage() {
            this.$router.push('install');
        },
    },
    render(h) {
        return h('div', {}, [
            h('button', {
                class: 'update-button',
                on: {
                    click: this.goToInstallPage,
                },
            }, 'Atnaujinti duomenis'),
            h(List, {
                props: {
                    songs: this.songs,
                },
            }),
        ]);
    },
};
</script>
<style>
.update-button {
    display: block;
    width: 100%; /* Make button span the whole width of the page */
    margin: 0 auto;
    padding: 10px 20px;
    font-size: 16px;
    background-color: rgba(217, 178, 111, 1); /* Goldish color */
    color: #2f2f2f;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 2px 5px 10px 0 rgba(0, 0, 0, 0.1);
    text-decoration: none;
    text-align: center;
    transition: box-shadow ease-in-out 0.2s;
    margin-bottom: 10px;
}
.update-button:hover {
    background-color: beige;
    box-shadow: 2px 5px 10px 0 rgba(0, 0, 0, 0.3);
}
</style>
