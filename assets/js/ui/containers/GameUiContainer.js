import React from 'react'
import EventHandler from '../../lib/EventHandler'

import {
    HudHealth,
    HudScore,
    HudLeaderboard,
    HudSettingsButton,
    HudJumpJet
} from '../components/Hud'
import SettingsModal from '../components/Settings/SettingsModal'

export default class GameUiContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            jumpJetCounter: 0,
            health: '100',
            score: '0',
            currentWeapon: 1,
            players: [],
            player: {},
            volume: .5,
            nickname: 'Unamed Ranger',
            settingsModalOpen: false,
            selectedPrimaryWeapon: 'AK47',
            selectedSecondaryWeapon: 'DesertEagle'
        }

        this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSecondaryGunClick = this.handleSecondaryGunClick.bind(this)
        this.handlePrimaryGunClick = this.handlePrimaryGunClick.bind(this)

        EventHandler.on('health update', (health) => {
            this.setState({ health })
        })

        EventHandler.on('score update', (score) => {
            this.setState({ score })
        })

        EventHandler.on('weapon update', (currentWeapon) => {
            this.setState({ currentWeapon })
        })

        EventHandler.on('players update', (players) => {
            this.setState({ players })
        })

        EventHandler.on('player update', (data) => {
            this.setState({
                player: data.player
            })
        })

        EventHandler.on('settings open', (data) => {
            this.setState({
                settingsModalOpen: !this.state.settingsModalOpen
            })
        })

        EventHandler.on('player jump jet update', (data) => {
            this.setState({
                jumpJetCounter: data.jumpJetCounter
            })
        })
    }

    handleSettingsButtonClick() {
        this.setState({
            settingsModalOpen: !this.state.settingsModalOpen
        })
    }

    handleNicknameChange(nickname) {
        EventHandler.emit('player update nickname', { nickname })
        this.setState({ nickname })
    }

    handleSoundEffectVolumeChange(volume) {
        EventHandler.emit('volume update', { volume })
        this.setState({ volume })
    }

    handlePrimaryGunClick(weapon) {
        EventHandler.emit('primary weapon update', weapon)
        this.setState({
            selectedPrimaryWeapon: weapon.id
        })
        toastr.info('Your weapon will change the next time you respawn.')
    }

    handleSecondaryGunClick(weapon) {
        EventHandler.emit('secondary weapon update', weapon)
        this.setState({
            selectedSecondaryWeapon: weapon.id
        })
        toastr.info('Your weapon will change the next time you respawn.')
    }

    render() {
        return (
            <div>
                <HudHealth
                    health={ this.state.health }
                />
                <HudScore
                    score={ this.state.score }
                />
                <HudLeaderboard
                    players={ this.state.players }
                />
                <HudJumpJet
                    jumpJetCounter={ this.state.jumpJetCounter }
                />
                <HudSettingsButton
                    onButtonClick={ this.handleSettingsButtonClick }
                />
                <SettingsModal
                    defaultNicknameValue={ this.state.nickname }
                    defaultSoundEffectValue={ this.state.volume }
                    isOpen={ this.state.settingsModalOpen }
                    onClose={ this.handleSettingsButtonClick }
                    onNicknameChange={ this.handleNicknameChange }
                    onPrimaryGunClick={ this.handlePrimaryGunClick }
                    onSecondaryGunClick={ this.handleSecondaryGunClick }
                    onSoundEffectVolumeChange={ this.handleSoundEffectVolumeChange }
                    player={ this.state.player }
                    selectedPrimaryWeapon={ this.state.selectedPrimaryWeapon }
                    selectedSecondaryWeapon={ this.state.selectedSecondaryWeapon }
                />
            </div>
        )
    }
}
