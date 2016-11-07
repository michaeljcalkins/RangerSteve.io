// @flow
import playerSchema from '../../../../../lib/schemas/playerSchema'

export default function(data: {
    facing: string,
    flying: bool,
    id: string,
    leftArmAngle: number,
    rightArmAngle: number,
    shooting: bool,
    weaponId: string,
    x: number,
    y: number,
}) {
    data.id = window.SOCKET_ID
    var buffer = playerSchema.encode(data)
    window.socket.emit('move player', buffer)
}
