<template>
    <div
        class="row"
        style="margin-bottom: 10px"
    >
        <div class="col-sm-6">
            <label>Primary</label>
            <div
                class="option-group option-weapon-group align-middle"
                @click="handlePrimaryViewClick"
                style="margin-bottom: 28px"
            >
                <div>
                    <img :src="primaryWeapon.image" />
                </div>
                <span class="caret"></span>
                <span class="option-name">{{primaryWeapon.name}}</span>
            </div>

            <label>Secondary</label>
            <div
                class="option-group option-weapon-group align-middle"
                @click="handleSecondaryViewClick"
            >
                <div>
                    <img :src="secondaryWeapon.image" />
                </div>
                <span class="caret"></span>
                <span class="option-name">{{secondaryWeapon.name}}</span>
            </div>
        </div>
        <div class="col-sm-6">
            <label>Character</label>
            <div
                class="option-group option-character-group align-middle"
                @click="handleCharacterViewClick"
            >
                <div>
                    <img src="/images/characters/Ranger-Steve.png" />
                </div>
                <span class="caret"></span>
                <span class="option-name">Ranger Steve</span>
            </div>
        </div>
    </div>

    <div class="form-group">
        <label>Nickname</label>
        <input
            class="form-control"
            defaultValue={ defaultNicknameValue }
            onChange={ handleNicknameChange }
            type="text"
        />
    </div>
    <div class="form-group">
        <label htmlFor="">Sound Effects Volume</label>
        <input
            defaultValue={ defaultSoundEffectValue }
            max="1"
            min="0"
            onChange={ handleSoundEffectVolumeChange }
            step=".01"
            type="range"
        />
    </div>
</template>

<script>
import GameConsts from '../../../lib/GameConsts'

export default {
    props: [
        'defaultNicknameValue',
        'defaultSoundEffectValue',
        'onNicknameChange',
        'onSoundEffectVolumeChange',
        'onViewChange',
        'selectedPrimaryWeapon',
        'selectedSecondaryWeapon'
    ],
    methods: {
        handleNicknameChange: function(evt) {
            onNicknameChange(evt.target.value)
        },

        handleSoundEffectVolumeChange: function(evt) {
            onSoundEffectVolumeChange(evt.target.value)
        },

        handlePrimaryViewClick: function() {
            onViewChange('choosePrimary')
        },

        handleSecondaryViewClick: function() {
            onViewChange('chooseSecondary')
        },

        handleCharacterViewClick: function() {
            onViewChange('chooseCharacter')
        }
    },
    computed: {
        primaryWeapon: function() {
            if (!this.selectedPrimaryWeapon)
                return null

            let weapon = _.find(GameConsts.PRIMARY_WEAPONS, {
                id: this.selectedPrimaryWeapon
            })

            if (!weapon) {
                console.error('Could not find primary weapon.', this.selectedPrimaryWeapon)
                return null
            }

            return weapon
        },

        secondaryWeapon: function() {
            if (!this.selectedSecondaryWeapon)
                return null

            let weapon = _.find(GameConsts.SECONDARY_WEAPONS, {
                id: this.selectedSecondaryWeapon
            })

            if (!weapon) {
                console.error('Could not find secondary weapon.', this.selectedSecondaryWeapon)
                return null
            }

            return weapon
        }
    }
}
</script>
