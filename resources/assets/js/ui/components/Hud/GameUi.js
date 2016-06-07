import React, { PropTypes } from 'react'
import store from 'store'

import EventHandler from '../../../lib/EventHandler'
import HudChatHistory from './HudChatHistory'
import HudNewChatMessage from './HudNewChatMessage'
import HudHealth from './HudHealth'
import HudJumpJet from './HudJumpJet'
import HudKillConfirmed from './HudKillConfirmed'
import HudKillLog from './HudKillLog'
import HudLeaderboard from './HudLeaderboard'
import HudScore from './HudScore'
import HudTimer from './HudTimer'
import HudSettingsButton from './HudSettingsButton'
import HudKillingSpree from './HudKillingSpree'
import SettingsModal from '../Settings/SettingsModal'
import EndOfRoundLeaderboard from '../Round/EndOfRoundLeaderboard'

export default class GameUi extends React.Component {
    constructor(props) {
        super(props)

        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handlePrimaryGunClick = this.handlePrimaryGunClick.bind(this)
        this.handleSecondaryGunClick = this.handleSecondaryGunClick.bind(this)
        this.handleViewChange = this.handleViewChange.bind(this)
        this.handleMusicVolumeChange = this.handleMusicVolumeChange.bind(this)
        this.renderEndOfRoundLeaderboard = this.renderEndOfRoundLeaderboard.bind(this)
    }

    componentDidMount() {
        this.startEventHandler()
        // this.handleNicknameChange(this.state.nickname)
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

        EventHandler.on('player update', (data) => {
            this.setState({ player: data.player })
        })

        $(document).keyup((e) => {
            if (e.keyCode !== 27) return
            this.props.onCloseSettingsModal()
            this.props.onCloseChatModal()
        });
    }

    handleSendMessage(message) {
        if (message.length > 0) {
            EventHandler.emit('message send', { message })
        }
        this.setState({ chatModalOpen: false })
        EventHandler.emit('input enable')
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

    renderEndOfRoundLeaderboard() {
        const { room } = this.props

        if (_.get(this, 'room.state', false) === 'ended') {
            return (
                <EndOfRoundLeaderboard
                    players={ room.players }
                    roundStartTime={ room.roundStartTime }
                />
            )
        }

        return null
    }

    render() {
        const {
            player,
            room,
            game,
            onCloseSettingsModal,
            onOpenSettingsModal,
            onSettingsViewChange,
            onMusicVolumeChange,
            onSfxVolumeChange,
            onNicknameChange
        } = this.props

        return (
            <div>
                <HudKillConfirmed showKillConfirmed={ game.showKillConfirmed } />
                <HudKillLog messages={ game.killLogMessages } />
                <HudKillingSpree killingSpreeCount={ game.killingSpreeCount } />
                <HudHealth health={ player.health } />
                <HudScore score={ player.score } />
                <HudTimer roundEndTime={ room.roundEndTime } />
                <HudLeaderboard players={ room.players } />
                <HudJumpJet jumpJetCounter={ player.jumpJetCounter } />
                <HudSettingsButton onButtonClick={ onOpenSettingsModal } />
                <HudNewChatMessage
                    isOpen={ game.chatModalIsOpen }
                    onSendMessage={ this.handleSendMessage }
                />
                <HudChatHistory messages={ game.messages } />
                { this.renderEndOfRoundLeaderboard() }
                <SettingsModal
                    defaultMusicValue={ player.musicVolume }
                    defaultNicknameValue={ player.nickname }
                    defaultSoundEffectValue={ player.sfxVolume }
                    isOpen={ game.settingsModalIsOpen }
                    onClose={ onCloseSettingsModal }
                    onMusicVolumeChange={ onMusicVolumeChange }
                    onNicknameChange={ onNicknameChange }
                    onPrimaryGunClick={ this.handlePrimaryGunClick }
                    onSecondaryGunClick={ this.handleSecondaryGunClick }
                    onSfxVolumeChange={ onSfxVolumeChange }
                    onViewChange={ onSettingsViewChange }
                    player={ player }
                    selectedPrimaryWeapon={ player.selectedPrimaryWeapon }
                    selectedSecondaryWeapon={ player.selectedSecondaryWeapon }
                    settingsView={ game.settingsView }
                />
            </div>
        )
    }
}

GameUi.propTypes = {
    game: PropTypes.object.isRequired,
    onCloseChatModal: PropTypes.func.isRequired,
    onCloseSettingsModal: PropTypes.func.isRequired,
    onMusicVolumeChange: PropTypes.func.isRequired,
    onNicknameChange: PropTypes.func.isRequired,
    onOpenSettingsModal: PropTypes.func.isRequired,
    onSettingsViewChange: PropTypes.func.isRequired,
    onSfxVolumeChange: PropTypes.func.isRequired,
    player: PropTypes.object.isRequired,
    room: PropTypes.object.isRequired
}
