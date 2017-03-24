import React, { Component } from 'react'
import storage from 'store'
import autobind from 'react-autobind'
import toInteger from 'lodash/toInteger'
import get from 'lodash/get'

const getSortedPlayers = require('lib/getSortedPlayers')

import HudChatHistory from './Hud/HudChatHistory'
import HudAnnouncement from './Hud/HudAnnouncement'
import HudKillLog from './Hud/HudKillLog'
import HudChangeWeaponsButton from './Hud/HudChangeWeaponsButton'
import HudSettingsButton from './Hud/HudSettingsButton'
import HudKillingSpree from './Hud/HudKillingSpree'
import HudTimer from './Hud/HudTimer'
import HudGamemode from './Hud/HudGamemode'
import HudTeamScore from './Hud/HudTeamScore'
import HudHealth from './Hud/HudHealth'
import HudJetpack from './Hud/HudJetpack'
import HudAmmo from './Hud/HudAmmo'
import HudKillConfirmed from './Hud/HudKillConfirmed'
import HudLeaderboard from './Hud/HudLeaderboard'
import HudStatsGraph from './Hud/HudStatsGraph'
import SettingsModal from './SettingsModal/SettingsModal'
import LeaderboardModal from './LeaderboardModal/LeaderboardModal'
import RespawnModal from './RespawnModal/RespawnModal'
import emitMessageSend from '../../lib/SocketEvents/emitMessageSend'
import RemainingFuelPercent from '../../lib/RemainingFuelPercent'
import NetworkStats from './NetworkStats/NetworkStats'
import HudNewChatMessage from './Hud/HudNewChatMessage'
import HudPointmatchScore from './Hud/HudPointmatchScore'

export default class GameUi extends Component {
  constructor (props) {
    super(props)
    autobind(this)
  }

  componentDidMount () {
    this.startEventHandler()
  }

  startEventHandler () {
    document.addEventListener('keydown', (e) => {
      const { game, onOpenChatModal, onCloseChatModal, onCloseSettingsModal } = this.props

      if (
        (
          e.keyCode === parseInt(this.props.game.keyboardControls.newChatMessage) ||
          e.keyCode === window.Phaser.Keyboard.ENTER
        ) &&
        !game.chatModalIsOpen &&
        !game.settingsModalIsOpen
      ) {
        e.preventDefault()
        onOpenChatModal()
      }

      if (e.keyCode === window.Phaser.Keyboard.ESC) {
        e.preventDefault()
        onCloseSettingsModal()
        onCloseChatModal()
      }
    })
  }

  handleSendMessage (message) {
    this.props.onCloseChatModal()

    if (message.length === 0) return

    this.props.onReduceToMaxChatMessages()

    emitMessageSend.call(this, message)
  }

  handleSoundEffectVolumeChange (volume) {
    storage.set('sfxVolume', volume)
    this.props.onSfxVolumeChange(volume)
  }

  handleViewChange (view) {
    this.setState({ settingsView: view })
  }

  handlePrimaryGunClick (weapon) {
    this.props.onPrimaryWeaponIdChange(weapon.id)
    storage.set('selectedPrimaryWeaponId', weapon.id)
  }

  handleSecondaryGunClick (weapon) {
    storage.set('selectedSecondaryWeaponId', weapon.id)
    this.props.onSecondaryWeaponIdChange(weapon.id)
  }

  isLeaderboardModalOpen () {
    const {
      room,
      game
    } = this.props

    return (game.leaderboardModalIsOpen || room.state === 'ended')
  }

  handleOpenSettingsButton () {
    const { onOpenSettingsModal, onSettingsViewChange } = this.props

    onOpenSettingsModal()
    onSettingsViewChange('settings')
  }

  handleChangeWeaponsButton () {
    const { onOpenSettingsModal, onSettingsViewChange } = this.props

    onOpenSettingsModal()
    onSettingsViewChange('default')
  }

