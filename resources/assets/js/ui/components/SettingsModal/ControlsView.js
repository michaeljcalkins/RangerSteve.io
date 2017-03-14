import React, { PropTypes } from 'react'
import Select from 'react-select'
import storage from 'store'

export default function ControlsView ({
    game,
    onKeyboardControlChange,
    onSetResetEventsFlag
}) {
  const options = [
        { value: window.Phaser.Keyboard.A, label: 'A' },
        { value: window.Phaser.Keyboard.B, label: 'B' },
        { value: window.Phaser.Keyboard.C, label: 'C' },
        { value: window.Phaser.Keyboard.D, label: 'D' },
        { value: window.Phaser.Keyboard.E, label: 'E' },
        { value: window.Phaser.Keyboard.F, label: 'F' },
        { value: window.Phaser.Keyboard.G, label: 'G' },
        { value: window.Phaser.Keyboard.H, label: 'H' },
        { value: window.Phaser.Keyboard.I, label: 'I' },
        { value: window.Phaser.Keyboard.J, label: 'J' },
        { value: window.Phaser.Keyboard.K, label: 'K' },
        { value: window.Phaser.Keyboard.L, label: 'L' },
        { value: window.Phaser.Keyboard.M, label: 'M' },
        { value: window.Phaser.Keyboard.N, label: 'N' },
        { value: window.Phaser.Keyboard.O, label: 'O' },
        { value: window.Phaser.Keyboard.P, label: 'P' },
        { value: window.Phaser.Keyboard.Q, label: 'Q' },
        { value: window.Phaser.Keyboard.R, label: 'R' },
        { value: window.Phaser.Keyboard.S, label: 'S' },
        { value: window.Phaser.Keyboard.T, label: 'T' },
        { value: window.Phaser.Keyboard.U, label: 'U' },
        { value: window.Phaser.Keyboard.V, label: 'V' },
        { value: window.Phaser.Keyboard.W, label: 'W' },
        { value: window.Phaser.Keyboard.X, label: 'X' },
        { value: window.Phaser.Keyboard.Y, label: 'Y' },
        { value: window.Phaser.Keyboard.Z, label: 'Z' },
        { value: window.Phaser.Keyboard.SPACEBAR, label: 'Space Bar' }
  ]

  function handleSetAzerty () {
    let obj = {}

    obj['left'] = window.Phaser.Keyboard.Q
    storage.set('keyboardControl.left', window.Phaser.Keyboard.Q)
    onKeyboardControlChange(obj)

    obj['right'] = window.Phaser.Keyboard.D
    storage.set('keyboardControl.right', window.Phaser.Keyboard.D)
    onKeyboardControlChange(obj)

    obj['up'] = window.Phaser.Keyboard.Z
    storage.set('keyboardControl.up', window.Phaser.Keyboard.Z)
    onKeyboardControlChange(obj)

    obj['switchWeapon'] = window.Phaser.Keyboard.A
    storage.set('keyboardControl.switchWeapon', window.Phaser.Keyboard.A)
    onKeyboardControlChange(obj)

    obj['newChatMessage'] = window.Phaser.Keyboard.T
    storage.set('keyboardControl.newChatMessage', window.Phaser.Keyboard.T)
    onKeyboardControlChange(obj)

    onSetResetEventsFlag(true)
  }

  function handleSetQwerty () {
    let obj = {}

    obj['left'] = window.Phaser.Keyboard.A
    storage.set('keyboardControl.left', window.Phaser.Keyboard.A)
    onKeyboardControlChange(obj)

    obj['right'] = window.Phaser.Keyboard.D
    storage.set('keyboardControl.right', window.Phaser.Keyboard.D)
    onKeyboardControlChange(obj)

    obj['up'] = window.Phaser.Keyboard.W
    storage.set('keyboardControl.up', window.Phaser.Keyboard.W)
    onKeyboardControlChange(obj)

    obj['switchWeapon'] = window.Phaser.Keyboard.Q
    storage.set('keyboardControl.switchWeapon', window.Phaser.Keyboard.Q)
    onKeyboardControlChange(obj)

    obj['newChatMessage'] = window.Phaser.Keyboard.T
    storage.set('keyboardControl.newChatMessage', window.Phaser.Keyboard.T)
    onKeyboardControlChange(obj)

    onSetResetEventsFlag(true)
  }

  function handleControlChange (name, val) {
    if (!val) return
    const storageKey = 'keyboardControl.' + name
    storage.set(storageKey, val.value)
    let obj = {}
    obj[name] = val.value
    onKeyboardControlChange(obj)
    onSetResetEventsFlag(true)
  }

  return (
    <div className='row'>
      <div className='col-xs-12'>
        <div className='row'>
          <div className='col-xs-6'>
            <button
              className='btn btn-block btn-outline'
              onClick={handleSetQwerty}
            >
              QWERTY
            </button>
          </div>
          <div className='col-xs-6'>
            <button
              className='btn btn-block btn-outline'
              onClick={handleSetAzerty}
            >
              AZERTY
            </button>
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <table className='table'>
            <thead>
              <tr>
                <th className='col-xs-4'>Action</th>
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
                <td></td>
              </tr>
              <tr>
                <td>Aim</td>
                <td>Move your mouse</td>
                <td></td>
              </tr>
              <tr>
                <td>Jump</td>
                <td>
                  <Select
                    clearable={false}
                    onChange={handleControlChange.bind(this, 'up')}
                    options={options}
                    value={game.keyboardControls['up']}
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Move left</td>
                <td>
                  <Select
                    clearable={false}
                    onChange={handleControlChange.bind(this, 'left')}
                    options={options}
                    value={game.keyboardControls['left']}
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Move right</td>
                <td>
                  <Select
                    clearable={false}
                    onChange={handleControlChange.bind(this, 'right')}
                    options={options}
                    value={game.keyboardControls['right']}
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Reload</td>
                <td>
                  <Select
                    clearable={false}
                    onChange={handleControlChange.bind(this, 'reload')}
                    options={options}
                    value={game.keyboardControls['reload']}
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Switch weapons</td>
                <td>
                  <Select
                    clearable={false}
                    onChange={handleControlChange.bind(this, 'switchWeapon')}
                    options={options}
                    value={game.keyboardControls['switchWeapon']}
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Write chat message</td>
                <td>
                  <Select
                    clearable={false}
                    onChange={handleControlChange.bind(this, 'newChatMessage')}
                    options={options}
                    value={game.keyboardControls['newChatMessage']}
                  />
                </td>
                <td></td>
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
  onSetResetEventsFlag: PropTypes.func.isRequired
}
