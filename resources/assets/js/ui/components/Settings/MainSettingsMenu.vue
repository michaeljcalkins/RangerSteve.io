<template>
    <div
        class="row"
        style="margin-bottom: 10px"
    >
        <div class="col-sm-6">
            <label>Primary</label>
            <div
                class="option-group option-weapon-group align-middle"
                @click="handlePrimaryViewClick('choosePrimary')"
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
                @click="handleSecondaryViewClick('chooseSecondary')"
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
                @click="handleCharacterViewClick('chooseCharacter')"
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
            @keyup="handleNicknameChange"
            v-model="nickname"
            maxlength="25"
            type="text"
        />
    </div>
    <div class="form-group">
        <label>Sound Effects Volume</label>
        <input
            max="1"
            min="0"
            @change="handleSoundEffectVolumeChange"
            v-model="volume"
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
    data: function() {
        return {
            nickname: this.defaultNicknameValue,
            volume: this.defaultSoundEffectValue
        }
    },
    methods: {
        handleNicknameChange: function() {
            if (this.nickname.length > 25)
                this.nickname = this.nickname.splice(0, 25)

            this.onNicknameChange(this.nickname)
        },

        handleSoundEffectVolumeChange: function(evt) {
            this.onSoundEffectVolumeChange(evt.target.value)
        },

        handlePrimaryViewClick: function() {
            this.onViewChange('choosePrimary')
        },

        handleSecondaryViewClick: function() {
            this.onViewChange('chooseSecondary')
        },

        handleCharacterViewClick: function() {
            this.onViewChange('chooseCharacter')
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
