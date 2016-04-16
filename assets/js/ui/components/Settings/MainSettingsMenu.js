import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function MainSettingsMenu(props) {
    const {
        defaultNicknameValue,
        defaultSoundEffectValue,
        onNicknameChange,
        onSoundEffectVolumeChange,
        onViewChange,
        selectedPrimaryWeapon,
        selectedSecondaryWeapon
    } = props

    function handleNicknameChange(evt) {
        onNicknameChange(evt.target.value)
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

    function renderPrimaryWeapon() {
        if (!selectedPrimaryWeapon)
            return null

        let weapon = _.find(GameConsts.PRIMARY_WEAPONS, { id: selectedPrimaryWeapon })

        if (!weapon) {
            console.error('Could not find primary weapon.', selectedPrimaryWeapon)
            return null
        }

        return (
            <div
                className="option-group option-weapon-group align-middle"
                onClick={ handlePrimaryViewClick }
                style={ { marginBottom: '28px' } }
            >
                <div>
                    <img src={ weapon.image } />
                </div>
                <span className="caret"></span>
                <span className="option-name">{ weapon.name }</span>
            </div>
        )
    }

    function renderSecondaryWeapon() {
        if (!selectedSecondaryWeapon)
            return null

        let weapon = _.find(GameConsts.SECONDARY_WEAPONS, { id: selectedSecondaryWeapon })

        if (!weapon) {
            console.error('Could not find secondary weapon.', selectedSecondaryWeapon)
            return null
        }

        return (
            <div
                className="option-group option-weapon-group align-middle"
                onClick={ handleSecondaryViewClick }
            >
                <div>
                    <img src={ weapon.image } />
                </div>
                <span className="caret"></span>
                <span className="option-name">{ weapon.name }</span>
            </div>
        )
    }

    return (
        <div>
            <div
                className="row"
                style={ { marginBottom: '10px' } }
            >
                <div className="col-sm-6">
                    <label>Primary</label>
                    { renderPrimaryWeapon() }

                    <label>Secondary</label>
                    { renderSecondaryWeapon() }
                </div>
                <div className="col-sm-6">
                    <label>Character</label>
                    <div
                        className="option-group option-character-group align-middle"
                        onClick={ handleCharacterViewClick }
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
                    defaultValue={ defaultNicknameValue }
                    onChange={ handleNicknameChange }
                    type="text"
                />
            </div>
            <div className="form-group">
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
    )
}

MainSettingsMenu.propTypes = {
    defaultNicknameValue: PropTypes.string,
    defaultSoundEffectValue: PropTypes.number,
    onNicknameChange: PropTypes.func.isRequired,
    onSoundEffectVolumeChange: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
    selectedPrimaryWeapon: PropTypes.string.isRequired,
    selectedSecondaryWeapon: PropTypes.string.isRequired
}
