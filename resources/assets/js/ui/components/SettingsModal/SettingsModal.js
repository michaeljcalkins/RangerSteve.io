// @flow
import React from 'react'
import cs from 'classnames'

import ChoosePrimaryView from './ChoosePrimaryView'
import ChooseSecondaryView from './ChooseSecondaryView'
import ControlsView from './ControlsView'
import WeaponsView from './WeaponsView'
import SettingsView from './SettingsView'

export default function SettingsModal({
    game,
    isOpen,
    onClose,
    onKeyboardControlChange,
    onNicknameChange,
    onPrimaryGunClick,
    onQualityChange,
    onRespawnChange,
    onSecondaryGunClick,
    onSetResetEventsFlag,
    onSfxVolumeChange,
    onViewChange,
    player,
}: Props) {
    function renderModalView() {
        switch (game.settingsView) {
            case 'choosePrimary':
                return (
                <ChoosePrimaryView {...{
                    onPrimaryGunClick,
                    onViewChange,
                }}
                />
                )

            case 'chooseSecondary':
                return (
                <ChooseSecondaryView {...{
                    onSecondaryGunClick,
                    onViewChange,
                }}
                />
                )

            case 'settings':
                return (
                <SettingsView {...{
                    game,
                    onNicknameChange,
                    onQualityChange,
                    onSfxVolumeChange,
                    onViewChange,
                    onRespawnChange,
                    player,
                }}
                />
                )

            case 'controls':
                return (
                <ControlsView {...{
                    game,
                    onKeyboardControlChange,
                    onSetResetEventsFlag,
                    onViewChange,
                }}
                />
                )

            default:
                return (
                <WeaponsView {...{
                    game,
                    onViewChange,
                    player,
                }}
                />
                )
        }
    }

    return (
        <div
            className="modal modal-settings"
            style={ { display: isOpen ? 'block' : 'none' } }
        >
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
                        <h4 className="modal-title">Settings</h4>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-sm-12 text-center">
                                <ul className="nav nav-pills" style={ { marginBottom: '15px', display: 'inline-block' } }>
                                    <li
                                        className={ cs({
                                            pointer: true,
                                            active: game.settingsView === 'default',
                                        }) }
                                    >
                                        <a onClick={ onViewChange.bind(this, 'default') }>
                                            Weapons
                                        </a>
                                    </li>
                                    <li
                                        className={ cs({
                                            pointer: true,
                                            active: game.settingsView === 'settings',
                                        }) }
                                    >
                                        <a onClick={ onViewChange.bind(this, 'settings') }>
                                            Settings
                                        </a>
                                    </li>
                                    <li
                                        className={ cs({
                                            pointer: true,
                                            active: game.settingsView === 'controls',
                                        }) }
                                    >
                                        <a onClick={ onViewChange.bind(this, 'controls') }>
                                            Controls
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        { renderModalView() }
                    </div>
                </div>
            </div>
        </div>
    )
}

type Props = {
    defaultNicknameValue: string,
    defaultSoundEffectValue: number,
    isOpen: bool,
    onClose: Function,
    onNicknameChange: Function,
    onPrimaryGunClick: Function,
    onQualityChange: Function,
    onSecondaryGunClick: Function,
    onSoundEffectVolumeChange: Function,
    onViewChange: Function,
    player: Object,
    selectedPrimaryWeapon: string,
    selectedSecondaryWeapon: string,
    settingsView: string,
}
