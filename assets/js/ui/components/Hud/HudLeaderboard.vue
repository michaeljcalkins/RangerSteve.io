<template>
    <div class="hud-leaderboard hud-item">
        <h1>Leaderboard</h1>
        <ol>
            <li
                track-by="$index"
                v-for="player in sortedPlayers"
            >
                <span>{{player.meta.nickname}}</span>
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
                .slice(0, 9)
                .map((player, index) => {
                    player.meta.nickname = player.meta.nickname ? player.meta.nickname : 'Unamed Ranger'
                    return player
                })
        }
    }
}
