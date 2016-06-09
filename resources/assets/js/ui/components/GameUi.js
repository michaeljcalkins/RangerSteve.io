import React, { PropTypes } from 'react'
import store from 'store'

import HudChatHistory from './Hud/HudChatHistory'
import HudNewChatMessage from './Hud/HudNewChatMessage'
import HudHealth from './Hud/HudHealth'
import HudJumpJet from './Hud/HudJumpJet'
import HudKillConfirmed from './Hud/HudKillConfirmed'
import HudKillLog from './Hud/HudKillLog'
import HudLeaderboard from './Hud/HudLeaderboard'
import HudScore from './Hud/HudScore'
import HudTimer from './Hud/HudTimer'
import HudSettingsButton from './Hud/HudSettingsButton'
import HudKillingSpree from './Hud/HudKillingSpree'
import SettingsModal from './Settings/SettingsModal'
import EndOfRoundLeaderboard from './Round/EndOfRoundLeaderboard'
import emitMessageSend from '../../lib/SocketEvents/emitMessageSend'

export default class GameUi extends React.Component {
    constructor(props) {
        super(props)

        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handleViewChange = this.handleViewChange.bind(this)
        this.handleMusicVolumeChange = this.handleMusicVolumeChange.bind(this)
        this.renderEndOfRoundLeaderboard = this.renderEndOfRoundLeaderboard.bind(this)
        this.handleSelectPrimaryClick = this.handleSelectPrimaryClick.bind(this)
        this.handleSelectSecondaryClick = this.handleSelectSecondaryClick.bind(this)
    }

    componentDidMount() {
        this.startEventHandler()
    }

    startEventHandler() {
        $(document).keyup((e) => {
            const game = this.props.game

            if (e.keyCode === Phaser.Keyboard.ESC) {
                e.preventDefault()
                this.props.onCloseSettingsModal()
                this.props.onCloseChatModal()
            }

            if (e.keyCode === Phaser.Keyboard.T && !game.chatModalIsOpen && !game.settingsModalIsOpen) {
                e.preventDefault()
                this.props.onOpenChatModal()
            }

            if (e.keyCode === Phaser.Keyboard.TAB && !game.chatModalIsOpen && !game.settingsModalIsOpen) {
                e.preventDefault()
                this.props.onOpenSettingsModal()
            }
        })
    }

    handleSendMessage(message) {
        if (message.length === 0) return
        emitMessageSend.call(this, {
            roomId: this.props.room.id,
            playerId: '/#' + window.socket.id,
            playerNickname: this.props.player.nickname ? this.props.player.nickname : 'Unnamed Ranger',
            message
        })
    }

    handleNicknameChange(nickname) {
        store.set('nickname', nickname)
        this.props.onNicknameChange(nickname)
        window.socket.emit('player update nickname', {
            roomId: this.props.room.id,
            nickname: data.nickname
        })
    }

    handleSoundEffectVolumeChange(volume) {
        store.set('sfxVolume', volume)
        this.props.onSfxVolumeChange(volume)
    }

    handleMusicVolumeChange(volume) {
        store.set('musicVolume', volume)
        this.props.onMusicVolumeChange(volume)
    }

    handleViewChange(view) {
        this.setState({ settingsView: view })
    }

    handleSelectPrimaryClick(weapon) {
        this.game.store.getState().player.selectedPrimaryWeaponId = weapon.id
    }

    handleSelectSecondaryClick(weapon) {
        this.game.store.getState().player.selectedSecondaryWeaponId = weapon.id
    }

    renderEndOfRoundLeaderboard() {
        if (this.props.room.state !== 'ended')
            return null

        return (
            <EndOfRoundLeaderboard
                players={ this.props.room.players }
                roundStartTime={ this.props.room.roundStartTime }
            />
        )
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
                    isOpen={ game.settingsModalIsOpen }
                    game={ game }
                    onClose={ onCloseSettingsModal }
                    onMusicVolumeChange={ this.handleMusicVolumeChange }
                    onNicknameChange={ this.handleNicknameChange }
                    onPrimaryGunClick={ this.handlePrimaryGunClick }
                    onSecondaryGunClick={ this.handleSecondaryGunClick }
                    onSfxVolumeChange={ this.handleSoundEffectVolumeChange }
                    onViewChange={ onSettingsViewChange }
                    player={ player }
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
    onOpenChatModal: PropTypes.func.isRequired,
    onOpenSettingsModal: PropTypes.func.isRequired,
    onSettingsViewChange: PropTypes.func.isRequired,
    onSfxVolumeChange: PropTypes.func.isRequired,
    player: PropTypes.object.isRequired,
    room: PropTypes.object.isRequired
}
