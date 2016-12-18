// @flow
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function(data: {
  roomId: string,
  damage: number,
  damagedPlayerId: string,
  attackingPlayerId: string,
  weaponId: string,
  wasHeadshot: bool,
}) {
    Client.send(GameConsts.EVENT.PLAYER_DAMAGED, data)
}
