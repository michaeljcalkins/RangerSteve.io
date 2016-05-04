import React from 'react'

import EventHandler from '../../lib/EventHandler'
import HudHealth from '../components/Hud/HudHealth.vue'
import HudScore from '../components/Hud/HudScore.vue'
import HudLeaderboard from '../components/Hud/HudLeaderboard.vue'
import HudSettingsButton from '../components/Hud/HudSettingsButton.vue'
import HudJumpJet from '../components/Hud/HudJumpJet.vue'
import HudKillConfirmed from '../components/Hud/HudKillConfirmed.vue'
import HudChatMessage from '../components/Hud/HudChatMessage.vue'
import HudChat from '../components/Hud/HudChat.vue'
import SettingsModal from '../components/Settings/SettingsModal.vue'

export default class GameUiContainer extends React.Component {
    constructor() {
        super()

        this.state = {
            chatModalOpen: false,
            currentWeapon: 1,
            health: 100,
            showKillConfirmed: false,
            jumpJetCounter: 0,
            messages: [],
            nickname: 'Unamed Ranger',
            player: {},
            players: [],
            score: 0,
            settingsView: 'main',
            selectedPrimaryWeapon: 'AK47',
            selectedSecondaryWeapon: 'DesertEagle',
            settingsModalOpen: false,
            volume: .5
        }

        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleCloseSettingsModal = this.handleCloseSettingsModal.bind(this)
        this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handlePrimaryGunClick = this.handlePrimaryGunClick.bind(this)
        this.handleSecondaryGunClick = this.handleSecondaryGunClick.bind(this)
        this.handleViewChange = this.handleViewChange.bind(this)
    }

    componentDidMount() {
        let killConfirmedHandle = null
        EventHandler.on('player kill confirmed', () => {
            this.showKillConfirmed = true
            clearTimeout(killConfirmedHandle)
            killConfirmedHandle = setTimeout(() => {
                this.showKillConfirmed = false
            }, 3000)
        })

        EventHandler.on('message received', (data) => {
            this.setState({
                messages: this.state.messages.push(data)
            })
        })

        EventHandler.on('health update', (health) => {
            this.setState({ helath })
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
            this.setState({ player })
        })

        EventHandler.on('settings open', () => {
            this.setState({ settingsModalOpen: true })
            EventHandler.emit('input disable')
        })

        EventHandler.on('chat open', () => {
            this.setState({ chatModalOpen: true })
            EventHandler.emit('input disable')
        })

        EventHandler.on('chat close', () => {
            this.setState({ chatModalOpen: false })
            EventHandler.emit('input enable')
        })

        EventHandler.on('player jump jet update', (data) => {
            this.setState({ jumpJetCounter: data.jumpJetCounter })
        })
    }

    handleSendMessage(message) {
        EventHandler.emit('message send', { message })
        this.setState({ chatModalOpen: false })
        EventHandler.emit('input enable')
    }

    handleCloseSettingsModal() {
        this.setState({ settingsModalOpen: false })
        this.setState({ settingsView: 'main' })
        EventHandler.emit('input enable')
    }

    handleSettingsButtonClick() {
        this.setState({ settingsModalOpen: true })
        this.setState({ settingsView: 'main' })
        EventHandler.emit('input disable')
    }

    handleNicknameChange(nickname) {
        this.setState({ nickname })
        EventHandler.emit('player update nickname', { nickname })
    }

    handleSoundEffectVolumeChange(volume) {
        this.setState({ volume })
        EventHandler.emit('volume update', { volume })
    }

    handlePrimaryGunClick(weapon) {
        this.setState({ selectedPrimaryWeapon: weapon.id })
        toastr.clear()
        toastr.info('Your weapon will change the next time you respawn.')
        EventHandler.emit('primary weapon update', weapon)
    }

    handleSecondaryGunClick(weapon) {
        this.setState({ selectedSecondaryWeapon: weapon.id })
        toastr.clear()
        toastr.info('Your weapon will change the next time you respawn.')
        EventHandler.emit('secondary weapon update', weapon)
    }

    handleViewChange(view) {
        this.setState({ settingsView: view })
    }

    render() {
        return (
            <div>
                <HudKillConfirmed showKillConfirmed={ this.state.showKillConfirmed } />
                <HudHealth health={ this.state.health } />
                <HudScore score={ this.state.score } />
                <HudLeaderboard players={ this.state.players } />
                <HudJumpJet jumpJetCounter={ this.state.jumpJetCounter } />
                <HudSettingsButton onButtonClick={ this.handleSettingsButtonClick } />
                <HudChatMessage
                    isOpen={ this.state.chatModalOpen }
                    onSendMessage={ this.handleSendMessage }
                />
                <HudChat messages={ this.state.messages } />
                <SettingsModal
                    defaultNicknameValue={ this.state.nickname }
                    defaultSoundEffectValue={ this.state.volume }
                    isOpen={ this.state.settingsModalOpen }
                    onClose={ this.state.handleCloseSettingsModal }
                    onNicknameChange={ this.state.handleNicknameChange }
                    onPrimaryGunClick={ this.state.handlePrimaryGunClick }
                    onSecondaryGunClick={ this.state.handleSecondaryGunClick }
                    onSoundEffectVolumeChange={ this.state.handleSoundEffectVolumeChange }
                    onViewChange={ this.state.handleViewChange }
                    player={ this.state.player }
                    selectedPrimaryWeapon={ this.state.selectedPrimaryWeapon }
                    selectedSecondaryWeapon={ this.state.selectedSecondaryWeapon }
                    settingsView={ this.state.settingsView }
                />
            </div>
        )
    }
}
