import React from 'react'
import store from 'store'

import EventHandler from '../../lib/EventHandler'
import HudChatHistory from '../components/Hud/HudChatHistory'
import HudNewChatMessage from '../components/Hud/HudNewChatMessage'
import HudHealth from '../components/Hud/HudHealth'
import HudJumpJet from '../components/Hud/HudJumpJet'
import HudKillConfirmed from '../components/Hud/HudKillConfirmed'
import HudKillLog from '../components/Hud/HudKillLog'
import HudLeaderboard from '../components/Hud/HudLeaderboard'
import HudScore from '../components/Hud/HudScore'
import HudSettingsButton from '../components/Hud/HudSettingsButton'
import HudKillingSpree from '../components/Hud/HudKillingSpree'
import NameGenerator from '../../lib/NameGenerator'
import SettingsModal from '../components/Settings/SettingsModal'

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
            killLogMessages: [],
            killingSpreeCount: 0,
            nickname: store.get('nickname', NameGenerator()),
            player: {},
            players: [],
            score: 0,
            settingsView: 'main',
            selectedPrimaryWeapon: store.get('selectedPrimaryWeapon', 'AK47'),
            selectedSecondaryWeapon: store.get('selectedSecondaryWeapon', 'DesertEagle'),
            settingsModalOpen: !store.has('nickname'),
            sfxVolume: store.get('sfxVolume', .1),
            musicVolume: store.get('musicVolume', .3)
        }

        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleCloseSettingsModal = this.handleCloseSettingsModal.bind(this)
        this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handlePrimaryGunClick = this.handlePrimaryGunClick.bind(this)
        this.handleSecondaryGunClick = this.handleSecondaryGunClick.bind(this)
        this.handleViewChange = this.handleViewChange.bind(this)
        this.handleMusicVolumeChange = this.handleMusicVolumeChange.bind(this)
    }

    componentDidMount() {
        this.startEventHandler()
        this.handleNicknameChange(this.state.nickname)
    }

    startEventHandler() {
        let lastKillingSpreeCount = 0

        EventHandler.on('player killing spree', (data) => {
            if (data.killingSpree === lastKillingSpreeCount) return

            lastKillingSpreeCount = data.killingSpree

            this.setState({
                killingSpreeCount: data.killingSpree
            })

            if (data.killingSpree === 3) {
                EventHandler.emit('play triplekill')
            } else if (data.killingSpree === 4) {
                EventHandler.emit('play multikill')
            } else if (data.killingSpree === 6) {
                EventHandler.emit('play ultrakill')
            } else if (data.killingSpree === 8) {
                EventHandler.emit('play killingspree')
            } else if (data.killingSpree === 10) {
                EventHandler.emit('play unstoppable')
            } else if (data.killingSpree === 12) {
                EventHandler.emit('play ludicrouskill')
            } else if (data.killingSpree === 14) {
                EventHandler.emit('play rampagekill')
            } else if (data.killingSpree === 15) {
                EventHandler.emit('play monsterkill')
            }

            setTimeout(() => {
                this.setState({
                    killingSpreeCount: 0
                })
            }, 3000)
        })

        let killConfirmedHandle = null
        EventHandler.on('player kill confirmed', () => {
            this.setState({ showKillConfirmed: true })
            clearTimeout(killConfirmedHandle)
            killConfirmedHandle = setTimeout(() => {
                this.setState({ showKillConfirmed: false })
            }, 3000)
        })

        EventHandler.on('player kill log', (data) => {
            let newMessages = Object.assign(this.state.killLogMessages)
            newMessages.push(data)
            this.setState({ killLogMessages: newMessages })

            setTimeout(() => {
                let newMessages = Object.assign(this.state.killLogMessages)
                _.remove(newMessages, data)
                this.setState({ killLogMessages: newMessages })
            }, 10000)
        })

        EventHandler.on('message received', (data) => {
            let newMessages = Object.assign(this.state.messages)
            newMessages.push(data)
            this.setState({ messages: newMessages })
        })

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
            this.setState({ player: data.player })
        })

        EventHandler.on('settings open', () => {
            this.setState({ settingsModalOpen: true })
            EventHandler.emit('input disable')
        })

        EventHandler.on('settings close', () => {
            this.setState({ settingsModalOpen: false })
            EventHandler.emit('input enable')
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

        $(document).keyup(function(e) {
            if (e.keyCode == 27) {
                EventHandler.emit('settings close')
                EventHandler.emit('chat close')
            }
        });
    }

    handleSendMessage(message) {
        if (message.length > 0) {
            EventHandler.emit('message send', { message })
        }
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
        store.set('nickname', nickname)
    }

    handleSoundEffectVolumeChange(volume) {
        this.setState({ sfxVolume: volume })
        EventHandler.emit('sfx volume update', { volume })
        store.set('sfxVolume', volume)
    }

    handleMusicVolumeChange(volume) {
        this.setState({ musicVolume: volume })
        EventHandler.emit('music volume update', { volume })
        store.set('musicVolume', volume)
    }

    handlePrimaryGunClick(weapon) {
        this.setState({ selectedPrimaryWeapon: weapon.id })

        EventHandler.emit('primary weapon update', weapon)
        store.set('selectedPrimaryWeapon', weapon.id)
    }

    handleSecondaryGunClick(weapon) {
        this.setState({ selectedSecondaryWeapon: weapon.id })
        EventHandler.emit('secondary weapon update', weapon)
        store.set('selectedSecondaryWeapon', weapon.id)
    }

    handleViewChange(view) {
        this.setState({ settingsView: view })
    }

    render() {
        return (
            <div>
                <HudKillConfirmed showKillConfirmed={ this.state.showKillConfirmed } />
                <HudKillLog messages={ this.state.killLogMessages } />
                <HudKillingSpree killingSpreeCount={ this.state.killingSpreeCount } />
                <HudHealth health={ this.state.health } />
                <HudScore score={ this.state.score } />
                <HudLeaderboard players={ this.state.players } />
                <HudJumpJet jumpJetCounter={ this.state.jumpJetCounter } />
                <HudSettingsButton onButtonClick={ this.handleSettingsButtonClick } />
                <HudNewChatMessage
                    isOpen={ this.state.chatModalOpen }
                    onSendMessage={ this.handleSendMessage }
                />
                <HudChatHistory messages={ this.state.messages } />
                <SettingsModal
                    defaultMusicValue={ this.state.musicVolume }
                    defaultNicknameValue={ this.state.nickname }
                    defaultSoundEffectValue={ this.state.sfxVolume }
                    isOpen={ this.state.settingsModalOpen }
                    onClose={ this.handleCloseSettingsModal }
                    onMusicVolumeChange={ this.handleMusicVolumeChange }
                    onNicknameChange={ this.handleNicknameChange }
                    onPrimaryGunClick={ this.handlePrimaryGunClick }
                    onSecondaryGunClick={ this.handleSecondaryGunClick }
                    onSoundEffectVolumeChange={ this.handleSoundEffectVolumeChange }
                    onViewChange={ this.handleViewChange }
                    player={ this.state.player }
                    selectedPrimaryWeapon={ this.state.selectedPrimaryWeapon }
                    selectedSecondaryWeapon={ this.state.selectedSecondaryWeapon }
                    settingsView={ this.state.settingsView }
                />
            </div>
        )
    }
}
