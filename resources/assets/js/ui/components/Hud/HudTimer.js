import React, { PropTypes } from 'react'
import moment from 'moment'

export default class HudTimer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            elapsed: '5:00'
        }
    }

    componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    tick() {
        let timeRemaining = this.props.roundEndTime - moment().unix()
        var minutes = Math.floor(timeRemaining / 60)
        var seconds = timeRemaining - minutes * 60
        seconds = `0${seconds}`.substr(-2)

        if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
            this.setState({ elapsed: '0:00' })
        }

        this.setState({ elapsed: `${minutes}:${seconds}` })
    }

    render() {
        return (
            <div className="hud-timer hud-item">{ this.state.elapsed }</div>
        )
    }
}

HudTimer.propTypes = {
    roundEndTime: PropTypes.number
}
