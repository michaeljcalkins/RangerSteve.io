import React from 'react'
import EventHandler from '../../lib/EventHandler'

import {
    HudHealth,
    HudScore,
    HudLeaderboard,
    HudSettingsButton
} from '../components/Hud'
import SettingsModal from '../components/Settings/SettingsModal'

export default class GameUiContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            health: '100',
            score: '0',
            currentWeapon: 1,
            players: [],
            volume: .5,
            nickname: 'Unamed Ranger',
            settingsModalOpen: false
        }

        this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this)
        this.handleSoundEffectVolumeChange = this.handleSoundEffectVolumeChange.bind(this)
        this.handleNicknameChange = this.handleNicknameChange.bind(this)
    }

    componentDidMount() {
        EventHandler.on('health update', (health) => {
            this.setState({ health })
        })

        EventHandler.on('score update', (score) => {
            this.setState({ score })
        })

        EventHandler.on('weapon update', (currentWeapon) => {
            this.setState({ currentWeapon })
        })

        EventHandler.on('players update', (players) => {
            this.setState({ players })
        })
    }

    handleSettingsButtonClick() {
        this.setState({
            settingsModalOpen: !this.state.settingsModalOpen
        })
    }

    handleNicknameChange(nickname) {
        EventHandler.emit('player update nickname', { nickname })
        this.setState({ nickname })
    }

    handleSoundEffectVolumeChange(volume) {
        EventHandler.emit('volume update', { volume })
        this.setState({ volume })
    }

    render() {
        return (
            <div>
                <HudHealth
                    health={ this.state.health }
                />
                <HudScore
                    score={ this.state.score }
                />
                <HudLeaderboard
                    players={ this.state.players }
                />
                <HudSettingsButton
                    onButtonClick={ this.handleSettingsButtonClick }
                />
                <SettingsModal
                    defaultNicknameValue={ this.state.nickname }
                    defaultSoundEffectValue={ this.state.volume }
                    isOpen={ this.state.settingsModalOpen }
                    onClose={ this.handleSettingsButtonClick }
                    onNicknameChange={ this.handleNicknameChange }
                    onSoundEffectVolumeChange={ this.handleSoundEffectVolumeChange }
                />
            </div>
        )
    }
}
