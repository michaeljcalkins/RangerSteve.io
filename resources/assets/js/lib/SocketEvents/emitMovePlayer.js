// @flow
import playerFromClientSchema from 'lib/schemas/playerFromClientSchema'

export default function(data: {
    angle: number,
    facing: string,
    flying: bool,
    shooting: bool,
    weaponId: string,
    x: number,
    y: number,
}) {
    var buffer: Uint8Array = playerFromClientSchema.encode(data)
    window.socket.emit('move player', buffer)
}
