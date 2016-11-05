import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import actions from '../../actions'
import GameUi from '../components/GameUi'

const mapStateToProps = (state) => {
    return {
        player: state.player,
        room: state.room,
        game: state.game,
    }
}

const mapDispatchToProps = (dispatch) => {
    const playerActions = bindActionCreators(actions.player, dispatch)
    const gameActions = bindActionCreators(actions.game, dispatch)

    return {
        onSetSfxVolume: gameActions.setSfxVolume,
        onSetNickname: playerActions.setNickname,
        onReduceToMaxChatMessages: gameActions.reduceToMaxChatMessages,
        onCloseSettingsModal: gameActions.closeSettingsModal,
        onOpenSettingsModal: gameActions.openSettingsModal,
        onCloseChatModal: gameActions.closeChatModal,
        onOpenChatModal: gameActions.openChatModal,
        onNicknameChange: playerActions.setNickname,
        onSfxVolumeChange: gameActions.setSfxVolume,
        onSettingsViewChange: gameActions.setSettingsModalView,
        onPrimaryWeaponIdChange: playerActions.setNextSelectedPrimaryWeaponId,
        onSecondaryWeaponIdChange: playerActions.setNextSelectedSecondaryWeaponId,
        onSetResetEventsFlag: gameActions.setResetEventsFlag,
        onKeyboardControlChange: gameActions.setKeyboardControl,
    }
}

const GameUiContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GameUi)

export default GameUiContainer
