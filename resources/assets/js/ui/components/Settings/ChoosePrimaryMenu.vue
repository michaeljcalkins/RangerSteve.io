<template>
    <div class="row">
        <div class="col-sm-12">
            <label>Select a Primary Weapon</label>
            <div class="options-menu">
                <div
                    class="option-group option-weapon-group align-middle"
                    track-by="$index"
                    v-for="weapon in primaryWeapons"
                    @click="handleSelectPrimaryClick(weapon)"
                >
                    <div
                        v-show="player.meta.score < weapon.minScore"
                        class="option-screen"></div>
                    <div>
                        <img :src="weapon.image" />
                    </div>
                    <span class="option-name">{{weapon.name}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GameConsts from '../../../lib/GameConsts'

export default {
    props: [
        'onViewChange',
        'onPrimaryGunClick',
        'player'
    ],
    data: function() {
        return {
            primaryWeapons: GameConsts.PRIMARY_WEAPONS
        }
    },
    methods: {
        handleSelectPrimaryClick: function(weapon) {
            if (this.player.meta.score < weapon.minScore)
                return

            this.onPrimaryGunClick(weapon)
            this.onViewChange('main')
        }
    }
}
</script>
