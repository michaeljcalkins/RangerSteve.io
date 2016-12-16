// @flow
import React from 'react'
import storage from 'store'
import autobind from 'react-autobind'

import HudChatHistory from './Hud/HudChatHistory'
import HudAnnouncement from './Hud/HudAnnouncement'
import HudKillLog from './Hud/HudKillLog'
import HudChangeWeaponsButton from './Hud/HudChangeWeaponsButton'
import HudSettingsButton from './Hud/HudSettingsButton'
import HudKillingSpree from './Hud/HudKillingSpree'
import HudLeaderboard from './Hud/HudLeaderboard'
import SettingsModal from './SettingsModal/SettingsModal'
import LeaderboardModal from './LeaderboardModal/LeaderboardModal'
import RespawnModal from './RespawnModal/RespawnModal'
import emitMessageSend from '../../lib/SocketEvents/emitMessageSend'
import emitPlayerUpdateNickname from '../../lib/SocketEvents/emitPlayerUpdateNickname'

export default class GameUi extends React.Component {
    props: Props

    constructor(props) {
        super(props)
        autobind(this)
    }

    componentDidMount() {
        this.startEventHandler()
    }

    startEventHandler() {
        document.addEventListener('keyup', (e) => {
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

        emitMessageSend.call(this, message)
    }

    handleNicknameChange(nickname) {
        storage.set('nickname', nickname)
        this.props.onNicknameChange(nickname)
        emitPlayerUpdateNickname(this.props.room.id, nickname)
    }

    handleQualityChange(quality) {
        storage.set('quality', quality)
        this.props.onQualityChange(quality)
        window.dispatchEvent(new Event('resize'))
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

    handleOpenSettingsButton() {
        const { onOpenSettingsModal, onSettingsViewChange } = this.props

        onOpenSettingsModal()
        onSettingsViewChange('settings')
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
                onOpenSettingsModal,
                ...props,
            },
        } = this

        return (
            <div>
                <HudKillLog messages={ game.killLogMessages } />
                <HudKillingSpree killingSpreeCount={ player.killingSpreeCount } />
                <HudChangeWeaponsButton onButtonClick={ this.handleChangeWeaponsButton } />
                <HudSettingsButton onButtonClick={ this.handleOpenSettingsButton } />
                <HudLeaderboard room={ room } />
                <HudAnnouncement announcement={ room.announcement } />
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
                    <RespawnModal { ...{
                        onOpenSettingsModal: onOpenSettingsModal,
                        onSettingsViewChange: onSettingsViewChange,
                        ...props } }
                    />
                }

                <SettingsModal
                    game={ game }
                    isOpen={ game.settingsModalIsOpen }
                    onClose={ onCloseSettingsModal }
                    onKeyboardControlChange={ props.onKeyboardControlChange }
                    onNicknameChange={ this.handleNicknameChange }
                    onPrimaryGunClick={ this.handlePrimaryGunClick }
                    onQualityChange={ this.handleQualityChange }
                    onRespawnChange={ props.onSetAutoRespawn }
                    onSecondaryGunClick={ this.handleSecondaryGunClick }
                    onSetResetEventsFlag={ props.onSetResetEventsFlag }
                    onSfxVolumeChange={ this.handleSoundEffectVolumeChange }
                    onViewChange={ onSettingsViewChange }
                    player={ player }
                />

                { (
                    (player.health <= 0 && room.state !== 'ended') ||
                    game.settingsModalIsOpen
                ) &&
                    <div
                        className="modal-backdrop"
                        style={ { display: 'block' } }
                    />
                }
            </div>
        )
    }
}

type Props = {
    game: Object,
    onCloseChatModal: Function,
    onCloseSettingsModal: Function,
    onKeyboardControlChange: Function,
    onNicknameChange: Function,
    onOpenChatModal: Function,
    onOpenSettingsModal: Function,
    onPrimaryWeaponIdChange: Function,
    onQualityChange: Function,
    onReduceToMaxChatMessages: Function,
    onSecondaryWeaponIdChange: Function,
    onSetResetEventsFlag: Function,
    onSettingsViewChange: Function,
    onSfxVolumeChange: Function,
    player: Object,
    room: Object,
}
