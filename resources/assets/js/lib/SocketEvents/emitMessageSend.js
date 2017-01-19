import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function (data: string) {
  Client.send(GameConsts.EVENT.MESSAGE_SEND, data)
}
