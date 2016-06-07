import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'
import NameGenerator from '../../../lib/NameGenerator'

export default class MainSettingsMenu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            nickname: props.defaultNicknameValue,
            sfxVolume: props.defaultSoundEffectValue,
            musicVolume: props.defaultMusicValue
        }

        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handlePrimaryViewClick = this.handlePrimaryViewClick.bind(this)
        this.handleSecondaryViewClick = this.handleSecondaryViewClick.bind(this)
        this.handleCharacterViewClick = this.handleCharacterViewClick.bind(this)
        this.primaryWeapon = this.primaryWeapon.bind(this)
        this.secondaryWeapon = this.secondaryWeapon.bind(this)
        this.handleGenerateName = this.handleGenerateName.bind(this)
        this.handleMusicVolumeChange = this.handleMusicVolumeChange.bind(this)
    }

    handleGenerateName() {
        const nickname = NameGenerator()
        this.refs.nicknameInput.value = nickname
        this.setState({ nickname })
        this.props.onNicknameChange(nickname)
    }

    handleNicknameChange(evt) {
        if (this.state.nickname.length > 100) return
        const nickname = evt.target.value.slice(0, 100)
        this.setState({ nickname })
        this.props.onNicknameChange(nickname)
    }

    handleMusicVolumeChange(evt) {
        this.props.onMusicVolumeChange(Number(evt.target.value))
    }

    handleSoundEffectVolumeChange(evt) {
        this.props.onSfxVolumeChange(Number(evt.target.value))
    }

    handlePrimaryViewClick() {
        this.props.onViewChange('choosePrimary')
    }

    handleSecondaryViewClick() {
        this.props.onViewChange('chooseSecondary')
    }

    handleCharacterViewClick() {
        this.props.onViewChange('chooseCharacter')
    }

    primaryWeapon() {
        if (! this.props.selectedPrimaryWeapon)
            return null

        let weapon = _.find(GameConsts.PRIMARY_WEAPONS, {
            id: this.props.selectedPrimaryWeapon
        })

        if (! weapon) {
            console.error('Could not find primary weapon.', this.props.selectedPrimaryWeapon)
            return null
        }

        return weapon
    }

    secondaryWeapon() {
        if (! this.props.selectedSecondaryWeapon)
            return null

        let weapon = _.find(GameConsts.SECONDARY_WEAPONS, {
            id: this.props.selectedSecondaryWeapon
        })

        if (! weapon) {
            console.error('Could not find secondary weapon.', this.props.selectedSecondaryWeapon)
            return null
        }

        return weapon
    }

    render() {
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
                            id="open-primary-weapon-menu-button"
                            onClick={ this.handlePrimaryViewClick }
                            style={ { marginBottom: '28px' } }
                        >
                            <div>
                                <img src={ this.primaryWeapon().image } />
                            </div>
                            <span className="caret"></span>
                            <span className="option-name">{ this.primaryWeapon().name }</span>
                        </div>

                        <label>Secondary</label>
                        <div
                            className="option-group option-weapon-group align-middle"
                            id="open-secondary-weapon-menu-button"
                            onClick={ this.handleSecondaryViewClick }
                        >
                            <div>
                                <img src={ this.secondaryWeapon().image } />
                            </div>
                            <span className="caret"></span>
                            <span className="option-name">{ this.secondaryWeapon().name }</span>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <label>Character</label>
                        <div
                            className="option-group option-character-group align-middle"
                            id="open-character-menu-buttom"
                            onClick={ this.handleCharacterViewClick }
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
                    <label>Nickname <span className="pointer" onClick={ this.handleGenerateName }>(Generate Name)</span></label>
                    <input
                        className="form-control"
                        defaultValue={ this.state.nickname }
                        maxLength="100"
                        onChange={ this.handleNicknameChange }
                        ref="nicknameInput"
                        type="text"
                    />
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Sound Effects Volume</label>
                            <input
                                defaultValue={ this.state.sfxVolume }
                                max="1"
                                min="0"
                                onChange={ this.handleSoundEffectVolumeChange }
                                step=".01"
                                type="range"
                            />
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Music Volume</label>
                            <input
                                defaultValue={ this.state.musicVolume }
                                max="1"
                                min="0"
                                onChange={ this.handleMusicVolumeChange }
                                step=".01"
                                type="range"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

MainSettingsMenu.propTypes = {
    defaultMusicValue: PropTypes.number,
    defaultNicknameValue: PropTypes.string,
    defaultSoundEffectValue: PropTypes.number,
    onMusicVolumeChange: PropTypes.func,
    onNicknameChange: PropTypes.func,
    onSoundEffectVolumeChange: PropTypes.func,
    onViewChange: PropTypes.func,
    selectedPrimaryWeapon: PropTypes.string,
    selectedSecondaryWeapon: PropTypes.string
}
