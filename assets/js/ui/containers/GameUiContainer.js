import React from 'react'
import EventHandler from '../../lib/EventHandler'

import {
    HudHealth,
    HudScore,
    HudWeaponsInventory,
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
            settingsModalOpen: false
        }

        this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this)
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

    render() {
        return (
            <div>
                <HudHealth
                    health={ this.state.health }
                />
                <HudScore
                    score={ this.state.score }
                />
                <HudWeaponsInventory
                    currentWeapon={ this.state.currentWeapon }
                />
                <HudLeaderboard
                    players={ this.state.players }
                />
                <HudSettingsButton
                    onButtonClick={ this.handleSettingsButtonClick }
                />
                <SettingsModal
                    isOpen={ this.state.settingsModalOpen }
                    onClose={ this.handleSettingsButtonClick }
                />
            </div>
        )
    }
}
