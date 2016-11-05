import React, { PropTypes } from 'react'
import storage from 'store'
import autobind from 'react-autobind'
import $ from 'jquery'

import HudChatHistory from './Hud/HudChatHistory'
import HudKillLog from './Hud/HudKillLog'
import HudChangeWeaponsButton from './Hud/HudChangeWeaponsButton'
import HudKeyboardControlsButton from './Hud/HudKeyboardControlsButton'
import HudKillingSpree from './Hud/HudKillingSpree'
import HudLeaderboard from './Hud/HudLeaderboard'
import SettingsModal from './SettingsModal/SettingsModal'
import LeaderboardModal from './LeaderboardModal/LeaderboardModal'
import RespawnModal from './RespawnModal/RespawnModal'
import emitMessageSend from '../../lib/SocketEvents/emitMessageSend'

export default class GameUi extends React.Component {
    constructor(props) {
        super(props)
        autobind(this)
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

            if (e.keyCode === parseInt(this.props.game.keyboardControls.newChatMessage) && !game.chatModalIsOpen && !game.settingsModalIsOpen) {
                e.preventDefault()
                this.props.onOpenChatModal()
            }
        })
    }

    handleSendMessage(message) {
        this.props.onCloseChatModal()

        if (message.length === 0) return

        this.props.onReduceToMaxChatMessages()

        emitMessageSend.call(this, {
            roomId: this.props.room.id,
            playerId: '/#' + window.socket.id,
            playerNickname: this.props.player.nickname ? this.props.player.nickname : 'Unnamed Ranger',
            message,
        })
    }

    handleNicknameChange(nickname) {
        storage.set('nickname', nickname)
        this.props.onNicknameChange(nickname)
        window.socket.emit('player update nickname', {
            roomId: this.props.room.id,
            nickname,
        })
    }

    handleSoundEffectVolumeChange(volume) {
        storage.set('sfxVolume', volume)
        this.props.onSfxVolumeChange(volume)
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

    isLeaderboardModalOpen() {
        const {
            props: {
                room,
                game,
            },
        } = this

        return (game.leaderboardModalIsOpen || room.state === 'ended')
    }

    handleOpenKeyboardControlsButton() {
        const { onOpenSettingsModal, onSettingsViewChange } = this.props

        onOpenSettingsModal()
        onSettingsViewChange('controls')
    }

    handleChangeWeaponsButton() {
        const { onOpenSettingsModal, onSettingsViewChange } = this.props

        onOpenSettingsModal()
        onSettingsViewChange('default')
    }

    render() {
        const {
            props: {
                player,
                room,
                game,
                onCloseSettingsModal,
                onSettingsViewChange,
            },
        } = this

        return (
            <div>
                <HudKillLog messages={ game.killLogMessages } />
                <HudKillingSpree killingSpreeCount={ player.killingSpreeCount } />
                <HudChangeWeaponsButton onButtonClick={ this.handleChangeWeaponsButton } />
                <HudKeyboardControlsButton onButtonClick={ this.handleOpenKeyboardControlsButton } />
                <HudLeaderboard room={ room } />
                <HudChatHistory
                    isOpen={ game.chatModalIsOpen }
                    messages={ game.chatMessages }
                    newChatMessageCharacter={ +game.keyboardControls.newChatMessage }
                    onSendMessage={ this.handleSendMessage }
                />

                { this.isLeaderboardModalOpen() &&
                    <LeaderboardModal
                        players={ room.players }
                        room={ room }
                        roundStartTime={ room.roundStartTime }
                    />
                }

                { player.health <= 0 && room.state !== 'ended' &&
                    <RespawnModal player={ player } room={ room } />
                }

                <SettingsModal
                    game={ game }
                    isOpen={ game.settingsModalIsOpen }
                    onClose={ onCloseSettingsModal }
                    onKeyboardControlChange={ this.props.onKeyboardControlChange }
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
    room: PropTypes.object.isRequired,
}
