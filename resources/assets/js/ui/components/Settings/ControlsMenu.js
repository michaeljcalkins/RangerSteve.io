import React, { PropTypes } from 'react'
import storage from 'store'

export default function ControlsMenu({
    game,
    onKeyboardControlChange,
    onSetResetEventsFlag
}) {
    const keyboardCodes = {
        A: Phaser.Keyboard.A,
        B: Phaser.Keyboard.B,
        C: Phaser.Keyboard.C,
        D: Phaser.Keyboard.D,
        E: Phaser.Keyboard.E,
        F: Phaser.Keyboard.F,
        G: Phaser.Keyboard.G,
        H: Phaser.Keyboard.H,
        I: Phaser.Keyboard.I,
        J: Phaser.Keyboard.J,
        K: Phaser.Keyboard.K,
        L: Phaser.Keyboard.L,
        M: Phaser.Keyboard.M,
        N: Phaser.Keyboard.N,
        O: Phaser.Keyboard.O,
        P: Phaser.Keyboard.p,
        Q: Phaser.Keyboard.Q,
        R: Phaser.Keyboard.R,
        S: Phaser.Keyboard.S,
        T: Phaser.Keyboard.T,
        U: Phaser.Keyboard.U,
        V: Phaser.Keyboard.V,
        W: Phaser.Keyboard.W,
        X: Phaser.Keyboard.X,
        Y: Phaser.Keyboard.Y,
        Z: Phaser.Keyboard.Z
    }

    function handleSetAzerty() {
        let obj = {}

        obj['left'] = Phaser.Keyboard.Q
        storage.set('keyboardControl.left', Phaser.Keyboard.Q)
        onKeyboardControlChange(obj)
        let input = document.getElementById('control-left')
        input.value = Phaser.Keyboard.Q

        obj['right'] = Phaser.Keyboard.D
        storage.set('keyboardControl.right', Phaser.Keyboard.D)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-right')
        input.value = Phaser.Keyboard.D

        obj['up'] = Phaser.Keyboard.Z
        storage.set('keyboardControl.up', Phaser.Keyboard.Z)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-up')
        input.value = Phaser.Keyboard.Z

        obj['switchWeapon'] = Phaser.Keyboard.A
        storage.set('keyboardControl.switchWeapon', Phaser.Keyboard.A)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-switchWeapon')
        input.value = Phaser.Keyboard.A

        obj['newChatMessage'] = Phaser.Keyboard.T
        storage.set('keyboardControl.newChatMessage', Phaser.Keyboard.T)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-newChatMessage')
        input.value = Phaser.Keyboard.T

        onSetResetEventsFlag(true)
    }

    function handleSetQwerty() {
        let obj = {}

        obj['left'] = Phaser.Keyboard.A
        storage.set('keyboardControl.left', Phaser.Keyboard.A)
        onKeyboardControlChange(obj)
        let input = document.getElementById('control-left')
        input.value = Phaser.Keyboard.A

        obj['right'] = Phaser.Keyboard.D
        storage.set('keyboardControl.right', Phaser.Keyboard.D)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-right')
        input.value = Phaser.Keyboard.D

        obj['up'] = Phaser.Keyboard.W
        storage.set('keyboardControl.up', Phaser.Keyboard.W)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-up')
        input.value = Phaser.Keyboard.W

        obj['switchWeapon'] = Phaser.Keyboard.Q
        storage.set('keyboardControl.switchWeapon', Phaser.Keyboard.Q)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-switchWeapon')
        input.value = Phaser.Keyboard.Q

        obj['newChatMessage'] = Phaser.Keyboard.T
        storage.set('keyboardControl.newChatMessage', Phaser.Keyboard.T)
        onKeyboardControlChange(obj)
        input = document.getElementById('control-newChatMessage')
        input.value = Phaser.Keyboard.T

        onSetResetEventsFlag(true)
    }

    function renderKeyboardCodes() {
        return Object.keys(keyboardCodes).map((key) => {
            return (
                <option
                    key={ key }
                    value={ keyboardCodes[key] }
                >
                    { key }
                </option>
            )
        })
    }

    function handleControlChange(evt) {
        storage.set('keyboardControl.' + evt.target.name, evt.target.value)
        let obj = {}
        obj[evt.target.name] = evt.target.value
        onKeyboardControlChange(obj)
        let input = document.getElementById('control-' + evt.target.name)
        input.value = evt.target.value

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
                                <th className="col-sm-2">Controls</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <select
                                        className="form-control"
                                        defaultValue={ game.keyboardControls['left'] }
                                        id="control-left"
                                        name="left"
                                        onChange={ handleControlChange }
                                    >
                                        { renderKeyboardCodes('left') }
                                    </select>
                                </td>
                                <td>Run left</td>
                            </tr>
                            <tr>
                                <td>
                                    <select
                                        className="form-control"
                                        defaultValue={ game.keyboardControls['right'] }
                                        id="control-right"
                                        name="right"
                                        onChange={ handleControlChange }
                                    >
                                        { renderKeyboardCodes() }
                                    </select>
                                </td>
                                <td>Run right</td>
                            </tr>
                            <tr>
                                <td>
                                    <select
                                        className="form-control"
                                        defaultValue={ game.keyboardControls['up'] }
                                        id="control-up"
                                        name="up"
                                        onChange={ handleControlChange }
                                    >
                                        { renderKeyboardCodes() }
                                    </select>
                                </td>
                                <td>Jump and when in the air fly with jump jet</td>
                            </tr>
                            <tr>
                                <td>
                                    <select
                                        className="form-control"
                                        defaultValue={ game.keyboardControls['switchWeapon'] }
                                        id="control-switchWeapon"
                                        name="switchWeapon"
                                        onChange={ handleControlChange }
                                    >
                                        { renderKeyboardCodes() }
                                    </select>
                                </td>
                                <td>Switch between primary and secondary weapons</td>
                            </tr>
                            <tr>
                                <td>
                                    <select
                                        className="form-control"
                                        defaultValue={ game.keyboardControls['newChatMessage'] }
                                        id="control-newChatMessage"
                                        name="newChatMessage"
                                        onChange={ handleControlChange }
                                    >
                                        { renderKeyboardCodes() }
                                    </select>
                                </td>
                                <td>Open new chat message</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

ControlsMenu.propTypes = {
    game: PropTypes.object.isRequired,
    onKeyboardControlChange: PropTypes.func.isRequired
}
