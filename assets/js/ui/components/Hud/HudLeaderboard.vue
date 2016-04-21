<template>
    <div class="hud-leaderboard hud-item">
        <h1>Leaderboard</h1>
        <ol>
            <li v-for="player in players">
        </ol>
    </div>
</template>

<script>
export default {
    props: ['players'],
    computed: {
        sortedPlayers: function() {
            return this.players
                .sort(function(a, b) {
                    return a.meta.score < b.meta.score
                })
                .slice(0, 9)
                .map((player, index) => {
                    return player.meta.nickname ? player.meta.nickname : 'Unamed Ranger'
                })
        }
    }
}
