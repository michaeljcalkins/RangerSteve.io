// @flow
import actions from '../../actions'

export default function onPlayerKillLog(data: {
    deadNickname: string,
    attackerNickname: string,
    weaponId: string,
}) {
    const store = this.game.store

    store.dispatch(actions.game.addKillLogMessage(data))
    setTimeout(() => {
        store.dispatch(actions.game.removeKillLogMessage(data))
    }, 10000)
}
