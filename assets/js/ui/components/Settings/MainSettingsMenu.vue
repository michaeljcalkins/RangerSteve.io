<template>
    <div>
        <div
            class="row"
            style={ { marginBottom: '10px' } }
        >
            <div class="col-sm-6">
                <label>Primary</label>
                { renderPrimaryWeapon() }

                <label>Secondary</label>
                { renderSecondaryWeapon() }
            </div>
            <div class="col-sm-6">
                <label>Character</label>
                <div
                    class="option-group option-character-group align-middle"
                    onClick={ handleCharacterViewClick }
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
        },

        renderPrimaryWeapon: function() {
            if (!selectedPrimaryWeapon)
                return null

            let weapon = _.find(GameConsts.PRIMARY_WEAPONS, { id: selectedPrimaryWeapon })

            if (!weapon) {
                console.error('Could not find primary weapon.', selectedPrimaryWeapon)
                return null
            }

            return (
                <div
                    class="option-group option-weapon-group align-middle"
                    onClick={ handlePrimaryViewClick }
                    style={ { marginBottom: '28px' } }
                >
                    <div>
                        <img src={ weapon.image } />
                    </div>
                    <span class="caret"></span>
                    <span class="option-name">{ weapon.name }</span>
                </div>
            )
        },

        renderSecondaryWeapon: function() {
            if (!selectedSecondaryWeapon)
                return null

            let weapon = _.find(GameConsts.SECONDARY_WEAPONS, { id: selectedSecondaryWeapon })

            if (!weapon) {
                console.error('Could not find secondary weapon.', selectedSecondaryWeapon)
                return null
            }

            return (
                <div
                    class="option-group option-weapon-group align-middle"
                    onClick={ handleSecondaryViewClick }
                >
                    <div>
                        <img src={ weapon.image } />
                    </div>
                    <span class="caret"></span>
                    <span class="option-name">{ weapon.name }</span>
                </div>
            )
        }
    }
}
</script>
