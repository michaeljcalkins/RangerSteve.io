import React, { PropTypes } from 'react'
import storage from 'store'

import HudChatHistory from './Hud/HudChatHistory'
import HudNewChatMessage from './Hud/HudNewChatMessage'
import HudHealth from './Hud/HudHealth'
import HudJumpJet from './Hud/HudJumpJet'
import HudKillConfirmed from './Hud/HudKillConfirmed'
import HudKillLog from './Hud/HudKillLog'
import HudLeaderboard from './Hud/HudLeaderboard'
import HudAmmo from './Hud/HudAmmo'
import HudScore from './Hud/HudScore'
import HudTimer from './Hud/HudTimer'
import HudSettingsButton from './Hud/HudSettingsButton'
import HudKillingSpree from './Hud/HudKillingSpree'
import SettingsModal from './Settings/SettingsModal'
import EndOfRoundLeaderboard from './Round/EndOfRoundLeaderboard'
import RespawnModal from './Respawn/RespawnModal'
import emitMessageSend from '../../lib/SocketEvents/emitMessageSend'
import LoadingScreen from './LoadingScreen/LoadingScreen'

export default class GameUi extends React.Component {
    constructor(props) {
        super(props)

        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handleViewChange = this.handleViewChange.bind(this)
        this.handleMusicVolumeChange = this.handleMusicVolumeChange.bind(this)
        this.renderEndOfRoundLeaderboard = this.renderEndOfRoundLeaderboard.bind(this)
        this.handlePrimaryGunClick = this.handlePrimaryGunClick.bind(this)
        this.handleSecondaryGunClick = this.handleSecondaryGunClick.bind(this)
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

            if (e.keyCode === this.props.game.keyboardControls.newChatMessage && !game.chatModalIsOpen && !game.settingsModalIsOpen) {
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

        this.props.onCloseChatModal()
        this.props.onReduceToMaxChatMessages()

        emitMessageSend.call(this, {
            roomId: this.props.room.id,
            playerId: '/#' + window.socket.id,
            playerNickname: this.props.player.nickname ? this.props.player.nickname : 'Unnamed Ranger',
            message
        })
    }

    handleNicknameChange(nickname) {
        storage.set('nickname', nickname)
        this.props.onNicknameChange(nickname)
        window.socket.emit('player update nickname', {
            roomId: this.props.room.id,
            nickname
        })
    }

    handleSoundEffectVolumeChange(volume) {
        storage.set('sfxVolume', volume)
        this.props.onSfxVolumeChange(volume)
    }

    handleMusicVolumeChange(volume) {
        storage.set('musicVolume', volume)
        this.props.onMusicVolumeChange(volume)
    }

    handleViewChange(view) {
        this.setState({ settingsView: view })
    }

    handlePrimaryGunClick(weapon) {
        this.props.onPrimaryWeaponIdChange(weapon.id)
        storage.set('selectedPrimaryWeaponId', weapon.id)
    }

    handleSecondaryGunClick(weapon) {
        storage.set('selectedSecondaryWeaponId', weapon.id)
        this.props.onSecondaryWeaponIdChange(weapon.id)
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
            onSettingsViewChange
        } = this.props

        return (
            <div>
                { game.state === 'loading' && <LoadingScreen /> }
                <HudAmmo ammoRemaining={ player.ammoRemaining } />
                <HudKillConfirmed showKillConfirmed={ game.showKillConfirmed } />
                <HudKillLog messages={ game.killLogMessages } />
                <HudKillingSpree killingSpreeCount={ player.killingSpreeCount } />
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
                <HudChatHistory messages={ game.chatMessages } />
                { this.renderEndOfRoundLeaderboard() }
                <RespawnModal
                    isOpen={ player.health <= 0 && room.state !== 'ended' }
                    player={ player }
                />
                <SettingsModal
                    game={ game }
                    isOpen={ game.settingsModalIsOpen }
                    onClose={ onCloseSettingsModal }
                    onKeyboardControlChange={ this.props.onKeyboardControlChange }
                    onMusicVolumeChange={ this.handleMusicVolumeChange }
                    onNicknameChange={ this.handleNicknameChange }
                    onPrimaryGunClick={ this.handlePrimaryGunClick }
                    onSecondaryGunClick={ this.handleSecondaryGunClick }
                    onSetResetEventsFlag={ this.props.onSetResetEventsFlag }
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
    onKeyboardControlChange: PropTypes.func.isRequired,
    onMusicVolumeChange: PropTypes.func.isRequired,
    onNicknameChange: PropTypes.func.isRequired,
    onOpenChatModal: PropTypes.func.isRequired,
    onOpenSettingsModal: PropTypes.func.isRequired,
    onPrimaryWeaponIdChange: PropTypes.func.isRequired,
    onReduceToMaxChatMessages: PropTypes.func.isRequired,
    onSecondaryWeaponIdChange: PropTypes.func.isRequired,
    onSetResetEventsFlag: PropTypes.func,
    onSettingsViewChange: PropTypes.func.isRequired,
    onSfxVolumeChange: PropTypes.func.isRequired,
    player: PropTypes.object.isRequired,
    room: PropTypes.object.isRequired
}
