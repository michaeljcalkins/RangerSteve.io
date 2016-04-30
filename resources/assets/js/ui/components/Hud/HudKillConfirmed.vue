<template>
    <div
        v-show="showKillConfirmed"
        class="hud-kill-confirmed"
    >+10</div>
</template>

<script>
export default {
    props: ['showKillConfirmed']
}
</script>
