<script lang="ts" setup>
    import router from '../router';

    const onClickGoGame = () => {
        router.push('/game');
    };
    const onClickGoGame2 = () => {
        router.push('/game2');
    };
</script>

<template>
    <h1>Home View</h1>
    <button @click="onClickGoGame">go game</button>
    <button @click="onClickGoGame2">go game2</button>

</template>

<style scoped></style>
