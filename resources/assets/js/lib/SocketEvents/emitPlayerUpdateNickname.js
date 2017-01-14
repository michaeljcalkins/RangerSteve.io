import debounce from 'lodash/debounce'
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

const emitPlayerUpdateNickname = (roomId, nickname) => {
  Client.send(GameConsts.EVENT.PLAYER_UPDATE_NICKNAME, {
    roomId,
    nickname,
  })
}

export default debounce(emitPlayerUpdateNickname, 1000)

