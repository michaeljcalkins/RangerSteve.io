<template>
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
        :on-close="handleSettingsButtonClick"
        :on-nickname-change="handleNicknameChange"
        :on-primary-gun-click="handlePrimaryGunClick"
        :on-secondary-gun-click="handleSecondaryGunClick"
        :on-sound-effect-volume-change="handleSoundEffectVolumeChange"
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
import SettingsModal from '../components/Settings/SettingsModal.vue'

export default {
    components: {
        HudHealth,
        HudScore,
        HudLeaderboard,
        HudSettingsButton,
        HudJumpJet,
        SettingsModal
    },
    data: function() {
        return {
            jumpJetCounter: 0,
            health: 100,
            score: 0,
            currentWeapon: 1,
            players: [],
            player: {},
            volume: .5,
            nickname: 'Unamed Ranger',
            settingsModalOpen: false,
            selectedPrimaryWeapon: 'AK47',
            selectedSecondaryWeapon: 'DesertEagle'
        }
    },
    created: function() {
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
            this.players + players
        })

        EventHandler.on('player update', (data) => {
            this.player = data.player
        })

        EventHandler.on('settings open', (data) => {
            this.settingsModalOpen = !this.state.settingsModalOpen
        })

        EventHandler.on('player jump jet update', (data) => {
            this.jumpJetCounter = data.jumpJetCounter
        })
    },
    methods: {
        handleSettingsButtonClick: function() {
            this.settingsModalOpen = !this.settingsModalOpen
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
        }
    }
}
</script>
