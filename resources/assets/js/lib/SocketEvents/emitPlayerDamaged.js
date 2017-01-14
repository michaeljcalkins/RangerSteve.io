import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function(data) {
  Client.send(GameConsts.EVENT.PLAYER_DAMAGED, data)
}
