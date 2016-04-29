<template>
    <div class="row">
        <div class="col-sm-12">
            <label>Select a Secondary Weapon</label>
            <div class="options-menu">
                <div
                    class="option-group option-weapon-group align-middle"
                    key="index"
                    v-for="weapon in secondaryWeapons"
                    @click="handleSelectPrimaryClick(weapon)"
                >
                    <div
                        class="option-screen"
                        v-show="player.meta.score < weapon.minScore"></div>
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
        'onSecondaryGunClick',
        'player'
    ],
    data: function() {
        return {
            secondaryWeapons: GameConsts.SECONDARY_WEAPONS
        }
    },
    methods: {
        handleSelectPrimaryClick: function(weapon) {
            if (this.player.meta.score < weapon.minScore)
                return

            this.onSecondaryGunClick(weapon)
            this.onViewChange('main')
        }
    }
}
