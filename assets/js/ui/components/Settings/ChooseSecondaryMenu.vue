<template>
    <div class="row">
        <div class="col-sm-12">
            <label>Select a Secondary Weapon</label>
            <div class="options-menu">
                <div
                    class="option-group option-weapon-group align-middle"
                    key={ index }
                    v-for=""
                    onClick={ handleSelectPrimaryClick.bind(this, weapon) }
                >
                    { player.meta.score < weapon.minScore
                        ? <div class="option-screen"></div>
                        : null
                    }
                    <div>
                        <img src={ weapon.image } />
                    </div>
                    <span class="option-name">{ weapon.name }</span>
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
    data: {
        secondaryWeapons: function() {
            return GameConsts.SECONDARY_WEAPONS
        }
    },
    methods: {
        function handleSelectPrimaryClick(weapon) {
            if (player.meta.score < weapon.minScore)
                return

            this.onSecondaryGunClick(weapon)
            this.onViewChange('main')
        }
    }
}