  render () {
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
      onCloseChatModal
    } = this.props

    const sortedPlayers = getSortedPlayers(room.players)
    const bestPlayer = get(sortedPlayers, '[0].score', 0) > 0
      ? sortedPlayers[0]
      : { nickname: '--', score: 0 }

    const isRespawnModalOpen = player.health <= 0 && room.state !== 'ended'

    const secondsRemaining = room.currentTime
      ? toInteger((room.roundEndTime - room.currentTime) / 1000)
      : 0

    const fuelRemaining = RemainingFuelPercent(player.jumpJetCounter)

    const ammoRemaining = player.currentWeapon === 'primaryWeapon'
      ? player.primaryAmmoRemaining
      : player.secondaryAmmoRemaining

    const isWeaponReloading = (
      player.currentWeapon === 'primaryWeapon' && player.isPrimaryReloading ||
      player.currentWeapon === 'secondaryWeapon' && player.isSecondaryReloading
    )

    return (
      <div>
        <a className='hud-main-menu-button hud-item' href='/'>Back to Main Menu</a>
        <HudKillLog messages={game.killLogMessages} />
        <HudKillingSpree killingSpreeCount={player.killingSpreeCount} />
        <HudTimer secondsRemaining={secondsRemaining} />
        <HudGamemode gamemode={room.gamemode} mod={room.mod} />
        { room.gamemode === 'TeamDeathmatch' &&
          <HudTeamScore
            score1={room.redTeamScore}
            score2={room.blueTeamScore}
          />
        }
        { room.gamemode === 'Pointmatch' &&
          <HudPointmatchScore
            player={bestPlayer}
          />
        }
        <HudHealth health={player.health} />
        <HudJetpack fuelRemaining={fuelRemaining} />
        <HudAmmo
          ammo={ammoRemaining}
          isReloading={isWeaponReloading}
          isSwitching={player.isSwitchingWeapon}
        />
        <HudChangeWeaponsButton onButtonClick={this.handleChangeWeaponsButton} />
        <HudSettingsButton onButtonClick={this.handleOpenSettingsButton} />
        <HudLeaderboard
          players={sortedPlayers}
          room={room}
        />
        { room.announcement &&
          <HudAnnouncement announcement={room.announcement} />
        }
        <HudChatHistory
          messages={game.chatMessages}
        />
        <HudNewChatMessage
          isOpen={game.chatModalIsOpen}
          newChatMessageCharacter={+this.props.game.keyboardControls.newChatMessage}
          onSendMessage={this.handleSendMessage}
          onBlur={onCloseChatModal}
        />

        { this.isLeaderboardModalOpen() &&
          <LeaderboardModal
            players={sortedPlayers}
            room={room}
          />
        }

        { isRespawnModalOpen &&
          <RespawnModal
            onOpenSettingsModal={onOpenSettingsModal}
            onSettingsViewChange={onSettingsViewChange}
            room={room}
          />
        }

        { game.settingsModalIsOpen &&
          <SettingsModal
            game={game}
            mod={room.mod}
            onClose={onCloseSettingsModal}
            onKeyboardControlChange={onKeyboardControlChange}
            onPrimaryGunClick={this.handlePrimaryGunClick}
            onRespawnChange={onSetAutoRespawn}
            onSecondaryGunClick={this.handleSecondaryGunClick}
            onSetResetEventsFlag={onSetResetEventsFlag}
            onSfxVolumeChange={this.handleSoundEffectVolumeChange}
            onViewChange={onSettingsViewChange}
            player={player}
          />
        }

        { window.RS && window.window.RS.networkStats && game.isNetworkStatsVisible &&
          <NetworkStats stats={window.window.RS.networkStats} />
        }

        { game.isFpsStatsVisible &&
          <HudStatsGraph id='stats-panel' />
        }

        { game.showKillConfirmed &&
          <HudKillConfirmed />
        }
      </div>
    )
  }
}
