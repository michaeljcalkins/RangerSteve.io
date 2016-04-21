<template>
    <div class="modal hud-settings-modal" v-bind:style="modalStyles">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button
                        :on-click="onClose"
                        type="button"
                        class="close">
                        <span>&times;</span>
                    </button>
                    <h4 class="modal-title">Options</h4>
                </div>
                <div class="modal-body">
                    <main-settings-menu
                        v-if="view == 'main'"
                        :default-nickname-value="defaultNicknameValue"
                        :default-sound-effect-value="defaultSoundEffectValue"
                        :on-nickname-change="onNicknameChange"
                        :on-sound-effect-volume-change="onSoundEffectVolumeChange"
                        :on-view-change="handleViewChange"
                        :selected-primary-weapon="selectedPrimaryWeapon"
                        :selected-secondary-weapon="selectedSecondaryWeapon"
                    ></main-settings-menu>

                    <choose-primary-menu
                        v-if="view == 'choosePrimary'"
                        :on-primary-gun-click="onPrimaryGunClick"
                        :on-view-change="handleViewChange"
                        :player="player"
                    ></choose-primary-menu>

                    <choose-secondary-menu
                        v-if="view == 'chooseSecondary'"
                        :on-secondary-gun-click="onSecondaryGunClick"
                        :on-view-change="handleViewChange"
                        :player="player"
                    ></choose-secondary-menu>

                    <choose-character-menu
                        v-if="view == 'chooseCharacter'"
                        :on-view-change="handleViewChange"
                        :player="player"
                    ></choose-character-menu>
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-default"
                        :on-click="onClose">
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
        'onNicknameChange',
        'onPrimaryGunClick',
        'onSecondaryGunClick',
        'onSoundEffectVolumeChange',
        'player',
        'selectedPrimaryWeapon',
        'selectedSecondaryWeapon'
    ],
    data: function() {
        return {
            view: 'main'
        }
    },
    methods: {
        handleViewChange(view) {
            this.view = view
        }
    }
}
</script>
