// @flow
// import movePlayerSchema from 'lib/schemas/movePlayerSchema'
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function(data: {
    angle: number,
    flying: bool,
    shooting: bool,
    weaponId: string,
    x: number,
    y: number,
}) {
    // var buffer: Uint8Array = movePlayerSchema.encode(data)
    Client.send(GameConsts.EVENT.MOVE_PLAYER, data)
}
