import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function MainSettingsMenu({
    defaultNicknameValue,
    defaultSoundEffectValue,
    onNicknameChange,
    onSoundEffectVolumeChange,
    onViewChange,
    selectedPrimaryWeapon,
    selectedSecondaryWeapon
}) {
    let nickname = defaultNicknameValue
    let volume = defaultSoundEffectValue

    function handleNicknameChange() {
        if (nickname.length > 25)
            nickname = nickname.splice(0, 25)

        onNicknameChange(nickname)
    }

    function handleSoundEffectVolumeChange(evt) {
        onSoundEffectVolumeChange(evt.target.value)
    }

    function handlePrimaryViewClick() {
        onViewChange('choosePrimary')
    }

    function handleSecondaryViewClick() {
        onViewChange('chooseSecondary')
    }

    function handleCharacterViewClick() {
        onViewChange('chooseCharacter')
    }

    function primaryWeapon() {
        if (!selectedPrimaryWeapon)
            return null

        let weapon = _.find(GameConsts.PRIMARY_WEAPONS, {
            id: selectedPrimaryWeapon
        })

        if (! weapon) {
            console.error('Could not find primary weapon.', selectedPrimaryWeapon)
            return null
        }

        return weapon
    }

    function secondaryWeapon() {
        if (! selectedSecondaryWeapon)
            return null

        let weapon = _.find(GameConsts.SECONDARY_WEAPONS, {
            id: selectedSecondaryWeapon
        })

        if (!weapon) {
            console.error('Could not find secondary weapon.', selectedSecondaryWeapon)
            return null
        }

        return weapon
    }

    return (
        <div>
            <div
                className="row"
                style="margin-bottom: 10px"
            >
                <div className="col-sm-6">
                    <label>Primary</label>
                    <div
                        className="option-group option-weapon-group align-middle"
                        onClick={ handlePrimaryViewClick('choosePrimary') }
                        style={ { marginBottom: '28px' } }
                    >
                        <div>
                            <img src={ primaryWeapon.image } />
                        </div>
                        <span className="caret"></span>
                        <span className="option-name">{ primaryWeapon.name }</span>
                    </div>

                    <label>Secondary</label>
                    <div
                        className="option-group option-weapon-group align-middle"
                        onClick={ handleSecondaryViewClick('chooseSecondary') }
                    >
                        <div>
                            <img src={ secondaryWeapon.image } />
                        </div>
                        <span className="caret"></span>
                        <span className="option-name">{ secondaryWeapon.name }</span>
                    </div>
                </div>
                <div className="col-sm-6">
                    <label>Character</label>
                    <div
                        className="option-group option-character-group align-middle"
                        onClick={ handleCharacterViewClick('chooseCharacter') }
                    >
                        <div>
                            <img src="/images/characters/Ranger-Steve.png" />
                        </div>
                        <span className="caret"></span>
                        <span className="option-name">Ranger Steve</span>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label>Nickname</label>
                <input
                    className="form-control"
                    defaultValue={ nickname }
                    maxlength="25"
                    onChange={ handleNicknameChange }
                    type="text"
                />
            </div>
            <div className="form-group">
                <label>Sound Effects Volume</label>
                <input
                    defaultValue={ volume }
                    max="1"
                    min="0"
                    onChange={ handleSoundEffectVolumeChange }
                    step=".01"
                    type="range"
                />
            </div>
        </div>
    )
}
