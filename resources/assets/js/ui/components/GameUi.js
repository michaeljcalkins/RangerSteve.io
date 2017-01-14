import React, { Component } from 'react'
import storage from 'store'
import autobind from 'react-autobind'
import cs from 'classnames'

import HudChatHistory from './Hud/HudChatHistory'
import HudAnnouncement from './Hud/HudAnnouncement'
import HudKillLog from './Hud/HudKillLog'
import HudChangeWeaponsButton from './Hud/HudChangeWeaponsButton'
import HudSettingsButton from './Hud/HudSettingsButton'
import HudKillingSpree from './Hud/HudKillingSpree'
import HudLeaderboard from './Hud/HudLeaderboard'
import HudStatsGraph from './Hud/HudStatsGraph'
import SettingsModal from './SettingsModal/SettingsModal'
import LeaderboardModal from './LeaderboardModal/LeaderboardModal'
import RespawnModal from './RespawnModal/RespawnModal'
import emitMessageSend from '../../lib/SocketEvents/emitMessageSend'
import emitPlayerUpdateNickname from '../../lib/SocketEvents/emitPlayerUpdateNickname'
import NetworkStats from './NetworkStats/NetworkStats'

export default class GameUi extends Component {
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
      room,
      game,
    } = this.props

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
      player,
      room,
      game,
      onCloseSettingsModal,
      onSettingsViewChange,
      onOpenSettingsModal,
      onKeyboardControlChange,
      onSetAutoRespawn,
      onSetResetEventsFlag,
    } = this.props

    const mainMenuButtonClasses = cs('hud-main-menu-button hud-item', {
      'is-electron': window.IS_ELECTRON
    })

    return (
      <div>
        <a className={ mainMenuButtonClasses } href="/">Back to Main Menu</a>
        <HudKillLog messages={ game.killLogMessages } />
        <HudKillingSpree killingSpreeCount={ player.killingSpreeCount } />
        <HudChangeWeaponsButton onButtonClick={ this.handleChangeWeaponsButton } />
        <HudSettingsButton onButtonClick={ this.handleOpenSettingsButton } />
        <HudLeaderboard room={ room } />
        { room.announcement &&
          <HudAnnouncement announcement={ room.announcement }/>
        }
        <HudChatHistory
            isOpen={ game.chatModalIsOpen }
            messages={ game.chatMessages }
            newChatMessageCharacter={ +game.keyboardControls.newChatMessage }
            onSendMessage={ this.handleSendMessage }
        />

        { this.isLeaderboardModalOpen() &&
          <LeaderboardModal room={ room } />
        }

        { player.health <= 0 && room.state !== 'ended' &&
          <RespawnModal
              onOpenSettingsModal={ onOpenSettingsModal }
              onSettingsViewChange={ onSettingsViewChange }
              room={ room }
          />
        }

        { game.settingsModalIsOpen &&
          <SettingsModal
              game={ game }
              onClose={ onCloseSettingsModal }
              onKeyboardControlChange={ onKeyboardControlChange }
              onPrimaryGunClick={ this.handlePrimaryGunClick }
              onRespawnChange={ onSetAutoRespawn }
              onSecondaryGunClick={ this.handleSecondaryGunClick }
              onSetResetEventsFlag={ onSetResetEventsFlag }
              onSfxVolumeChange={ this.handleSoundEffectVolumeChange }
              onViewChange={ onSettingsViewChange }
              player={ player }
          />
        }

        { window.RS && window.RS.networkStats && game.isNetworkStatsVisible &&
          <NetworkStats stats={ window.RS.networkStats } />
        }

        { game.isFpsStatsVisible &&
          <HudStatsGraph id="stats-panel" />
        }
      </div>
    )
  }
}
