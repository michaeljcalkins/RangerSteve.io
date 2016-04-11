import React, { PropTypes } from 'react'

export default function MainSettingsMenu(props) {
    const {
        defaultNicknameValue,
        defaultSoundEffectValue,
        onNicknameChange,
        onSoundEffectVolumeChange,
        onViewChange
    } = props

    function handleNicknameChange(evt) {
        onNicknameChange(evt.target.value)
    }

    function handleSoundEffectVolumeChange(evt) {
        onSoundEffectVolumeChange(evt.target.value)
    }

    function handlePrimaryViewClick(evt) {
        onViewChange('choosePrimary')
    }

    function handleSecondaryViewClick(evt) {
        onViewChange('chooseSecondary')
    }

    function handleCharacterViewClick(evt) {
        onViewChange('chooseCharacter')
    }

    return (
        <div>
            <div
                className="row"
                style={ { marginBottom: '10px' } }
            >
                <div className="col-sm-6">
                    <label>Primary</label>
                    <div
                        className="option-group option-weapon-group align-middle"
                        onClick={ handlePrimaryViewClick }
                        style={ { marginBottom: '25px' } }
                    >
                        <div>
                            <img src="/images/guns/Spr_AK47.png" />
                        </div>
                        <span className="caret"></span>
                        <span className="option-name">AK-47</span>
                    </div>

                    <label>Secondary</label>
                    <div
                        className="option-group option-weapon-group align-middle"
                        onClick={ handleSecondaryViewClick }
                    >
                        <div>
                            <img src="/images/guns/Spr_DesertEagle.png" />
                        </div>
                        <span className="caret"></span>
                        <span className="option-name">Desert Eagle</span>
                    </div>
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

}
