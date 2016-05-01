<template>
    <hud-kill-confirmed :show-kill-confirmed="showKillConfirmed"></hud-kill-confirmed>
    <hud-health :health="health"></hud-health>
    <hud-score :score="score"></hud-score>
    <hud-leaderboard :players="players"></hud-leaderboard>
    <hud-jump-jet :jump-jet-counter="jumpJetCounter"></hud-jump-jet>
    <hud-settings-button
        :on-button-click="handleSettingsButtonClick"
    ></hud-settings-button>
    <settings-modal
        :default-nickname-value="nickname"
        :default-sound-effect-value="volume"
        :is-open="settingsModalOpen"
        :on-view-change="handleViewChange"
        :on-close="handleSettingsButtonClick"
        :on-nickname-change="handleNicknameChange"
        :on-primary-gun-click="handlePrimaryGunClick"
        :on-secondary-gun-click="handleSecondaryGunClick"
        :on-sound-effect-volume-change="handleSoundEffectVolumeChange"
        :settings-view="settingsView"
        :player="player"
        :selected-primary-weapon="selectedPrimaryWeapon"
        :selected-secondary-weapon="selectedSecondaryWeapon"
    ></settings-modal>
</template>

<script>
import EventHandler from '../../lib/EventHandler'
import HudHealth from '../components/Hud/HudHealth.vue'
import HudScore from '../components/Hud/HudScore.vue'
import HudLeaderboard from '../components/Hud/HudLeaderboard.vue'
import HudSettingsButton from '../components/Hud/HudSettingsButton.vue'
import HudJumpJet from '../components/Hud/HudJumpJet.vue'
import HudKillConfirmed from '../components/Hud/HudKillConfirmed.vue'
import SettingsModal from '../components/Settings/SettingsModal.vue'

export default {
    components: {
        HudHealth,
        HudScore,
        HudLeaderboard,
        HudSettingsButton,
        HudJumpJet,
        HudKillConfirmed,
        SettingsModal
    },
    data: function() {
        return {
            currentWeapon: 1,
            health: 100,
            showKillConfirmed: false,
            jumpJetCounter: 0,
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
    },
    created: function() {
        let killConfirmedHandle = null
        EventHandler.on('player kill confirmed', () => {
            this.showKillConfirmed = true
            clearTimeout(killConfirmedHandle)
            killConfirmedHandle = setTimeout(() => {
                this.showKillConfirmed = false
            }, 3000)
        })

        EventHandler.on('health update', (health) => {
            this.health = health
        })

        EventHandler.on('score update', (score) => {
            this.score = score
        })

        EventHandler.on('weapon update', (currentWeapon) => {
            this.currentWeapon = currentWeapon
        })

        EventHandler.on('players update', (players) => {
            this.players = players
        })

        EventHandler.on('player update', (data) => {
            this.player = data.player
        })

        EventHandler.on('settings open', (data) => {
            this.settingsModalOpen = !this.settingsModalOpen
        })

        EventHandler.on('player jump jet update', (data) => {
            this.jumpJetCounter = data.jumpJetCounter
        })
    },
    methods: {
        handleSettingsButtonClick: function() {
            this.settingsModalOpen = !this.settingsModalOpen
            this.settingsView = 'main'
        },

        handleNicknameChange: function(nickname) {
            EventHandler.emit('player update nickname', { nickname })
            this.nickname = nickname
        },

        handleSoundEffectVolumeChange: function(volume) {
            EventHandler.emit('volume update', { volume })
            this.volume = volume
        },

        handlePrimaryGunClick: function(weapon) {
            EventHandler.emit('primary weapon update', weapon)
            this.selectedPrimaryWeapon = weapon.id
            toastr.info('Your weapon will change the next time you respawn.')
        },

        handleSecondaryGunClick: function(weapon) {
            EventHandler.emit('secondary weapon update', weapon)
            this.selectedSecondaryWeapon = weapon.id
            toastr.info('Your weapon will change the next time you respawn.')
        },

        handleViewChange(view) {
            this.settingsView = view
        }
    }
}
</script>
