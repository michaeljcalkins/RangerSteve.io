import { connect } from 'react-redux'

import GameUi from '../components/Hud/GameUi'

const mapStateToProps = (state) => {
    return {
        player: state.player
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}

const GameUiContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GameUi)

export default GameUiContainer
