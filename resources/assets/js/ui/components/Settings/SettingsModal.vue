<style>
.hud-settings-modal {
    cursor: default;
}
</style>

<template>
    <div class="modal hud-settings-modal" :style="{ display: isOpen ? 'block' : 'none' }">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button
                        @click="onClose"
                        type="button"
                        class="close">
                        <span>&times;</span>
                    </button>
                    <h4 class="modal-title">Options</h4>
                </div>
                <div class="modal-body">
                    <main-settings-menu
                        v-if="settingsView == 'main'"
                        :default-nickname-value="defaultNicknameValue"
                        :default-sound-effect-value="defaultSoundEffectValue"
                        :on-nickname-change="onNicknameChange"
                        :on-sound-effect-volume-change="onSoundEffectVolumeChange"
                        :on-view-change="onViewChange"
                        :selected-primary-weapon="selectedPrimaryWeapon"
                        :selected-secondary-weapon="selectedSecondaryWeapon"
                    ></main-settings-menu>

                    <choose-primary-menu
                        v-if="settingsView == 'choosePrimary'"
                        :on-primary-gun-click="onPrimaryGunClick"
                        :on-view-change="onViewChange"
                        :player="player"
                    ></choose-primary-menu>

                    <choose-secondary-menu
                        v-if="settingsView == 'chooseSecondary'"
                        :on-secondary-gun-click="onSecondaryGunClick"
                        :on-view-change="onViewChange"
                        :player="player"
                    ></choose-secondary-menu>

                    <choose-character-menu
                        v-if="settingsView == 'chooseCharacter'"
                        :on-view-change="onViewChange"
                        :player="player"
                    ></choose-character-menu>
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-default"
                        @click="onClose">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MainSettingsMenu from './MainSettingsMenu.vue'
import ChoosePrimaryMenu from './ChoosePrimaryMenu.vue'
import ChooseSecondaryMenu from './ChooseSecondaryMenu.vue'
import ChooseCharacterMenu from './ChooseCharacterMenu.vue'

export default {
    components: {
        MainSettingsMenu,
        ChoosePrimaryMenu,
        ChooseSecondaryMenu,
        ChooseCharacterMenu
    },
    props: [
        'isOpen',
        'onClose',
        'defaultNicknameValue',
        'defaultSoundEffectValue',
        'onViewChange',
        'onNicknameChange',
        'onPrimaryGunClick',
        'onSecondaryGunClick',
        'onSoundEffectVolumeChange',
        'player',
        'settingsView',
        'selectedPrimaryWeapon',
        'selectedSecondaryWeapon'
    ]
}
</script>
