import React, { PropTypes } from 'react'
import autobind from 'react-autobind'

import GameConsts from '../../../lib/GameConsts'
import NameGenerator from '../../../lib/NameGenerator'
import WeaponStats from './WeaponStats'

export default class MainSettingsMenu extends React.Component {
    constructor(props) {
        super(props)
        autobind(this)

        this.state = {
            nickname: props.player.nickname,
            sfxVolume: props.game.sfxVolume,
        }
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

    // TODO This function is no longer needed
    primaryWeapon() {
        const { nextSelectedPrimaryWeaponId } = this.props.player
        const weapon = GameConsts.WEAPONS[nextSelectedPrimaryWeaponId]

        if (! weapon) {
            console.error('Could not find primary weapon.', nextSelectedPrimaryWeaponId)
            return null
        }

        return weapon
    }

    // TODO This function is no longer needed
    secondaryWeapon() {
        const { nextSelectedSecondaryWeaponId } = this.props.player
        const weapon = GameConsts.WEAPONS[nextSelectedSecondaryWeaponId]

        if (! weapon) {
            console.error('Could not find secondary weapon.', nextSelectedSecondaryWeaponId)
            return null
        }

        return weapon
    }

    renderPrimaryWeaponImage() {
        const primaryWeapon = this.primaryWeapon()

        if (! primaryWeapon) return null

        return <img src={ '/images/guns/large/' + primaryWeapon.image } />
    }

    renderSecondaryWeaponImage() {
        const secondaryWeapon = this.secondaryWeapon()

        if (! secondaryWeapon) return null

        return <img src={ '/images/guns/large/' + secondaryWeapon.image } />
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-sm-6">
                        <label>Primary Weapon</label>
                        <div
                            className="option-group option-group-lg option-character-group align-middle"
                            id="open-primary-weapon-menu-button"
                            onClick={ this.handlePrimaryViewClick }
                        >
                            <div>
                                { this.renderPrimaryWeaponImage() }
                            </div>
                            <span className="option-name">{ this.primaryWeapon().name }</span>
                            <WeaponStats weapon={ this.primaryWeapon() } />
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <label>Secondary Weapon</label>
                        <div
                            className="option-group option-group-lg option-weapon-group align-middle"
                            id="open-secondary-weapon-menu-button"
                            onClick={ this.handleSecondaryViewClick }
                        >
                            <div>
                                { this.renderSecondaryWeaponImage() }
                            </div>
                            <span className="option-name">{ this.secondaryWeapon().name }</span>
                            <WeaponStats weapon={ this.secondaryWeapon() } />
                        </div>
                    </div>
                </div>

                <div className="row" style={ { marginBottom: '15px' } }>
                    <div className="col-sm-12">
                        <em>Fire rate calculated in rounds per second.</em>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Nickname</label>
                            <input
                                className="form-control"
                                defaultValue={ this.state.nickname }
                                maxLength="25"
                                onChange={ this.handleNicknameChange }
                                ref="nicknameInput"
                                type="text"
                            />
                            <button
                                className="btn btn-primary btn-xs"
                                onClick={ this.handleGenerateName }
                            >
                                Random Nickname
                            </button>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Sound Effects Volume</label>
                            <input
                                defaultValue={ this.state.sfxVolume }
                                max=".13"
                                min="0"
                                onChange={ this.handleSoundEffectVolumeChange }
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
    game: PropTypes.object,
    onNicknameChange: PropTypes.func,
    onSoundEffectVolumeChange: PropTypes.func,
    onViewChange: PropTypes.func,
    player: PropTypes.object,
}
