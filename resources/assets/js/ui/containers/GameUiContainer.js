import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import actions from '../../actions'
import GameUi from '../components/Hud/GameUi'

const mapStateToProps = (state) => {
    return {
        player: state.player,
        room: state.room,
        game: state.game
    }
}

const mapDispatchToProps = (dispatch) => {
    const playerActions = bindActionCreators(actions.player, dispatch)
    const gameActions = bindActionCreators(actions.game, dispatch)

    return {
        onSetMusicVolume: gameActions.setMusicVolume,
        onSetSfxVolume: gameActions.setSfxVolume,
        onSetNickname: playerActions.setNickname,
        onCloseSettingsModal: gameActions.closeSettingsModal,
        onOpenSettingsModal: gameActions.openSettingsModal,
        onCloseChatModal: gameActions.closeChatModal,
        onMusicVolumeChange: gameActions.setMusicVolume,
        onNicknameChange: playerActions.setNickname,
        onSfxVolumeChange: gameActions.setSfxVolume,
        onSettingsViewChange: gameActions.setSettingsModalView
    }
}

const GameUiContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GameUi)

export default GameUiContainer
