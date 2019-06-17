<template>
    <div id="app">
        <vuedeo refs="vuedeo">
            <template v-slot:header>
            </template>
            <template v-slot:body>
            </template>
            <template v-slot:controls>
            </template>
            <template v-slot:footer>
            </template>
        </vuedeo>
    </div>
</template>

<script>

import {vuedeo} from './vuedeo';

export default {
    name      : 'App',
    components: {
        vuedeo,
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
