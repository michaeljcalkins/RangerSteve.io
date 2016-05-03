<template>
    <div class="hud-leaderboard hud-item">
        <h1>Leaderboard</h1>
        <table class="table table-condensed">
            <tbody>
                <tr
                    track-by="$index"
                    v-for="player in sortedPlayers"
                >
                    <td>{{player.meta.nickname}}</td>
                    <td>{{player.meta.score}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: ['players'],
    computed: {
        sortedPlayers: function() {
            return this.players
                .sort((a, b) => a.meta.score < b.meta.score)
                .slice(0, 9)
                .map((player, index) => {
                    player.meta.nickname = player.meta.nickname ? player.meta.nickname : 'Unamed Ranger'
                    return player
                })
        }
    }
}
</script>
