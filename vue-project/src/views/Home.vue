<script lang="ts" setup>
    import router from '../router';

    const onClickGoGame = () => {
        router.push('/game');
    };
</script>

<template>
    <h1>Home View</h1>
    <button @click="onClickGoGame">go game</button>
</template>

<style scoped></style>
