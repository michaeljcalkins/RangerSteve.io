import React, { PropTypes } from 'react'
import Select from 'react-select'
import storage from 'store'

export default function ControlsView({
    game,
    onKeyboardControlChange,
    onSetResetEventsFlag,
}) {
    const options = [
        { value: Phaser.Keyboard.A, label: 'A' },
        { value: Phaser.Keyboard.B, label: 'B' },
        { value: Phaser.Keyboard.C, label: 'C' },
        { value: Phaser.Keyboard.D, label: 'D' },
        { value: Phaser.Keyboard.E, label: 'E' },
        { value: Phaser.Keyboard.F, label: 'F' },
        { value: Phaser.Keyboard.G, label: 'G' },
        { value: Phaser.Keyboard.H, label: 'H' },
        { value: Phaser.Keyboard.I, label: 'I' },
        { value: Phaser.Keyboard.J, label: 'J' },
        { value: Phaser.Keyboard.K, label: 'K' },
        { value: Phaser.Keyboard.L, label: 'L' },
        { value: Phaser.Keyboard.M, label: 'M' },
        { value: Phaser.Keyboard.N, label: 'N' },
        { value: Phaser.Keyboard.O, label: 'O' },
        { value: Phaser.Keyboard.P, label: 'P' },
        { value: Phaser.Keyboard.Q, label: 'Q' },
        { value: Phaser.Keyboard.R, label: 'R' },
        { value: Phaser.Keyboard.S, label: 'S' },
        { value: Phaser.Keyboard.T, label: 'T' },
        { value: Phaser.Keyboard.U, label: 'U' },
        { value: Phaser.Keyboard.V, label: 'V' },
        { value: Phaser.Keyboard.W, label: 'W' },
        { value: Phaser.Keyboard.X, label: 'X' },
        { value: Phaser.Keyboard.Y, label: 'Y' },
        { value: Phaser.Keyboard.Z, label: 'Z' },
        { value: Phaser.Keyboard.SPACEBAR, label: 'Space Bar' },
    ]

    function handleSetAzerty() {
        let obj = {}

        obj['left'] = Phaser.Keyboard.Q
        storage.set('keyboardControl.left', Phaser.Keyboard.Q)
        onKeyboardControlChange(obj)

        obj['right'] = Phaser.Keyboard.D
        storage.set('keyboardControl.right', Phaser.Keyboard.D)
        onKeyboardControlChange(obj)

        obj['up'] = Phaser.Keyboard.Z
        storage.set('keyboardControl.up', Phaser.Keyboard.Z)
        onKeyboardControlChange(obj)

        obj['switchWeapon'] = Phaser.Keyboard.A
        storage.set('keyboardControl.switchWeapon', Phaser.Keyboard.A)
        onKeyboardControlChange(obj)

        obj['newChatMessage'] = Phaser.Keyboard.T
        storage.set('keyboardControl.newChatMessage', Phaser.Keyboard.T)
        onKeyboardControlChange(obj)

        onSetResetEventsFlag(true)
    }

    function handleSetQwerty() {
        let obj = {}

        obj['left'] = Phaser.Keyboard.A
        storage.set('keyboardControl.left', Phaser.Keyboard.A)
        onKeyboardControlChange(obj)

        obj['right'] = Phaser.Keyboard.D
        storage.set('keyboardControl.right', Phaser.Keyboard.D)
        onKeyboardControlChange(obj)

        obj['up'] = Phaser.Keyboard.W
        storage.set('keyboardControl.up', Phaser.Keyboard.W)
        onKeyboardControlChange(obj)

        obj['switchWeapon'] = Phaser.Keyboard.Q
        storage.set('keyboardControl.switchWeapon', Phaser.Keyboard.Q)
        onKeyboardControlChange(obj)

        obj['newChatMessage'] = Phaser.Keyboard.T
        storage.set('keyboardControl.newChatMessage', Phaser.Keyboard.T)
        onKeyboardControlChange(obj)

        onSetResetEventsFlag(true)
    }

    function handleControlChange(name, val) {
        if (! val) return
        const storageKey = 'keyboardControl.' + name
        storage.set(storageKey, val.value)
        let obj = {}
        obj[name] = val.value
        onKeyboardControlChange(obj)
        onSetResetEventsFlag(true)
    }

    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="row">
                    <div className="col-sm-6">
                        <button
                            className="btn btn-block btn-default"
                            onClick={ handleSetQwerty }
                        >
                            QWERTY
                        </button>
                    </div>
                    <div className="col-sm-6">
                        <button
                            className="btn btn-block btn-default"
                            onClick={ handleSetAzerty }
                        >
                            AZERTY
                        </button>
                    </div>
                </div>
                <div className="well well-sm">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="col-sm-4">Action</th>
                                <th>Control</th>
                                <th>Alt. Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Fly</td>
                                <td>Right click and hold</td>
                                <td>Press and hold SHIFT</td>
                            </tr>
                            <tr>
                                <td>Shoot</td>
                                <td>Left click</td>
                                <td />
                            </tr>
                            <tr>
                                <td>Aim</td>
                                <td>Move your mouse</td>
                                <td />
                            </tr>
                            <tr>
                                <td>Jump</td>
                                <td>
                                    <Select
                                        clearable={ false }
                                        onChange={ handleControlChange.bind(this, 'up') }
                                        options={ options }
                                        value={ game.keyboardControls['up'] }
                                    />
                                </td>
                                <td />
                            </tr>
                            <tr>
                                <td>Move left</td>
                                <td>
                                    <Select
                                        clearable={ false }
                                        onChange={ handleControlChange.bind(this, 'left') }
                                        options={ options }
                                        value={ game.keyboardControls['left'] }
                                    />
                                </td>
                                <td />
                            </tr>
                            <tr>
                                <td>Move right</td>
                                <td>
                                    <Select
                                        clearable={ false }
                                        onChange={ handleControlChange.bind(this, 'right') }
                                        options={ options }
                                        value={ game.keyboardControls['right'] }
                                    />
                                </td>
                                <td />
                            </tr>
                            <tr>
                                <td>Reload</td>
                                <td>
                                    <Select
                                        clearable={ false }
                                        onChange={ handleControlChange.bind(this, 'reload') }
                                        options={ options }
                                        value={ game.keyboardControls['reload'] }
                                    />
                                </td>
                                <td />
                            </tr>
                            <tr>
                                <td>Switch weapons</td>
                                <td>
                                    <Select
                                        clearable={ false }
                                        onChange={ handleControlChange.bind(this, 'switchWeapon') }
                                        options={ options }
                                        value={ game.keyboardControls['switchWeapon'] }
                                    />
                                </td>
                                <td />
                            </tr>
                            <tr>
                                <td>Write chat message</td>
                                <td>
                                    <Select
                                        clearable={ false }
                                        onChange={ handleControlChange.bind(this, 'newChatMessage') }
                                        options={ options }
                                        value={ game.keyboardControls['newChatMessage'] }
                                    />
                                </td>
                                <td />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

ControlsView.propTypes = {
    game: PropTypes.object.isRequired,
    onKeyboardControlChange: PropTypes.func.isRequired,
    onSetResetEventsFlag: PropTypes.func.isRequired,
}
