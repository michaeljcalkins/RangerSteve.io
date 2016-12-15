// @flow
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function(data: {
  roomId: string,
  playerNickname: string,
  playerId: string,
  message: string,
}) {
    Client.send(GameConsts.EVENT.MESSAGE_SEND, data)
}
