import React from 'react'
import EventHandler from '../../lib/EventHandler'

import {
    HudHealth,
    HudScore,
    HudWeaponsInventory
} from '../components/Hud'

export default class GameUiContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            health: '',
            score: '',
            currentWeapon: 1
        }
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
            </div>
        )
    }
}
