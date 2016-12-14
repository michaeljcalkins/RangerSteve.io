// @flow
import playerFromClientSchema from 'lib/schemas/playerFromClientSchema'
import GameConsts from 'lib/GameConsts'

export default function(data: {
    angle: number,
    facing: string,
    flying: bool,
    shooting: bool,
    weaponId: string,
    x: number,
    y: number,
}) {
    // var buffer: Uint8Array = playerFromClientSchema.encode(data)
    window.socket.write({
        type: GameConsts.EVENT.MOVE_PLAYER,
        payload: data,
    })
}
