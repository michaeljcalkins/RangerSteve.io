import React, { PropTypes } from 'react'

import MainSettingsMenu from './MainSettingsMenu.vue'
import ChoosePrimaryMenu from './ChoosePrimaryMenu.vue'
import ChooseSecondaryMenu from './ChooseSecondaryMenu.vue'
import ChooseCharacterMenu from './ChooseCharacterMenu.vue'

export default function SettingsModal({
    isOpen,
    onClose,
    defaultNicknameValue,
    defaultSoundEffectValue,
    onViewChange,
    onNicknameChange,
    onPrimaryGunClick,
    onSecondaryGunClick,
    onSoundEffectVolumeChange,
    player,
    settingsView,
    selectedPrimaryWeapon,
    selectedSecondaryWeapon
}) {
    function renderModalView() {
        switch (this.state.settingsView) {
            case 'choosePrimary':
                return (
                    <ChoosePrimaryMenu
                        onPrimaryGunClick={ onPrimaryGunClick }
                        onViewChange={ onViewChange }
                        player={ player }
                    />
                )

            case 'chooseSecondary':
                return (
                    <ChooseSecondaryMenu
                        onSecondaryGunClick={ onSecondaryGunClick }
                        onViewChange={ onViewChange }
                        player={ player }
                    />
                )

            case 'chooseCharacter':
                return (
                    <ChooseCharacterMenu
                        onViewChange={ onViewChange }
                        player={ player }
                    />
                )

            default:
                return (
                    <MainSettingsMenu
                        defaultNicknameValue={ defaultNicknameValue }
                        defaultSoundEffectValue={ defaultSoundEffectValue }
                        onNicknameChange={ onNicknameChange }
                        onSoundEffectVolumeChange={ onSoundEffectVolumeChange }
                        onViewChange={ onViewChange }
                        selectedPrimaryWeapon={ selectedPrimaryWeapon }
                        selectedSecondaryWeapon={ selectedSecondaryWeapon }
                    />
                )
        }
    }

    return (
        <div
            className="modal hud-settings-modal"
            style={ { display: isOpen ? 'block' : 'none' } }>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button
                            className="close"
                            onClick={ onClose }
                            type="button"
                        >
                            <span>&times;</span>
                        </button>
                        <h4 className="modal-title">Options</h4>
                    </div>
                    <div className="modal-body">
                        { renderModalView() }
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-default"
                            onClick={ onClose }
                            type="button"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
