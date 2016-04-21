<template>
    <div class="hud-jump-jet hud-item">
        <div class="progress">
            <div
                class="progress-bar progress-bar-success"
                v-bind:style="{ width: percent + '%' }"
            ></div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['jumpJetCounter'],
    computed: {
        percent: function() {
            let percent = 100

            if (this.jumpJetCounter < 0) {
                percent = 100 - ((this.jumpJetCounter * -1) / 130000 * 100).toFixed(0)
                percent = percent < 0 ? 0 : percent
            }

            return percent
        }
    }
}
</script>
