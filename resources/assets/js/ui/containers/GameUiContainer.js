import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import actions from '../../actions'
import GameUi from '../components/Hud/GameUi'

const mapStateToProps = (state) => {
    return {
        player: state.player
    }
}

const mapDispatchToProps = (dispatch) => {
    const playerActions = bindActionCreators(actions.player, dispatch)

    return {
        onSetMusicVolume: playerActions.setMusicVolume,
        onSetSfxVolume: playerActions.setSfxVolume,
        onSetNickname: playerActions.setNickname,
        onCloseSettingsModal: playerActions.closeSettingsModal,
        onOpenSettingsModal: playerActions.openSettingsModal,
    }
}

const GameUiContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GameUi)

export default GameUiContainer
