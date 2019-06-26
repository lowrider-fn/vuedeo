<template>
    <div id="app">
        <vuedeo refs="vuedeo">
            <template v-slot:header />
            <template v-slot:body />
            <template v-slot:controls />
            <template v-slot:footer />
        </vuedeo>
    </div>
</template>

<script>

import { Vuedeo } from './vuedeo';

export default {
    name      : 'App',
    components: {
        vuedeo: Vuedeo,
    },
};

</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

</style>
