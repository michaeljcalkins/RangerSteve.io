<template>
    <div class="hud-leaderboard hud-item">
        <h1>Leaderboard</h1>
        <ol>
            <li
                track-by="$index"
                v-for="player in sortedPlayers"
            >
                <span>{{player.meta && player.meta.nickname ? player.meta.nickname : 'Unamed Ranger'}}</span>
            </li>
        </ol>
    </div>
</template>

<script>
export default {
    props: ['players'],
    computed: {
        sortedPlayers: function() {
            return this.players
                .sort((a, b) => a.meta.score < b.meta.score)
                .filter((player) => _.has(player, 'meta'))
                .slice(0, 9)
                .map((player, index) => {
                    return player.meta.nickname ? player.meta.nickname : 'Unamed Ranger'
                })
        }
    }
}
